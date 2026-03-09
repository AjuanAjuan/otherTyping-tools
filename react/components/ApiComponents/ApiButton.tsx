
import { baseButtonColor, ButtonSize, ButtonType, getButtonStyles } from '@/src/css/colorCss';
import { isFunction, isPromise } from '@/src/tool/is';
import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { Button, ButtonProps } from 'react-native-paper';
import DialogButton from '../DialogButton/DialogButton';
import Icon, { IconType } from '../icon/icon';

type ApiButtonProps<T> = {
  className?: string
  api: (params: any) => Promise<T | undefined>
  params?: any
  onFinish?: (result: T | undefined) => any
  children?: ((state: {
    data: T | undefined;
    loading: boolean;
    err: any;
  }) => React.ReactNode) | React.ReactNode | string;
  confirm?: string
  size?: ButtonSize
  type?: ButtonType
  circle?: boolean
  icon?: string
  iconStyle?: StyleProp<TextStyle>
  iconType?: IconType
} & Omit<ButtonProps, "children">

const ApiButton = <T,>({
  api,
  params,
  icon,
  onFinish,
  confirm,
  // size = 'small',
  size = 'default',
  type = 'primary',
  circle = false,
  children,
  className,
  iconStyle,
  iconType,
  disabled,
  ...otherprops }: ApiButtonProps<T>) => {

  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  // const [isFinish, setIsFinish] = useState<boolean>(false);
  const [err, setErr] = useState<any>(null);

  const apiRef = useRef(api);
  const paramsRef = useRef(params);

  // style
  const { buttonStyle, labelStyle: computedLabelStyle, contentStyle, textColor, iconSize } = getButtonStyles(type, size, circle)
  const mergedStyle = [buttonStyle, otherprops.style, disabled && styles.disabled]
  const mergedLabelStyle = [computedLabelStyle, { color: textColor }, otherprops.labelStyle]
  const mergedContentStyle = [contentStyle, otherprops.contentStyle as ViewStyle]

  // smallStyle
  const { labelStyle: smallLabelStyle, contentStyle: smallContentStyle } = getButtonStyles(type, 'small')

  const handleApi = async () => {
    try {
      setErr(null); // 开始新请求，清空旧错误
      setLoading(true);

      let p = paramsRef.current; // 从 ref 中读取最新值
      if (isPromise(params)) {
        p = await params;
      }
      else if (isFunction(params)) {
        p = params()
      }

      // 状态变更
      setLoading(true)
      const result = await apiRef.current(p)
      setData(
        result
      )
      onFinish?.(result)
      setLoading(false);

    } catch (error) {
      // 请求失败，更新错误状态
      setErr(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    apiRef.current = api;
    paramsRef.current = params;
  }, [api, params]);

  return (
    <>
      {
        confirm ? <DialogButton title={'确认操作'} {...otherprops} icon={icon}
          className={className}
          style={mergedStyle}
          labelStyle={mergedLabelStyle}
          contentStyle={mergedContentStyle}
          disabled={disabled}
          compact={false}
          buttonChildren=
          {
            icon ? (
              <Icon type={iconType} name={icon} size={iconSize} color={textColor} style={iconStyle as any} />
            ) : (
              isFunction(children) ?
                children?.({ data, loading, err }) : (children || '')
            )
          }
        >
          {({ close }) =>
            <>
              <View>
                <Text style={styles.confirmText}>{confirm}</Text>
                <View className='flex flex-row justify-between mt-2'>
                  <ApiButton type='info'
                    api={async () => { close() }} className={className}
                    labelStyle={{ ...smallLabelStyle, color: baseButtonColor.primary }}
                    contentStyle={smallContentStyle}
                    compact={false}
                  >
                    取消
                  </ApiButton>
                  <ApiButton loading={loading} api={
                    async () => { await handleApi(); close(); }}
                    mode='contained'
                    labelStyle={smallLabelStyle}
                    contentStyle={smallContentStyle}
                    compact={false}
                  >
                    确定
                  </ApiButton>
                </View>

              </View>
            </>
          }
        </DialogButton> :

          icon ? (
            <Button {...otherprops} disabled={disabled} loading={loading}
              onPress={() => handleApi()} className={className}
              style={mergedStyle}
              labelStyle={mergedLabelStyle}
              contentStyle={mergedContentStyle}
              compact={false}
            >
              <Icon type={iconType} name={icon} size={iconSize} color={textColor} style={[iconStyle as any, { height: '100%' }]}></Icon>
            </Button>
          ) :
            <Button {...otherprops} disabled={disabled} loading={loading}
              onPress={() => handleApi()} className={className}
              style={mergedStyle}
              labelStyle={mergedLabelStyle}
              contentStyle={mergedContentStyle}
              compact={false}
            >
              {
                isFunction(children) ?
                  children?.({ data, loading, err }) : (children || '')
              }
            </Button>
      }
    </>
  );
};

export default ApiButton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    marginBottom: 20,
  },
  disabled: {
    opacity: 0.5,
  }
});