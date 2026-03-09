<template>
	<el-tree-select class="ApiTreeSelect" :filter-node-method="filterNode" :data="data" :filterable="filterable"
		check-strictly @visible-change="visibleChange" :clearable="clearable" :model-value="modelValue"
		@update:model-value="change" :render-after-expand="false" v-bind="$attrs">
		<template #empty>
			<div v-if="initLoading" class="loading">
				<icon icon="ep:loading" :size="20" />
			</div>
			<div v-else class="empty">
				<el-empty description="暂无数据" :image-size="100" />
			</div>
		</template>
	</el-tree-select>
</template>

<script setup lang="ts" name="ApiTreeSelect">
/**
 * 树型选择
 */
interface Props {
	modelValue: string | number | null | undefined
	api: (() => Promise<any>)
	filterable?: boolean
	clearable?: boolean
	autoSubmit?: boolean
	visibleRefresh?: boolean
	width?: number
}
const { modelValue, api, filterable = true, clearable = true, autoSubmit = false, visibleRefresh = false } = defineProps<Props>()

const emit = defineEmits(['update:model-value'])

let data = $ref<any[]>([])
let isInit = $ref(false)
let initLoading = $ref(false)
const loadData = async (refresh: boolean = false) => {
	if (!isInit || refresh || visibleRefresh) {
		initLoading = true
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
const change = (val: string | number | null | undefined) => {
	let newVal = val === '' ? null : val
	emit("update:model-value", newVal)
	if (autoSubmit) submitFunc && submitFunc()
}

// const filterNodeMethod = (value: any, data: any) => data.label.includes(value)
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
.ApiTreeSelect {
	flex: 1;
}

.el-select.ApiTreeSelect {
	width: 250px;
}

.loading {
	padding: 10px;
}
</style>
