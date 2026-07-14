<script setup lang="ts">
import { AgGridVue } from 'ag-grid-vue3'
import type { AutoSizeStrategy } from 'ag-grid-community'

import { ref } from 'vue'

import type {
  ColDef,
  ValueGetterParams,
} from 'ag-grid-community'

import {
  TreeStore,
  items,
  type TreeItem,
  type TreeItemId,
} from '@/store/tree-store'

import type { VisibleTreeItem } from './model/types'

const store = new TreeStore(
  items.map((item) => ({ ...item })),
)


const expandedElements = new Set<TreeItemId>()

expandedElements.add(1)
expandedElements.add('91064cee')
expandedElements.add(4)

function toggleRow(id: TreeItemId): void {
  if (expandedElements.has(id)){
    expandedElements.delete(id)
  }
  else {
    expandedElements.add(id)
  }

  rowData.value = buildExpandedRows()
}

function buildExpandedRows(): VisibleTreeItem[] {
  const rows: VisibleTreeItem[] = []

  const allRoots = store
    .getAll()
    .filter((item) => item.parent === null)

  function appendItem(
    item: TreeItem,
    depth: number,
  ): void {
    const children = store.getChildren(item.id)
    const hasChildren = children.length > 0

    const isExpanded =
      hasChildren &&
      expandedElements.has(item.id)

    rows.push({
      ...item,
      depth,
      hasChildren,
      expanded: isExpanded,
      category: hasChildren
        ? 'Группа'
        : 'Элемент',
    })

    if (!isExpanded) {
      return
    }

    for (const child of children) {
      appendItem(child, depth + 1)
    }
  }

  for (const root of allRoots) {
    appendItem(root, 0)
  }

  return rows
}

const rowData = ref<VisibleTreeItem[]>(
  buildExpandedRows(),
)

const columnDefs = ref<
  ColDef<VisibleTreeItem>[]
>([
  {
    headerName: '№ п/п',
    flex: 1,
    valueGetter: (
      params: ValueGetterParams<VisibleTreeItem>,
    ) => {
      return params.node.rowIndex === null
        ? ''
        : params.node.rowIndex + 1
    }
  },
  {
    field: 'category',
    headerName: 'Категория',
    flex: 3,
    valueGetter: params => {
      const item = params.data
      if (!item?.hasChildren){
        return item?.category
      }
      const arrow = item.expanded ? '▼' : '▶'
      return `${arrow} ${item.category}`
    },
    
    onCellClicked: params => {
      const item = params.data
      if (!item?.hasChildren) {
        return
      }
      toggleRow(item.id)
    },

    cellStyle: params => ({
      cursor: params.data?.hasChildren ? 'pointer' : 'default',
      paddingLeft: `${(params.data?.depth ?? 0) * 20 + 16}px`
    })
  },
  {
    field: 'label',
    headerName: 'Наименование',
    flex: 6
  },
])

const defaultColDef: ColDef<VisibleTreeItem> = {
  sortable: false,
  filter: false,
}

</script>

<template>
  <ag-grid-vue
    style="height: 100%"
    :column-defs="columnDefs"
    :row-data="rowData"
    :default-col-def="defaultColDef"
  />
</template>