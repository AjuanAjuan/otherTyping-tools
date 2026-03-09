<template>
	<slot :isFinish="isFinish" :loading="loading" :data="data" :err="err" :reload="handleApi"></slot>
</template>

<script setup lang="ts" name="ApiView" generic="T">
import { isFunction, isPromise } from '@/utils/is'
/**
 * Api查询面板
 */
interface Props {
	/** Api请求函数 */
	api: (params?: any) => Promise<T>
	/** Api参数 */
	params?: any
}

const { api, params } = defineProps<Props>()

const emit = defineEmits(["finish"])


let err = $ref<any>()
let loading = $ref(true)
let isFinish = $ref(false)
let data = ref<T>()
const handleApi = async () => {
	try {
		let p = params
		if (isPromise(params)) {
			p = await params()
		}
		else if (isFunction(params)) {
			p = params()
		}
		loading = true
		data.value = await api(p).finally(() => loading = false)
		isFinish = true
		emit("finish", data.value)
	}
	catch (e) {
		err = e
	}
}
handleApi()
defineExpose({
	reload: handleApi,
	data: data//$$(data)
})
// onMounted(() => {
// 	handleApi();
// })
</script>

<style scoped></style>
