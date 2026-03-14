<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFetch } from '../composables/useFetchOfertas';
import { URL_BACK } from '../../../config';

const route = useRoute();
const router = useRouter();


// Construimos la URL usando el ID que viene en la ruta
const url = ref(`${URL_BACK}/ofertas/${route.params.id}`);
const { data: oferta, error, loading, estudiantePostula, postulaciones } = useFetch(url);

const volver = () => router.push({ name: "ofertas" });

const idEstudiante=localStorage.getItem("userId")
const bodyPostulacion=ref({
  id_oferta:route.params.id,
  id_estudiante:idEstudiante
})

const yaPostulado = ref(false);
const verificarPostulacion= async()=>{

  try {
    const listaPostulados= await postulaciones(`${URL_BACK}/postulaciones/${route.params.id}`)


    // Usamos .some para saber si existe al menos uno 
    yaPostulado.value= listaPostulados.some( p=> parseInt(p.id_usuario_estudiante) == parseInt(idEstudiante))
  }catch (err){

    console.error("Error obteniendo las postulaciones: ", err)
  }
}

// Llamamos a la función cuando el componente se carga
onMounted(() => {
  verificarPostulacion();
});

const postularOferta = async ()=>{

  try{
    
    const res = await estudiantePostula(bodyPostulacion.value,`${URL_BACK}/estudiante/postular`)

    alert("inscripción hecha correctamente")
     verificarPostulacion()

  }catch (error){
    console.error("Error al hacer la incripción: ", error)
    alert("Error al hacer la incripción")

  }
}

const guardarOferta = ()=>{
  alert ("oferta guardada correctamente")
}
</script>

<template>
  <div class="detalle-page">
    <div class="detalle-container">

      <button @click="volver" class="btn-back">
        ← Volver al listado
      </button>

      <!-- Estados -->
      <div v-if="loading" class="state-msg">
        Cargando detalles...
      </div>

      <div v-else-if="error" class="state-msg error">
        Error al cargar la oferta
      </div>

      <!-- Card principal -->
      <article v-else-if="oferta" class="oferta-card">

        <!-- Header -->
        <header class="header-detalle">
          <div class="header-meta">
            <span class="badge">
              {{ oferta.tipo_puesto }}
            </span>
            <span class="badge">
              {{ oferta.contenido_extra }}
            </span>

          </div>

          <h1 class="empresa">
            {{ oferta.nombre_empresa }}
          </h1>
        </header>

        <!-- Contenido -->
        <div class="contenido">

          <!-- Descripción -->
          <section class="descripcion">
            <h3>Descripción del puesto</h3>
            <p>{{ oferta.descripcion }}</p>
          </section>

          <!-- Sidebar -->
          <aside class="sidebar">
            <div class="info-box">

              <div class="info-item">
                <strong>Fecha de publicación</strong>
                <span> {{ oferta.fecha_publicacion }}</span>
              </div>

              <hr>

              <div class="info-item">
                <strong>Expira el</strong>
                <span>{{ oferta.fecha_expiracion }}</span>
              </div>

              <button @click="guardarOferta" class="btn-apply">
                Guardar oferta
              </button>

              <button @click="postularOferta" :disabled="yaPostulado" class="btn-apply">
                {{ yaPostulado ? 'Ya estás inscrito' : 'Inscribirme' }}
              </button>

            </div>
          </aside>

        </div>
      </article>

    </div>
  </div>
</template>

<style scoped>
/* Página base*/
.detalle-page {
  background: #F3F4F6;
  min-height: 100vh;
  padding: 50px 20px;
}

.detalle-container {
  max-width: 1000px;
  margin: auto;
}

/*   Card principal*/
.oferta-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 40px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

/* Header */
.header-detalle {
  margin-bottom: 30px;
}

.header-meta {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  margin-bottom: 8px;
}

.empresa {
  font-size: 1.9rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.2;
}

.badge {
  background: #2E7D32;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
}

.fecha {
  font-size: 0.9rem;
  color: #6B7280;
}

/* Layout principal */
.contenido {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 35px;
}

/* Descripción*/
.descripcion h3 {
  font-size: 1.2rem;
  margin-bottom: 12px;
  color: #111827;
}

.descripcion p {
  color: #4B5563;
  line-height: 1.8;
  white-space: pre-line;
  text-align: start;
}

/* Sidebar */
.info-box {
  background: #F9FAFB;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #E5E7EB;
  position: sticky;
  top: 20px;
}

.info-item {
  margin-bottom: 18px;
}

.info-item strong {
  display: block;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #6B7280;
  margin-bottom: 5px;
}

.info-item span {
  color: #111827;
  font-weight: 500;
}

.info-box hr {
  border: none;
  border-top: 1px solid #E5E7EB;
  margin: 15px 0;
}

/* Botones */
.btn-apply {
  width: 100%;
  margin-top: 10px;
  padding: 14px;
  border-radius: 10px;
  border: none;
  background: #4C1D95;
  color: white;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-apply:hover {
  background: #3b1675;
  transform: translateY(-1px);
}

/*Cuando esta deactivado */
.btn-apply:disabled {
  background-color: #9ca3af; /* Gris */
  cursor: not-allowed;
  transform: none;
}

.btn-back {
  background: none;
  border: none;
  font-weight: 600;
  margin-bottom: 18px;
  cursor: pointer;
}

/* Estilo para el botón de actualizar */
.btn-update {
  background: #6b46c1; /* morado suave */
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  margin-right: 12px;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.btn-update:hover {
  background: #5a38a8;
  transform: translateY(-2px);
}

/* Estilo para el botón de eliminar */
.btn-delete {
  background: #dc2626; /* rojo */
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.btn-delete:hover {
  background: #b91c1c;
  transform: translateY(-2px);
}

/* Estados*/
.state-msg {
  padding: 30px;
  text-align: center;
  color: #6B7280;
}

.state-msg.error {
  color: #DC2626;
}

/*  Responsive */
@media (max-width: 768px) {

  .oferta-card {
    padding: 25px;
  }

  .contenido {
    grid-template-columns: 1fr;
  }

  .header-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .empresa {
    font-size: 1.5rem;
  }

}
</style>
