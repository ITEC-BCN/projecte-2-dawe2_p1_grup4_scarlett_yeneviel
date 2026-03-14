<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Variables reactivas para saber el estado del usuario
const isAuthenticated = ref(false);
const userRole = ref('');

// Función que lee el localStorage para saber quién está navegando
const checkAuthStatus = () => {
  const token = localStorage.getItem('token'); // Ajusta el nombre si usas otro
  const role = localStorage.getItem('role');   // Ej: 'admin' o 'estudiante'
  
  isAuthenticated.value = !!token; // Si hay token es true, si no, false
  userRole.value = role || '';
};

// 1. Revisamos al montar el componente (cuando cargas la página)
onMounted(() => {
  checkAuthStatus();
});

// 2. Revisamos cada vez que cambias de página (ruta)
// Esto es un truco para que el Navbar se actualice automáticamente tras el Login
watch(() => route.path, () => {
  checkAuthStatus();
});

// Función para cerrar sesión
const logout = () => {
  // Limpiamos todo el rastro del usuario
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('studentId'); // O los datos que guardes
  
  checkAuthStatus(); // Actualizamos las variables
  router.push('/login'); // Lo mandamos de vuelta al login
};
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="brand" @click="$router.push('/')">
        <picture>
          <source srcset="../../public/logos/InterniaVerde.webp" type="image/webp">
          <img class="logo" src="../../public/logos/InterniaVerde.png" alt="Logo de la empresa">
        </picture>
        <h2 class="brand-text">Internia</h2>
      </div>

      <div class="nav-links">
        <router-link to="/">Inicio</router-link>
        <router-link to="/ofertas">Ofertas</router-link>

        <router-link v-if="!isAuthenticated" to="/login" class="btn-login">
          Login
        </router-link>

        <template v-else>
          <router-link v-if="userRole === 'estudiante'" to="/perfil">
            Mi Perfil
          </router-link>

          <router-link v-if="userRole === 'estudiante'" to="/dashboard">
            Dashboard
          </router-link>

          <a href="#" @click.prevent="logout" class="btn-logout">
            Cerrar sesión
          </a>
        </template>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Navbar.vue */
.navbar {
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 40;
  width: 100%; 
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.nav-container {
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
}

/* Sección Logo */
.brand {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo {
  height: 60px;
  width: auto;
  margin-right: 12px;
}

.brand-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.025em;
}

/* Enlaces */
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links a {
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 700;
  color: #6b7280;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #111827;
}

/* Link activo (Donde estás parado) */
.router-link-active {
  color: #10b981 !important;
  /* Verde accent */
  font-weight: 600;
}

/* Estilo especial para botones (Login y Dashboard) */
.btn-login {
  background-color: #8b5cf6;
  /* Púrpura */
  color: white !important;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  transition: opacity 0.2s;
}

.btn-login:hover {
  opacity: 0.9;
}

.btn-dashboard {
  color: #10b981 !important;
  font-weight: 600 !important;
}

.btn-dashboard:hover {
  text-decoration: underline !important;
}
</style>