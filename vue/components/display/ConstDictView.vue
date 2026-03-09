<template>
	<span class="ConstDictView">
		<slot :text="text" :value="modelValue" :loaded="constDictStore.loaded">
			{{ constDictStore.loaded ? text : '' }}
		</slot>
	</span>
</template>
<script setup lang="ts" name="ConstDictView">
import { useConstDictStore } from "@/store/constDict"

interface Props {
	modelValue?: string | number | null
	code: string
}
const { modelValue, code } = defineProps<Props>()
const constDictStore = useConstDictStore()
constDictStore.initConstDict()

let dict = $computed(() => constDictStore.dictRef(code).value)
let text = $computed(() => dict.find(t => t.code === modelValue)?.name || (modelValue !== undefined && modelValue !== null && modelValue !== '' ? `(${modelValue})` : ""))

</script>
<style scoped>

</style>
