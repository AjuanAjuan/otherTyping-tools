<template>
	<el-input :type="type" @keyup.enter="handleKeyEnter" v-bind="$attrs" />
</template>
<script setup lang="ts" name="Input">
import { ElInput } from 'element-plus';
interface Props {
	autoSubmit?: boolean
	type?: string
}
const { autoSubmit = true, type = 'text' } = defineProps<Props>()
const submitFunc = inject("SubmitFunc", () => { })
const handleKeyEnter = () => {
	if (autoSubmit && type == 'text')
		submitFunc && submitFunc()
}
</script>
