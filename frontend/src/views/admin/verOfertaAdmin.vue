<script setup>
// /admin/oferta/:id
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFetch } from '../../composables/useFetchOfertas';
import Modal from '../../components/Modal.vue';
import ActualizarEstado from '../../components/ModalEstadoCandi.vue';
import CvViewer from '../../components/CvViewer.vue';
import { useStudents } from "../../composables/useStudents";
import { sendEmail } from '../../js/funEmail';
import api from "../../services/api";
import {
  Calendar as CalendarIcon,
  MapPin as MapPinIcon,
  Briefcase as BriefcaseIcon,
  Clock as ClockIcon,
  CheckCircle as CheckIcon,
  Bookmark as BookmarkIcon,
  Heart as Heart
} from 'lucide-vue-next';
import { json } from 'body-parser';

/*Oferta id*/
defineProps({
  id: String
});

const route = useRoute();
const router = useRouter();

const url = ref(`${import.meta.env.VITE_URL_BACK}/ofertas/${route.params.id}`);
const { data: oferta, error, loading, postulaciones, fetchData } = useFetch(url);

const volver = () => router.push({ name: 'ofertas' });

const ActualizarOferta = (id) => {
  router.push({ name: "ActualizarOferta", params: { id: id } });
};

// Funciones para el modal de eliminar
// El ref guarda la instancia del modal 
const modalRef = ref(null);
const loadingModal = ref(false); // Importante para el feedback visual
const handleOfertaEstado = async () => {
  const nuevoEstado = oferta.value.estado === 'ACTIVA' ? 'INACTIVA' : 'ACTIVA';

  try {
    loadingModal.value = true;
    const res = await api.put(`${import.meta.env.VITE_URL_BACK}/ofertaDesactivar/${oferta.value.id}`,{ estado: nuevoEstado }, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!res.data) throw new Error('Error actualizando oferta');

    // Usamos la propiedad expuesta 'mensaje' del modal genérico
    modalRef.value.mensaje = `Oferta ${nuevoEstado === 'ACTIVA' ? 'activada' : 'desactivada'} con éxito.`;

    setTimeout(async () => {
      modalRef.value.closeModal();
      if (nuevoEstado === 'INACTIVA') {
        router.push({ name: "PanelOfertasAdmin" });
      } else {
        await fetchData(); // Recargar datos si se queda en la página
      }
    }, 2000);

  } catch (err) {
    console.error(err);
    modalRef.value.mensaje = "Error al procesar la petición";
  } finally {
    loadingModal.value = false;
  }
};


// ACTUALIZAR ESTADO DE LA CANDIDATURA
// Ref al modal que actualizará el estado
const modalEstadoCandiRef = ref(null);

// Guardamos aquí los ids para pasarlos al modal
const selectedOferta = ref(null);
const selectedEstudiante = ref(null);

const modalEstadoCandi = (oferta, estudiante) => {
  // Al pulsar 'Actualizar estado' guardamos los ids y abrimos el modal
  selectedOferta.value = oferta.id;

  selectedEstudiante.value = {
    id: estudiante.id,
    email: estudiante.email,
    nombre: estudiante.nombre,
    titulo: oferta.tipo_puesto,
  };

  modalEstadoCandiRef.value?.openModal();
};


const candidaturaActualizada = async (nuevoEstado) => {
  // nuevoEstado debería ser el string que devuelve el modal (ej: "Aceptado")
  try {
    const estudiante = selectedEstudiante.value;

    if (estudiante && estudiante.email) {
      await sendEmail(
        estudiante.email,
        estudiante.nombre,
        'candidatura', // El estado que acaba de aplicarse
        {
          offerTitle: estudiante.titulo, // Usamos los datos del padre
          newStatus: nuevoEstado
        }
      );
    }
  } catch (error) {
    console.error("Error en el proceso de actualización/email:", error);
  }

  // Refrescar la lista de la UI
  await obtenerPostulaciones();
};


