<script setup>
// No necesitas lógica extra por ahora
</script>

<template>
  <nav class="navbar">
    <div class="nav-container">
      <div class="brand" @click="$router.push('/')">
        <img src="/Internia.webp" class="logo" alt="Logo" />
        <h2 class="brand-text">Internia</h2>
      </div>

      <div class="nav-links">
        <router-link to="/">Inicio</router-link>
        <router-link to="/ofertas">Ofertas</router-link>
        <router-link to="/login">Login</router-link>
        <router-link to="/perfil">Perfil</router-link>
        <router-link to="/dashboard">Dashboard</router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>

.navbar {
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 30;
  width: 100vw; 
  left: 0;
  right: 0;
  margin-left: calc(-50vw + 50%); /* Truco para romper contenedores padres con max-width */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.nav-container {
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 30px;
}

/* Sección Logo */
.brand {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo {
  height: 32px;
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
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  transition: color 0.2s;
}

.nav-links a:hover {
  color: #111827;
}

/* Link activo (Donde estás parado) */
.router-link-active {
  color: #10b981 !important; /* Verde accent */
  font-weight: 600;
}

/* Estilo especial para botones (Login y Dashboard) */
.btn-login {
  background-color: #8b5cf6; /* Púrpura */
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