<script setup lang='ts' name="inputV2" desriptionn="可变input">
import { ElInput } from 'element-plus'
// import type { FunctionalComponent } from 'vue'

type InputCellProps = {
  modelValue?: string | number | null
  disabled?: boolean;
  defaultWidth?: number | string;
  hideTextBorder?: boolean
  minWidth?: number | string;
};

const props = defineProps<InputCellProps>();
const isClick = ref<boolean>(false);
const emit = defineEmits(['update:modelValue', 'blur'])
const value = ref(props.modelValue)
const inputRef = ref<InstanceType<typeof ElInput>>();

const handleBlur = async () => {
  isClick.value = false;
  emit('blur', props.modelValue)
}

const handleKeyUp = async (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    // tab 也会blur
    await handleBlur()
  }
}

watch(() => isClick.value, async (val) => {
  if (val) {
    await nextTick();
    inputRef.value?.focus?.();
  }
})

</script>

<template>
  <div style="height: 100%;">
    <ElInput v-if="isClick" ref="inputRef" v-model="value" @change="emit('update:modelValue', value)"
      class="focusedEl_Input focusedEl" size="default" :disabled="props.disabled" @blur="handleBlur"
      @keyup="handleKeyUp" />
    <div v-else
      :style="{ borderWidth: hideTextBorder ? 'none' : '1px', width: (defaultWidth || 150) + 'px', height: value ? 'auto' : '30px', minWidth }"
      tabindex="0" @click="() => { isClick = true }" class="inputV2-trigger table-v2-inline-editing-trigger"
      @focus="isClick = true">
      {{ modelValue }}
    </div>
  </div>
</template>
<style lang="scss" scoped>
.inputV2-trigger {
  height: 100%;
  border-radius: 5px;
}
</style>
