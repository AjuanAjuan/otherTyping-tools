<script setup lang="ts">
import { VCodeDiff } from './GetCodeDiff'

/**
 * 代码比对
 */
interface Props {
  codeOld: string,
  codeNew: string,
  filename?: string
  language?: string
}

const { codeOld, codeNew, filename = "unknown.cs", language = "csharp" } = defineProps<Props>()

// const newShortText = ref(codeOld)
// const oldShortText = ref(codeNew)


const formState = reactive({
  language: language,
  diffStyle: 'word',
  outputFormat: 'side-by-side',
  context: 10,
  trim: false,
  noDiffLineFeed: false,
  filename: filename, //'package.json',
  hideHeader: false,
  hideStat: false,
})

const oldString = ref(codeOld)
const newString = ref(codeNew)

// const oldString = ref(oldShortText.value)
// const newString = ref(newShortText.value)
// if (localStorage.getItem('oldString'))
//   oldString.value = localStorage.getItem('oldString') || ''

// if (localStorage.getItem('newString'))
//   newString.value = localStorage.getItem('newString') || ''

// function resetText() {
//   localStorage.removeItem('oldString')
//   localStorage.removeItem('newString')
//   oldString.value = oldShortText.value
//   newString.value = newShortText.value
// }
// function clearText() {
//   localStorage.removeItem('oldString')
//   localStorage.removeItem('newString')
//   oldString.value = ''
//   newString.value = ''
// }
// watch(oldString, () => localStorage.setItem('oldString', oldString.value))
// watch(newString, () => localStorage.setItem('newString', newString.value))

function printEvent(e) {
  // eslint-disable-next-line no-console
  console.log('diff finished! below is data:')
  // eslint-disable-next-line no-console
  console.log(e)
}
</script>
<template>
  <div class="CodeDiff">

    <div style="display: flex; justify-content: space-evenly;">
      <textarea v-model="oldString" style="width: 48vw;" :rows="10" />
      <textarea v-model="newString" style="width: 48vw;" :rows="10" />
    </div>
    <!-- <div style="margin: 10px;">

    </div> -->
    <VCodeDiff :old-string="oldString" :new-string="newString" :language="formState.language"
      :diff-style="formState.diffStyle" :output-format="formState.outputFormat" :context="formState.context"
      :trim="formState.trim" :no-diff-line-feed="formState.noDiffLineFeed" :filename="formState.filename"
      :hide-header="formState.hideHeader" :hide-stat="formState.hideStat" @diff="printEvent" />

  </div>
</template>
<style scoped>
.CodeDiff {
  flex: 1
}
</style>