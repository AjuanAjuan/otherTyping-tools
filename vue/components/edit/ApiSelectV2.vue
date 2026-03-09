<template>
	<div :style="{ display: 'inline-block', width: (width || 150) + 'px', height: '100%' }">
		<el-select-v2 v-if="isClick || mode !== 'switch'" style="width: 100%;" ref="selectRef"
			class="ApiSelect focusedEl focusedEl_Switch" :remote-method="filterFunc" :loading="loading" v-bind="$attrs"
			@visible-change="visibleChangeHandle" :filterable="filterable" :remote="remote" :options="updatedOptions"
			:clearable="clearable" @blur="handleBlur" @update:model-value="change" :model-value="modelValue">
			<template #default="{ item }">
				<span style="margin-right: 8px">{{ item.label }}</span>
				<span v-if="item.tag" :style="({ color: tagColor, fontSize: '13px', marginRight: '8px' })">{{ item.tag }}</span>
				<span v-if="item.tip" :style="({ color: tipColor, fontSize: '13px' })" :title="item.tip">
					{{ item.tip }}
				</span>
			</template>
		</el-select-v2>
		<div v-else class="ApiSelect_Text" @click="isClick = true"
			:style="{ width: (width || 150) + 'px', borderWidth: hideTextBorder ? 'none' : '1px', minHeight: (minHeight || 24) + 'px' }">
			{{
				modelValue }}</div>
	</div>
</template>

<script setup lang="ts" name="ApiSelectV2" descriptio="可变的下拉select">
import { ElSelectV2 } from 'element-plus';
import { BaseApiSelectInput, DropdownItemOutput } from './ApiSelectMeta';
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
	/* width */
	width?: number
	minHeight?: number
	hideTextBorder?: boolean
	options?: DropdownItemOutput[]
	mode?: 'switch' | 'normal'
	blurFn?: () => any
}

const { modelValue, api, options, filterable = true, clearable = true, remote = true, blurFn, pageSize = 100, autoSubmit = false, selectFirst, tipColor = "red", tagColor = "var(--el-color-warning)" } = defineProps<Props>()

const emit = defineEmits(['update:model-value', 'loaded', 'change', 'blur'])

let loading = $ref(false)

let queryStr = $ref("")
let isClick = $ref<boolean>(false);

let updatedOptions = $ref<any[]>(options || [])
const selectRef = ref<null | InstanceType<typeof ElSelectV2>>()


const filterFunc = async (query: string) => {
	queryStr = query
	await loadData()
}
const loadData = async (ids?: (string | number)[]) => {
	if (!loading) {
		loading = true
		if (ids && ids.length > 0) {
			updatedOptions = await api({
				ids: ids,
				pageSize: pageSize,
			}).finally(() => loading = false)
		} else {
			updatedOptions = await api({
				wd: queryStr,
				pageSize: pageSize,
			}).finally(() => loading = false)
		}
		emit('loaded', updatedOptions)
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
		if (selectFirst && !modelValue && updatedOptions.length && updatedOptions[0].value) {
			emit("update:model-value", updatedOptions[0].value)
			emit("change", updatedOptions[0].value)
		}
	}
}
onInit()

const handleBlur = async () => {
	isClick = false;
	emit('blur', modelValue);
	blurFn?.();
	// 关闭下拉
}

onInit()
watch(() => modelValue, async val => {
	if (!isVisible)
		await onInit()
})

watch(() => isClick, async (val) => {
	if (val) {
		// 主动下拉
		await nextTick();
		// 展开下拉
		selectRef.value?.focus?.()
	}
})

defineExpose({
	loadData,
	options: $$(updatedOptions)
})
</script>

<style scoped>
.ApiSelect {
	flex: 1;
}

.ApiSelect_Text {
	width: 100%;
	display: flex;
	padding-left: 4px;
	align-items: center;
}
</style>
