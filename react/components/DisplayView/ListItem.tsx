
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { styles as listStyles } from '../ApiListView/css';
import { ListItemProps } from '../ApiListView/type';

export function ListItem<T extends Record<string, any>>({
  item,
  fields,
  index,
  style,
  actionNodes
}: ListItemProps<T>) {

  const renderValue = (fieldConfig: any, value: any) => {
    if (value === null || value === undefined) {
      return <Text style={styles.emptyText}>-</Text>;
    }
    // 简单类型直接显示
    if (typeof value === 'string' || typeof value === 'number') {
      return <Text style={styles.valueText}>{value}</Text>;
    }
    // 布尔值
    if (typeof value === 'boolean') {
      return <Text style={styles.valueText}>{value ? '是' : '否'}</Text>;
    }
    // 日期对象 (假设是Date或者符合日期格式的字符串，这里做个简单处理，通常后端返回字符串)
    // 如果是对象且不是React元素，尝试转字符串
    if (typeof value === 'object' && !React.isValidElement(value)) {
      try {
        return <Text style={styles.valueText}>{JSON.stringify(value)}</Text>
      } catch (e) {
        return <Text style={styles.valueText}>Object</Text>;
      }
    }
    return value;
  };

  return (
    <View style={[listStyles.listItem, style]} key={index}>
      {fields?.map((fieldConfig, idx) => {
        if (fieldConfig.hide) return null;

        // 获取值，支持嵌套属性 a.b.c
        const getValue = (obj: any, path: string) => {
          return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        };

        const rawValue = getValue(item, fieldConfig.field as string);

        return (
          <View key={`${String(fieldConfig.field)}-${idx}`} style={styles.filedRow}>
            <Text style={styles.label}>{fieldConfig.label}:</Text>
            <View style={styles.valueContainer}>
              {fieldConfig.renderer
                ? fieldConfig.renderer({ value: rawValue, record: item })
                : renderValue(fieldConfig, rawValue)
              }
            </View>
          </View>
        );
      })}

      {actionNodes && (
        <View style={styles.actionContainer}>
          {actionNodes}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  filedRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start', // 顶部对齐，防止多行文本导致label错位
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120, // 固定宽度或者最小宽度，保持对齐
    marginRight: 8,
    marginTop: 2, // 微调
  },
  valueContainer: {
    fontSize: 14,
    flex: 1,
  },
  valueText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
  }
});
