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
      path: "/registro",
      name: "registro",
      component: () => import('@/views/Registro.vue'),
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
             {
      path: "/oferta/actualizar/:id",
      name: "ActualizarOferta",
      component: () => import('@/views/ActualizarOferta.vue'),
      props: true
    },
    {
    path: "/crear",
    name: "CrearOferta",
    component: () => import('@/views/AfegirOferta.vue'),
    props: true
  },
  {
    path: "/nosotros",
    name: "sobre nosotros",
    component: () => import('@/views/Nosotros.vue'),
  },
    {
    path: "/servicios",
    name: "nuestros servicios",
    component: () => import('@/views/NuestrosServicios.vue'),
  },
      {
    path: "/ayuda",
    name: "centro de ayuda",
    component: () => import('@/views/CentroDeAyuda.vue'),
  },
        {
    path: "/contacto",
    name: "contacto",
    component: () => import('@/views/Contacto.vue'),
  },
        {
    path: "/faqs",
    name: "preguntas frecuentes",
    component: () => import('@/views/FAQs.vue'),
  },
          {
    path: "/servTerms",
    name: "términos de servicio",
    component: () => import('@/views/TerminosServicio.vue'),
  },
            {
    path: "/privacidad",
    name: "Politica de Privacidad",
    component: () => import('@/views/PoliticaPrivacidad.vue'),
  }
  ],
})

export default router