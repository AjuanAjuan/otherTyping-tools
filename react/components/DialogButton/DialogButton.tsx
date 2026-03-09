import { ButtonSize, ButtonType, getButtonStyles } from '@/src/css/colorCss';
import { isFunction } from '@/src/tool/is';
import React, { useCallback, useEffect, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, Dimensions, KeyboardEvent, ViewStyle, StyleProp, StyleSheet } from 'react-native';
import { Button, ButtonProps, Dialog, Portal } from 'react-native-paper';

type DialogButtonProps = {
  className?: string
  children?: ((state: {
    close: () => any;
  }) => React.ReactNode) | React.ReactNode;
  title?: string
  buttonChildren?: React.ReactNode;
  size?: ButtonSize
  type?: ButtonType
  circle?: boolean
  /** 同步回调 */
  onDialogOpen?: () => void | Promise<any>;
  /** 异步, before */
  beforeDialogOpen?: () => void | Promise<any>;
  /** Dialog 内容区域的固定高度 */
  dialogHeight?: number;
  /** Dialog 外边距（用于计算 iOS 键盘偏移，默认 Dialog 自带的间距） */
  dialogMargin?: number;
  /** Dialog.Content 的样式 */
  contentStyle?: StyleProp<ViewStyle>;
} & Omit<ButtonProps, "children">

const DialogButton: React.FC<DialogButtonProps> = ({
  type = 'primary',
  size = 'default',
  circle = false,
  className,
  children,
  buttonChildren,
  title,
  onDialogOpen,
  beforeDialogOpen,
  dialogHeight = 300,
  dialogMargin = 20, // Dialog 默认上下各 24 的间距
  contentStyle,
  disabled,
  ...otherprops
}) => {
  const [visible, setVisible] = React.useState(false);
  const hideDialog = async () => {
    setVisible(false);
  };

  // style
  const { buttonStyle, labelStyle: computedLabelStyle, contentStyle: computedContentStyle, textColor } = getButtonStyles(type, size, circle)
  const mergedStyle = [buttonStyle, otherprops.style, disabled && styles.disabled]
  const mergedLabelStyle = [computedLabelStyle, { color: textColor }, otherprops.labelStyle]
  const mergedContentStyle = [computedContentStyle, contentStyle]


  const handlePress = useCallback(async () => {
    if (beforeDialogOpen) {
      await beforeDialogOpen();
    }
    setVisible(true);
    if (onDialogOpen) {
      onDialogOpen();
    }
  }, [beforeDialogOpen]);

  return (
    <>
      <Button
        onPress={handlePress}
        {...otherprops}
        style={mergedStyle}
        labelStyle={mergedLabelStyle}
        contentStyle={mergedContentStyle}
        compact={false}
      >
        {buttonChildren}
      </Button>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>{title}</Dialog.Title>
          <DialogScrollContent
            dialogHeight={dialogHeight}
            dialogMargin={dialogMargin}
            contentStyle={contentStyle as ViewStyle}
          >
            {isFunction(children) ?
              children?.({ close: hideDialog }) : (children || '')}
          </DialogScrollContent>
        </Dialog>
      </Portal>
    </>
  );
};

// ==========================================
// 内部组件：处理 Dialog 内容的滚动和键盘避让
// ==========================================
type DialogScrollContentProps = {
  children: React.ReactNode;
  dialogHeight: number;
  dialogMargin: number;
  contentStyle?: ViewStyle;
}

const DialogScrollContent: React.FC<DialogScrollContentProps> = ({
  children,
  dialogHeight,
  dialogMargin,
  contentStyle,
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenHeight(window.height);
    });
    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    // 只在 iOS 上监听键盘事件
    if (Platform.OS !== 'ios') return;

    const onKeyboardWillShow = (e: KeyboardEvent) => {
      setKeyboardHeight(e.endCoordinates.height);
    };
    const onKeyboardWillHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener('keyboardWillShow', onKeyboardWillShow);
    const hideSub = Keyboard.addListener('keyboardWillHide', onKeyboardWillHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 计算 iOS 键盘偏移
  // Dialog 总高度 = dialogHeight + dialogMargin (包括 margin、title 等)
  const totalDialogHeight = dialogHeight + dialogMargin;
  // Dialog 底部到屏幕底部的距离 = (屏幕高度 - Dialog总高度) / 2
  const modalBottomOffset = (screenHeight - totalDialogHeight) / 2;
  // 实际需要的 paddingBottom = 键盘高度 - Dialog 底部偏移 + 预留间距
  const adjustedPaddingBottom = keyboardHeight > 0
    ? Math.max(0, keyboardHeight - modalBottomOffset + 40) // 预留间距考虑title, margin
    : 0;

  // Android: 使用固定高度的 ScrollView，系统自动处理键盘
  if (Platform.OS === 'android') {
    return (
      <Dialog.Content style={contentStyle}>
        <ScrollView
          style={{ height: dialogHeight }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={Keyboard.dismiss}>
            {children}
          </Pressable>
        </ScrollView>
      </Dialog.Content>
    );
  }

  // iOS: 使用 KeyboardAvoidingView + 动态 paddingBottom
  return (
    <Dialog.Content style={contentStyle}>
      <KeyboardAvoidingView
        behavior="padding"
        style={{ height: dialogHeight }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: adjustedPaddingBottom }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={Keyboard.dismiss}>
            {children}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Dialog.Content>
  );
};

export default DialogButton;

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
})