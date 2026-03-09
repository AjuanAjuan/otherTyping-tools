<script setup lang="ts">
import { TableColumn } from '@/types/table'
import { DescriptionsSchema } from '@/types/descriptions'

interface Props {
	schema?: DescriptionsSchema | TableColumn,
	data: Recordable,
}
const { schema, data } = defineProps<Props>()

</script>
<template>
	<component v-if="schema?.formatter"
		:is="schema.formatter({ record: data, schema: schema, value: data[schema.field] })" v-bind="$attrs">
	</component>
	<template v-else-if="schema">
		{{ data[schema.field] }}
	</template>
</template>
