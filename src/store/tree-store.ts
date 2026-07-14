export type TreeItemId = number | string

export interface BaseTreeItem {
  id: TreeItemId
  parent: TreeItemId | null
}

export interface TreeItem extends BaseTreeItem {
  label: string
}

export const items: TreeItem[] = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' },
]

export class TreeStore<T extends BaseTreeItem = TreeItem> {
  private itemById = new Map<TreeItemId, T>()
  private childrenByParent = new Map<TreeItemId | null, T[]>()

  constructor(items: T[]) {
    for (const item of items) {
      this.itemById.set(item.id, item)
      this.indexChild(item)
    }
  }

  private indexChild(item: T): void {
    const siblings = this.childrenByParent.get(item.parent)
    if (siblings) {
      siblings.push(item)
    } else {
      this.childrenByParent.set(item.parent, [item])
    }
  }

  private unindexChild(item: T): void {
    const siblings = this.childrenByParent.get(item.parent)
    if (!siblings) {
      return
    }

    const index = siblings.indexOf(item)
    if (index !== -1) {
      siblings.splice(index, 1)
    }
  }

  getAll(): T[] {
    return Array.from(this.itemById.values())
  }

  getItem(id: TreeItemId): T | null {
    return this.itemById.get(id) ?? null
  }

  getChildren(id: TreeItemId): T[] {
    return this.childrenByParent.get(id) ?? []
  }

  getAllChildren(id: TreeItemId): T[] {
    const result: T[] = []

    const stack: T[] = [...this.getChildren(id)]

    while (stack.length > 0) {
      const child = stack.pop()
      if (child) {
        result.push(child)
        stack.push(...this.getChildren(child.id))
      }
    }

    return result
  }

  getAllParents(id: TreeItemId): T[] {
    const allParents: T[] = []
    let current = this.getItem(id)

    while (current) {
      allParents.push(current)
      current =
        current.parent === null ? null : this.getItem(current.parent)
    }
    return allParents
  }

  addItem(item: T): void {
    this.itemById.set(item.id, item)
    this.indexChild(item)
  }

  removeItem(id: TreeItemId): void {
    const item = this.itemById.get(id)
    if (!item) {
      return
    }

    for (const child of this.getAllChildren(id)) {
      this.itemById.delete(child.id)
      this.childrenByParent.delete(child.id)
    }

    this.itemById.delete(id)
    this.childrenByParent.delete(id)
    this.unindexChild(item)
  }

  updateItem(item: T): void {
    const existing = this.itemById.get(item.id)
    if (!existing) {
      return
    }

    if (existing.parent !== item.parent) {
      this.unindexChild(existing)
      this.indexChild(item)
    } else {
      const siblings = this.childrenByParent.get(item.parent)
      const index = siblings?.indexOf(existing) ?? -1
      if (siblings && index !== -1) {
        siblings[index] = item
      }
    }

    this.itemById.set(item.id, item)
  }
}
