// import React, { useRef } from 'react';
// import { StyleSheet, Text, View } from 'react-native';
// import { Card, Paragraph, Title } from 'react-native-paper';
// import ApiList from './List';
// import { ApiListRef } from './type';

// // 示例数据类型
// interface Product {
//   id: number;
//   name: string;
//   description: string;
//   price: number;
//   category: string;
// }

// // 示例产品卡片组件
// const ProductCard = ({ data }: { data: Product }) => {
//   return (
//     <Card style={styles.card}>
//       <Card.Content>
//         <Title>{data.name}</Title>
//         <Paragraph>{data.description}</Paragraph>
//         <Paragraph style={styles.price}>¥{data.price}</Paragraph>
//         <Paragraph style={styles.category}>分类: {data.category}</Paragraph>
//       </Card.Content>
//     </Card>
//   );
// };

// // 示例产品列表组件
// const ProductListExample = () => {
//   const apiListRef = useRef<ApiListRef>(null);

//   // 模拟 API 请求
//   const fetchProducts = async (params: { current: number; size: number;[key: string]: any }) => {
//     // 模拟网络延迟
//     await new Promise(resolve => setTimeout(resolve, 1000));

//     // 模拟分页数据
//     const { current, size, category, keyword } = params;
//     const mockData: Product[] = [];

//     // 根据参数过滤数据
//     let total = 100;
//     if (category) {
//       total = 50;
//     }
//     if (keyword) {
//       total = 20;
//     }

//     const start = (current - 1) * size;
//     for (let i = start; i < Math.min(start + size, total); i++) {
//       mockData.push({
//         id: i + 1,
//         name: `产品 ${i + 1}${keyword ? ` (匹配 ${keyword})` : ''}`,
//         description: `这是第 ${i + 1} 个产品的描述信息`,
//         price: Math.floor(Math.random() * 100) + 10,
//         category: category || ['电子产品', '服装', '图书', '家居'][i % 4],
//       });
//     }

//     return {
//       records: mockData,
//       total,
//       size,
//       current,
//       pages: Math.ceil(total / size),
//     };
//   };

//   // 刷新数据
//   const handleRefresh = () => {
//     apiListRef.current?.refresh();
//   };

//   // 搜索产品
//   const handleSearch = (keyword: string) => {
//     apiListRef.current?.search({ keyword });
//   };

//   // 筛选产品
//   const handleFilter = (category: string) => {
//     apiListRef.current?.filter({ category });
//   };

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.title}>产品列表示例</Text>
//         <View style={styles.buttonGroup}>
//           <Text style={styles.button} onPress={handleRefresh}>刷新</Text>
//           <Text style={styles.button} onPress={() => handleSearch('测试')}>搜索</Text>
//           <Text style={styles.button} onPress={() => handleFilter('电子产品')}>筛选</Text>
//         </View>
//       </View>

//       {/* 列表模式示例 */}
//       <Text style={styles.sectionTitle}>列表模式</Text>
//       <ApiList
//         ref={apiListRef}
//         api={fetchProducts}
//         searchParams={{ category: '电子产品' }}
//         layoutType="list"
//         pageSize={10}
//       >
//         {(item, index) => <ProductCard data={item} key={item.id} />}
//       </ApiList>

//       {/* 网格模式示例 */}
//       <Text style={styles.sectionTitle}>网格模式</Text>
//       <ApiList
//         api={fetchProducts}
//         searchParams={{}}
//         layoutType="grid"
//         pageSize={10}
//       >
//         {(item, index) => <ProductCard data={item} key={item.id} />}
//       </ApiList>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     padding: 16,
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   buttonGroup: {
//     flexDirection: 'row',
//     marginTop: 8,
//   },
//   button: {
//     padding: 8,
//     margin: 4,
//     backgroundColor: '#2196F3',
//     color: 'white',
//     borderRadius: 4,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     padding: 16,
//     backgroundColor: '#f0f0f0',
//   },
//   card: {
//     margin: 8,
//   },
//   price: {
//     color: '#e74c3c',
//     fontWeight: 'bold',
//   },
//   category: {
//     color: '#7f8c8d',
//     fontSize: 12,
//   },
// });

// export default ProductListExample;