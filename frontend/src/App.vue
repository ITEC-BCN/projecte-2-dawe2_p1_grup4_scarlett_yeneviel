<script setup> 

import Navbar from './components/Navbar.vue';
import Footer from './components/Footer.vue';
import CardOferta from './components/cardOferta.vue';
</script>

<template>
  <div class="app-layout">
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
    <CardOferta />
    <Footer />
  </div>
  </template>

<style>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
main {
  flex: 1; /* Esto estira el contenido central y empuja el footer al fondo */
}

.main-content {
  flex: 1;
  overflow-y: auto; 
  padding: 2rem;
}
</style>
