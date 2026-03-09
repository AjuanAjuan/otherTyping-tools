<!-- 阶跃回差特定结构表 -->
<script setup lang='ts' generic="T">
import { isFunction } from '@/utils/is';
import { TableProps } from './type';

// @ts-ignore
const props = defineProps<TableProps<T>>();
const noTable = inject('noTable', () => false) // 大屏组件用


</script>

<template>
  <div class="baseTable" v-if="keyData?.length && dataTableProps">
    <!-- 特殊表 -->
    <table v-if="!noTable()" class="dataTable">
      <thead>
        <tr>
          <td :class="headerCellClassName" v-if="!hideIndex" style="min-width: 30px">序号</td>
          <td :class="headerCellClassName" v-for="(t, colIndex) in props.dataTableProps"
            :style="{ minWidth: t.minWidth + 'px' }">
            <component v-if="t.headerFormatter"
              :is="t.headerFormatter({ colIndex, colName: t.props, colNames: dataTableProps.map(i => i.props) })">
            </component>
            <span v-else>
              {{ t.label }}
            </span>
          </td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(data, index) in keyData">
          <td v-if="!hideIndex">{{ index + 1 }}</td>
          <td v-for="(t, colIndex) in dataTableProps" :colspan="isFunction(t.colSpan) ?
            t.colSpan({ record: data, value: data[t.props], rowIndex: index, colIndex }) :
            t.colSpan" :rowSpan="isFunction(t.rowSpan) ?
              t.rowSpan({ record: data, value: data[t.props], rowIndex: index, colIndex }) :
              t.rowSpan">
            <component v-if="t.formatter"
              :is="t.formatter({ record: data, value: data[t.props], rowIndex: index, colIndex })">
            </component>
            <span v-else>
              {{ data[t.props] }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="scss">
.baseTable {
  width: 100%;
  margin-bottom: 1rem;
  overflow: auto;
}

table.dataTable {
  border-collapse: collapse;
  width: 100%;
  text-align: center;
  font-size: 1rem;

  thead {
    font-weight: bold;
    color: var(--el-text-color-secondary);
  }

  tbody {
    color: var(--el-text-color-primary);

  }

  tr {
    td {
      border-width: 1px;
      padding: 1rem 0.3rem;
    }

    td:first-of-type,
    td:last-of-type {
      border-left: none;
      border-right: none;
    }
  }
}
</style>