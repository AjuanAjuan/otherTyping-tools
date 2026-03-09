
/**
 * 选择组件输入参数
 */
export interface BaseApiSelectInput {
	/** 主键Id */
	ids?: (string | number)[] | null;
	/** 搜索关键字 */
	wd?: string | null;
	/**
	 * 分页大小
	 * @format int32
	 */
	pageSize?: number;
	/**
	 * 页码
	 * @format int32
	 */
	page?: number;
}
/**
 * 下拉选择项
 */
export interface DropdownItemOutput {
	label?: string | null;
	value?: string | number | null;
}
