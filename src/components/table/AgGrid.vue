<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'

import { ref } from 'vue'

import type {
  ColDef,
  ValueGetterParams,
} from 'ag-grid-community'

import {
  TreeStore,
  items,
} from '@/store/tree-store'

import type { TableRow } from './model/types'

import { buildTableRows, getRowId } from '@/utils/utils'

const store = new TreeStore(
  items.map((item) => ({ ...item })),
)

const tableRows = ref<TableRow[]>(
  buildTableRows(store),
)

const columnDefs = ref<
  ColDef<TableRow>[]
>([
  {
    headerName: '№ п/п',
    flex: 1,
    valueGetter: (params) => {
      if (params.node.rowIndex === null) {
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
  <ag-grid-vue
    style="height: 100%"
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
</template>