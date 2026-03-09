import { DropdownItemOutput } from '../ApiComponents/ApiSelectMeta';
import { ComponentType } from './componentMap';
/**
 * 表单字段类型（从 componentMap 中获取）
 */
export type FieldType = ComponentType;

/**
 * 树选类型
 */
export type TreeNode = {
  label?: string | null;
  value?: string | null;
  pid?: string | null;
  children?: TreeNode[] | null;
};

/**
 * 验证规则
 */
export interface ValidationRule<T extends Record<string, any> = Record<string, any>> {
  required?: boolean;
  pattern?: RegExp;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  message?: string;
  isNumber?: boolean;
  validator?: (value: any, formValues: T) => boolean | string;
}

/**
 * 选项类型（用于 select 和 radio）
 */
export interface FieldOption {
  label: string;
  value: string | number;
}

/**
 * 验证与逻辑控制配置
 */
export interface FieldValidation<T extends Record<string, any>> {
  /** 外层必填标识，如果 rules 中没有 required，则使用此值 */
  required?: boolean;
  /** 验证规则 */
  rules?: ValidationRule<T>[];
  /** 是否禁用 */
  disabled?: boolean | ((props: FormFieldApiProps<T>) => boolean);
  /** 控制字段显隐 */
  conditional?: (props: FormFieldApiProps<T>) => boolean;
  /** 依赖字段列表，字段值变化时可能需要重新获取数据 */
  dependencies?: (keyof T)[];
  /** 结果是否转换为number类型 */
  isNumber?: boolean;
}

/**
 * 组件特定配置
 */
export interface FieldComponentConfig<T extends Record<string, any>> {
  /** select 和 radio 的选项 */
  options?: FieldOption[];
  /** 字典编码，用于 ConstSelect 组件 */
  code?: string;
  /** api，支持接收 formModel 参数动态获取数据 */
  api?: (props: FormFieldApiProps<T>) => Promise<DropdownItemOutput[]>;
  /** 用于 ApiSelectMulti 组件，支持接收 formModel 参数动态获取数据 */
  multipleApi?: (props: FormFieldApiProps<T>) => Promise<TreeNode[]>;
  /** 是否为多选模式 */
  multiple?: boolean;
  /** 用于 DatePicker 组件 */
  dateMode?: 'year' | 'year-month' | 'date';
  /** 用于 DatePicker 组件是否为范围选择 */
  isRange?: boolean;
  /** 额外属性，会传递给渲染的组件（无类型限制） */
  otherProps?: Record<string, any>;
}

/**
 * 表单字段配置（分层结构）
 * 
 * 支持两种使用方式：
 * 1. 扁平化：直接在顶层定义所有属性（向后兼容）
 * 2. 分层化：使用 validation 和 componentConfig 嵌套属性
 */
export interface Field<T extends Record<string, any> = Record<string, any>, K extends keyof T = keyof T> {
  // ========== 基础信息 ==========
  /** 字段名 */
  field: K;
  /** 组件类型 */
  component: FieldType;
  /** 字段标签 */
  label: string;
  /** 占位符 */
  placeholder?: string;
  /** 默认初始化值 */
  defaultValue?: T[K];
  /** 自定义样式 */
  style?: any;

  // ========== 验证与逻辑控制（支持扁平化和嵌套两种方式）==========
  /** 验证与逻辑控制配置（嵌套方式） */
  validation?: FieldValidation<T>;
  /** 外层必填标识（扁平化方式，向后兼容） */
  required?: boolean;
  /** 验证规则（扁平化方式，向后兼容） */
  rules?: ValidationRule<T>[];
  /** 是否禁用（扁平化方式，向后兼容） */
  disabled?: boolean | ((props: FormFieldApiProps<T>) => boolean);
  /** 控制字段显隐（扁平化方式，向后兼容） */
  conditional?: (props: FormFieldApiProps<T>) => boolean;
  /** 依赖字段列表（扁平化方式，向后兼容） */
  dependencies?: (keyof T)[];
  /** 结果是否转换为number类型（扁平化方式，向后兼容） */
  isNumber?: boolean;

  // ========== 组件特定配置（支持扁平化和嵌套两种方式）==========
  /** 组件特定配置（嵌套方式） */
  componentConfig?: FieldComponentConfig<T>;
  /** select 和 radio 的选项（扁平化方式，向后兼容） */
  options?: FieldOption[];
  /** 字典编码（扁平化方式，向后兼容） */
  code?: string;
  /** api（扁平化方式，向后兼容） */
  api?: (props: FormFieldApiProps<T>) => Promise<DropdownItemOutput[]>;
  /** multipleApi（扁平化方式，向后兼容） */
  multipleApi?: (props: FormFieldApiProps<T>) => Promise<TreeNode[]>;
  /** 是否为多选模式（扁平化方式，向后兼容） */
  multiple?: boolean;
  /** 用于 DatePicker 组件（扁平化方式，向后兼容） */
  dateMode?: 'year' | 'year-month' | 'date';
  /** 用于 DatePicker 组件是否为范围选择（扁平化方式，向后兼容） */
  isRange?: boolean;
  /** 额外属性（扁平化方式，向后兼容） */
  otherProps?: Record<string, any>;
}

export type FormFieldApiProps<T> = {
  formModel: T
}

/**
 * 简化类型别名，方便使用
 */
export type FieldArray<T extends Record<string, any> = Record<string, any>> = Field<T>[];

/**
 * 表单组件 Props
 */
export interface FormProps<T extends Record<string, any> = Record<string, any>> {
  fields: Field<T>[];
  /** 如果没有则不显示按钮区域 */
  onSubmit?: (values: T) => Promise<any>;
  defaultValues?: Partial<T>;
  style?: any;
  onCancel?: () => void;
  hideCancel?: boolean;
  onFinishSubmit?: (result?: any) => any;
  cancelText?: string;
}

/**
 * 表单实例方法（通过 ref 暴露）
 */
export interface FormMethods<T extends Record<string, any> = Record<string, any>> {
  getValues: () => T;
  validate: () => Promise<boolean>;
  reset: (values?: Partial<T>) => void;
  setValue: <K extends keyof T>(name: K, value: T[K]) => void;
  getFieldError: (name: keyof T) => string | undefined;
  submit: () => Promise<any>;
}

export enum FormFieldsType {
  Add = 'add',
  Edit = 'edit',
  Display = 'display'
}



