import { useToast } from '@/src/hook/useToast';
import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Controller, Path, useForm, } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { isNumber } from '@/src/tool/is';
import {
  HelperText,
  RadioButton,
  Text,
  TextInput
} from 'react-native-paper';
import ApiButton from '../ApiComponents/ApiButton';
import ApiSelect from '../ApiComponents/ApiSelect';
import ConstSelect from '../ApiComponents/ConstSelect';
import { Field, FormMethods, FormProps } from './type';
import { inputStyles } from '../ApiComponents/select-style';
import ApiSelectMulti from '../ApiComponents/ApiSelectMulti';
import DatePicker from '../ApiComponents/DatePicker';
import ApiRadioButton from '../ApiComponents/ApiRadioButton';

function FormInner<T extends Record<string, any> = Record<string, any>>(
  props: FormProps<T>,
  ref?: React.ForwardedRef<FormMethods<T>>
) {
  const { fields, onSubmit, defaultValues, style } = props;
  const { error: showToastError } = useToast();

  // 构建默认值对象
  const formDefaultValues = useMemo(() => {
    const values: any = { ...defaultValues };
    fields.forEach((field) => {
      if (field.defaultValue !== undefined && values[field.field] === undefined) {
        values[field.field] = field.defaultValue;
      }
    });
    return values as T;
  }, [fields, defaultValues]);

  const {
    control,
    handleSubmit,
    getValues,
    reset,
    setValue,
    watch,
    formState: { errors },
    trigger,
  } = useForm<T>({
    defaultValues: formDefaultValues as any,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  // 监听所有字段值变化，用于条件渲染
  const formValues = watch() as T;

  // 暴露表单方法给父组件
  useImperativeHandle(ref, () => ({
    getValues: () => {
      // 遍历所有fields,如果filed有isNumber,则将结果转为number
      const values = getValues() as T;
      fields.forEach((field) => {
        if (field.isNumber) {
          (values as any)[field.field as string] = Number((values as any)[field.field as string]);
        }
      });
      return values;
    },
    validate: async () => {
      const result = await trigger();
      return result;
    },
    reset: (values?: Partial<T>) => {
      if (values) {
        reset(values as T);
      } else {
        reset(formDefaultValues);
      }
    },
    setValue: <K extends keyof T>(name: K, value: T[K]) => {
      setValue(name as unknown as Path<T>, value, { shouldValidate: true });
    },
    getFieldError: (name: keyof T) => {
      return errors[name as Path<T>]?.message as string | undefined;
    },
    submit: () => {
      return handleSubmit(handleFormSubmit as any)();
    },
  }));

  // 验证规则转换
  const convertRules = (field: Field<T>) => {
    const rules = field.rules || [];
    const reactHookFormRules: any = {};

    // 检查 rules 中是否有 required
    const hasRequiredInRules = rules.some(rule => rule.required !== undefined);

    // 优先级：如果 rules 中有 required，使用 rules 中的；否则使用外层的 require
    let requiredValue: boolean | undefined;
    let requiredMessage: string | undefined;

    if (hasRequiredInRules) {
      // 如果 rules 中有 required，以 rules 中的为准
      const requiredRule = rules.find(rule => rule.required !== undefined);
      if (requiredRule) {
        requiredValue = requiredRule.required;
        requiredMessage = requiredRule.message;
      }
    } else if (field.required !== undefined) {
      // 如果 rules 中没有 required，但外层有 required，使用外层的
      requiredValue = field.required;
      requiredMessage = undefined; // 外层 require 没有 message，使用默认消息
    }

    // 设置 required 规则
    if (requiredValue === true) {
      reactHookFormRules.required = requiredMessage || '此字段为必填项';
    } else if (requiredValue === false) {
      reactHookFormRules.required = false;
    }

    rules.forEach((rule) => {
      // required 已经在上面处理过了，这里跳过
      if (rule.required !== undefined) {
        return;
      }
      if (rule.pattern) {
        reactHookFormRules.pattern = {
          value: rule.pattern,
          message: rule.message || '格式不正确',
        };
      }
      if (rule.minLength !== undefined) {
        reactHookFormRules.minLength = {
          value: rule.minLength,
          message: rule.message || `最少需要 ${rule.minLength} 个字符`,
        };
      }
      if (rule.maxLength !== undefined) {
        reactHookFormRules.maxLength = {
          value: rule.maxLength,
          message: rule.message || `最多允许 ${rule.maxLength} 个字符`,
        };
      }
      if (rule.min !== undefined) {
        reactHookFormRules.min = {
          value: rule.min,
          message: rule.message || `最小值不能小于 ${rule.min}`,
        };
      }
      if (rule.max !== undefined) {
        reactHookFormRules.max = {
          value: rule.max,
          message: rule.message || `最大值不能大于 ${rule.max}`,
        };
      }
      if (rule.validator) {
        reactHookFormRules.validate = (value: any) => {
          const result = rule.validator!(value, formValues);
          if (result === true) return true;
          if (typeof result === 'string') return result;
          return rule.message || '验证失败';
        };
      }
      if (field.isNumber || rule.isNumber) {
        reactHookFormRules.validate = (value: any) => {
          if (!isNumber(value, true)) {
            return rule.message || '必须是数字';
          }
          return true;
        };
      }
    });

    return reactHookFormRules;
  };

  // 判断字段是否禁用
  const isFieldDisabled = (field: Field<T>): boolean => {
    if (typeof field.disabled === 'function') {
      return field.disabled({ formModel: formValues });
    }
    return field.disabled || false;
  };

  // 判断字段是否显示
  const isFieldVisible = (field: Field<T>): boolean => {
    if (field.conditional) {
      return field.conditional({ formModel: formValues });
    }
    return true;
  };

  // 渲染文本输入框
  const renderTextInput = (field: Field<T>) => {
    const disabled = isFieldDisabled(field);

    return (
      <Controller
        key={String(field.field)}
        control={control}
        name={field.field as Path<T>}
        rules={convertRules(field)}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldContainer}>
            <Text>{field.label}</Text>
            <TextInput
              placeholder={field.placeholder}
              value={String(value ?? '')}
              onBlur={onBlur}
              onChangeText={onChange}
              disabled={disabled}
              mode="outlined"
              style={[inputStyles.input, field.style]}
              {...(field.otherProps || {})}
              error={!!errors[field.field as Path<T>]}
              right={
                value && <TextInput.Icon icon="close-circle" size={14}
                  onPress={() => onChange('')}>
                </TextInput.Icon>
              }
              keyboardType={field.isNumber ? 'numeric' : 'default'}
            />
            {errors[field.field as Path<T>] && (
              <HelperText type="error" style={{ padding: 0 }} visible={!!errors[field.field as Path<T>]}>
                {errors[field.field as Path<T>]?.message as string}
              </HelperText>
            )}
          </View>
        )}
      />
    );
  };

  // 渲染密码输入框
  const renderPasswordInput = (field: Field<T>) => {
    const disabled = isFieldDisabled(field);
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

    return (
      <Controller
        key={String(field.field)}
        control={control}
        name={field.field as Path<T>}
        rules={convertRules(field)}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={styles.fieldContainer}>
            <Text>{field.label}</Text>
            <TextInput
              placeholder={field.placeholder}
              value={String(value ?? '')}
              onBlur={onBlur}
              onChangeText={onChange}
              disabled={disabled}
              mode="outlined"
              style={[inputStyles.input, field.style]}
              {...(field.otherProps || {})}
              error={!!errors[field.field as Path<T>]}
              secureTextEntry={!isPasswordVisible}
              autoComplete="password"
              textContentType="password"
              right={
                <TextInput.Icon
                  icon={isPasswordVisible ? 'eye-off' : 'eye'}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                />
              }
            />
            {errors[field.field as Path<T>] && (
              <HelperText type="error" style={{ padding: 0 }} visible={!!errors[field.field as Path<T>]}>
                {errors[field.field as Path<T>]?.message as string}
              </HelperText>
            )}
          </View>
        )}
      />
    );
  };

  // 在 Form 组件中添加 Select 渲染方法
  const renderSelect = (field: Field<T>) => {
    const disabled = isFieldDisabled(field);

    return (
      <Controller
        key={String(field.field)}
        control={control}
        name={field.field as Path<T>}
        rules={convertRules(field)}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View style={{ ...styles.fieldContainer }}>
            <Text>{field.label}</Text>
            <ApiSelect
              api={field.api!}
              value={value}
              onValueChange={(selectedValue) => {
                onChange(selectedValue);
              }}
              items={field.options || []}
              label={field.label}
              placeholder={field.placeholder}
              disabled={disabled}
              error={!!error}
              style={{ ...field.style }}
              formModel={formValues}
              dependencies={field.dependencies}
              {...(field.otherProps || {})}
            />
            {errors[field.field as Path<T>] && (
              <HelperText type="error" style={{ padding: 0 }} visible={!!errors[field.field as Path<T>]}>
                {errors[field.field as Path<T>]?.message as string}
              </HelperText>
            )}
          </View>
        )}
      />
    );
  };

  // 渲染单选按钮组
  const renderRadioGroup = (field: Field<T>) => {
    const disabled = isFieldDisabled(field);
    return (
      <Controller
        key={String(field.field)}
        control={control}
        name={field.field as Path<T>}
        rules={convertRules(field)}
        render={({ field: { onChange, value } }) => (
          <View style={styles.fieldContainer}>
            {field.label && (
              <Text style={styles.radioLabel}>{field.label}</Text>
            )}
            <RadioButton.Group
              onValueChange={(val) => onChange(val)}
              value={String(value ?? '')}
            >
              {field.options?.map((option) => (
                <RadioButton.Item
                  key={String(option.value)}
                  label={option.label}
                  value={String(option.value)}
                  disabled={disabled}
                  style={field.style}
                  {...(field.otherProps || {})}
                />
              ))}
            </RadioButton.Group>
            {errors[field.field as Path<T>] && (
              <HelperText type="error" style={{ padding: 0 }} visible={!!errors[field.field as Path<T>]}>
                {errors[field.field as Path<T>]?.message as string}
              </HelperText>
            )}
          </View>
        )}
      />
    );
  };

  // 渲染常量选择框
  const renderConstSelect = (field: Field<T>) => {
    const disabled = isFieldDisabled(field);

    return (
      <Controller
        key={String(field.field)}
        control={control}
        name={field.field as Path<T>}
        rules={convertRules(field)}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <View style={{ ...styles.fieldContainer }}>
            <Text>{field.label}</Text>
            {
              field.code &&
              <ConstSelect
                code={field.code!} // 字典编码
                value={value}
                error={!!error}
                onValueChange={onChange}
                label={field.label}
                placeholder={field.placeholder}
                disabled={disabled}
                style={{ ...field.style }}
                {...(field.otherProps || {})}
              />
            }
            {errors[field.field as Path<T>] && (
              <HelperText type="error" style={{ padding: 0 }} visible={!!errors[field.field as Path<T>]}>
                {errors[field.field as Path<T>]?.message as string}
              </HelperText>
            )}
          </View>
        )}
      />
    );
  };


  const renderMultiSelect = (field: Field<T>) => {
    const disabled = isFieldDisabled(field);
    return (
      <Controller
        key={String(field.field)}
        control={control}
        name={field.field as Path<T>}
        rules={convertRules(field)}
        render={({ field: { onChange, value } }) => {
          return (
            <View style={{ ...styles.fieldContainer }}>
              <Text>{field.label}</Text>
              <ApiSelectMulti
                formModel={formValues}
                multipleApi={field.multipleApi!}
                dependencies={field.dependencies}
                value={value as string[]}
                onValueChange={(checkedIds) => {
                  onChange(checkedIds);
                }}
                disabled={disabled}
                {...(field.otherProps || {})}
              />
              {errors[field.field as Path<T>] && (
                <HelperText type="error" style={{ padding: 0 }} visible={!!errors[field.field as Path<T>]}>
                  {errors[field.field as Path<T>]?.message as string}
                </HelperText>
              )}
            </View>
          );
        }}
      />
    );
  }

  const renderDatePicker = (field: Field<T>) => {
    const disabled = isFieldDisabled(field);
    return (
      <Controller
        key={String(field.field)}
        control={control}
        name={field.field as Path<T>}
        rules={convertRules(field)}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return (
            <View style={{ ...styles.fieldContainer }}>
              <Text>{field.label}</Text>
              <DatePicker
                value={value as string}
                onValueChange={onChange}
                mode={field.dateMode || 'date'}
                placeholder={field.placeholder}
                disabled={disabled}
                isRange={field.isRange}
                error={!!error}
                style={{ ...field.style }}
                {...(field.otherProps || {})}
              />
              {errors[field.field as Path<T>] && (
                <HelperText type="error" style={{ padding: 0 }} visible={!!errors[field.field as Path<T>]}>
                  {errors[field.field as Path<T>]?.message as string}
                </HelperText>
              )}
            </View>
          );
        }}
      />
    );
  }

  // api单(多)选框(常用)
  const renderApiRadioButton = (field: Field<T>) => {
    const disabled = isFieldDisabled(field);
    return (
      <Controller
        key={String(field.field)}
        control={control}
        name={field.field as Path<T>}
        rules={convertRules(field)}
        render={({ field: { onChange, value }, fieldState: { error } }) => {
          return (
            <View style={{ ...styles.fieldContainer }}>
              <Text>{field.label}</Text>
              <ApiRadioButton
                api={field.api!}
                value={value}
                onValueChange={onChange}
                label={field.label}
                placeholder={field.placeholder}
                disabled={disabled}
                multiple={field.multiple}
                error={!!error}
                style={{ ...field.style }}
                formModel={formValues}
                dependencies={field.dependencies}
                {...(field.otherProps || {})}
              />
              {errors[field.field as Path<T>] && (
                <HelperText type="error" style={{ padding: 0 }} visible={!!errors[field.field as Path<T>]}>
                  {errors[field.field as Path<T>]?.message as string}
                </HelperText>
              )}
            </View>
          );
        }}
      />
    );
  }

  // 渲染单个字段
  const renderField = (field: Field<T>) => {
    // 条件渲染：如果字段不满足显示条件，则不渲染
    if (!isFieldVisible(field)) {
      return null;
    }

    switch (field.component) {
      case 'Input':
        return renderTextInput(field);
      case 'Password':
        return renderPasswordInput(field);
      case 'ApiSelect':
        return renderSelect(field);
      case 'Radio':
        return renderRadioGroup(field);
      case 'ConstSelect':
        return renderConstSelect(field);
      case 'MultiSelect':
        return renderMultiSelect(field);
      case 'DatePicker':
        return renderDatePicker(field);
      case 'ApiRadio':
        return renderApiRadioButton(field);

      default:
        // 对于其他组件类型，可以根据需要扩展
        console.warn(`Unknown field component: ${field.component}`);
        return null;
    }
  };


  const handleFormSubmit = React.useCallback(async (values: T) => {
    try {
      // 移除空项
      const filteredValues = Object.fromEntries(
        Object.entries(values).filter(([_, value]) => value !== undefined && value !== null && value !== '')
      );
      const result = await onSubmit?.(filteredValues as T);
      // 只有在验证通过且 onSubmit 执行成功后才调用 finish 回调
      props.onFinishSubmit?.(result);
    } catch (err: any) {
      // console.error('Form submission error:', err);
      showToastError('操作失败', err?.message || '请稍后重试');
    }
  }, [onSubmit, props.onFinishSubmit, showToastError]);

  // smallStyle
  // const { labelStyle: smallLabelStyle } = getButtonStyles('primary', 'small')

  return (
    <View style={[styles.container, style]}>
      {fields.map(renderField)}
      {onSubmit && (
        <>
          <View className='flex flex-row justify-around'>
            <ApiButton
              mode="contained"
              type='primary'
              size='small'
              api={handleSubmit(handleFormSubmit as any)}
              style={{ ...styles.submitButton }}
            >
              提交
            </ApiButton>
            {!props.hideCancel && <ApiButton
              mode="contained"
              type='info'
              style={styles.submitButton}
              api={props.onCancel ? async () => { props.onCancel?.() } : async () => { }}
            >
              {props.cancelText || '取消'}
            </ApiButton>}
          </View>
        </>
      )}
    </View>
  );
}

// 使用 forwardRef 包装以支持泛型
const Form = forwardRef(FormInner) as <T extends Record<string, any> = Record<string, any>>(
  props: FormProps<T> & { ref?: React.ForwardedRef<FormMethods<T>> }
) => React.ReactElement;

// 设置 displayName
(Form as any).displayName = 'Form';

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  fieldContainer: {
    // height: 80,
    marginBottom: 8,
    display: 'flex',
  },
  selectAnchor: {
    position: 'relative',
  },
  radioLabel: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 24,
  },
});

export default Form;
