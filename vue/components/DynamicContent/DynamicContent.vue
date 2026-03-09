<script lang="tsx" setup>
import { DynamicContentItemOutput, DynamicContentOutput } from '@/http-client/data-contracts';
import { defineAsyncComponent } from 'vue';
import { loadComponent } from '@/router';

const { modelValue } = defineProps<{
  modelValue: string
}>()

const content = computed<DynamicContentOutput | null>(() => {
  if (!modelValue) return null;
  try {
    return JSON.parse(modelValue) as DynamicContentOutput;
  } catch (error) {
    return null;
  }
})

const getComponent = (item: DynamicContentItemOutput) => {
  let comp: () => Promise<any> = loadComponent(item.componentName)
  return defineAsyncComponent({
    // 动态导入组件
    loader: comp,
    // // 加载状态显示的组件
    loadingComponent: <div style='width: 100%, height: 300px' v-loading={true}></div>,
    // // 错误状态显示的组件
    errorComponent: () => <div>组件{item.componentName}加载失败。</div>,
    delay: 0,
    // 5秒超时
    timeout: 5000
  })
}

</script>
<template>
  <div class="DynamicContent" v-if="content">
    <div v-if="content.title" class="font-bold text-center mb-4" style="font-size: 1.5rem;">{{ content.title }}</div>
    <div v-if="content.content">{{ content.content }}</div>
    <div v-for="item in content.items">
      <component v-if="item.componentName" :is="getComponent(item)" v-bind="item.componentProps" />
    </div>
  </div>
</template>