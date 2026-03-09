<template>
	<ElButton v-if="!tooltip" @click="handleClick" :loading="loading" :circle="circle" :size="size" :text="text"
		:type="type" v-bind="$attrs">
		<template v-if="$slots.default" #default>
			<slot></slot>
		</template>
		<template v-if="$slots.icon" #icon>
			<slot name="icon"></slot>
		</template>
	</ElButton>
	<el-tooltip v-else :content="tooltip">
		<ElButton @click="handleClick" :loading="loading" :circle="circle" :size="size" :text="text" :type="type"
			v-bind="$attrs">
			<template v-if="$slots.default" #default>
				<slot></slot>
			</template>
			<template v-if="$slots.icon" #icon>
				<slot name="icon"></slot>
			</template>
		</ElButton>
	</el-tooltip>
	<sc-dialog class="dialogButton_sc_dialogButton" v-if="keepState || modelVisible" v-model="modelVisible" :title="title"
		:append-to-body="true" :width="dialogWidth" :fullscreen="fullscreen" @close="close" :append-to="appendTo">
		<slot name="contents" :close="close" :data="data"></slot>
	</sc-dialog>
</template>

<!-- <DialogButton tooltip="测试弹窗" title="弹窗标题" keep-state>
	弹窗
	<template #contents>
		弹窗内容
	</template>
</DialogButton> -->
<script lang="tsx">
export default { inheritAttrs: false }
</script>
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
	/** 是否为全屏 Dialog */
	fullscreen?: boolean
	dialogWidth?: string
	size?: "" | "default" | "small" | "large"
	type?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text'
	circle?: boolean
	text?: boolean
	appendTo?: HTMLElement | string
}



const { api, params, tooltip, keepState = false, dialogWidth, fullscreen = false, circle = false, text, type } = defineProps<Props>()

const emit = defineEmits(["open", "finish", "close"])
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
	emit("close")
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

<style lang="scss">
.dialogButton_sc_dialogButton {
	header {
		width: 100%;
		max-height: calc(30px + var(--el-dialog-padding-primary));
	}

	.el-dialog__body {
		height: calc(100% - 30px - var(--el-dialog-padding-primary));
		overflow-y: auto;
	}
}
</style>
