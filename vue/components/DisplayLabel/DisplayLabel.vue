<script setup lang="ts">
import { TableColumn } from '@/types/table'
import { DescriptionsSchema } from '@/types/descriptions'

interface Props {
	schema: DescriptionsSchema | TableColumn,
}
const { schema } = defineProps<Props>()

</script>
<template>
	{{ schema.label }}
</template>
