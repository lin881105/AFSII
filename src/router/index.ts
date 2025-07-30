import { createRouter, createWebHistory } from 'vue-router'

import RoleSelectView from '@/views/RoleSelectView.vue'
import UserView from '@/views/UserView.vue'
import AdminView from '@/views/AdminView.vue'
// import LanguageInterfaceView from '@/views/LanguageInterfaceView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'roleSelect',
      component: RoleSelectView,
    },
    {
      path: '/user',
      name: 'user',
      component: UserView,
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
  ],
})

export default router