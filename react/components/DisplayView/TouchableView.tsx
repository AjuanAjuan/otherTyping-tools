import React, { useState, useCallback, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';

export interface TouchableViewProps extends TouchableOpacityProps {
  /** 触发的点击事件，可以返回 Promise，执行期间会自动在按钮上方显示 loading 遮罩并屏蔽后续点击 */
  onPress?: (e: any) => void | Promise<any>;
  /** 节流时间，多次点击时防止重复触发。默认 500ms。对于单纯的同步跳转如 router.push 非常有效 */
  throttleTime?: number;
  /** 执行异步 Promise 操作时，是否在按键表面展示内置的半透明 loading 遮罩 */
  showLoading?: boolean;
}

const TouchableView: React.FC<TouchableViewProps> = ({
  onPress,
  throttleTime = 500,
  showLoading = true,
  children,
  style,
  disabled,
  ...rest
}) => {
  const [loading, setLoading] = useState(false);
  const lastPressTime = useRef<number>(0);
  const isMounted = useRef(true);

  React.useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handlePress = useCallback(async (e: any) => {
    // 正在加载或者被外部禁用时不响应
    if (loading || disabled) return;

    // 节流处理：拦截手速过快的多次连续点击
    const now = Date.now();
    if (now - lastPressTime.current < throttleTime) {
      return;
    }
    lastPressTime.current = now;

    if (!onPress) return;

    let isAsync = false;
    try {
      const result = onPress(e);
      // 如果触发的函数返回了 Promise 对象（如 await 接口或是手动睡眠延迟），则截获并展现转圈态
      if (result && typeof result.then === 'function') {
        isAsync = true;
        setLoading(true);
        await result;
      }
    } catch (error) {
      console.error('TouchableView Error:', error);
    } finally {
      if (isAsync && isMounted.current) {
        // 解除加载状态前，确保组件尚未被卸载，防止内存泄漏警告
        setLoading(false);
      }
    }
  }, [onPress, loading, throttleTime, disabled]);

  return (
    <TouchableOpacity
      disabled={loading || disabled}
      onPress={handlePress}
      style={[style, styles.wrapper]}
      {...rest}
    >
      {loading && showLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color="#1890ff" />
        </View>
      )}
      {children}
    </TouchableOpacity>
  );
};

export default TouchableView;

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative', // 确保 absolute overlay 居中于当前容器
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    zIndex: 10,
    borderRadius: 8, // 柔化边缘
  }
});