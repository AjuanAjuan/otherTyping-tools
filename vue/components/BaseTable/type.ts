export type DataTableProps<T, K extends keyof T> = {
  props: K,
  label: string,
  formatter?: (arg: FormatterProps<T, K>) => any
  headerFormatter?: (arg: HeaderFormatterProps<T, K>) => any
  colSpan?: number | ((arg?: FormatterProps<T, K>) => number)
  rowSpan?: number | ((arg?: FormatterProps<T, K>) => number)
  minWidth?: number
}

export type FormatterProps<T, K extends keyof T> = {
  /** rowData */
  record: T,
  value: T[K],
  /** rowIndex */
  rowIndex: number,
  /** colIndex */
  colIndex: number,
}

export type HeaderFormatterProps<T, K extends keyof T> = {
  colIndex: number,
  colName: K,
  colNames: Array<keyof T>,
}

export type ComputedDataTableProps<T> = { [K in keyof T]: DataTableProps<T, K> }[keyof T][];

export type TableProps<T> = {
  jobId?: string;
  hideIndex?: boolean;
  keyData?: (T & Record<string, any>)[], // 数据表的数据
  dataTableProps?: ComputedDataTableProps<T>;
  headerCellClassName?: string;
}