<template>
	<div :style="{ display: 'inline-block', width: (width || 150) + 'px', height: '100%' }">
		<el-select-v2 v-if="isClick || mode !== 'switch'" ref="selectRef" class="ConstSelect focusedEl focusedEl_Switch"
			style="width: 100%" :remote-method="filterFunc" v-bind="$attrs" :filterable="filterable" :remote="remote"
			:options="options" :clearable="clearable" :model-value="modelValue" @blur="handleBlur"
			@update:model-value="change" />
		<div v-else class="ApiSelect_Text" @click="isClick = true" tabindex="0" @focus="isClick = true"
			:style="{ width: (width || 150) + 'px', borderWidth: hideTextBorder ? 'none' : '1px', minHeight: (minHeight || 22) + 'px' }">
			{{
				options.find(code => code.value === modelValue)?.label }}</div>
	</div>
</template>

<script setup lang="ts" name="ConstSelectV2" descriptio="可变的下拉constselectV2">
import { useConstDictStore } from "@/store/constDict"
import { ElSelectV2 } from "element-plus";
/**
 * 常量选择器，用于常量编辑或查询表单使用
 */
interface Props {
	modelValue?: string | number | null
	code: string
	filterable?: boolean
	clearable?: boolean
	remote?: boolean
	autoSubmit?: boolean
	width?: number
	minHeight?: number
	hideTextBorder?: boolean
	mode?: 'switch' | 'normal'
	blurFn?: () => any
}
// const { modelValue = null, code, filterable = true, clearable = true, remote = true, autoSubmit = false } = defineProps<Props>()
const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'change', 'blur'])
let isClick = $ref<boolean>(false);
const selectRef = ref<null | InstanceType<typeof ElSelectV2>>()

let queryStr = $ref("")
const filterFunc = (query: string) => {
	queryStr = query
}

const constDictStore = useConstDictStore()
constDictStore.initConstDict()

let dict = $computed(() => constDictStore.dictRef(props.code).value)
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
	if (props.autoSubmit) submitFunc && submitFunc()
}

const handleBlur = async () => {
	isClick = false;
	emit('blur', props.modelValue);
	props.blurFn?.()
	// 关闭下拉
}

watch(() => isClick, async (val) => {
	if (val) {
		// 主动下拉
		await nextTick();
		// 展开下拉
		selectRef.value?.focus?.();
	}
})


</script>

<style scoped>
.ConstSelect {
	flex: 1;
}
</style>
