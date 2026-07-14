import type { TreeItem, TreeItemId } from '@/store/tree-store'
import type { TableRow } from '@/components/table/model/types'
import type { GetRowIdParams } from 'ag-grid-community'

import { TreeStore } from '@/store/tree-store'

export function createRowId(id: TreeItemId): string {
  return `${typeof id}:${String(id)}`
}

export function getRowId(params: GetRowIdParams<TableRow>): string {
  return params.data.__rowId
}

export function buildTableRows(store: TreeStore): TableRow[] {
  const allItems: TreeItem[] = store.getAll()
  const parentIds: Set<string> = new Set<string>()

  allItems.forEach((item: TreeItem) => {
    if (item.parent !== null) {
      parentIds.add(createRowId(item.parent))
    }
  })

  return allItems.map((item: TreeItem) => {
    const rowId = createRowId(item.id)

    return {
      ...item,

      __rowId: rowId,

      __parentRowId:
        item.parent === null
          ? undefined
          : createRowId(item.parent),

      category:
        parentIds.has(rowId)
          ? 'Группа'
          : 'Элемент',
    }
  })
}