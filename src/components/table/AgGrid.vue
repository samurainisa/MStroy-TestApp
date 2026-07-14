<script setup lang="ts">
import { ref } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'

import type {
  ColDef,
} from 'ag-grid-community'

import {
  TreeStore,
} from '@/store/tree-store'

import type { TableRow } from './model/types'

import { buildTableRows, getRowId } from '@/utils/utils'

const props = defineProps<{
  store: TreeStore
}>()

const tableRows = ref<TableRow[]>(
  buildTableRows(props.store),
)

const columnDefs = ref<
  ColDef<TableRow>[]
>([
  {
    headerName: '№ п/п',
    flex: 1,
    valueGetter: (params) => {
      if (params.node?.rowIndex == null) {
        return ''
      }
      return params.node.rowIndex + 1
    },
  },
  {
    field: 'category',
    headerName: 'Категория',
    flex: 3,
    showRowGroup: true,
    cellRenderer: 'agGroupCellRenderer',
    cellRendererParams: {
      suppressCount: true,
    },
  },
  {
    field: 'label',
    headerName: 'Наименование',
    flex: 6,
  },
])

const defaultColDef: ColDef<TableRow> = {
  sortable: false,
  filter: false,
}
</script>

<template>
  <div class="table-panel">
    <div class="table-panel__mode-bar">
      Режим: просмотр
    </div>

    <ag-grid-vue
      class="table-panel__grid"
      :row-data="tableRows"
      :column-defs="columnDefs"
      :get-row-id="getRowId"
      :default-col-def="defaultColDef"
      :tree-data="true"
      :suppress-group-cell-sticky="true"
      :animate-rows="true"
      tree-data-parent-id-field="__parentRowId"
      tree-data-display-type="custom"
    />
  </div>
</template>

<style scoped>
.table-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #eeeeee;
}

.table-panel__mode-bar {
  padding: 8px 12px;
  color: #1a73e8;
  font-size: 14px;
}

.table-panel__grid {
  height: 100vh;
  min-height: 0;
}

.table-panel__grid :deep(.ag-cell-wrapper) {
  position: relative;
  padding-left: calc(
    20px +
    var(--ag-row-group-indent-size, 10px) * var(--ag-indentation-level) * 0.5
  ) !important;
}


.table-panel__grid :deep(.ag-group-expanded),
.table-panel__grid :deep(.ag-group-contracted) {
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translateY(-50%);
}

.table-panel__grid :deep(.ag-group-value) {
  margin-left: 30px;
}

.table-panel__grid :deep(.ag-row-group-leaf-indent) {
  margin-left: 0 !important;
}
</style>