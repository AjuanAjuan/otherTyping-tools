import { ElInput } from 'element-plus'
import type { FunctionalComponent } from 'vue'

type InputCellProps = {
  modelValue?: string,
  disabled?: boolean;
  defaultWidth?: number;
};
/**
 * @description 可变式inputcell 点击切换可修改性,只需要传入modelValue(外界传入v-model)
 */
//@ts-ignore
export const InputV2: FunctionalComponent<InputCellProps> = defineComponent(
  (props: { modelValue: string, disabled?: boolean, defaultWidth?: number }, ctx) => {
    const isClick = ref<boolean>(false);
    const value = ref<string>(props.modelValue);
    const input = ref()
    const setRef = (el) => {
      input.value = el
      if (el) {
        el.focus?.()
      }
    }
    return () => (
      <>
        {isClick.value ?
          <ElInput
            style={{ width: "100%" }}
            ref={setRef}
            v-model={value.value}
            onChange={() => { ctx.emit('update:modelValue', value.value); }}
            size={"default"}
            disabled={props.disabled}
            onBlur={() => { isClick.value = false; ctx.emit('blur') }}
          />
          :
          <div style={{ width: (props.defaultWidth || 150) + 'px' }} onClick={() => { isClick.value = true }} class="table-v2-inline-editing-trigger">
            {props.modelValue}
          </div >}
      </>
    );
  }, {
  props: ['disabled', 'modelValue', 'defaultWidth'],
  emits: ['update:modelValue', 'blur']
})