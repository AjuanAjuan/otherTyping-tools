import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useConstDictStore } from '@/src/store/constDict';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Modal, Pressable, Text, View, TouchableOpacity, Platform } from 'react-native';
import { selectStyles as styles } from './select-style';
import RNPickerSelect from 'react-native-picker-select';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ConstSelectProps {
  value: string | number | null | undefined;
  onValueChange: (value: string | number | null) => void;
  code: string; // 字典编码
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  style?: any;
  mode?: 'dialog' | 'dropdown'
  error?: boolean;
}

const ConstSelectInner: React.FC<ConstSelectProps> = ({
  value,
  onValueChange,
  code,
  label,
  error = false,
  placeholder = '请选择...',
  disabled = false,
  style,
}) => {
  const { getDictByCode, initConstDict } = useConstDictStore();
  const [isVisible, setIsVisible] = useState(false);
  const [tempValue, setTempValue] = useState<any>(null);

  // 初始化字典
  useEffect(() => {
    initConstDict();
  }, [initConstDict]);

  const dictData = getDictByCode(code);

  const pickerItems = useMemo(() => {
    if (!dictData || dictData.length === 0) return [];
    return dictData.map(item => ({
      label: item.name || String(item.code || ''),
      value: item.code,
    }));
    // JSON序列化依赖对比
  }, [JSON.stringify(dictData)]);

  const handleOpen = useCallback(() => {
    if (disabled) return;
    const initialValue = (value !== undefined && value !== null && value !== '') ? value : (pickerItems.length > 0 ? pickerItems[0].value : null);
    setTempValue(initialValue);
    setIsVisible(true);
  }, [disabled, value, pickerItems]);

  const handleConfirm = useCallback(() => {
    onValueChange(tempValue);
    setIsVisible(false);
  }, [onValueChange, tempValue]);

  const handleClear = useCallback(() => {
    onValueChange(null);
  }, [onValueChange]);

  // 查表支持类型宽泛匹配
  const selectedItem = useMemo(() => {
    return pickerItems.find(item => String(item.value) === String(value));
  }, [pickerItems, value]);

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
          placeholder={{ label: placeholder, value: null, color: '#9EA0A4' }}
          items={pickerItems}
          onValueChange={(val) => {
            // 有可能出现数值相等的string = number
            if (val !== undefined && (value == null || val.toString() != value.toString())) {
              onValueChange(val);
            };
          }}
          value={value}
        /> :
        <>
          {/*  git开源封装的,但是会出现闪退问题
          <RNPickerSelect
            value={value}
            onValueChange={onValueChange}
            items={pickerItems}
            disabled={disabled}
            placeholder={{
              label: placeholder,
              value: null,
              color: '#9EA0A4',
            }}
            useNativeAndroidPickerStyle={false}
            style={{
              inputIOS: { ...styles.inputIOS, },
              inputAndroid: { ...styles.inputAndroid, },
              placeholder: { color: '#9EA0A4' },
              viewContainer: { justifyContent: 'center', }
            }}
          >
            <View pointerEvents="none" style={[styles.textWrapper, error && styles.borderError]}>
              <Text style={[styles.text, !value && styles.placeholderText]}>
                {value && selectedItem ? selectedItem.label : (value || placeholder)}
              </Text>
            </View>
          </RNPickerSelect> */}
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

              <SafeAreaView edges={['bottom']} style={{ backgroundColor: '#caced6' }}>
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
                      {pickerItems.map(item => (
                        <Picker.Item key={String(item.value)} label={String(item.label)} value={item.value} />
                      ))}
                      {pickerItems.length === 0 && <Picker.Item label="无数据" value={null} />}
                    </Picker>
                  </View>
                </View>
              </SafeAreaView>
            </View>
          </Modal>
        </>
      }
    </View>
  );
};

export const ConstSelect = React.memo(ConstSelectInner, (prev, next) => {
  return prev.value === next.value &&
    prev.disabled === next.disabled &&
    prev.error === next.error &&
    prev.code === next.code;
}) as React.FC<ConstSelectProps>;

export default ConstSelect;