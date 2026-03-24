<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CardOferta from '../components/cardOferta.vue'; 
import { URL_BACK } from '../../../config';

const router = useRouter();

// Variables reactivas
const ofertasRecomendadas = ref([]);
const cargando = ref(true);
const error = ref(null);

const cargarOfertasPersonalizadas = async () => {
  // 1. Sacamos el ID del usuario. Asegúrate de que al hacer el login lo guardas como 'studentId' o el nombre que uses.
  const userId = localStorage.getItem('studentId'); // O 'studentId', el que estés usando en tu auth

  if (!userId) {
    error.value = "Inicia sesión para ver tus ofertas recomendadas.";
    cargando.value = false;
    return;
  }

  try {
    // 2. Llamamos a tu endpoint del backend
    const respuesta = await fetch(`${URL_BACK}/estudiantes/${userId}/ofertas-recomendadas`);
    
    if (!respuesta.ok) {
      throw new Error("Aún no tienes skills registradas o hubo un error al buscar el match.");
    }

    // 3. Guardamos la respuesta
    const data = await respuesta.json();
    ofertasRecomendadas.value = data;

  } catch (err) {
    console.error("Error:", err);
    error.value = err.message;
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  cargarOfertasPersonalizadas();
});

const verDetalle = (id) => {
  router.push({ name: 'OfertaDetalle', params: { id: id } });
};
</script>

<template>
  <div v-if="cargando" class="estado-mensaje">
    <p>Buscando las mejores ofertas para tus skills...</p>
  </div>

  <div v-else-if="error" class="estado-mensaje error">
    <p>Error: {{ error }}</p>
  </div>

  <section v-else class="container-ofertas">
    <h1 class="main-title">Ofertas Recomendadas </h1>
    <p class="subtitle">Basado en tus habilidades actuales</p>

    <div v-if="ofertasRecomendadas.length > 0" class="grid-ofertas">
      <CardOferta
        v-for="oferta in ofertasRecomendadas"
        :key="oferta.id"
        :oferta="oferta"
        @verDetalleOferta="verDetalle(oferta.id)"
      />
    </div>


    <div v-else class="estado-mensaje">
      <p>Ups, no hemos encontrado ofertas que hagan match con tus skills en este momento.</p>
    </div>

    <div class="boton-container">
      <router-link to="/ofertas" class="btn-masOfertas">
        Ver todas las ofertas
      </router-link>
    </div>

  </section>

    
</template>

<style scoped>
/* Contenedor principal para centrar todo */
.container-ofertas {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

/* Títulos */
.main-title {
  font-size: 28px;
  font-weight: 800;
  color: #0d1b2a;
  margin-bottom: 5px;
  text-align: left;
}

.subtitle {
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 30px;
  text-align: left;
}

/* Grid de tarjetas */
.grid-ofertas {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Mensajes de estado (carga, error, vacío) */
.estado-mensaje {
  text-align: center;
  font-size: 18px;
  color: #555;
  margin-top: 50px;
}

.estado-mensaje.error {
  color: #d32f2f;
}

/* Contenedor opcional si quieres que el botón quede centrado en la pantalla */
.boton-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

/* Estilos para tu router-link */
.btn-masOfertas {
  display: inline-block;
  background-color: #1a8f64; /* Verde esmeralda elegante */
  color: #ffffff;
  text-decoration: none;
  padding: 14px 35px; /* Un poco más de padding para que se vea más pro */
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
  
  /* Un pequeño toque extra de elegancia: una sombra suave */
  box-shadow: 0 4px 6px rgba(26, 143, 100, 0.2); 
}

.btn-masOfertas:hover {
  background-color: #126143; /* Un verde más oscuro al pasar el ratón */
  transform: translateY(-2px); /* Efecto de saltito */
  box-shadow: 0 6px 12px rgba(26, 143, 100, 0.3); /* La sombra crece */
  color: #ffffff;
}

/* Responsive */
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