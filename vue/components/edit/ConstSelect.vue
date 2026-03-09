<template>
	<el-select-v2 class="ConstSelect" :style="{ width: (width || 150) + 'px' }" :remote-method="filterFunc"
		v-bind="$attrs" :filterable="filterable" :remote="remote" :options="options" :clearable="clearable"
		:model-value="modelValue" @update:model-value="change" />
</template>

<script setup lang="ts" name="ConstSelect">
import { useConstDictStore } from "@/store/constDict"
/**
 * 常量选择器，用于常量编辑或查询表单使用
 */
interface Props {
	modelValue: string | number | null
	code: string
	filterable?: boolean
	clearable?: boolean
	remote?: boolean
	autoSubmit?: boolean
	width?: number
}
const { modelValue = null, code, filterable = true, clearable = true, remote = true, autoSubmit = false } = defineProps<Props>()

const emit = defineEmits(['update:modelValue', 'change'])


let queryStr = $ref("")
const filterFunc = (query: string) => {
	queryStr = query
}

const constDictStore = useConstDictStore()
constDictStore.initConstDict()

let dict = $computed(() => constDictStore.dictRef(code).value)
let options = $computed(() => {
	if (queryStr) {
		return dict.filter(t => t.code == queryStr || t.name?.includes(queryStr)).map(t => ({ value: t.code!, label: t.name! }))
	}
	return dict.map(t => ({ value: t.code!, label: t.name! }))
})

const submitFunc = inject("SubmitFunc", () => { })
/**
 * 处理点击clear '' 转 null
 * @param val
 */
const change = (val: string | number | null | undefined) => {
	queryStr = ''
	let newVal = val === '' ? null : val
	emit("update:modelValue", newVal)
	emit("change", newVal)
	if (autoSubmit) submitFunc && submitFunc()
}

</script>

<style scoped>
.ConstSelect {
	flex: 1;
}
</style>
