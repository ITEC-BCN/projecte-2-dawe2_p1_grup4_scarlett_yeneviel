<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useFetch } from "../composables/useFetchOfertas";
import CardOferta from "../components/cardOferta.vue";
import { URL_BACK } from "../../../config";

const router = useRouter();
const url = ref(`${URL_BACK}/ofertas`); 
const { data, error, loading, fetchData } = useFetch(url);

// 1. Variable para guardar lo que el usuario escribe
const searchQuery = ref("");

// 2. MAGIA DE VUE: Filtramos la data en tiempo real
const ofertasFiltradas = computed(() => {
  // Si aún no hay datos, devolvemos un array vacío
  if (!data.value) return [];
  
  // Convertimos lo escrito a minúsculas para que la búsqueda no sea sensible a mayúsculas
  const query = searchQuery.value.toLowerCase();
  
  return data.value.filter((oferta) => {
    // Revisamos si el texto está en el nombre de la empresa O en el tipo de puesto
    const empresa = (oferta.nombre_empresa || "").toLowerCase();
    const puesto = (oferta.tipo_puesto || "").toLowerCase();
    
    return empresa.includes(query) || puesto.includes(query);
  });
});

const verDetalle = (id, namePath) => {
  router.push({ name: namePath, params: { id: id } });
};

const roleUSer = localStorage.getItem('role');

const crearOferta = () => {
  router.push('/crear');
};
</script>

<template>
  <div v-if="loading" class="estado-mensaje">
    <p>Loading...</p>
  </div>
  <div v-else-if="error" class="estado-mensaje error">
    <p>Error: {{ error }}</p>
  </div>

  <section v-else class="container-ofertas">
    <h1 class="main-title">Ofertas de Prácticas</h1>
    
    <div class="buscador-container">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="🔍 Buscar por empresa o puesto..." 
        class="input-buscador"
      />
    </div>

    <div v-if="roleUSer == 'admin'">
      <button @click="crearOferta" class="addOferta">+ Crear nueva oferta</button>
      
      <div v-if="ofertasFiltradas.length > 0" class="grid-ofertas">
        <CardOferta
          v-for="oferta in ofertasFiltradas"
          :key="oferta.id"
          :oferta="oferta"
          @verDetalleOferta="verDetalle(oferta.id,'verOfertaAdmin')"
        />
      </div>
      <div v-else class="estado-mensaje"><p>No se encontraron ofertas con esa búsqueda.</p></div>
    </div>
    
    <div v-else>
      <div v-if="ofertasFiltradas.length > 0" class="grid-ofertas">
        <CardOferta
          v-for="oferta in ofertasFiltradas"
          :key="oferta.id"
          :oferta="oferta"
          @verDetalleOferta="verDetalle(oferta.id,'OfertaDetalle')"
        />
      </div>
      <div v-else class="estado-mensaje"><p>No se encontraron ofertas con esa búsqueda.</p></div>
    </div>

  </section>
</template>

<style scoped>
/* Contenedor principal */
.container-ofertas {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.main-title {
  font-size: 28px;
  font-weight: 800;
  color: #0d1b2a;
  margin-bottom: 20px;
  text-align: left;
}

/* ESTILOS DEL BUSCADOR */
.buscador-container {
  margin-bottom: 30px;
}
.input-buscador {
  width: 100%;
  max-width: 500px;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s ease;
}
.input-buscador:focus {
  border-color: #512da8;
}

/* Botón admin */
.addOferta {
  background-color: #512da8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: background-color 0.2s;
}
.addOferta:hover {
  background-color: #4527a0;
}

/* Grid */
.grid-ofertas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.estado-mensaje {
  text-align: center;
  margin-top: 2rem;
  color: #666;
}

@media (max-width: 1024px) {
  .grid-ofertas { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .grid-ofertas { grid-template-columns: 1fr; }
}
</style>