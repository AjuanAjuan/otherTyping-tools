import { BASE_CSS, baseButtonColor } from '@/src/css/colorCss';
import React, { useState, useEffect, useRef, useCallback, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FormFieldApiProps } from '../form2/type';
import { DropdownItemOutput } from './ApiSelectMeta';

type ApiRadioButtonProps<T> = {
  value: any;
  onValueChange: (value: any) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  style?: any;
  formModel?: T;
  api: (props: FormFieldApiProps<T>) => Promise<DropdownItemOutput[]>;
  dependencies?: (keyof T)[]; // 依赖字段列表
  /** 是否多选 */
  multiple?: boolean;
  /** 样式变体：'border' (有边框) | 'plain' (无边框) */
  variant?: 'border' | 'plain';
  hasIcon?: boolean
}

// 缓存单个选项组件以优化性能
interface ApiRadioButtonItemProps {
  item: DropdownItemOutput;
  selected: boolean;
  disabled?: boolean;
  variant: 'border' | 'plain';
  hasIcon: boolean;
  onPress: (value: any) => void;
}

const ApiRadioButtonItem = React.memo<ApiRadioButtonItemProps>(({
  item,
  selected,
  disabled,
  variant,
  hasIcon,
  onPress
}) => {

  return (
    <TouchableOpacity
      style={[
        styles.item,
        variant === 'border' ? styles.itemBorder : styles.itemPlain,
        selected ? {
          backgroundColor: BASE_CSS.colors.primaryContainer,
          borderColor: baseButtonColor.primary,
        } : null,
        disabled ? styles.itemDisabled : null,
      ]}
      onPress={() => onPress(item.value)}
      activeOpacity={0.7}
      disabled={disabled}
    >
      {hasIcon && (
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{selected ? '✓' : '○'}</Text>
        </View>
      )}
      <Text
        style={[
          styles.itemText,
          selected ? styles.itemTextSelected : styles.itemTextNormal,
          disabled ? styles.textDisabled : null
        ]}
      >
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // 自定义比较函数：返回 true 表示 props 相同，跳过渲染；返回 false 表示需要重新渲染
  // 最关键的是 selected 状态，其他属性通常不会变化
  if (prevProps.selected !== nextProps.selected) {
    return false; // selected 变化了，必须重新渲染
  }

  // 检查其他可能变化的属性
  if (prevProps.disabled !== nextProps.disabled) {
    return false;
  }

  // item 的 value 和 label 通常不会变化，但为了安全还是检查
  if (prevProps.item.value !== nextProps.item.value ||
    prevProps.item.label !== nextProps.item.label) {
    return false;
  }

  // variant 和 hasIcon 通常是固定的，但也检查一下
  if (prevProps.variant !== nextProps.variant ||
    prevProps.hasIcon !== nextProps.hasIcon) {
    return false;
  }

  // 所有关键属性都相同，跳过渲染
  return true;
});

ApiRadioButtonItem.displayName = 'ApiRadioButtonItem';

export type ApiRadioButtonRef = {
  selectAll: () => void;
  clear: () => void;
  reload: () => Promise<void>;
}

const ApiRadioButtonInner = React.forwardRef(<T,>(
  {
    value,
    onValueChange,
    disabled,
    style,
    formModel,
    api,
    dependencies,
    multiple = false,
    variant = 'border',
    hasIcon = false
  }: ApiRadioButtonProps<T>,
  ref: React.Ref<ApiRadioButtonRef>
) => {

  const [apiResult, setApiResult] = useState<DropdownItemOutput[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 使用 ref 存储最新的 value，避免 handlePress 依赖 value
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const getItems = useCallback(async () => {
    try {
      const result = await api({ formModel: formModel || {} as T });
      const list = Array.isArray(result) ? result : [];
      setApiResult(list);
      setIsLoading(false);
    } catch (e) {
      console.error("ApiSelect Load Fail", e);
      setApiResult([]);
      setIsLoading(false);
    }
  }, [api, formModel])

  useImperativeHandle(ref, () => ({
    selectAll: () => {
      if (!multiple) return;
      const allValues = apiResult.map(item => item.value);
      onValueChange(allValues);
    },
    clear: () => {
      onValueChange(multiple ? [] : undefined);
    },
    reload: async () => {
      setIsLoading(true);
      await getItems();
    }
  }));

  useEffect(() => {
    setIsLoading(true);
    getItems()
  }, [...(dependencies?.map(dep => formModel?.[dep]) || [])]) // eslint-disable-line react-hooks/exhaustive-deps

  // 使用 useCallback 缓存 handlePress 函数，但不依赖 value，而是使用 valueRef
  const handlePress = useCallback((itemValue: any) => {
    if (disabled) return;

    if (multiple) {
      // 多选逻辑 - 使用 ref 获取最新值
      const currentValue = valueRef.current;
      let currentValues = Array.isArray(currentValue) ? [...currentValue] : [];

      // 检查是否存在
      const index = currentValues.indexOf(itemValue);
      if (index !== -1) {
        currentValues.splice(index, 1);
      } else {
        currentValues.push(itemValue);
      }
      onValueChange(currentValues);
    } else {
      // 单选逻辑
      const currentValue = valueRef.current;
      if (currentValue === itemValue) {
        return;
      }
      onValueChange(itemValue);
    }
  }, [disabled, multiple, onValueChange]); // 移除 value 依赖

  // isSelected 不需要 useCallback，因为它在 render 中直接调用
  const isSelected = (itemValue: any) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(itemValue);
    }
    return value === itemValue;
  };

  // 如果正在加载且没有历史数据，才显示纯 loading（避免 reload 时页面高度塌陷导致闪烁）
  if (isLoading && apiResult.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <ActivityIndicator size="small" color={baseButtonColor.primary} />
        <Text style={styles.loadingText}>加载选项中...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {apiResult.map((item, index) => (
        <ApiRadioButtonItem
          key={`${item.value}-${index}`}
          item={item}
          selected={isSelected(item.value)}
          disabled={disabled}
          variant={variant}
          hasIcon={hasIcon}
          onPress={handlePress}
        />
      ))}
    </View>
  );
});

