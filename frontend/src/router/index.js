import { createRouter, createWebHistory } from 'vue-router'
import { URL_BACK } from '../../../config.js';
import { obtenerIdDesdeToken } from '../js/obtenerId.js';

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
      path: "/update-password/:token",
      name: "updatePassword",
      component: () => import('@/views/ActualizarContraseña.vue'),
      props: true
    },
    {
      path: "/restore-password",
      name: "restorePassword",
      component: () => import('@/views/RestaurarContraseña.vue'),
      props: true
    },
    {
      path: "/admin/login",
      name: "loginAdmin",
      component: () => import('@/views/admin/LoginAdmin.vue'),
      props: true
    },
    {
      path: "/admin/registro",
      name: "registroAdmin",
      component: () => import('@/views/admin/registroAdmin.vue'),
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
      meta: { requiresAuth: true, IsRejected:true }
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
      meta: { requiresAuth: true,IsRejected:true }
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
      path: "/admin/oferta/:id",
      name: "verOfertaAdmin",
      component: () => import('@/views/admin/verOfertaAdmin.vue'),
      props: true,
      meta: { requiresAdmin: true }
    },
    {
      path: "/estudiantes/:id/ofertas-recomendadas",
      name: "ofertasRecomendadas",
      component: () => import('@/views/OfertasPersonalizadas.vue'),
      props: true,
      meta: { requiresAdmin: false,IsRejected:true }
    },
    {
      path: '/revision',
      name: 'espera',
      component: () => import('../views/EnEspera.vue')
    },
  ],
})

//Tipo de middleware
//meta ponemos el requisito para poder visitar esa ruta
router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  const userId = obtenerIdDesdeToken();

  // 1. Si la ruta requiere autenticación
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      return next({ name: 'login' });
    }

    // --- LÓGICA DE BLOQUEO POR ESTADO ---
    if (userRole === 'estudiante') {
      try {

        //VERSION CON ENDPOINT
        // Llamamos a tu endpoint para obtener el estado actual del estudiante
        const response = await fetch(`${import.meta.env.VITE_URL_BACK}/estudiante/estado/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        const estado = data.estado;

        const estaPendiente = estado !== 'aprobado' && estado !== 'rechazado';

        const permitePendientes = to.meta.allowPending;

        if (estaPendiente && !permitePendientes && to.name !== 'espera') {
          return next({ name: 'espera' });
        }

        const rechazada=to.meta.IsRejected;
        const cuentaRechazada= estado==='rechazado';
        if (cuentaRechazada && rechazada && to.name !== 'espera') {
          return next({ name: 'espera' });
        }


      } catch (error) {
        console.error("Error verificando estado:", error);
        // En caso de error de red, podrías decidir si dejarlo pasar o desloguearlo
      }
    }
    // ------------------------------------

    // 2. Verificar si requiere ser admin
    if (to.matched.some(record => record.meta.requiresAdmin)) {
      if (userRole === 'admin') {
        next();
      } else {
        alert("Acceso denegado.");
        next({ name: 'ofertas' });
      }
    } else {
      next(); // Es una ruta auth normal y pasó el filtro de estado
    }

  } else {
    next(); // Ruta pública
  }
});

export default router