//Postulaciones
const listaPostulaciones = ref([]);
const cargandoPostulaciones = ref(true)
const obtenerPostulaciones = async () => {

  try {
    cargandoPostulaciones.value = true;
    // Llamamos a la función del composable pasándole el ID
    const res = await postulaciones(`${import.meta.env.VITE_URL_BACK}/postulaciones/${route.params.id}`);
    listaPostulaciones.value = res || [];
  } catch (err) {
    console.error("Error cargando postulaciones:", err);
  } finally {
    cargandoPostulaciones.value = false;
  }
}
// Ejecutar al cargar la página
onMounted(async () => {
  await obtenerPostulaciones();
});

//Ver perfil de los estudiantes postulados
const verDetallePerfil = (id) => {
  router.push({ name: 'PerfilDetalleSolo', params: { id } });
};

// Paginación
const usersPerPage = 5; // Número de usuarios por página
const currentPage = ref(1); // Página actual

const paginatedPostulaciones = computed(() => {
  const start = (currentPage.value - 1) * usersPerPage;
  const end = start + usersPerPage;
  return listaPostulaciones.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(listaPostulaciones.value.length / usersPerPage);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToPage = (p) => {
  const page = Number(p);
  if (!Number.isInteger(page)) return;
  if (page < 1) return;
  if (page > totalPages.value) return;
  currentPage.value = page;
};


</script>

<template>

  <div class="detalle-page">
    <div class="detalle-container">

      <button @click="volver" class="btn-back">
        ← Volver al listado
      </button>

      <!-- Estados -->
      <div v-if="loading" class="state-msg">
        Buscando los mejores detalles...
      </div>

      <div v-else-if="error" class="state-msg error">
        Vaya, algo salió mal al cargar la oferta
      </div>

      <!-- Card principal -->
      <article v-else-if="oferta" class="oferta-card-new">

        <!-- Header -->
        <header class="header-top">
          <div class="empresa-info">
            <div class="logo-box">🏢</div>

            <div>
              <h1 class="titulo-puesto">{{ oferta.tipo_puesto }}</h1>
              <p class="empresa-nombre">{{ oferta.nombre_empresa }}</p>


              <div class="tags">
                <span v-for="(skill, index) in oferta.skills_nombres" :key="index" class="tag">
                  {{ skill }}
                </span>

                <span v-if="!oferta.skills_nombres?.length" class="tag-vacio">
                  Sin skills especificadas
                </span>
              </div>
            </div>
          </div>
        </header>

        <!-- Contenido -->

        <!-- GRID -->
        <div class="contenido-grid-new">

          <!-- IZQUIERDA -->
          <main class="info-principal-new">

            <section class="bloque">
              <h3>Descripción</h3>
              <p>{{ oferta.descripcion }}</p>
            </section>

            <section class="bloque">
              <h3>Funciones</h3>
              <p>{{ oferta.funciones }}</p>
            </section>

            <section class="bloque">
              <h3>Requisitos</h3>
              <p>{{ oferta.requisitos }}</p>
            </section>

            <section class="bloque beneficios">
              <h3>Beneficios</h3>
              <div class="beneficios-grid">
                <div>{{ oferta.beneficios }}</div>
              </div>
            </section>

          </main>

          <!-- SIDEBAR DERECHA -->
          <aside class="sidebar-new">
            <div class="info-box-new">
              <h4 id="detallesOfertaTitulo">Detalles de la oferta</h4>

              <div class="info-item-new">
                <div class="icon-wrapper gray">
                  <MapPinIcon :size="20" />
                </div>
                <div class="text-group">
                  <span class="label-title">Ubicación</span>
                  <strong>{{ oferta.ubicacion.ciudad }}</strong>
                </div>
              </div>

              <div class="info-item-new">
                <div class="icon-wrapper gray">
                  <BriefcaseIcon :size="20" />
                </div>
                <div class="text-group">
                  <span class="label-title">Modalidad</span>
                  <strong>{{ oferta.modalidad }}</strong>
                </div>
              </div>

              <div class="info-item-new">
                <div class="icon-wrapper gray">
                  <ClockIcon :size="20" />
                </div>
                <div class="text-group">
                  <span class="label-title">Jornada</span>
                  <strong>{{ oferta.jornada }}</strong>
                </div>
              </div>

              <div class="info-item-new">
                <div class="icon-wrapper corporativo">
                  <CalendarIcon :size="20" />
                </div>
                <div class="text-group">
                  <span class="label-title">Publicado</span>
                  <strong id="publicado">{{ oferta.fecha_publicacion }}</strong>
                </div>
              </div>

              <div class="info-item-new">
                <div class="icon-wrapper red">
                  <CalendarIcon :size="20" />
                </div>
                <div class="text-group">
                  <span class="label-title">Expira</span>
                  <strong class="expira" id="expiracion">{{ oferta.fecha_expiracion }}</strong>
                </div>
              </div>
            </div>

            <div class="acciones-header">
              <button class="btn-update" @click="ActualizarOferta(oferta.id)">Actualizar</button>
              <button @click="modalRef.openModal()" class="btn-update-state"
                :class="oferta.estado === 'ACTIVA' ? 'desactivar' : 'activar'">
                {{ oferta.estado === 'ACTIVA' ? 'Desactivar' : 'Activar' }}
              </button>

              <Modal ref="modalRef"
                :titulo="oferta.estado === 'ACTIVA' ? '¿Estás seguro de que deseas desactivar esta oferta?' : '¿Deseas activar esta oferta?'"
                :textoBotonConfirmar="oferta.estado === 'ACTIVA' ? 'Sí, desactivar' : 'Sí, activar'"
                :colorConfirmar="oferta.estado === 'ACTIVA' ? 'danger' : 'success'" :loading="loading"
                @confirmar="handleOfertaEstado" />
            </div>
          </aside>
        </div>
      </article>
      <!-- Sección de postulaciones con clases y estructura mejorada -->
      <section class="postulaciones-section" aria-labelledby="postulaciones-titulo">
        <div class="postulaciones-header-container">
          <h2 id="postulaciones-titulo" class="postulaciones-header">Gestión de Candidatos</h2>
          <span class="badge-count">{{ listaPostulaciones.length }} Postulantes</span>
        </div>

        <div v-if="cargandoPostulaciones" class="state-loader" role="status">
          <p>Cargando postulaciones...</p>
        </div>

        <div v-else-if="listaPostulaciones.length === 0" class="postulaciones-empty">
          <p>No hay postulaciones registradas para esta oferta.</p>
        </div>

        <div v-else class="table-responsive">
          <table class="postulaciones-table">
            <thead>
              <tr>
                <th scope="col">Candidato</th>
                <th scope="col">Estado</th>
                <th scope="col">Fecha Postulación</th>
                <th scope="col" class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in paginatedPostulaciones" :key="item.id">
                <td>
                  <div class="candidato-cell">
                    <img :src="item.usuario_estudiante.avatar || '/img/avatarGroup.png'"
                      :alt="'Avatar de ' + item.usuario_estudiante.nombre" class="candidato-avatar-mini" />
                    <div class="candidato-data">
                      <span class="candidato-name">{{ item.usuario_estudiante.nombre }} {{
                        item.usuario_estudiante.apellido }}</span>
                      <span class="candidato-email">{{ item.usuario_estudiante.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="['status-pill', item.estado.toLowerCase()]">
                    {{ item.estado }}
                  </span>
                </td>
                <td class="fecha-cell">
                  {{ item.fecha_postulacion || '—' }}
                </td>
                <td>
                  <div class="candidato-actions-inline">
                    <button @click="modalEstadoCandi(oferta, item.usuario_estudiante)"
                      class="btn-icon-text primary" title="Actualizar estado">
                      Actualizar
                    </button>
                    <button @click="verDetallePerfil(item.usuario_estudiante.id)" class="btn-icon-text secondary"
                      title="Ver Perfil">
                      Perfil
                    </button>
                    <CvViewer :cv-url="item.usuario_estudiante.documento?.[0]?.ruta_archivo" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Controles de paginación -->
        <div class="pagination" v-if="totalPages > 1">
          <button @click="prevPage" :disabled="currentPage === 1" class="page-btn">
            Anterior
          </button>
          <div class="page-numbers">
            <button v-for="p in totalPages" :key="p" :class="['page-number', { active: p === currentPage }]"
              @click="goToPage(p)">{{ p }}</button>
          </div>
          <button @click="nextPage" :disabled="currentPage === totalPages" class="page-btn">
            Siguiente
          </button>
        </div>
      </section>

    </div>



  </div>

  <!-- Modal para actualizar estado (bindamos ids y manejamos evento actualizado) -->
  <ActualizarEstado ref="modalEstadoCandiRef" :oferta-id="selectedOferta" :estudiante="selectedEstudiante"
    @actualizado="candidaturaActualizada" />
</template>

<style scoped>
/* Página base*/

.detalle-page {
  background: #F3F4F6;
  min-height: 100vh;
  padding: 50px 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.detalle-container {
  max-width: 1200px;
  margin: auto;
}

#expiracion {
  color: var(--danger);
}

#publicado {
  color: var(--primary)
}

.icon-wrapper {
  flex-shrink: 0;
  /* Evita que el círculo se aplaste */
  width: 36px;
  /* Un poco más grande para mejor visibilidad */
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.corporativo {
  background: var(--primary);
  color: white;
}

.red {
  background: var(--danger);
  color: white;
}

#detallesOfertaTitulo {
  font-size: 1.2rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 20px;
  border-bottom: 4px solid var(--accent);
  padding-left: 10px;
  border-radius: 4px;
}

/* Card principal rediseñada */
.oferta-card-new {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 40px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

/* Header */

/* El título (Ubicación, Modalidad, etc.) */
.label-title {
  font-size: 0.85rem;
  color: #6b7280;
  /* Color gris suave */
  font-weight: 500;
  line-height: 1;
}

/* Contenedor de acciones para alinear botones */
.acciones-header {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}




/* Layout principal */

.contenido-grid-new {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
  align-items: start;
  width: 100%;
  box-sizing: border-box;
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

/* Información Principal */
.info-principal-new {
  display: flex;
  flex-direction: column;
  gap: 25px;
}


/* Sidebar */

/* Sidebar Pegajoso */
.sidebar-new {
  position: sticky;
  top: 30px;
}

.info-box-new {
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
}

/* Alineación de los items del sidebar */
.info-item-new {
  display: flex;
  /* Alinea icono y texto en la misma fila */
  align-items: center;
  /* Centra verticalmente el icono con el texto */
  gap: 12px;
  /* Espacio entre icono y texto */
  margin-bottom: 20px;
}

.info-item-new strong {
  display: inline-block;
  /* Cambiado de block para evitar conflictos */
  font-size: 1rem;
  color: #111827;
  /* Color casi negro para resaltar el dato */
  font-weight: 700;
  text-transform: none;
  /* Quitamos el uppercase si quieres que se lea natural */
  margin-top: 2px;
}

.info-item-new span {
  color: #000000;
  font-weight: 600;
  font-size: 1.1rem;
}

.detalle-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detalle-meta p {
  background: #111827;
  color: #ffffff;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

.expira {
  color: var(--danger);
}

/* HEADER tipo tarjeta */
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.empresa-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.logo-box {
  width: 55px;
  height: 55px;
  background: #e5e7eb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.titulo-puesto {
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
}

.text-group {
  display: flex;
  flex-direction: column;
  /* Título arriba, Valor abajo */
}

.empresa-nombre {
  color: #2563eb;
  font-weight: 600;
  margin-top: 5px;
  margin-bottom: 12px;
}

.tags {
  display: flex;
  gap: 8px;
}

.tag {
  background: var(--focus);
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  color: #ffffff;
  justify-content: center;
  align-content: center;
}

/* BLOQUES SUAVES */
.bloque {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
}

.bloque h3 {
  font-weight: 800;
  margin-bottom: 10px;
}

/* BENEFICIOS */


.beneficios-grid {
  display: flex;
  gap: 10px;
}

.beneficios-grid div {
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-style: italic;
}

/* SIDEBAR */
.info-box-new h4 {
  margin-bottom: 15px;
}

.info-item-new {
  margin-bottom: 15px;
}

.info-item-new span {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
}

.info-item-new strong {
  font-size: 1rem;
}

.expira {
  color: #dc2626;
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


.btn-back {
  background: none;
  border: none;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 20px;
  cursor: pointer;
  font-size: 1rem;
}

/* Estilo para el botón de actualizar */
.btn-update {
  background: #4f46e5;
  /* morado suave */
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
.btn-update-state {
  color: #fff;
  padding: 10px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.desactivar {
  background: #dc2626;
}

.desactivar:hover {
  background: #b91c1c;
  transform: translateY(-2px);
}

.activar {
  background-color: #16a34a;
}

.activar:hover {
  background: #16a34a;
  transform: translateY(-2px);
}

/* Estados */
.state-msg {
  padding: 40px;
  text-align: center;
  font-size: 1.2rem;
  color: #6B7280;
}

.state-msg.error {
  color: #DC2626;
}


/* Estilo para la fila de acciones (botones) */
.actions {
  display: flex;
  gap: 12px;
  /* espacio entre botones */
  align-items: center;
  margin-top: 18px;
}

/* Estilos para la sección de postulaciones */
.postulaciones-section {
  margin-top: 40px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-left: auto;
  margin-right: auto;
}

.postulaciones-header-container {
  padding: 20px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.postulaciones-header {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.badge-count {
  background: #e2e8f0;
  color: #475569;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

/* Tabla Estilo Admin */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  /* Esto permite el scroll si la tabla es muy ancha */
}

.postulaciones-table {
  width: 100%;
  border-collapse: separate;
  text-align: left;
  border-spacing: 0 10px;
}

.postulaciones-table thead th {
  background: #f8fafc;
  padding: 12px 24px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  border-bottom: 1px solid #e5e7eb;
}

.postulaciones-table tbody tr {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  transition: all 0.2s ease;
}

.postulaciones-table tbody tr:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.postulaciones-table td {
  padding: 16px 24px;
  vertical-align: middle;
}

/* Celda Candidato */
.candidato-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.candidato-avatar-mini {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  /* más moderno que círculo */
  object-fit: cover;
  border: 2px solid #eef2ff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.candidato-data {
  display: flex;
  flex-direction: column;
}

.candidato-name {
  font-weight: 700;
  color: #111827;
}

.candidato-email {
  font-size: 0.8rem;
  color: #6b7280;
}

/* Status Pills */
.status-pill {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.status-pill.pendiente {
  background: #fef3c7;
  color: #92400e;
}

.status-pill.aceptado {
  background: #ecfdf5;
  color: #047857;
}

.status-pill.rechazada {
  background: #fee2e2;
  color: #991b1b;
}


/* Botones de Acción Estilizados */
.candidato-actions-inline {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-icon-text {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.btn-icon-text.primary {
  background: #4f46e5;
  color: white;
}

.btn-icon-text.secondary {
  background: white;
  border-color: #d1d5db;
  color: #374151;
}

.btn-icon-text.accent {
  background: #0ea5e9;
  color: white;
}

.btn-icon-text:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-icon-text:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* --- RESPONSIVE 1024px (Tablets / Laptops pequeñas) --- */
@media (max-width: 1024px) {
  .detalle-container {
    max-width: 98%;
    padding: 0 5px;
  }

  .contenido-grid-new {
    grid-template-columns: 1fr 220px;
    gap: 18px;
  }

  .oferta-card-new {
    padding: 18px;
    max-width: 98vw;
    margin-left: 1vw;
    margin-right: 1vw;
  }

  .postulaciones-section {
    max-width: 99vw;
    margin-left: 0.5vw;
    margin-right: 0.5vw;
    padding: 8px;
  }

  .postulaciones-table td,
  .postulaciones-table thead th {
    padding: 10px;
    font-size: 0.9rem;
  }
}

/* --- RESPONSIVE 768px (Móviles / Tablets vertical) --- */
@media (max-width: 768px) {
  .detalle-page {
    padding: 30px 15px;
  }

  .oferta-card-new {
    padding: 25px;
  }

  .contenido-grid-new {
    grid-template-columns: 1fr;
    gap: 30px;
  }


  .sidebar-new {
    position: static;
  }

  .info-box-new {
    padding: 15px;
  }

  /* Tabla a Card */
  .postulaciones-table thead {
    display: none;
  }

  .postulaciones-table,
  .postulaciones-table tbody,
  .postulaciones-table tr,
  .postulaciones-table td {
    display: block;
    width: 100%;
    box-sizing: border-box;
  }

  .postulaciones-table tr {
    padding: 16px 0;
    border-bottom: 8px solid #f3f4f6;
    position: relative;
    margin-bottom: 10px;
  }

  .postulaciones-table td {
    padding: 8px 0;
    border: none;
    font-size: 1rem;
    word-break: break-word;
  }

  .candidato-actions-inline {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    width: 100%;
  }

  .candidato-actions-inline>* {
    width: 100%;
  }

  .fecha-cell::before {
    content: "Postulado el: ";
    font-weight: 600;
    color: #64748b;
  }

  .btn-icon-text {
    width: 100%;
    text-align: center;
  }
}

/* --- RESPONSIVE 480px (Smartphones pequeños) --- */
@media (max-width: 480px) {

  .header-top {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .empresa-info {
    width: 100%;
    align-items: flex-start;
  }

  .titulo-puesto {
    font-size: 1.3rem;
    line-height: 1.3;
    word-break: break-word;
  }

  .empresa-nombre {
    font-size: 0.95rem;
  }

  .tags {
    flex-wrap: wrap;
  }

  .logo-box {
    width: 48px;
    height: 48px;
    font-size: 20px;
    flex-shrink: 0;
  }

  .detalle-container {
    max-width: 100%;
  }

  .oferta-card-new {
    padding: 20px;
    border-radius: 12px;
  }


  .seccion-detalle-new {
    padding: 15px;
  }

  .seccion-detalle-new h3 {
    font-size: 1.1rem;
  }

  .seccion-detalle-new p {
    font-size: 0.9rem;
  }

  .info-item-new span {
    font-size: 1rem;
  }

  .detalle-meta p {
    font-size: 0.75rem;
    padding: 5px 8px;
  }

  .state-msg {
    padding: 20px;
    font-size: 1rem;
  }

  .btn-update,
  .btn-delete {
    width: 100%;
    margin-right: 0;
    text-align: center;
    padding: 10px 0;
    font-size: 1rem;
  }

  /**Postulaciones */
  .postulaciones-header-container {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 8px;
  }

  .candidato-actions-inline {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }

  .btn-icon-text {
    width: 100%;
    text-align: center;
    padding: 10px;
    font-size: 1rem;
  }

  .candidato-avatar-mini {
    width: 38px;
    height: 38px;
  }

  .status-pill {
    display: inline-block;
    margin-bottom: 5px;
    font-size: 0.85rem;
  }
}

/* --- UTILIDADES DE DISEÑO --- */
.status-pill {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
}

.status-pill.pendiente {
  background: #fef3c7;
  color: #92400e;
}

.status-pill.aceptado {
  background: #dcfce7;
  color: #166534;
}

.status-pill.rechazada {
  background: #fee2e2;
  color: #991b1b;
}

.btn-icon-text {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  border: 1px solid transparent;
}

.btn-icon-text.primary {
  background: #4f46e5;
  color: white;
}

.btn-icon-text.secondary {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-icon-text.accent {
  background: #0ea5e9;
  color: white;
}

/* --- PAGINACIÓN --- */
.pagination {
  padding: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.page-numbers {
  display: flex;
  gap: 6px;
}

.page-btn,
.page-number {
  border: 1px solid #e6e6e6;
  background: white;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  color: #4d1b95;
  transition: all 0.2s ease;
}

.page-btn:hover:not([disabled]) {
  border-color: #4d1b95;
  background: #f5f3ff;
}

.page-btn[disabled] {
  opacity: 0.45;
  cursor: not-allowed;
}

.page-number.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}
</style>
