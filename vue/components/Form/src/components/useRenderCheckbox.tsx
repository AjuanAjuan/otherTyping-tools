import { FormSchema } from '@/types/form'
import { ElCheckbox, ElCheckboxButton } from 'element-plus'
import { defineComponent } from 'vue'
import { isFunction } from "@/utils/is"

export const useRenderCheckbox = () => {
	const renderChcekboxOptions = (item: FormSchema) => {
		if (!isFunction(item.componentProps)) {
			// 如果有别名，就取别名
			const labelAlias = item?.componentProps?.optionsAlias?.labelField
			const valueAlias = item?.componentProps?.optionsAlias?.valueField
			const Com = (item.component === 'Checkbox' ? ElCheckbox : ElCheckboxButton) as ReturnType<
				typeof defineComponent
			>
			return item?.componentProps?.options?.map((option) => {
				return <Com label={option[labelAlias || 'value']}>{option[valueAlias || 'label']}</Com>
			})
		}
	}

	return {
		renderChcekboxOptions
	}
}
