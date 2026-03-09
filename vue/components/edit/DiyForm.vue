<template>
  <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px" class="diy-form">
    <el-form-item v-for="(field, index) in formDefinition.fields" :key="index" :label="field.label" :prop="field.key"
      :required="field.required">
      <!-- 文本输入 -->
      <el-input v-if="field.type === 'text'" v-model="formData[field.key]" :placeholder="`请输入${field.label}`" />

      <!-- 数字输入 -->
      <el-input v-else-if="field.type === 'number'" v-model.number="formData[field.key]"
        :placeholder="`请输入${field.label}`" type="number" />

      <!-- 日期选择 -->
      <el-date-picker v-else-if="field.type === 'date'" v-model="formData[field.key]" type="date"
        :placeholder="`请选择${field.label}`" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />

      <!-- 单选框组 -->
      <el-radio-group v-else-if="field.type === 'radio'" v-model="formData[field.key]">
        <el-radio v-for="option in field.options" :key="option.value" :label="option.value">
          {{ option.label }}
        </el-radio>
      </el-radio-group>

      <!-- 复选框组 -->
      <el-checkbox-group v-else-if="field.type === 'checkbox'" v-model="formData[field.key]">
        <el-checkbox v-for="option in field.options" :key="option.value" :label="option.value">
          {{ option.label }}
        </el-checkbox>
      </el-checkbox-group>

      <!-- 下拉选择 -->
      <el-select v-else-if="field.type === 'select'" v-model="formData[field.key]" :placeholder="`请选择${field.label}`">
        <el-option v-for="option in field.options" :key="option.value" :label="option.label" :value="option.value" />
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="handleSubmit">提交</el-button>
      <el-button @click="handleReset">重置</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, defineProps, defineEmits } from 'vue';
import {
  ElForm, ElFormItem, ElInput, ElDatePicker, ElRadioGroup, ElRadio,
  ElCheckboxGroup, ElCheckbox, ElSelect, ElOption, ElButton
} from 'element-plus';

// 导入表单字段类型定义（与ProcessEdit.vue保持一致）
interface FormField {
  type: 'text' | 'number' | 'date' | 'radio' | 'checkbox' | 'select';
  label: string;
  key: string;
  required: boolean;
  defaultValue: any;
  options?: { label: string; value: string }[];
}

interface FormDefinition {
  fields: FormField[];
}

// 组件Props
interface Props {
  modelValue: Record<string, any>;
  formDefinition: FormDefinition;
}

// 组件Emits
const emit = defineEmits(['update:modelValue', 'submit', 'reset']);

// 接收Props
const props = defineProps<Props>();

// 表单引用
const formRef = ref<any>(null);

// 表单数据
const formData = ref<Record<string, any>>({});

// 表单验证规则
const formRules = ref<Record<string, any>>({});

// 初始化表单数据和规则
const initForm = () => {
  // 初始化表单数据
  const newFormData: Record<string, any> = { ...props.modelValue };

  // 为每个字段设置默认值（如果未提供）
  props.formDefinition.fields.forEach(field => {
    if (newFormData[field.key] === undefined || newFormData[field.key] === null) {
      newFormData[field.key] = field.defaultValue;

      // 复选框默认值应为数组
      if (field.type === 'checkbox' && !Array.isArray(newFormData[field.key])) {
        newFormData[field.key] = [];
      }
    }
  });

  formData.value = newFormData;

  // 初始化验证规则
  const newRules: Record<string, any> = {};

  props.formDefinition.fields.forEach(field => {
    if (field.required) {
      newRules[field.key] = [
        {
          required: true,
          message: `请${field.type === 'radio' || field.type === 'checkbox' || field.type === 'select' ? '选择' : '输入'}${field.label}`,
          trigger: field.type === 'date' ? 'change' : 'blur'
        }
      ];

      // 为数字类型添加类型验证
      if (field.type === 'number') {
        newRules[field.key].push({
          type: 'number',
          message: `${field.label}必须是数字`,
          trigger: 'blur'
        });
      }
    }
  });

  formRules.value = newRules;
};

// 提交表单
const handleSubmit = () => {
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      emit('update:modelValue', formData.value);
      emit('submit', formData.value);
    }
  });
};

// 重置表单
const handleReset = () => {
  formRef.value.resetFields();
  initForm(); // 重置为初始值
  emit('reset');
};

// 监听表单定义变化
watch(
  () => props.formDefinition,
  () => {
    initForm();
  },
  { deep: true, immediate: true }
);

// 监听模型值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      Object.keys(newValue).forEach(key => {
        formData.value[key] = newValue[key];
      });
    }
  },
  { deep: true }
);

// 初始化
onMounted(() => {
  initForm();
});
</script>

<style scoped>
.diy-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-form-item {
  margin-bottom: 16px;
}
</style>
