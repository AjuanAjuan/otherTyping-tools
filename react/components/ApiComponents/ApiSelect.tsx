import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Modal, Pressable, Text, View, TouchableOpacity, Platform } from 'react-native';
import { FormFieldApiProps } from '../form2/type';
import { DropdownItemOutput } from './ApiSelectMeta';
import { selectStyles as styles } from './select-style';
import RNPickerSelect from 'react-native-picker-select';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ApiSelectProps<T> {
  value: any;
  onValueChange: (value: any) => void;
  items?: Array<{
    label: string;
    value: any;
    disabled?: boolean;
  }>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  style?: any;
  formModel?: T;
  api: (props: FormFieldApiProps<T>) => Promise<DropdownItemOutput[]>;
  dependencies?: (keyof T)[]; // 依赖字段列表
}

const ApiSelectInner = <T,>({
  value,
  onValueChange,
  placeholder = '请选择...',
  disabled = false,
  error = false,
  style,
  api,
  formModel,
  dependencies,
}: ApiSelectProps<T>) => {

  const [apiResult, setApiResult] = useState<DropdownItemOutput[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [tempValue, setTempValue] = useState<any>(null);

  useEffect(() => {
    const getItems = async () => {
      if (api) {
        try {
          const result = await api({ formModel: formModel || {} as T });
          const list = Array.isArray(result) ? result : [];
          setApiResult(list);
          setIsLoaded(true);
        } catch (e) {
          console.error("ApiSelect Load Fail", e);
          setApiResult([]);
          setIsLoaded(true);
        }
      }
    }
    getItems()
  }, [...(dependencies?.map(dep => formModel?.[dep]) || [])])

  const handleOpen = useCallback(() => {
    if (disabled) return;
    const initialValue = (value !== undefined && value !== null && value !== '') ? value : (apiResult.length > 0 ? apiResult[0].value : null);
    setTempValue(initialValue);
    setIsVisible(true);
  }, [disabled, value, apiResult]);

  const handleConfirm = useCallback(() => {
    onValueChange(tempValue);
    setIsVisible(false);
  }, [onValueChange, tempValue]);

  const handleClear = useCallback(() => {
    onValueChange(null);
  }, [onValueChange]);

  const selectedItem = useMemo(() => {
    return apiResult.find(item => String(item.value) === String(value));
  }, [apiResult, value]);

  if (!isLoaded) {
    return <View style={[styles.container, style]}><Text style={styles.loadingText}>加载中...</Text></View>;
  }

  return (
    <View style={[styles.container, style]}>
      {Platform.OS !== 'ios' ?
        <RNPickerSelect
          style={{
            inputAndroid: {
              fontSize: 16,
              paddingHorizontal: 10,
              paddingVertical: 8,
              borderWidth: 1,
              borderColor: 'gray',
              borderRadius: 4,
              color: 'black',
              paddingRight: 30, // to ensure the text is never behind the icon
            },
            iconContainer: {
              top: 10,
              right: 12,
            },
          }}
          items={apiResult}
          onValueChange={(val) => {
            // 有可能出现数值相等的string = number
            if (val !== undefined && (value == null || val.toString() != value.toString())) {
              onValueChange(val);
            };
          }}
          value={value}
        /> :
        <>
          <TouchableOpacity onPress={handleOpen} disabled={disabled} activeOpacity={0.7}>
            <View style={[styles.textWrapper, error && styles.borderError, disabled && { opacity: 0.5 }]}>
              <Text style={[styles.text, (value === undefined || value === null || value === '') && styles.placeholderText, { flex: 1 }]} numberOfLines={1}>
                {selectedItem ? selectedItem.label : (value !== undefined && value !== null ? String(value) : placeholder)}
              </Text>
              {value !== undefined && value !== null && value !== '' && !disabled && (
                <TouchableOpacity
                  onPress={handleClear}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={styles.clearButton}
                >
                  <MaterialCommunityIcons name="close-circle" size={14} />
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
          <Modal
            visible={isVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsVisible(false)}
            statusBarTranslucent={false}
          >
            <View style={styles.modalWrapper}>
              <Pressable style={styles.backdrop} onPress={() => setIsVisible(false)} />

              <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#f2f2f7' }}>
                <View style={styles.modalContent}>
                  <View style={styles.toolbar}>
                    <TouchableOpacity onPress={() => setIsVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
                      <Text style={styles.toolbarFont}>取消</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleConfirm} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
                      <Text style={styles.toolbarFont}>确定</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.pickerRow}>
                    <Picker
                      selectedValue={tempValue}
                      onValueChange={(val) => {
                        if (val !== undefined) setTempValue(val);
                      }}
                      style={styles.pickerColumn}
                      itemStyle={styles.pickerItem}
                    >
                      {apiResult.map(item => (
                        <Picker.Item key={String(item.value)} label={String(item.label)} value={item.value} />
                      ))}
                      {apiResult.length === 0 && <Picker.Item label="无数据" value={null} />}
                    </Picker>
                  </View>
                </View>
              </SafeAreaView>
            </View>
          </Modal>
        </>
      }
    </View >
  );
};

const arePropsEqual = (prevProps: ApiSelectProps<any>, nextProps: ApiSelectProps<any>) => {
  if (prevProps.value !== nextProps.value) return false;
  if (prevProps.disabled !== nextProps.disabled) return false;
  if (prevProps.error !== nextProps.error) return false;

  const prevDeps = prevProps.dependencies || [];
  const nextDeps = nextProps.dependencies || [];
  if (prevDeps.length !== nextDeps.length) return false;
  for (const dep of nextDeps) {
    if (prevProps.formModel?.[dep] !== nextProps.formModel?.[dep]) return false;
  }
  return true;
}

export const ApiSelect = React.memo(ApiSelectInner, arePropsEqual) as typeof ApiSelectInner;

export default ApiSelect;