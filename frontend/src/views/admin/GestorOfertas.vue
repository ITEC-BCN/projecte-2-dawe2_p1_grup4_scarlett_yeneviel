<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFetch } from '../../composables/useFetchOfertas';
import { URL_BACK } from '../../../../config';

const router = useRouter();
const url = ref(`${URL_BACK}/ofertas`);
const { data: ofertas, error, loading, fetchData} = useFetch(url);

// pagination
const currentPage = ref(1);
const pageSize = ref(8);
const totalPages = computed(() => Math.max(1, Math.ceil((ofertas.value || []).length / pageSize.value)));
const ofertasPaginadas = computed(() => {
  const arr = ofertas.value || [];
  const start = (currentPage.value - 1) * pageSize.value;
  return arr.slice(start, start + pageSize.value);
});
const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const goToPage = (p) => { currentPage.value = p; };


const eliminarOferta = async (id) => {
  if (!confirm('¿Eliminar esta oferta? Esta acción no se puede deshacer.')) return;
  try {
    const res = await fetch(`${URL_BACK}/ofertas/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error eliminando');
    await fetchData();
  } catch (err) {
    console.error('Error eliminando oferta', err);
    alert('No se pudo eliminar la oferta');
  }
};
</script>
<template>
    <header class="pa-header">
      <h2>Panel Administrador - Ofertas</h2>
      <p class="muted">Gestiona ofertas y solicitudes de estudiantes</p>
    </header>

    <div class="ofertas-header">
        <h1 class="main-title">Ofertas de Prácticas</h1>
        <button v-if="roleUSer === 'admin'" @click="crearOferta" class="btn-admin">
            <span>+</span> Crear nueva oferta
        </button>
    </div>
  <div class="panel-admin">
    <section class="pa-list">
      <div v-if="loading" class="pa-status-msg">
        <span class="loader"></span> Cargando ofertas...
      </div>
      <div v-else-if="error" class="pa-status-msg error">
        ⚠️ Error: {{ error }}
      </div>

      <div v-else>
        <div class="offers-container">
          <ul class="offers-list">
            <li v-for="oferta in ofertasPaginadas" :key="oferta.id" class="offer-item">
              <div class="offer-main">
                <div class="offer-info">
                  <strong>{{ oferta.tipo_puesto }}</strong>
                  <div class="company">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    {{ oferta.nombre_empresa }}
                  </div>
                </div>

                <div class="offer-actions">
                  <button class="btn" @click="router.push({ name: 'verOfertaAdmin', params: { id: oferta.id } })">
                    Ver detalle
                  </button>
                  <button class="btn btn-danger" @click="eliminarOferta(oferta.id)">Eliminar</button>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div class="pa-pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">Anterior</button>
          <div class="page-numbers">
            <button v-for="p in totalPages" :key="p" :class="['page-number', { active: p === currentPage }]" @click="goToPage(p)">{{ p }}</button>
          </div>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">Siguiente</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Contenedor Principal */
.panel-admin { 
  background: white; 
  padding: 24px; 
  border-radius: 16px; 
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  max-width: 900px;
  margin: 0 auto;
    margin-bottom: 30px;
}

/* Header */
.pa-header {
  margin-top: 30px;
  margin-bottom: 24px;
  padding-bottom: 16px;
}
.pa-header h2 { 
  margin: 0 0 6px 0; 
  font-size: 1.5rem;
  color: #111827;
  letter-spacing: -0.025em;
}
.muted { color: #6b7280; font-size: 0.95rem; }

.ofertas-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}
/* Lista de Ofertas */
.offers-container {
  border: 1px solid #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
}
.offers-list { list-style: none; padding: 0; margin: 0; }

.offer-item { 
  padding: 16px 20px; 
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
}
.offer-item:last-child { border-bottom: none; }
.offer-item:hover { background-color: #f9fafb; }

.offer-main { display: flex; justify-content: space-between; align-items: center; gap: 16px; }

/* Información de la Oferta */
.offer-info { display: flex; flex-direction: column; gap: 4px; }

.job-tag {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
  font-weight: 600;
}

.offer-info strong {
  font-size: 1.1rem;
  color: #1f2937;
}

.company { 
  color: #6b7280; 
  font-size: 0.9rem; 
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Botones y Acciones (Manteniendo tus estilos base) */
.offer-actions { display: flex; gap: 10px; flex-shrink: 0; }

.btn { 
  background: #10b981; 
  color: white; 
  border: none; 
  padding: 8px 16px; 
  border-radius: 8px; 
  cursor: pointer; 
  font-weight: 600;
  font-size: 0.875rem;
}
.btn-danger { background: #ef4444; }

/* Paginación */
.pa-pagination { 
  display: flex; 
  align-items: center;
  justify-content: center; 
  gap: 12px; 
  margin-top: 24px; 
}
.page-numbers { display: flex; gap: 6px; }

.page-btn, .page-number { 
  border: 1px solid #e6e6e6; 
  background: white; 
  padding: 8px 14px; 
  border-radius: 8px; 
  cursor: pointer; 
  font-weight: 700; 
  color: #4d1b95; 
  transition: all 0.2s ease;
}
.page-btn:hover:not([disabled]) { border-color: #4d1b95; background: #f5f3ff; }
.page-btn[disabled] { opacity: 0.45; cursor: not-allowed; }

.page-number.active { 
  background: #10b981; 
  color: white; 
  border-color: #10b981; 
}

/* Estados */
.pa-status-msg {
  padding: 40px;
  text-align: center;
  color: #6b7280;
  font-weight: 500;
}
.pa-status-msg.error { color: #ef4444; }
</style>

