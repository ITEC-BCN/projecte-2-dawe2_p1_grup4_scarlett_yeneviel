<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useFetch } from "../composables/useFetchOfertas";
import CardOferta from "../components/cardOferta.vue";
import { URL_BACK } from "../../../config";

const router = useRouter();
const url = ref(`${URL_BACK}/ofertas`); // Aquí poner la URL de tu API (se coge del .env)
const { data, error, loading, fetchData } = useFetch(url);
const verDetalle = (id, namePath) => {
  router.push({ name: namePath, params: { id: id } });
};


const roleUSer= localStorage.getItem('role')

const crearOferta = ()=>{

  router.push('/crear')
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
    <h1 class="main-title">Ofertas de Prácticas</h1>
    <div v-if="roleUSer == 'admin'">
      <button @click="crearOferta" class="addOferta">Crear nueva oferta</button>
      <div v-if="data && data" class="grid-ofertas">
        <CardOferta
        v-for="oferta in data"
        :key="oferta.id"
        :oferta="oferta"
        @verDetalleOferta="verDetalle(oferta.id,'verOfertaAdmin')"
      />
      </div>
     
    </div>
    <div v-else>
      <div v-if="data && data" class="grid-ofertas">
   
      <CardOferta
        v-for="oferta in data"
        :key="oferta.id"
        :oferta="oferta"
        @verDetalleOferta="verDetalle(oferta.id,'OfertaDetalle')"
      />
    </div>
    </div>

  </section>

  <div></div>
</template>

<style scoped>
/* Contenedor principal para centrar todo */
.container-ofertas {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
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

.addOferta {
  background-color: #512da8; /* Morado de la imagen */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: background-color 0.2s;
}

.addOferta:hover {
  background-color: #4527a0;
}
/* Responsive: si la pantalla es pequeña, baja a 1 o 2 columnas */
@media (max-width: 1024px) {
  .grid-ofertas {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 768px) {
  .grid-ofertas {
    grid-template-columns: 1fr;
  }
}
</style>
