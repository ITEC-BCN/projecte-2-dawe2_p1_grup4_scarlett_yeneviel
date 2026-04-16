<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFetch } from '../../composables/useFetchOfertas';
import { URL_BACK } from '../../../../config';

const router = useRouter();
const url = ref(`${URL_BACK}/ofertas`);
const { data: ofertas, error, loading, fetchData} = useFetch(url);

// Simulación de rol (ajusta según tu lógica de auth)
const roleUser = ref('admin'); 

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

const crearOferta = () => {
  router.push({ name: 'CrearOferta' }); // Ajusta el nombre de tu ruta
};

const eliminarOferta = async (id) => {
  if (!confirm('¿Eliminar esta oferta? Esta acción no se puede deshacer.')) return;
  try {
    const res = await fetch(`${URL_BACK}/ofertas/${id}`, { method: 'PUT' });
    if (!res.ok) throw new Error('Error desactivando oferta');
    await fetchData();
  } catch (err) {
    console.error('Error desactivando oferta', err);
    alert('No se pudo desactivar la oferta');
  }
};
</script>

<template>
  <div class="admin-layout">
    <header class="main-header">
      <div class="header-content">
        <div>
          <div class="badge-admin">Panel de Control</div>
          <h1>Gestión de Ofertas</h1>
          <p class="subtitle">Publica, edita y supervisa las vacantes de prácticas</p>
        </div>
        
        <button v-if="roleUser === 'admin'" @click="crearOferta" class="btn-primary-action">
          <div class="btn-content">
            <span class="btn-icon-plus">+</span>
            <div class="btn-text">
              <span class="btn-title">Nueva Oferta</span>
              <span class="btn-desc">Crear vacante</span>
            </div>
          </div>
        </button>
      </div>
    </header>

    <div class="table-section">
      <div v-if="loading" class="status-box">
        <div class="spinner"></div>
        <p>Cargando ofertas de prácticas...</p>
      </div>

      <div v-else-if="error" class="status-box error">
        <p>⚠️ Error al cargar: {{ error }}</p>
      </div>

      <div v-else>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Puesto / Empresa</th>
                <th>Ubicación / Tipo</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="oferta in ofertasPaginadas" :key="oferta.id">
                <td>
                  <div class="offer-info">
                    <span class="job-title">{{ oferta.tipo_puesto }}</span>
                    <div class="company-row">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                      {{ oferta.nombre_empresa }}
                    </div>
                  </div>
                </td>
                <td>
                   <div class="tag-row">
                     <span class="location-tag">{{ oferta.ubicacion.ciudad || 'No especificada' }} - {{ oferta.modalidad || 'No especificada' }}</span>
                   </div>
                </td>
                <td class="actions-cell">
                  <button class="btn-view" @click="router.push({ name: 'verOfertaAdmin', params: { id: oferta.id } })">
                    Detalles
                  </button>
                  <button class="btn-delete-icon" @click="eliminarOferta(oferta.id)" title="Eliminar oferta">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                </td>
              </tr>
              <tr v-if="ofertasPaginadas.length === 0">
                <td colspan="3" class="empty-state">No hay ofertas publicadas actualmente.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination-footer" v-if="totalPages > 1">
          <button class="nav-btn" :disabled="currentPage === 1" @click="prevPage">Anterior</button>
          <div class="pages-list">
            <button v-for="p in totalPages" :key="p" :class="['page-item', { active: p === currentPage }]" @click="goToPage(p)">
              {{ p }}
            </button>
          </div>
          <button class="nav-btn" :disabled="currentPage === totalPages" @click="nextPage">Siguiente</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Layout Principal */
.admin-layout { max-width: 1000px; margin: 2rem auto; padding: 0 1rem; font-family: 'Inter', sans-serif; }

/* Header */
.main-header { margin-bottom: 2.5rem; }
.header-content { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
.badge-admin { display: inline-block; background: #f3f4f6; color: #4b5563; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; }
h1 { font-size: 2rem; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.02em; }
.subtitle { color: #6b7280; margin: 4px 0 0; font-size: 1rem; }

/* Botón Crear Nueva Oferta (Premium) */
.btn-primary-action {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white; border: none; padding: 10px 24px; border-radius: 12px;
  cursor: pointer; transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}
.btn-primary-action:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3); }
.btn-content { display: flex; align-items: center; gap: 14px; }
.btn-icon-plus { font-size: 1.5rem; font-weight: 300; line-height: 1; }
.btn-text { text-align: left; display: flex; flex-direction: column; }
.btn-title { font-weight: 700; font-size: 0.95rem; }
.btn-desc { font-size: 0.75rem; opacity: 0.9; }

/* Tabla y Contenedor */
.table-section { background: white; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
.table-container { width: 100%; overflow-x: auto; }
.custom-table { width: 100%; border-collapse: collapse; }
.custom-table th { background: #f9fafb; padding: 14px 24px; text-align: left; font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e5e7eb; }
.custom-table td { padding: 18px 24px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }

/* Información de Fila */
.job-title { display: block; font-weight: 700; color: #1f2937; font-size: 1.05rem; margin-bottom: 4px; }
.company-row { display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 0.9rem; }
.location-tag { background: #eff6ff; color: #1e40af; padding: 4px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }

/* Acciones */
.actions-cell { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
.btn-view { background: #f3f4f6; color: #374151; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-view:hover { background: #e5e7eb; }
.btn-delete-icon { background: #fef2f2; color: #ef4444; border: 1px solid #fee2e2; padding: 8px; border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; }
.btn-delete-icon:hover { background: #ef4444; color: white; }

/* Paginación Modernizada */
.pagination-footer { padding: 1.5rem; display: flex; justify-content: center; align-items: center; gap: 1rem; background: #fafafa; }
.nav-btn { background: white; border: 1px solid #e5e7eb; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: 600; color: #374151; }
.nav-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.pages-list { display: flex; gap: 6px; }
.page-item { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #e5e7eb; background: white; cursor: pointer; font-weight: 600; }
.page-item.active { background: #10b981; color: white; border-color: #10b981; }

/* Estados */
.status-box { padding: 4rem; text-align: center; color: #6b7280; }
.spinner { width: 30px; height: 30px; border: 3px solid #f3f4f6; border-top-color: #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; color: #9ca3af; padding: 3rem !important; }
</style>