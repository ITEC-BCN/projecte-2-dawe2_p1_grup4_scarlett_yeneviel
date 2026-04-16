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
      path: "/admin/login",
      name: "loginAdmin",
      component: () => import('@/views/admin/LoginAdmin.vue'),
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
      props: true,
    },
     {
      path: "/perfil",
      name: "perfil",
      component: () => import('@/views/Perfil.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
      {
      path: "/perfilDetalle/:id",
      name: "PerfilDetalleSolo",
      component: () => import('@/views/admin/PerfilDetalleSolo.vue'),
      props: true,
      meta: { requiresAdmin: true }
    },
          {
      path: "/dashboard",
      name: "dashboard",
      component: () => import('@/views/Dasboard.vue'),
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: "/oferta/actualizar/:id",
      name: "ActualizarOferta",
      component: () => import('@/views/admin/ActualizarOferta.vue'),
      props: true,
      meta: { requiresAdmin: true }
    },
    {
      path: "/admin/panel",
      name: "PanelAdmin",
      component: () => import('@/views/admin/PanelAdmin.vue'),
      props: true,
      meta: { requiresAdmin: true }
    },
    {
      path: "/admin/panelOfertas",
      name: "PanelOfertasAdmin",
      component: () => import('@/views/admin/GestorOfertas.vue'),
      props: true,
      meta: { requiresAdmin: true }
    },
    {
    path: "/crear",
    name: "CrearOferta",
    component: () => import('@/views/admin/AfegirOferta.vue'),
    props: true,
    meta: { requiresAdmin: true }
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
  },
  {
    path:"/admin/oferta/:id",
    name:"verOfertaAdmin",
    component:() => import('@/views/admin/verOfertaAdmin.vue'),
    props: true,
    meta: { requiresAdmin: true }
  },
  {
    path:"/estudiantes/:id/ofertas-recomendadas",
    name:"ofertasRecomendadas",
    component:() => import('@/views/OfertasPersonalizadas.vue'),
    props: true,
    meta: { requiresAdmin: false }
  }
  ],
})

//Tipo de middleware
//meta ponemos el requisito para poder visitar esa ruta
router.beforeEach((to, from, next) => {
  // Obtenemos el rol y el estado de autenticación
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role'); // 'admin' o 'estudiante'

  // 1. Verificar si la ruta requiere ser admin
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    
    if (token && userRole === 'admin') {
      next(); // Es admin, puede pasar
    } else {
      // No es admin: lo mandamos a las ofertas o a una página de "No autorizado"
      alert("Acceso denegado: Esta zona es solo para administradores.");
      next({ name: 'ofertas' }); 
    }

  } else if (to.matched.some(record => record.meta.requiresAuth)) {
    // 2. Verificar rutas que solo requieren estar logueado (estudiante o admin)
    if (token) {
      next();
    } else {
      next({ name: 'login' });
    }

  } else {
    // 3. Rutas públicas
    next();
  }
});

export default router