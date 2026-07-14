import type { TreeItem } from '@/tree-store'

export interface VisibleTreeItem extends TreeItem {
  depth: number
  hasChildren: boolean
  expanded: boolean
  category: 'Группа' | 'Элемент'
}