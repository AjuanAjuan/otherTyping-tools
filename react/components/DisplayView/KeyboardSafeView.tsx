import { useHeaderHeight } from '@react-navigation/elements';
import React, { ReactNode, useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, View, ViewStyle, KeyboardEvent, Dimensions } from 'react-native';

type KeyboardSafeViewProps = {
  children: ReactNode;
  contentContainerStyle?: ViewStyle;
  style?: ViewStyle;
  inModal?: boolean;
  /** Modal 容器的高度（用于计算底部偏移） */
  modalHeight?: number;
  className?: string
}

const KeyboardSafeView = ({ children, contentContainerStyle, style, inModal, modalHeight, className }: KeyboardSafeViewProps) => {
  const headerHeight = inModal ? 0 : (useHeaderHeight() || 0);
  // 顶部状态栏高度
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

  useEffect(() => {
    // 监听屏幕尺寸变化
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenHeight(window.height);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    // 只在 iOS Modal 模式下监听键盘
    if (Platform.OS !== 'ios' || !inModal) return;

    const keyboardWillShow = (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
    };

    const keyboardWillHide = () => {
      setKeyboardHeight(0);
    };

    const showSubscription = Keyboard.addListener('keyboardWillShow', keyboardWillShow);
    const hideSubscription = Keyboard.addListener('keyboardWillHide', keyboardWillHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [inModal]);

  // iOS 使用 KeyboardAvoidingView
  // Modal 模式下需要特殊处理：动态添加键盘高度的底部空间
  // 计算 Modal 底部到屏幕底部的距离
  let adjustedKeyboardHeight = keyboardHeight;
  if (inModal && keyboardHeight > 0 && modalHeight) {
    // Modal 底部距离屏幕底部的距离 = (屏幕高度 - Modal 高度) / 2
    const modalBottomOffset = (screenHeight - modalHeight) / 2;
    // 实际需要的 padding = 键盘高度 - Modal 底部偏移
    adjustedKeyboardHeight = Math.max(0, keyboardHeight - modalBottomOffset + 20); // 预留20
  }
  const scrollContentStyle = inModal
    ? [{ paddingBottom: adjustedKeyboardHeight }, contentContainerStyle]
    : [{ flexGrow: 1 }, contentContainerStyle];

  // Android 在 edgeToEdgeEnabled 模式下，系统 adjustResize 不生效，
  // 必须用 KeyboardAvoidingView，但要用 'padding' 而不是 'height'。
  // behavior='height' 会导致键盘收回后底部出现残留白块的 bug。
  // keyboardVerticalOffset = headerHeight(导航栏) + statusBarHeight(状态栏)，
  // 这样在 edge-to-edge 模式下偏移计算才正确。
  if (Platform.OS === 'android') {
    const androidOffset = 0;
    return (
      <KeyboardAvoidingView
        behavior="padding"
        style={inModal ? [{ height: '100%' }, style] : [{ flex: 1 }, style]}
        keyboardVerticalOffset={androidOffset}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={scrollContentStyle}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              {children}
            </View>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={inModal ? [{ height: '100%' }, style] : [{ flex: 1 }, style]}
      keyboardVerticalOffset={headerHeight}
      className={className}
    >
      <ScrollView
        style={inModal ? { flex: 1 } : undefined}
        contentContainerStyle={scrollContentStyle}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={Platform.OS === 'web' ? undefined : Keyboard.dismiss}>
          {inModal ? children : (
            <View style={{ flex: 1 }}>
              {children}
            </View>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default KeyboardSafeView;
