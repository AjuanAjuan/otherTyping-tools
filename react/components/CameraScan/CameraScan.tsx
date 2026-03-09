import React, { useCallback, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { CameraView, useCameraPermissions, BarcodeScanningResult, BarcodeType } from 'expo-camera';
import { BASE_CSS } from '@/src/css/colorCss';

export type CameraScanMethods = {
  /** 打开相机扫码（自动处理权限申请） */
  open: () => Promise<void>;
  /** 关闭相机扫码 */
  close: () => void;
}

export type CameraScanProps = {
  /** 是否显示扫码界面（受控模式，可选） */
  visible?: boolean;
  /** 扫码成功回调，返回扫描到的文本 */
  onScanned: (data: string) => void;
  /** 关闭扫码界面的回调 */
  onClose?: () => void;
  /** 扫描提示文字 */
  title?: string;
  /** 支持的条码类型，默认 ['qr'] */
  barcodeTypes?: BarcodeType[];
}

const CameraScan = forwardRef<CameraScanMethods, CameraScanProps>(({
  visible: controlledVisible,
  onScanned,
  onClose,
  title = '将二维码放入框内扫描',
  barcodeTypes = ['qr'],
}, ref) => {

  const [internalVisible, setInternalVisible] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const scanHandledRef = useRef(false);

  // 支持受控和非受控模式
  const isControlled = controlledVisible !== undefined;
  const showScanner = isControlled ? controlledVisible : internalVisible;

  const handleClose = useCallback(() => {
    if (!isControlled) {
      setInternalVisible(false);
    }
    onClose?.();
  }, [isControlled, onClose]);

  const handleOpen = useCallback(async () => {
    try {
      // 检查相机权限
      if (!cameraPermission?.granted) {
        const permResult = await requestCameraPermission();
        if (!permResult.granted) {
          Alert.alert('权限提示', '需要相机权限才能扫描二维码，请在设置中打开相机权限。');
          return;
        }
      }
      // 重置标记 & 打开扫码界面
      scanHandledRef.current = false;
      if (!isControlled) {
        setInternalVisible(true);
      }
    } catch (error: any) {
      console.error('相机扫码失败:', error);
      Alert.alert('扫码失败', error?.message || '请重试');
    }
  }, [cameraPermission, requestCameraPermission, isControlled]);

  // 相机扫到条码回调
  const handleBarCodeScanned = useCallback((result: BarcodeScanningResult) => {
    // 防止重复触发
    if (scanHandledRef.current) return;
    if (!result.data) return;

    scanHandledRef.current = true;
    handleClose();
    onScanned(result.data);
  }, [onScanned, handleClose]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
  }), [handleOpen, handleClose]);

  return (
    <Modal
      visible={showScanner}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={scannerStyles.container}>
        <CameraView
          style={scannerStyles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: barcodeTypes,
          }}
          onBarcodeScanned={handleBarCodeScanned}
        />
        {/* 扫描框叠加层 */}
        <View style={scannerStyles.overlay}>
          <Text style={scannerStyles.title}>{title}</Text>
          <View style={scannerStyles.scanFrame} />
          <TouchableOpacity
            style={scannerStyles.closeBtn}
            onPress={handleClose}
          >
            <Text style={scannerStyles.closeBtnText}>关闭</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
});

CameraScan.displayName = 'CameraScan';

export default CameraScan;

const scannerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: BASE_CSS.colors.primary,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  closeBtn: {
    marginTop: 48,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
