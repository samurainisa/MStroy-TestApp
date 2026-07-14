import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import { TreeDataModule } from 'ag-grid-enterprise'

ModuleRegistry.registerModules([AllCommunityModule, TreeDataModule])

createApp(App).mount('#app')
