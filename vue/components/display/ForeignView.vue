<template>
	<slot :text="text" :modelValue="modelValue">
		{{ text }}
	</slot>
</template>
<script setup lang="ts" name="ForeignView">
interface Props {
	modelValue?: Recordable
	value?: any
	field: string
}
const { modelValue, value, field } = defineProps<Props>()

let text = $computed(() => (modelValue && modelValue[field]) || (value == 0 || value === undefined ? '' : `(${value})`))
</script>
<style scoped>

</style>
