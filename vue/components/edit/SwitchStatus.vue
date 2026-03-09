<script setup lang="ts" name="SwitchStatus">
/**
 * 状态修改器 jsx用法 formatter: ({ record }) => <SwitchStatus v-model={record.status} id={record.id!} api={changeUserStatus} active-value={1} inactive-value={2} />,
 */
interface Props {
	modelValue?: string | number | boolean
	id: string | number
	api?: (input: any) => Promise<any>
}
const { modelValue, id, api } = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

let loading = $ref(false)
const change = async (val: string | number | boolean) => {
	if (api) {
		loading = true
		await api({ id: id, status: val }).finally(() => { loading = false })
	}
	emit("update:modelValue", val)
}
</script>
<template>
	<ElSwitch :model-value="modelValue" :loading="loading" @update:model-value="change" :disabled="!api" />
</template>
