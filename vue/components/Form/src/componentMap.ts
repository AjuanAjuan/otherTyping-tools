import type { Component } from 'vue'
import {
	ElCascader,
	ElCheckboxGroup,
	ElColorPicker,
	ElDatePicker,
	// ElInput,
	ElInputNumber,
	ElRadioGroup,
	ElRate,
	ElSelect,
	ElSelectV2,
	ElSlider,
	ElSwitch,
	ElTimePicker,
	ElTimeSelect,
	ElTransfer,
	// ElAutocomplete,
	ElTreeSelect,
	ElDivider
} from 'element-plus'
// import { InputPassword } from '@/components/InputPassword'
// import InputPassword from "@/components/edit/InputPassword.vue" //使用Element原生的简易版本
// import ConstSelect from "@/components/edit/ConstSelect.vue"
// import ApiSelect from "@/components/edit/ApiSelect.vue"
// import ApiCascader from "@/components/edit/ApiCascader.vue"
// import ApiTreeSelect from "@/components/edit/ApiTreeSelect.vue"

// import { Editor } from '@/components/Editor'
import { ComponentName } from '@/types/components'

// import scUpload from '@/components/scUpload/index.vue'
// import scUploadMultiple from '@/components/scUpload/multiple.vue'
// import scUploadFile from '@/components/scUpload/file.vue'

// import scFormTable from '@/components/scFormTable/index.vue'
// import scTableSelect from '@/components/scTableSelect/index.vue'

const Autocomplete = defineAsyncComponent(() => import('@/components/edit/Autocomplete.vue'));
const Input = defineAsyncComponent(() => import('@/components/edit/Input.vue'));
const InputPassword = defineAsyncComponent(() => import('@/components/edit/InputPassword.vue'));
const ConstSelect = defineAsyncComponent(() => import('@/components/edit/ConstSelect.vue'));
const ApiSelect = defineAsyncComponent(() => import('@/components/edit/ApiSelect.vue'));
const ApiCascader = defineAsyncComponent(() => import('@/components/edit/ApiCascader.vue'));
const ApiTreeSelect = defineAsyncComponent(() => import('@/components/edit/ApiTreeSelect.vue'));

const scUpload = defineAsyncComponent(() => import('@/components/scUpload/index.vue'));
const scUploadMultiple = defineAsyncComponent(() => import('@/components/scUpload/multiple.vue'));
const scUploadFile = defineAsyncComponent(() => import('@/components/scUpload/file.vue'));

const scTableSelect = defineAsyncComponent(() => import('@/components/scTableSelect/index.vue'));

const scIconSelect = defineAsyncComponent(() => import('@/components/scIconSelect/index.vue'));
const scEditor = defineAsyncComponent(() => import('@/components/scEditor/index.vue'))
const scCodeEditor = defineAsyncComponent(() => import('@/components/scCodeEditor/index.vue'));
const scCron = defineAsyncComponent(() => import('@/components/scCron/index.vue'));

const componentMap: Recordable<Component, ComponentName> = {
	Radio: ElRadioGroup,
	Checkbox: ElCheckboxGroup,
	CheckboxButton: ElCheckboxGroup,
	Input: Input,
	// Autocomplete: ElAutocomplete,
	Autocomplete: Autocomplete,
	InputNumber: ElInputNumber,
	Select: ElSelect,
	Cascader: ElCascader,
	Switch: ElSwitch,
	Slider: ElSlider,
	TimePicker: ElTimePicker,
	DatePicker: ElDatePicker,
	Rate: ElRate,
	ColorPicker: ElColorPicker,
	Transfer: ElTransfer,
	Divider: ElDivider,
	TimeSelect: ElTimeSelect,
	SelectV2: ElSelectV2,
	RadioButton: ElRadioGroup,
	InputPassword: InputPassword,
	Editor: scEditor, //html编辑器比较重，尽量别用
	IconSelect: scIconSelect,
	UploadFile: scUploadFile,
	UploadImage: scUpload,
	UploadImages: scUploadMultiple,
	//   FormTable: scFormTable, //目前未实现columns schema todo,现使用需使用模板
	TableSelect: scTableSelect,
	CodeEditor: scCodeEditor,
	Cron: scCron,
	ConstSelect: ConstSelect,
	TreeSelect: ElTreeSelect,
	ApiSelect: ApiSelect,
	ApiCascader: ApiCascader,
	ApiTreeSelect: ApiTreeSelect,
	//   Editor: Editor,
}

export { componentMap }
