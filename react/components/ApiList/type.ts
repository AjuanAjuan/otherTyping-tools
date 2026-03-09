// ApiList 组件的类型定义

export type PageResult<T> = {
  items?: T[] | null | undefined;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
}

export type ApiListMethods = {
  /**
   * 新增接口
   */
  addItem?: (params: any) => Promise<any>;

  /**
   * 编辑接口
   */
  editItem?: (params: any) => Promise<any>;

  /**
   * 删除接口
   */
  deleteItem?: (params: any) => Promise<any>;
}

// ApiList 组件的 Props 定义
export type ApiListProps<T> = {
  /**
   * 分页请求接口函数
   * @param params - 包含分页参数和查询参数的对象
   * @returns Promise<PageResult<T>>
   */
  api: (params: Record<string, any>) => Promise<PageResult<T>>;

  /**
   * 初始查询参数对象, 默认为空对象, 可以被后续筛选条件覆盖
   */
  searchParams?: { [key: string]: any };

  /**
   * 布局类型：'list' | 'grid'，默认为 'list'
   */
  layoutType?: 'list' | 'grid';

  /**
   * 是否允许切换布局模式，默认为 true
   * 如果为 true，用户可以在 grid 和 list 之间切换
   * 如果为 false，只能使用默认的 list 视图，不能切换到 grid
   */
  allowLayoutSwitch?: boolean;

  /**
   * 每页显示数量，默认为 10
   */
  pageSize?: number;

  /**
   * 渲染列表项的函数
   * @param item - 列表项数据
   * @returns JSX.Element
   */
  children?: (item: T, index: number, methods?: ApiListMethods) => React.ReactNode;

  /**
   * 显示反馈
   */
  showApiFeedback?: boolean;

  /**
   * 新增api
   */
  addApi?: (params: any) => Promise<any>;

  /**
   * 编辑api
   */
  editApi?: (params: any) => Promise<any>;

  /**
   * 删除api
   */
  deleteApi?: (params: any) => Promise<any>;

  /**
   * 新增接口
   */
  addItem?: (params: any) => Promise<any>;

  /**
   * 编辑接口
   */
  editItem?: (params: any) => Promise<any>;

  /**
   * 删除接口
   */
  deleteItem?: (params: any) => Promise<any>;


}

// 定义组件 ref 暴露的方法
export type ApiListRef = {
  /**
   * 重置到第一页并重新加载数据
   */
  refresh: () => void;

  /**
   * 执行搜索，追加搜索参数
   * @param keyword - 搜索关键词或其他搜索参数
   */
  search: (keyword: any) => Promise<void>;

  /**
   * 应用筛选条件
   * @param params - 筛选参数
   */
  filter: (params: { [key: string]: any }) => Promise<void>;

  /**
   * 滚动到顶部
   */
  scrollToTop: () => void;

  /**
   * 获取当前滚动位置
   */
  getScrollOffset: () => number;
} & ApiListMethods;
