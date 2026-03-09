<template>
	<ElButton v-if="!tooltip" @click="handleClick" :loading="loading" v-bind="$attrs">
		<template v-if="$slots.default" #default>
			<slot></slot>
		</template>
		<template v-if="$slots.icon" #icon>
			<slot name="icon"></slot>
		</template>
	</ElButton>
	<el-tooltip v-else :content="tooltip">
		<ElButton @click="handleClick" :loading="loading" v-bind="$attrs">
			<template v-if="$slots.default" #default>
				<slot></slot>
			</template>
			<template v-if="$slots.icon" #icon>
				<slot name="icon"></slot>
			</template>
		</ElButton>
	</el-tooltip>
	<el-drawer v-if="keepState || modelVisible" v-model="modelVisible" :title="title" :append-to-body="true">
		<div class="m-10px">
			<slot name="contents" :close="close" :data="data"></slot>
		</div>
	</el-drawer>
</template>

<script setup lang="tsx" name="DialogButton">
import { isFunction, isPromise } from '@/utils/is'
/**
 * 弹窗按钮
 */
interface Props {
	/** Api请求函数 */
	api?: (params?: any) => Promise<any>
	/** Api参数 */
	params?: any
	/** 操作确认信息 */
	tooltip?: string
	/** 弹窗标题 */
	title: string
	/** 是否保持弹窗状态 */
	keepState?: boolean
}

const { api, params, tooltip, keepState = false } = defineProps<Props>()

const emit = defineEmits(["open", "finish"])
let modelVisible = $ref(false)

let loading = $ref(false)
let data = $ref<any>()
const handleApi = async () => {
	// ElMessage.success("ok")
	if (!api) return
	let p = params
	if (isPromise(params)) {
		p = await params()
	}
	else if (isFunction(params)) {
		p = params()
	}
	loading = true
	data = await api(p).finally(() => loading = false)
	emit("finish", data)
}
const handleClick = async () => {
	emit("open")
	modelVisible = true
	await handleApi()
}
const close = (callback?: () => any) => {
	modelVisible = false
	callback && callback()
	return true
}
/** 注入包裹类型 */
provide('Wrap', 'none')

// const TooltipWrap = (props: any, { slots }: any) => {
// 	if (tooltip) {
// 		return <el-tooltip content={tooltip}>{slots.default && slots.default()}</el-tooltip>
// 	}
// 	else {
// 		return <>{slots.default && slots.default()}</>
// 	}
// }

</script>

<style scoped></style>
