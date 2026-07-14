import type { TreeItem } from '@/store/tree-store'

export interface VisibleTreeItem extends TreeItem {
  depth: number
  hasChildren: boolean
  expanded: boolean
  category: 'Группа' | 'Элемент'
}