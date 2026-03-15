<!-- <script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Asegúrate de que las rutas a tus componentes y config sean correctas
import CardOferta from '../components/cardOferta.vue'; 
import { URL_BACK } from '../../../config';

const router = useRouter();

// Variables reactivas para guardar los datos y el estado de la pantalla
const ofertasRecomendadas = ref([]);
const cargando = ref(true);
const error = ref(null);

const cargarOfertasPersonalizadas = async () => {
  // 1. Sacamos el ID del usuario desde el localStorage (¡Asegúrate de guardarlo al hacer login!)
  const userId = localStorage.getItem('studentId'); 

  if (!userId) {
    error.value = "No hemos encontrado tu sesión. Por favor, vuelve a iniciar sesión.";
    cargando.value = false;
    return;
  }

  try {
    // 2. Llamamos a tu endpoint personalizado
    const respuesta = await fetch(`${URL_BACK}/estudiantes/${userId}/ofertas-recomendadas`);
    
    if (!respuesta.ok) {
      throw new Error("Hubo un problema al buscar tus ofertas compatibles.");
    }

    // 3. Guardamos la magia que devuelve tu backend
    ofertasRecomendadas.value = await respuesta.json();

  } catch (err) {
    console.error("Error cargando las ofertas personalizadas:", err);
    error.value = err.message;
  } finally {
    // 4. Apagamos el estado de carga
    cargando.value = false;
  }
};

// Ejecutamos la función en cuanto el componente se monta en la pantalla
onMounted(() => {
  cargarOfertasPersonalizadas();
});

// Función para ir al detalle de la oferta
const verDetalle = (id) => {
  router.push({ name: 'OfertaDetalle', params: { id: id } });
};
</script> -->

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// Asegúrate de que las rutas a tus componentes sean correctas
import CardOferta from '../components/cardOferta.vue'; 

const router = useRouter();

// Variables reactivas para guardar los datos y el estado de la pantalla
const ofertasRecomendadas = ref([]);
const cargando = ref(true);
const error = ref(null);

const cargarOfertasPersonalizadas = async () => {
  // 1. Verificamos que el usuario esté logueado (opcional, pero buena práctica)
  const userId = localStorage.getItem('studentId'); 

  if (!userId) {
    error.value = "No hemos encontrado tu sesión. Por favor, vuelve a iniciar sesión.";
    cargando.value = false;
    return;
  }

  // 2. ¡EL TRUCO! Simulamos una llamada al servidor de 1 segundo
  setTimeout(() => {
    // 3. HARDCODEAMOS las ofertas (usando los datos reales que me pasaste)
    ofertasRecomendadas.value = [
      {
        id: 22,
        nombre_empresa: "SEAT CODE",
        fecha_publicacion: "2026-02-17",
        fecha_expiracion: "2026-03-19",
        tipo_puesto: "Desarrollador Web Fullstack (.NET/Vue.js)",
        descripcion: "El hub digital de SEAT busca desarrolladores para soluciones de movilidad inteligente.",
        funciones: "Implementación de servicios backend robustos y colaboración en el diseño de interfaces de usuario.",
        beneficios: "Salario competitivo, tickets restaurante, seguro médico y un ambiente muy dinámico.",
        requisitos: ".NET 6+, C#, SQL y nociones de metodologías Agile (Scrum)."
      },
      {
        id: 20,
        nombre_empresa: "BETWEEN Technology",
        fecha_publicacion: "2026-02-17",
        fecha_expiracion: "2026-03-17",
        tipo_puesto: "Programador .NET Core",
        descripcion: "Consultora tecnológica con proyectos en sectores industriales y servicios.",
        funciones: "Análisis técnico, migración de sistemas legacy y desarrollo de aplicaciones web escalables.",
        beneficios: "Contrato indefinido, plan de carrera personalizado y certificaciones oficiales pagadas.",
        requisitos: "C#, ASP.NET MVC, Entity Framework y conocimientos de front-end (Vue, Angular o React)."
      }
    ];

    // 4. Apagamos el estado de carga
    cargando.value = false;
  }, 1000); // Tarda 1000 milisegundos (1 segundo) en mostrarse
};

// Ejecutamos la función en cuanto el componente se monta en la pantalla
onMounted(() => {
  cargarOfertasPersonalizadas();
});

// Función para ir al detalle de la oferta
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