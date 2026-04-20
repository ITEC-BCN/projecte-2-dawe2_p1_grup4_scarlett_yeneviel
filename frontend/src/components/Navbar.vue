<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Variables reactivas
const isAuthenticated = ref(false);
const userRole = ref('');

// Variable para controlar el menú en móviles
const isMenuOpen = ref(false);

// Función que lee el localStorage
const checkAuthStatus = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  isAuthenticated.value = !!token;
  userRole.value = role || '';
};

// Alternar el estado del menú hamburguesa
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// 1. Revisamos al montar el componente
onMounted(() => {
  checkAuthStatus();
});

// 2. Revisamos cada vez que cambias de página
watch(() => route.path, () => {
  checkAuthStatus();
  isMenuOpen.value = false; // Cerramos el menú móvil al cambiar de página
});

// Función para cerrar sesión
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('studentId');
  localStorage.removeItem('studentEmail');

  if(userRole.value == 'admin'){
    localStorage.removeItem('userId');
    router.push('/admin/login'); // Si era admin, lo mandamos al login de admin
     checkAuthStatus(); // Actualizamos las variables
    return; // Salimos de la función para no ejecutar el push general
  }
  
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

      <button class="hamburger" @click="toggleMenu" aria-label="Abrir menú">
        <span class="bar" :class="{ 'open': isMenuOpen }"></span>
        <span class="bar" :class="{ 'open': isMenuOpen }"></span>
        <span class="bar" :class="{ 'open': isMenuOpen }"></span>
      </button>

      <div class="nav-links" :class="{ 'is-open': isMenuOpen }">
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


          <router-link v-if="userRole === 'admin'" to="/admin/panel">
            Panel de Administración
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
  height: 60px; /* Aumentado un poco para que respire el logo */
}

/* Sección Logo */
.brand {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo {
  height: 40px; /* Ajustado para que encaje bien en móvil y escritorio */
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

/* Enlaces (Estilos por defecto para Escritorio) */
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

.router-link-active {
  color: #10b981 !important;
  font-weight: 600;
}

/* Botones especiales */
.btn-login {
  background-color: #8b5cf6;
  color: white !important;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  transition: opacity 0.2s;
}

.btn-login:hover {
  opacity: 0.9;
}

.btn-logout {
  color: #ef4444 !important; /* Rojo para cerrar sesión */
}

.admin-text {
  margin: 0;
  font-weight: 600;
  color: #374151;
}

/* --- MENÚ HAMBURGUESA Y DISEÑO RESPONSIVE --- */

/* Botón oculto por defecto en escritorio */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 50; /* Por si el menú se pone por debajo */
}

.hamburger .bar {
  height: 3px;
  width: 100%;
  background-color: #111827;
  border-radius: 10px;
  transition: all 0.3s ease;
}

/* Animación del menú a una "X" */
.hamburger .bar.open:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}
.hamburger .bar.open:nth-child(2) {
  opacity: 0;
}
.hamburger .bar.open:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

/* Media Query para pantallas pequeñas (móviles y tablets) */
@media (max-width: 860px) {
  .nav-container {
    padding: 0 1.5rem;
  }

  .hamburger {
    display: flex; /* Mostramos el botón */
  }

  /* Transformamos el contenedor de enlaces en un menú desplegable */
  .nav-links {
    position: absolute;
    top: 61px; /* Justo debajo del navbar */
    left: 0;
    width: 100%;
    background-color: white;
    flex-direction: column;
    align-items: center;
    padding: 0;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.4s ease-in-out, padding 0.4s ease-in-out;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }

  /* Clase que se activa cuando isMenuOpen es true */
  .nav-links.is-open {
    max-height: 400px; /* Un valor alto para que quepa todo el contenido */
     padding: 1rem 0; /* Espaciado vertical para los enlaces */
  }

  .nav-links a {
    width: 100%;
    text-align: center;

  }

  .admin-text {
    padding-top: 10px;
  }
}
</style>