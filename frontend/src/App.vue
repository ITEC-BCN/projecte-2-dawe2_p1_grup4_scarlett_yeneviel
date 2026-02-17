<script setup> 

import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
</script>

<template>
  <div class="app-layout">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
  </template>

<style>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%; /* Asegura que el layout no exceda la pantalla */
}
main {
  flex: 1; /* Esto estira el contenido central y empuja el footer al fondo */
}

.main-content {
  flex: 1;
  overflow-y: auto; 

}
</style>
