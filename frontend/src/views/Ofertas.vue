<script setup>
import {ref} from 'vue'
import { useFetch } from '../composables/useFetch';
import CardOferta from '../components/cardOferta.vue';

const url= ref(`http://localhost:3000/ofertas`)
const {data, error,loading, fetchData}=useFetch(url);
const emit=defineEmits(["verDetalleOferta"])

const verDetale=()=>{
    emit("verDetalleOferta")
}
</script>

<template>
    <div v-if="loading">
      <p>Loading...</p>
  </div>
  <div v-else-if="error">
    <p>Error: {{ error }}</p>
  </div>

  <section v-else class="container-ofertas">
      <!--Aquí ya se cargó los datos de la api-->
    <h1 class="main-title">Ofertas Públicas de Prácticas</h1>
    <div  v-if="data && data" class="grid-ofertas">
        <CardOferta v-for="oferta in data" :key="oferta.id"
        :oferta="oferta"
        @verDetalleOferta="verDetale"
        />

    </div>
</section>

    <div>
        
    </div>
</template>

<style scoped>
/* Contenedor principal para centrar todo */
.container-ofertas {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Título principal alineado a la izquierda */
.main-title {
  font-size: 28px;
  font-weight: 800;
  color: #0d1b2a;
  margin-bottom: 30px;
  text-align: left;
}

/* La magia del Grid: 3 columnas que se adaptan */
.grid-ofertas {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columnas iguales */
  gap: 24px; /* Espacio entre tarjetas */
}

/* Responsive: si la pantalla es pequeña, baja a 1 o 2 columnas */
@media (max-width: 1024px) {
  .grid-ofertas { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .grid-ofertas { grid-template-columns: 1fr; }
}

</style>