<template>
	<ElTag v-if="modelValue !== null && modelValue !== undefined" :type="type">
		<slot>{{ defaultText }}
		</slot>
	</ElTag>
</template>

<script setup lang="ts">
interface Props {
	modelValue?: string | number | boolean | null,
	successValues?: (string | number | boolean)[]
	dangerValues?: (string | number | boolean)[]
	infoValues?: (string | number | boolean)[]
	warningValues?: (string | number | boolean)[]
}
const { modelValue, successValues = ["是", "Y", "True", "true", true, 1], dangerValues = ["否", "N", "False", "false", 0, "女", 2], infoValues = [], warningValues = [] } = defineProps<Props>()
/* @ts-ignore */
const type = computed<'success'>(() => {
	if (modelValue === null || modelValue === undefined) return ""
	if (successValues.includes(modelValue)) return "success"
	if (dangerValues.includes(modelValue)) return "danger"
	if (infoValues.includes(modelValue)) return "info"
	if (warningValues.includes(modelValue)) return "warning"
	return ""
})
let defaultText = $computed(() => {
	if (modelValue === false) {
		return '否'
	}
	if (modelValue === true) {
		return '是'
	}
	return modelValue
})
</script>

<style scoped></style>
