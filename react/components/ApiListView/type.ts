
import React from 'react';

export type DisplayField<T = Record<string, any>, K extends keyof T = keyof T> = {
  /** 字段名 */
  field: K | string;
  /** 显示标签 */
  label: string;
  /** 自定义渲染函数，如果为空则使用默认格式 */
  renderer?: ({ value, record }: { value: any, record: T }) => React.ReactNode;
  /** 是否隐藏 */
  hide?: boolean;
}

export interface ListItemProps<T extends Record<string, any>> {
  /** 数据项 */
  item: T;
  /** 字段配置 */
  fields: DisplayField<T>[];
  /** 索引 */
  index?: number;
  /** 其他自定义样式 */
  style?: any;
  /** 操作按钮区域 */
  actionNodes?: React.ReactNode;
}