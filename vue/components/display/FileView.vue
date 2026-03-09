<template>
	<div class="FileView">
		<span v-if="fileList.length == 0" class="imageEmpty">{{ emptyText }}</span>
		<div v-else>
			<div v-for="item in fileList">
				<div class="m-4px justify-items-center flex flex-row">
					<icon v-if="item.ext == 'pdf'" icon="uiw:file-pdf" color="red" :size="16" />
					<icon v-else-if="item.ext == 'doc' || item.ext == 'docx'" icon="icon-park:file-doc" color="blue" :size="16" />
					<icon v-else-if="item.ext == 'xls' || item.ext == 'xlsx'" icon="vscode-icons:file-type-excel" :size="16" />
					<icon v-else-if="item.ext == 'jpg' || item.ext == 'jpeg'" icon="ph:file-jpg" :size="16" />
					<icon v-else-if="item.ext == 'png'" icon="carbon:image" :size="16" class="pt-3px" />
					<icon v-else-if="item.ext == 'gif'" icon="ant-design:gif-outlined" :size="16" />
					<icon v-else icon="ant-design:file-outlined" :size="16" />
					<div class="ml-5px">
						{{ item.fileName }}
					</div>
					<div @click="preview(item)" class="mx-5px" title="预览">
						<icon icon="icon-park-outline:preview-open" :size="20" />
					</div>
					<!-- <a target="_blank" :href="item.downloadUrl" title="下载">
						<icon icon="material-symbols:download" :size="20" />
					</a> -->
					<div @click="download(item)" title="下载">
						<icon icon="ep:download" :size="20" />
					</div>
				</div>
			</div>
		</div>
		<!-- 		
		<el-image v-else-if="fileList.length == 1" :preview-src-list="fileList" preview-teleported :src="fileList[0]"
			:lazy="lazy" :style="imageStyle" :fit="fit" />
		<el-badge v-else :value="fileList.length" class="item">
			<el-image :preview-src-list="fileList" preview-teleported :src="fileList[0]" lazy :style="imageStyle" :fit="fit" />
		</el-badge> -->
	</div>
</template>

<script setup lang="ts" name="FileView">
interface Props {
	modelValue: string
	emptyText?: string
}

type FileItem = {
	url: string;
	downloadUrl: string;
	fileName: string;
	ext: string;
}
// 对 defineProps() 的响应性解构
// 默认值会被编译为等价的运行时选项
const { modelValue = "", emptyText = "未上传文件" } = defineProps<Props>()
const getFileItem = (url: string) => {
	let item: FileItem = {
		url: url,
		downloadUrl: url.includes('?') ? url + "&download=1" : url + "?download=1",
		fileName: url.split('/').pop()!,
		ext: url.split('.')[1].toLowerCase()!
	}
	if (item.ext?.includes("?")) {
		item.ext = item.ext.split('?')[0];
	}
	if (item.fileName?.includes('?n=')) {
		let n = decodeURIComponent(item!.fileName!.split('?n=').pop()!)
		if (n) {
			item.fileName = decodeURIComponent(n) + "." + item.ext;
		}
	}
	item.fileName = item.fileName.replaceAll('+', ' ')
	return item;
};
const fileList = computed(() => modelValue ? modelValue.split(',').map(getFileItem) : [])
const preview = (item: FileItem) => window.open(item.url)
const download = (item: FileItem) => window.open(item.downloadUrl)

</script>

<style scoped>
.ImageView {
	flex: 1;
}
</style>
