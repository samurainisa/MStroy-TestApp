<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import { ref } from 'vue'
import type { ColDef } from 'ag-grid-community'
import { TreeStore, items, type TreeItem } from '@/tree-store'

const store = new TreeStore(items.map((item) => ({ ...item })))
const rowData = ref<TreeItem[]>(store.getAll())

const columnDefs = ref<ColDef<TreeItem>[]>([
  { field: 'id', headerName: '№ п\п' },
  { field: 'parent', headerName: 'Категория' },
  { field: 'label', headerName: 'Наименование' },
])

const defaultColDef: ColDef = {
  flex: 1,
}
</script>

<template>
  <ag-grid-vue
    style="width: 100%; height: 100%"
    :columnDefs="columnDefs"
    :rowData="rowData"
    :defaultColDef="defaultColDef"
  />
</template>
