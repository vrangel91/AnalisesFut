import { createRouter, createWebHistory } from 'vue-router'
import SurebetsView from '../views/SurebetsView.vue'

const routes = [
  {
    path: '/',
    name: 'surebets',
    component: SurebetsView
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
