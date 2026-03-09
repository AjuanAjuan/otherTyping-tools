<script setup lang="ts">
// import { defineEmits } from 'vue'
// const { t } = useI18n()

// const { getPrefixCls } = useDesign()
// const prefixCls = 'content-detail-wrap' //getPrefixCls('content-detail-wrap')

interface Props {
	title: string
	// message?: string
	wrap?: 'page' | 'dialog' | 'drawer' | 'none'
	/** 仅针对 dialog 与 drawer 有效 */
	wrapVisible?: boolean
	keepState?: boolean
}
const { title = '',
	// message = '',
	wrap = 'page', wrapVisible = false, keepState = false } = defineProps<Props>()

const emit = defineEmits(['back', 'update:wrapVisible'])
let modelVisible = $computed({
	get() {
		return wrapVisible;
	},
	set(value) {
		emit('update:wrapVisible', value)
	}
})
</script>

<template>
	<el-container v-if="wrap == 'page'" class="ContentDetailWrap">
		<el-header>
			<el-page-header @back="emit('back')" class="w-full">
				<template #content>
					<slot name="title">
						{{ title }}
					</slot>
				</template>
				<template #extra>
					<div class="flex flex-row-reverse flex-wrap">
						<slot name="right"></slot>
					</div>
				</template>
			</el-page-header>
		</el-header>
		<el-main>
			<slot></slot>
		</el-main>
	</el-container>
	<template v-else-if="wrap == 'dialog'">
		<sc-dialog v-if="keepState || modelVisible" v-model="modelVisible" :title="title" :append-to-body="true">
			<slot></slot>
		</sc-dialog>
	</template>
	<template v-else-if="wrap == 'drawer'">
		<el-drawer v-if="keepState || modelVisible" v-model="modelVisible" :title="title" :append-to-body="true">
			<slot></slot>
		</el-drawer>
	</template>
	<template v-else>
		<slot></slot>
	</template>

</template>
<style>
.ContentDetailWrap .el-page-header__extra {
	flex-grow: 1;
}

.ContentDetailWrap .el-page-header__extra .el-button {
	margin-left: 8px;
	margin-top: 5px;
}
</style>
