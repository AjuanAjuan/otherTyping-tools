<template>
	<el-cascader class="ApiCascader" :filter-node-method="filterNode" :options="data" :filterable="filterable"
		@visible-change="visibleChange" :clearable="clearable" :model-value="modelValue" @update:model-value="change"
		:props="defaultProps" v-bind="$attrs" :placeholder="initLoading ? '加载中' : placeholder">
	</el-cascader>
</template>

<script setup lang="ts" name="ApiCascader">
import type { CascaderValue } from 'element-plus'
/**
 * 级联选择器 目前使用 el-cascader 实现，子级层数过多的请使用 ApiTreeSelect，否则显示体验不好
 */
interface Props {
	modelValue?: string | number
	/**
	 * 请求数据接口
	 */
	api: (() => Promise<any>)
	/**
	 * 开启过滤功能
	 */
	filterable?: boolean
	/**
	 * 开启清除功能
	 */
	clearable?: boolean
	/**
	 * 占位字符
	 */
	placeholder?: string
	/** el-cascader 原生配置项  */
	props?: Object
	autoSubmit?: boolean
}
const { modelValue, api, filterable = true, clearable = true, placeholder, props, autoSubmit = false } = defineProps<Props>()

const emit = defineEmits(['update:model-value'])

let defaultProps = $computed(() => ({
	// checkStrictly: true, //级联默认只能选根结点
	emitPath: false,
	...props
}))

let data = $ref<any[]>([])
let isInit = $ref(false)
let initLoading = $ref(false)
const loadData = async (refresh: boolean = false) => {
	if (!isInit || refresh) {
		initLoading = true
		// await sleepAsync(2000)
		data = await api().finally(() => initLoading = false)
		isInit = true
	}
}
const visibleChange = async (value: boolean) => {
	if (value) {
		await loadData().catch()
	}
}

const submitFunc = inject("SubmitFunc", () => { })
/**
 * 处理点击clear '' 转 null
 * @param val
 */
const change = (val: CascaderValue) => {
	let newVal = val === '' ? undefined : val
	emit("update:model-value", newVal)
	if (autoSubmit) submitFunc && submitFunc()
}

const filterNode = (value: string, data: any) => {
	return data.value == value || data.label.includes(value)
}
const onInit = async () => {
	if (modelValue) {
		await loadData()
		await nextTick()
	}
}
onInit()
watch(() => modelValue, async val => {
	await onInit()
})
defineExpose({
	loadData
})
</script>

<style scoped>
.ApiCascader {
	flex: 1;
}
</style>
