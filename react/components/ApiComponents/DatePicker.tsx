import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { selectStyles as styles } from './select-style';

/**
 * Isolated Picker component to prevent re-render sync lag on iOS
 */
const InternalPickerCol = React.memo(({ items, value, onValueChange, flex = 1 }: {
  items: { label: string, value: any }[],
  value: any,
  onValueChange: (val: any) => void,
  flex?: number
}) => {
  return (
    <View style={[styles.pickerColumn, { flex }]}>
      <Picker
        selectedValue={value}
        onValueChange={(val) => {
          if (val !== undefined) onValueChange(val);
        }}
        itemStyle={styles.pickerItem}
      >
        {items.map(item => (
          <Picker.Item key={String(item.value)} label={String(item.label)} value={item.value} />
        ))}
      </Picker>
    </View>
  );
}, (prev, next) => prev.value === next.value && prev.items === next.items);

export type DatePickerMode = 'year' | 'year-month' | 'date';

interface DatePickerProps {
  value: string | (string | null)[] | null | undefined;
  onValueChange: (value: string | (string | null)[] | null) => void;
  mode?: DatePickerMode;
  isRange?: boolean;
  placeholder?: string;
  startPlaceholder?: string;
  endPlaceholder?: string;
  disabled?: boolean;
  style?: any;
  error?: boolean;
  startYear?: number;
  endYear?: number;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onValueChange,
  mode = 'date',
  isRange = false,
  placeholder = '请选择日期',
  startPlaceholder = '开始日期',
  endPlaceholder = '结束日期',
  disabled = false,
  style,
  error = false,
  startYear = new Date().getFullYear() - 50,
  endYear = new Date().getFullYear() + 50,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeRangeIndex, setActiveRangeIndex] = useState<0 | 1 | null>(null); // 0 for start, 1 for end

  // Helper to parse date string
  const parseDate = (val: string | null | undefined) => {
    if (!val) return { y: new Date().getFullYear(), m: new Date().getMonth() + 1, d: new Date().getDate() };
    const segments = val.split('-');
    return {
      y: parseInt(segments[0], 10),
      m: segments[1] ? parseInt(segments[1], 10) : 1,
      d: segments[2] ? parseInt(segments[2], 10) : 1
    };
  };

  const [tempState, setTempState] = useState(parseDate(null));

  // Generate Data
  const years = useMemo(() => {
    const list = [];
    for (let i = startYear; i <= endYear; i++) {
      list.push({ label: `${i}年`, value: i });
    }
    return list;
  }, [startYear, endYear]);

  const months = useMemo(() => {
    const list = [];
    for (let i = 1; i <= 12; i++) {
      list.push({ label: `${i}月`, value: i });
    }
    return list;
  }, []);

  const days = useMemo(() => {
    const totalDays = new Date(tempState.y, tempState.m, 0).getDate();
    const list = [];
    for (let i = 1; i <= totalDays; i++) {
      list.push({ label: `${i}日`, value: i });
    }
    return list;
  }, [tempState.y, tempState.m]);

  const handleOpen = useCallback((index?: 0 | 1) => {
    if (disabled) return;

    let targetValue: string | null = null;
    if (isRange && Array.isArray(value)) {
      targetValue = value[index ?? 0] || null;
      setActiveRangeIndex(index ?? 0);
    } else {
      targetValue = value as string || null;
      setActiveRangeIndex(0);
    }

    setTempState(parseDate(targetValue));
    setIsVisible(true);
  }, [disabled, value, isRange]);

  const handleClear = useCallback((index?: 0 | 1) => {
    if (isRange) {
      const currentRange = Array.isArray(value) ? [...value] : [null, null];
      currentRange[index ?? 0] = null;
      onValueChange(currentRange);
    } else {
      onValueChange(null);
    }
  }, [isRange, value, onValueChange]);

  const handleConfirm = () => {
    let resultStr = `${tempState.y}`;
    if (mode === 'year-month' || mode === 'date') {
      resultStr += `-${String(tempState.m).padStart(2, '0')}`;
    }
    if (mode === 'date') {
      const maxDays = new Date(tempState.y, tempState.m, 0).getDate();
      const actualDay = tempState.d > maxDays ? maxDays : tempState.d;
      resultStr += `-${String(actualDay).padStart(2, '0')}`;
    }

    if (isRange) {
      const currentRange = Array.isArray(value) ? [...value] : [null, null];
      if (activeRangeIndex === 0) {
        currentRange[0] = resultStr;
      } else {
        currentRange[1] = resultStr;
      }
      onValueChange(currentRange);
    } else {
      onValueChange(resultStr);
    }
    setIsVisible(false);
  };

  const renderTrigger = (val: string | null | undefined, pText: string, index?: 0 | 1) => (
    <View style={[localStyles.trigger, isRange && localStyles.rangeTrigger]}>
      <TouchableOpacity
        onPress={() => handleOpen(index)}
        disabled={disabled}
        activeOpacity={0.7}
        style={[styles.textWrapper, error && styles.borderError, disabled && { opacity: 0.5 }, isRange && localStyles.rangeTrigger]}
      >
        <Text style={[styles.text, !val && styles.placeholderText, { flex: 1 }]} numberOfLines={1}>
          {val || pText}
        </Text>
        {val && !disabled && (
          <TouchableOpacity
            onPress={() => handleClear(index)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.clearButton}
          >
            <MaterialCommunityIcons name="close-circle" size={14} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, localStyles.wrapper, style]}>
      {!isRange ? (
        renderTrigger(value as string, placeholder)
      ) : (
        <View style={localStyles.rangeContainer}>
          {renderTrigger((value as any)?.[0], startPlaceholder, 0)}
          <Text style={localStyles.separator}>至</Text>
          {renderTrigger((value as any)?.[1], endPlaceholder, 1)}
        </View>
      )}

      <Modal visible={isVisible} transparent animationType="slide" onRequestClose={() => setIsVisible(false)}>
        <View style={styles.modalWrapper}>
          <Pressable style={styles.backdrop} onPress={() => setIsVisible(false)} />
          <View style={styles.modalContent}>
            <View style={styles.toolbar}>
              <TouchableOpacity onPress={() => setIsVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
                <Text style={styles.toolbarFont}>取消</Text>
              </TouchableOpacity>
              <Text style={localStyles.toolbarTitle}>
                {isRange ? (activeRangeIndex === 0 ? "选择开始时间" : "选择结束时间") : "选择日期"}
              </Text>
              <TouchableOpacity onPress={handleConfirm} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
                <Text style={styles.toolbarFont}>确定</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerRow}>
              <InternalPickerCol
                items={years}
                value={tempState.y}
                onValueChange={(y) => setTempState(s => ({ ...s, y }))}
              />
              {(mode === 'year-month' || mode === 'date') && (
                <InternalPickerCol
                  items={months}
                  value={tempState.m}
                  onValueChange={(m) => setTempState(s => ({ ...s, m }))}
                />
              )}
              {mode === 'date' && (
                <InternalPickerCol
                  items={days}
                  value={tempState.d}
                  onValueChange={(d) => setTempState(s => ({ ...s, d }))}
                />
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const localStyles = StyleSheet.create({
  wrapper: {
    height: 'auto', // Allow multi-line/wrap
  },
  trigger: {
    flex: 1,
  },
  rangeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  rangeTrigger: {
    minWidth: 120,
    flex: 1,
  },
  separator: {
    paddingHorizontal: 10,
    color: '#666',
  },
  toolbarTitle: {
    fontSize: 15,
    color: '#666',
  }
});

export default DatePicker;