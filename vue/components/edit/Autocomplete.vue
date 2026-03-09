<template>
	<ElAutocomplete @keyup.enter="handleKeyEnter" v-bind="$attrs">
		<template #default="{ item } : { item: { label: string, value: string } }">
			{{ item.label || item.value }}
		</template>
	</ElAutocomplete>
</template>
<script setup lang="ts" name="Input">
import { ElAutocomplete } from 'element-plus';
interface Props {
	autoSubmit?: boolean
}
const { autoSubmit = true } = defineProps<Props>()
const submitFunc = inject("SubmitFunc", () => { })
const handleKeyEnter = () => {
	if (autoSubmit)
		submitFunc && submitFunc()
}
</script>
