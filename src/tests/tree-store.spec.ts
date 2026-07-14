import { describe, it, expect, beforeEach } from 'vitest'
import { TreeStore, items, type TreeItem, type TreeItemId } from '@/store/tree-store'

describe('TreeStore', () => {
  let store: TreeStore

  beforeEach(() => {
    store = new TreeStore(items.map((item) => ({ ...item }))) // делаем копию массива, чтоб не менять исходный массив
  })

  describe('getAll', () => {
    it('возвращает все элементы', () => {
      expect(store.getAll()).toEqual(items)
      expect(store.getAll()).toHaveLength(8)
    })
  })

  describe('getItem', () => {
    it('находит элемент по числовому id', () => {
      expect(store.getItem(1)).toEqual({
        id: 1,
        parent: null,
        label: 'Айтем 1',
      })
    })

    it('находит элемент по строковому id', () => {
      expect(store.getItem('91064cee')).toEqual({
        id: '91064cee',
        parent: 1,
        label: 'Айтем 2',
      })
    })

    it('возвращает null, если элемента нет', () => {
      expect(store.getItem(999)).toBeNull()
    })
  })

  describe('getChildren', () => {
    it('возвращает прямых детей', () => {
      const children = store.getChildren(1)

      expect(children).toEqual([
        { id: '91064cee', parent: 1, label: 'Айтем 2' },
        { id: 3, parent: 1, label: 'Айтем 3' },
      ])
    })

    it('возвращает детей у узла со строковым id', () => {
      const children = store.getChildren('91064cee')

      expect(children.map((item: TreeItem) => item.id)).toEqual([4, 5, 6])
    })

    it('возвращает пустой массив, если детей нет', () => {
      expect(store.getChildren(7)).toEqual([])
    })
  })

  describe('getAllChildren', () => {
    it('возвращает всех детей (рекурсия)', () =>{
      const allChildren = store.getAllChildren(1)
      expect(allChildren).toHaveLength(7)

      const ids = allChildren.map((item) => item.id)
      expect(ids).toEqual(expect.arrayContaining([
        '91064cee', 3, 4, 5, 6, 7, 8,
      ]))

    })

    it('если взять узел с середины дерева', () => {
      const allChildren = store.getAllChildren(4)
      expect(allChildren).toHaveLength(2)
      const ids = [7,8]
      expect(ids).toEqual(expect.arrayContaining(allChildren.map((item) => item.id)))
    })

    it('возвращает пустой массив если нет детей', () => {
      expect(store.getAllChildren(7)).toEqual([])
      expect(store.getAllChildren(3)).toEqual([])
      expect(store.getAllChildren(8)).toEqual([])
    })
  })

  describe('getAllParents', () => {
    it('возвращает путь от элемента до корня (порядок важен)', () => {
      const parents = store.getAllParents(7)
      const ids = parents.map((item) => item.id)

      expect(ids).toEqual([7, 4, '91064cee', 1])
    })

    it('работает со строковым id', () => {
      const ids = store.getAllParents('91064cee').map((item) => item.id)

      expect(ids).toEqual(['91064cee', 1])
    })

    it('для корня возвращает только сам корень', () => {
      expect(store.getAllParents(1)).toEqual([
        { id: 1, parent: null, label: 'Айтем 1' },
      ])
    })

    it('для несуществующего id возвращает пустой массив', () => {
      expect(store.getAllParents(999)).toEqual([])
    })
  })

  describe('addItem', () => {
    it('добавляет элемент в хранилище', () => {
      const newItem: TreeItem = { id: 9, parent: 1, label: 'Айтем 9' }

      store.addItem(newItem)

      expect(store.getItem(9)).toEqual(newItem)
      expect(store.getAll()).toHaveLength(9)
      expect(store.getChildren(1).map((item) => item.id)).toContain(9)
    })
  })

  describe('removeItem', () => {
    it('удаляет элемент и всех его потомков', () => {
      store.removeItem(4)

      expect(store.getItem(4)).toBeNull()
      expect(store.getItem(7)).toBeNull()
      expect(store.getItem(8)).toBeNull()
      expect(store.getAll()).toHaveLength(5)
    })

    it('удаляет только лист, если детей нет', () => {
      store.removeItem(3)

      expect(store.getItem(3)).toBeNull()
      expect(store.getAll()).toHaveLength(7)
      expect(store.getItem(1)).not.toBeNull()
    })

    it('при удалении корня очищает всё дерево', () => {
      store.removeItem(1)

      expect(store.getAll()).toEqual([])
    })

    it('убирает удалённый элемент из списка детей его бывшего родителя', () => {
      store.removeItem(3)

      expect(store.getChildren(1).map((item) => item.id)).not.toContain(3)
    })

    it('ничего не делает для несуществующего id', () => {
      const before = store.getAll().length

      store.removeItem(999)

      expect(store.getAll()).toHaveLength(before)
    })
  })

  describe('updateItem', () => {
    it('обновляет существующий элемент', () => {
      store.updateItem({ id: 3, parent: 1, label: 'Обновлённый' })

      expect(store.getItem(3)).toEqual({
        id: 3,
        parent: 1,
        label: 'Обновлённый',
      })
    })

    it('может сменить parent', () => {
      store.updateItem({ id: 3, parent: 4, label: 'Айтем 3' })

      expect(store.getItem(3)?.parent).toBe(4)
      expect(store.getChildren(4).map((item) => item.id)).toContain(3)
    })

    it('убирает элемент из списка детей старого родителя при смене parent', () => {
      store.updateItem({ id: 3, parent: 4, label: 'Айтем 3' })

      expect(store.getChildren(1).map((item) => item.id)).not.toContain(3)
    })

    it('ничего не делает, если элемента нет', () => {
      const before = store.getAll().length

      store.updateItem({ id: 999, parent: null, label: 'Нет' })

      expect(store.getItem(999)).toBeNull()
      expect(store.getAll()).toHaveLength(before)
    })
  })

  describe('одновременное существование числового и строкового id', () => {
    it('различает id 1 (number) и "1" (string) как разные элементы', () => {
      store.addItem({ id: '1', parent: null, label: 'Строковый айтем 1' })

      expect(store.getItem(1)).toEqual({
        id: 1,
        parent: null,
        label: 'Айтем 1',
      })
      expect(store.getItem('1')).toEqual({
        id: '1',
        parent: null,
        label: 'Строковый айтем 1',
      })
      expect(store.getAll()).toHaveLength(9)
    })

    it('удаление по числовому id не затрагивает элемент со строковым id', () => {
      store.addItem({ id: '1', parent: null, label: 'Строковый айтем 1' })

      store.removeItem(1)

      expect(store.getItem(1)).toBeNull()
      expect(store.getItem('1')).not.toBeNull()
    })
  })

  describe('элементы с произвольными дополнительными полями', () => {
    interface ProductItem {
      id: TreeItemId
      parent: TreeItemId | null
      label: string
      price: number
      inStock: boolean
    }

    it('работает с типом, отличным от TreeItem', () => {
      const products: ProductItem[] = [
        { id: 1, parent: null, label: 'Категория', price: 0, inStock: true },
        { id: 2, parent: 1, label: 'Товар', price: 999, inStock: false },
      ]

      const productStore = new TreeStore<ProductItem>(products)

      expect(productStore.getItem(2)).toEqual({
        id: 2,
        parent: 1,
        label: 'Товар',
        price: 999,
        inStock: false,
      })
      expect(productStore.getChildren(1)).toHaveLength(1)
    })
  })

  describe('производительность на большом массиве', () => {
    function buildLinearChain(size: number): TreeItem[] {
      const chain: TreeItem[] = []
      for (let i = 0; i < size; i++) {
        chain.push({
          id: i,
          parent: i === 0 ? null : i - 1,
          label: `Айтем ${i}`,
        })
      }
      return chain
    }

    it('getItem, getChildren и getAllChildren остаются быстрыми на 50 000 элементов', () => {
      const size = 50000
      const bigStore = new TreeStore(buildLinearChain(size))

      const start = performance.now()

      for (let i = 0; i < 1000; i++) {
        bigStore.getItem(i)
        bigStore.getChildren(i)
      }
      bigStore.getAllChildren(0)

      const elapsed = performance.now() - start

      expect(elapsed).toBeLessThan(1000)
    })
  })
})


