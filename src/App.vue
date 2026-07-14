<script setup lang="ts">
import AgGrid from '@/components/table/AgGrid.vue'
import { TreeStore, items } from '@/tree-store'

const store = new TreeStore(items.map((item) => ({ ...item })))
</script>

<template>
  <main>
    <AgGrid :store="store" />
  </main>
</template>
