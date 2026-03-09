<template>
  <ElButton v-if="!confirm && !tooltip" @click="handleClick" :loading="loading" :type="type" :circle="circle"
    :size="size" v-bind="$attrs">
    <template v-if="$slots.default" #default>
      <slot></slot>
    </template>
    <template v-if="$slots.icon" #icon>
      <slot name="icon"></slot>
    </template>
  </ElButton>
  <el-tooltip v-else-if="!confirm" :content="tooltip">
    <ElButton @click="handleClick" :loading="loading" :type="type" :circle="circle" :size="size" v-bind="$attrs">
      <template v-if="$slots.default" #default>
        <slot></slot>
      </template>
      <template v-if="$slots.icon" #icon>
        <slot name="icon"></slot>
      </template>
    </ElButton>
  </el-tooltip>
  <el-popconfirm v-else :title="confirm" @confirm="handleApi">
    <template #reference>
      <ElButton :title="tooltip" :loading="loading" :type="type" :circle="circle" :size="size" v-bind="$attrs">
        <template v-if="$slots.default" #default>
          <slot></slot>
        </template>
        <template v-if="$slots.icon" #icon>
          <slot name="icon"></slot>
        </template>
      </ElButton>
    </template>
  </el-popconfirm>
</template>

<script lang="ts">
export default { inheritAttrs: false }
</script>
<script setup lang="ts" name="ApiButton" generic="T">
import { isFunction, isPromise } from '@/utils/is'
/**
 * Api查询按钮
 */
interface Props<T = any> {
  /** Api请求函数 */
  api: (params?: any) => Promise<T>
  /** Api参数 */
  params?: any
  /** 操作确认信息 */
  confirm?: string
  tooltip?: string
  type?: "" | "default" | "text" | "primary" | "success" | "warning" | "info" | "danger"
  size?: "" | "default" | "small" | "large"
  circle?: boolean
}

const { api, params, confirm, tooltip } = defineProps<Props<T>>()

const emit = defineEmits<{
  finish: [result: T]
}>()


let loading = $ref(false)
const handleApi = async () => {
  let p = params
  if (isPromise(params)) {
    p = await params()
  }
  else if (isFunction(params)) {
    p = params()
  }
  const execApi = async () => {
    let apiResult = await api(p)
    emit("finish", apiResult)
  }
  loading = true
  await execApi().finally(() => loading = false);
}
const handleClick = async () => {
  if (confirm) return
  await handleApi()
}

</script>

<style scoped></style>
