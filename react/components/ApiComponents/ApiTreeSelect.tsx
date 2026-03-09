// import React, { useEffect, useRef, useState } from 'react';
// import { StyleSheet, View } from 'react-native';
// import { FormFieldApiProps } from '../form2/type';


// type ApiTreeSelectProps<T> = {
//   api: (props: FormFieldApiProps<T>) => Promise<TreeNode[]>;
//   value?: string;
//   onValueChange?: (value: string | string[]) => void;
//   disabled?: boolean;
//   multiple?: boolean; // 是否为多选模式，默认为 true
//   formModel: T;
//   dependencies?: (keyof T)[]; // 依赖字段列表
//   placeholder?: string;
// }

// const ApiTreeSelect = <T,>({
//   api,
//   value,
//   onValueChange,
//   disabled = false,
//   multiple = false,
//   formModel,
//   dependencies
// }: ApiTreeSelectProps<T>) => {
//   const [treeData, setTreeData] = useState([] as TreeNode[]);
//   // const [isLoading, setIsLoading] = useState(false);
//   const [selectedValue, setSelectedValue] = useState<string | string[]>(value || (multiple ? [] : ''));

//   const treeViewRef = useRef<TreeViewRef | null>(null);


//   const handleSelectionChange = (checkedIds: string[]) => {
//     if (onValueChange) {
//       if (multiple) {
//         // 多选模式：返回数组
//         setSelectedValue(checkedIds);
//       } else {
//         // 单选模式：返回单个值或空字符串
//         setSelectedValue(checkedIds.length > 0 ? checkedIds[0] : '');
//       }
//     }
//   };

//   useEffect(() => {
//     treeViewRef.current && selectedValue !== undefined && selectedValue !== '' && onValueChange?.(selectedValue);
//   }, [selectedValue]);


//   useEffect(() => {
//     // setIsLoading(true);
//     const getTrees = async () => {
//       try {
//         const data = await api({ formModel });
//         setTreeData(data);
//       } catch (error) {
//         console.error('获取树形数据失败:', error);
//         setTreeData([]);
//       } finally {
//         // setIsLoading(false);
//       }
//     }
//     treeViewRef.current && getTrees()
//   }, [...(dependencies?.map(dep => formModel[dep]) || [])]);

//   return (
//     <View style={disabled ? styles.disabled : {}}>
//       <TreeView
//         ref={treeViewRef}
//         data={treeData}
//         preselectedIds={value ? [value] : []}
//         onCheck={(checkedIds) => !disabled && handleSelectionChange?.(checkedIds)}
//       />
//       {/* <TreeSelect
//         data={treeData}
//         onClick={({ item }) => onValueChange?.(item.id ? item.id : '')}
//         // isOpen
//         // openIds={['A01']}
//         isShowTreeId={false}
//         // selectType="single"
//         selectType="single"
//         itemStyle={{
//           // backgroudColor: '#8bb0ee',
//           fontSize: 12,
//           color: '#995962'
//         }}
//         selectedItemStyle={{
//           backgroudColor: '#f7edca',
//           fontSize: 16,
//           color: '#171e99'
//         }}
//         treeNodeStyle={{
//           openIcon: <Icon size={18} color="#171e99" name="arrow-down" />,
//           closeIcon: <Icon size={18} color="#171e99" name="arrow-right" />
//         }}
//       /> */}
//     </View>
//   );
// };

// export default ApiTreeSelect;

// const styles = StyleSheet.create({
//   disabled: {
//     opacity: 0.5,
//   }
// });