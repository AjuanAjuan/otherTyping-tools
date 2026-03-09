<template>
	<div class="ImageView">
		<span v-if="imageArr.length == 0" class="imageEmpty">{{ emptyText }}</span>
		<el-image v-else-if="imageArr.length == 1" :preview-src-list="imageArr" preview-teleported :src="imageArr[0]"
			:lazy="lazy" :style="imageStyle" :fit="fit" />
		<el-badge v-else :value="imageArr.length" class="item">
			<el-image :preview-src-list="imageArr" preview-teleported :src="imageArr[0]" lazy :style="imageStyle"
				:fit="fit" />
		</el-badge>
	</div>
</template>

<script setup lang="ts" name="ImageView">
interface Props {
	modelValue: string
	emptyText?: string
	lazy?: boolean
	imageWidth?: string
	imageHeight?: string
	fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
}

// 对 defineProps() 的响应性解构
// 默认值会被编译为等价的运行时选项
const { modelValue = "", emptyText = "", lazy = true, imageWidth = '60px', imageHeight = '60px', fit = "contain" } = defineProps<Props>()
const imageArr = computed(() => modelValue ? modelValue.split(',') : [])
const imageStyle = computed(() => {
	return { width: imageWidth, height: imageHeight }
})
</script>

<style scoped>
.ImageView {
	flex: 1;
}
</style>
