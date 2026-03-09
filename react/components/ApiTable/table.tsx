import React, { /* useEffect, useState  */ } from 'react';
// import { StyleSheet } from 'react-native';
// import { DataTable } from 'react-native-paper';
import { TableColumns } from './type';
import { View } from 'react-native';

type ApiTableProps = {
  showIndexColumn: boolean,
  columns: TableColumns[]
}

const ApiTable: React.FC<ApiTableProps> = (props) => {
  // /** pageIndex */
  // const [page, setPage] = useState(0);
  // /** */
  // const [numberOfItemsPerPageList] = useState([5, 10, 20])
  // /** 每页个数 */
  // const [itemsPerPage, setItemsPerPage] = useState(numberOfItemsPerPageList[0])
  // const [listData, setListData] = useState([])

  // const from = page * itemsPerPage
  // const to = Math.min((page + 1) * itemsPerPage, listData.length)



  // useEffect(() => {
  //   return () => {
  //   };
  // }, []);

  return (
    <View>

    </View>
    // <DataTable>
    //   <DataTable.Header>
    //     <DataTable.Title>Dessert</DataTable.Title>
    //     <DataTable.Title numeric>Calories</DataTable.Title>
    //     <DataTable.Title numeric>Fat</DataTable.Title>
    //   </DataTable.Header>



    //   <DataTable.Pagination
    //     page={page}
    //     numberOfPages={Math.ceil(listData.length / itemsPerPage)}
    //     onPageChange={(page) => setPage(page)}
    //     label={`${from + 1}-${to} of ${listData.length}`}
    //     numberOfItemsPerPageList={numberOfItemsPerPageList}
    //     numberOfItemsPerPage={itemsPerPage}
    //     onItemsPerPageChange={setItemsPerPage}
    //     showFastPaginationControls
    //     selectPageDropdownLabel={'每页个数'}
    //   />
    // </DataTable>
  );
};

export default ApiTable;

// const styles = StyleSheet.create({
// });