ApiRadioButtonInner.displayName = 'ApiRadioButton';

const arePropsEqual = <T,>(prevProps: ApiRadioButtonProps<T>, nextProps: ApiRadioButtonProps<T>) => {
  if (prevProps.value !== nextProps.value) return false;
  if (prevProps.disabled !== nextProps.disabled) return false;
  if (prevProps.error !== nextProps.error) return false;
  if (prevProps.api !== nextProps.api) return false;

  const prevDeps = prevProps.dependencies || [];
  const nextDeps = nextProps.dependencies || [];
  if (prevDeps.length !== nextDeps.length) return false;
  for (const dep of nextDeps) {
    if (prevProps.formModel?.[dep] !== nextProps.formModel?.[dep]) return false;
  }
  return true;
}

// 这种带有泛型的复杂组件配合 memo 和 forwardRef 比较难处理类型，这里做一个断言
export const ApiRadioButton = React.memo(ApiRadioButtonInner, arePropsEqual) as <T>(
  props: ApiRadioButtonProps<T> & { ref?: React.Ref<ApiRadioButtonRef> }
) => React.ReactElement;

export default ApiRadioButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  item: {
    minWidth: 60,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    marginRight: 8,
  },
  itemBorder: {
    borderWidth: 1,
    borderColor: '#dcdfe6',
    backgroundColor: '#ffffff',
  },
  itemPlain: {
    borderWidth: 0,
    backgroundColor: '#f5f7fa',
  },
  itemDisabled: {
    opacity: 0.5,
  },
  itemText: {
    fontSize: 15,
  },
  itemTextNormal: {
    color: '#606266',
  },
  itemTextSelected: {
    // color: '#ffffff',
    color: '#606266',
  },
  textDisabled: {
    color: '#c8c9cc',
  },
  loadingText: {
    marginLeft: 8,
    color: '#909399',
    fontSize: 14,
  },
  iconContainer: {
    marginRight: 4,
  },
  icon: {
    fontSize: 14,
    color: '#606266',
    lineHeight: 18,
  },
});