import type { TreeItem } from '@/store/tree-store'

export interface TableRow extends TreeItem {
  __rowId: string
  __parentRowId?: string
  category: 'Группа' | 'Элемент'
}