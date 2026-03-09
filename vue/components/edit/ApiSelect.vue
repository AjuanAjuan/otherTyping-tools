<template>
	<el-select-v2 class="ApiSelect" :style="{ width: (width || 150) + 'px' }" :remote-method="filterFunc"
		:loading="loading" v-bind="$attrs" @visible-change="visibleChangeHandle" :filterable="filterable" :remote="remote"
		:options="options" :clearable="clearable" :model-value="modelValue" @update:model-value="change">
		<template #default="{ item }">
			<span style="margin-right: 8px">{{ item.label }}</span>
			<span v-if="item.tag" :style="({ color: tagColor, fontSize: '13px', marginRight: '8px' })">{{ item.tag }}</span>
			<span v-if="item.tip" :style="({ color: tipColor, fontSize: '13px' })" :title="item.tip">
				{{ item.tip }}
			</span>
		</template>
	</el-select-v2>
</template>

<script setup lang="ts" name="ApiSelect" generic="T">
import { BaseApiSelectInput, DropdownItemOutput } from './ApiSelectMeta'
/**
 * 简易版Api查询选择器
 */
interface Props {
	modelValue?: string | number | (string | number)[] | null
	api: ((params: BaseApiSelectInput) => Promise<DropdownItemOutput[]>)
	filterable?: boolean
	clearable?: boolean
	// placeholder?: string
	remote?: boolean
	pageSize?: number
	autoSubmit?: boolean
	/** 是否自动选择第一项 */
	selectFirst?: boolean
	tipColor?: string
	tagColor?: string
	width?: number
}

const { modelValue, api, filterable = true, clearable = true, remote = true, pageSize = 100, autoSubmit = false, selectFirst, tipColor = "red", tagColor = "var(--el-color-warning)" } = defineProps<Props>()

const emit = defineEmits(['update:model-value', 'loaded', 'change'])

let options = $ref<any[]>([])
let loading = $ref(false)

let queryStr = $ref("")
const filterFunc = async (query: string) => {
	queryStr = query
	await loadData()
}
const loadData = async (ids?: (string | number)[]) => {
	if (!loading) {
		loading = true
		if (ids && ids.length > 0) {
			options = await api({
				ids: ids,
				pageSize: pageSize,
			}).finally(() => loading = false)
		} else {
			options = await api({
				wd: queryStr,
				pageSize: pageSize,
			}).finally(() => loading = false)
		}
		emit('loaded', options)
	}
}
let isVisible = false
const visibleChangeHandle = async (val: boolean) => {
	queryStr = ""
	if (val) {
		await loadData()
	}
	isVisible = val;
}
const submitFunc = inject("SubmitFunc", () => { })
/**
 * 处理点击clear '' 转 null
 * @param val
 */
const change = (val: string | number | (string | number)[] | null | undefined) => {
	let newVal = val === '' ? null : val
	emit("update:model-value", newVal)
	emit("change", newVal)
	if (autoSubmit) submitFunc && submitFunc()
}
const onInit = async () => {
	if (modelValue || selectFirst) {
		if (Array.isArray(modelValue)) {
			if (modelValue.length > 0)
				await loadData(modelValue)
		}
		else {
			await loadData(modelValue ? [modelValue] : [])
		}
		if (selectFirst && !modelValue && options.length && options[0].value) {
			emit("update:model-value", options[0].value)
			emit("change", options[0].value)
		}
	}
}
onInit()
watch(() => modelValue, async val => {
	if (!isVisible)
		await onInit()
})
defineExpose({
	loadData,
	options: $$(options)
})
</script>

<style scoped>
.ApiSelect {
	flex: 1;
}
</style>
