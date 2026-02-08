import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
         {
      path: "/login",
      name: "login",
      component: () => import('@/views/Login.vue'),
      props: true
    },
    {
      path: '/ofertas',
      name: 'ofertas',
      component: () => import('@/views/Ofertas.vue'),
    },
    {
      path: "/oferta/:id",
      name: "OfertaDetalle",
      component: () => import('@/views/OfertaDetalle.vue'),
      props: true
    },
     {
      path: "/perfil",
      name: "perfil",
      component: () => import('@/views/Perfil.vue'),
      props: true
    },
          {
      path: "/dashboard",
      name: "dashboard",
      component: () => import('@/views/Dasboard.vue'),
      props: true
    },
  ],
})

export default router