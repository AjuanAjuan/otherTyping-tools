import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { BASE_CSS } from '@/src/css/colorCss';

type ApiInputNumberProps = {
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  placeholder?: string;
  style?: any;
}

const ApiInputNumber = ({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  disabled,
  placeholder = '0',
  style
}: ApiInputNumberProps) => {

  const handleIncrement = () => {
    if (disabled) return;
    const newValue = (value || 0) + step;
    if (max !== undefined && newValue > max) return;
    onValueChange?.(newValue);
  };

  const handleDecrement = () => {
    if (disabled) return;
    const newValue = (value || 0) - step;
    if (min !== undefined && newValue < min) return;
    onValueChange?.(newValue);
  };

  const handleChange = (text: string) => {
    if (disabled) return;

    if (text === '' || text === '-') {
      onValueChange?.(undefined);
      return;
    }

    const numValue = parseFloat(text);
    if (isNaN(numValue)) return;

    // 检查范围
    if (min !== undefined && numValue < min) return;
    if (max !== undefined && numValue > max) return;

    onValueChange?.(numValue);
  };

  return (
    <View style={[styles.container, style, disabled && styles.disabled]}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleDecrement}
        disabled={disabled || (min !== undefined && (value || 0) <= min)}
      >
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        value={value?.toString() || ''}
        onChangeText={handleChange}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        editable={!disabled}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleIncrement}
        disabled={disabled || (max !== undefined && (value || 0) >= max)}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ApiInputNumber;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    minWidth: 130,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: '#F3F4F6',
  },
  button: {
    width: 32,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e7e7e7ff',
    borderColor: '#b3b3b3ff',
  },
  buttonText: {
    fontSize: 20,
    color: BASE_CSS.colors.primary,
    fontWeight: '600',
  },
  input: {
    flex: 1,
    height: 40,
    minWidth: 65,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
});
