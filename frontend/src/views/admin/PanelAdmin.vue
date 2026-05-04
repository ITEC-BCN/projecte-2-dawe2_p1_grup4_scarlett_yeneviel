<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFetchUser } from '../../composables/userFetchUser';
import { sendEmail } from '../../js/funEmail';

const router = useRouter();

// Usuarios
const urlUsers = ref(`${import.meta.env.VITE_URL_BACK}/estudiantes`);
const { data: users, error: usersError, loading: loadingUsers, fetchData: fetchUsers, actualizarEstado } = useFetchUser(urlUsers);

// Filtro por pestañas: 'todos', 'pendiente', 'aprobado', 'rechazado'
const activeTab = ref('pendiente'); 

// Computed para filtrar según la pestaña activa
const filteredUsers = computed(() => {
  const allUsers = users.value || [];
  if (activeTab.value === 'todos') return allUsers;
  return allUsers.filter(u => (u.estado || '').toLowerCase() === activeTab.value);
});

// Pagination sobre los usuarios FILTRADOS
const currentUserPage = ref(1);
const userPageSize = ref(5);
const totalUserPages = computed(() => Math.max(1, Math.ceil(filteredUsers.value.length / userPageSize.value)));

const usersPaginados = computed(() => {
  const start = (currentUserPage.value - 1) * userPageSize.value;
  return filteredUsers.value.slice(start, start + userPageSize.value);
});

// Reseteamos página al cambiar de pestaña
const setTab = (tab) => {
  activeTab.value = tab;
  currentUserPage.value = 1;
};

const prevUserPage = () => { if (currentUserPage.value > 1) currentUserPage.value--; };
const nextUserPage = () => { if (currentUserPage.value < totalUserPages.value) currentUserPage.value++; };

// Add: navigate to a specific page when clicking a page number
const goToPage = (p) => {
  const page = Number(p);
  if (!Number.isInteger(page)) return;
  if (page < 1) return;
  if (page > totalUserPages.value) return;
  currentUserPage.value = page;
};

// Stats
const usersTotal = computed(() => (users.value || []).length);
const pendingCount = computed(() => (users.value || []).filter(u => (u.estado || '').toLowerCase() === 'pendiente').length);
const approvedCount = computed(() => (users.value || []).filter(u => (u.estado || '').toLowerCase() === 'aprobado').length);
const rejectedCount = computed(() => (users.value || []).filter(u => (u.estado || '').toLowerCase() === 'rechazado').length);

// Actions
const viewUser = (id) => { router.push({ name: 'PerfilDetalleSolo', params: { id } }); };

const updateUserEstado = async (id, newEstado) => {
  try {
    await actualizarEstado(id, newEstado);
    await fetchUsers();
      const user = users.value.find(u => u.id === id);

    if (user && user.email) {
      console.log("Enviando correo a...", user.email);
      await sendEmail(user.email, user.nombre, newEstado);
    } else {
      console.warn("No se encontró el email para el usuario:", id);
    }
  } catch (err) {
    console.error('Error:', err);
    alert('No se pudo actualizar el estado');
  }
};


</script>

<template>
  <div class="admin-layout">
    <header class="main-header">
      <div class="header-content">
        <div>
          <h1>Gestión de Estudiantes</h1>
          <p class="subtitle">Administra el acceso y verifica perfiles de la plataforma</p>
        </div>
        <!--Enlace al gestor ofertas-->
        <button class="btn-primary-nav" @click="router.push({ name: 'PanelOfertasAdmin' })">
          <div class="btn-content">
            <span class="btn-icon-wrapper">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 12h6"></path><path d="M9 16h6"></path><path d="M12 8h.01"></path></svg>
            </span>
            <div class="btn-text">
              <span class="btn-title">Gestor de Ofertas</span>
              <span class="btn-desc">Ver vacantes activas</span>
            </div>
          </div>
      </button>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card success" @click="setTab('aprobado')" :class="{ active: activeTab === 'aprobado' }">
        <span class="stat-label">Aprobados</span>
        <span class="stat-value">{{ approvedCount }}</span>
      </div>
      <div class="stat-card pending" @click="setTab('pendiente')" :class="{ active: activeTab === 'pendiente' }">
        <span class="stat-label">Pendientes</span>
        <span class="stat-value">{{ pendingCount }}</span>
      </div>


      <div class="stat-card reject" @click="setTab('rechazado')" :class="{ active: activeTab === 'rechazado' }">
        <span class="stat-label">Rechazados</span>
        <span class="stat-value">{{ rejectedCount }}</span>
      </div>

      <div class="stat-card" @click="setTab('todos')" :class="{ active: activeTab === 'todos' }">
        <span class="stat-label">Total</span>
        <span class="stat-value">{{ usersTotal }}</span>
      </div>
    </div>

    <section class="table-section">

      <div v-if="loadingUsers" class="status-box">
        <div class="spinner"></div>
        <p>Cargando información...</p>
      </div>

      <div v-else-if="usersError" class="status-box error">
        <p>⚠️ {{ usersError }}</p>
      </div>

      <div v-else>
        <div class="table-container">
          <table class="custom-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="usuario in usersPaginados" :key="usuario.id">
                <td>
                  <div class="user-info">
                    <div class="avatar">{{ usuario.nombre[0] }}</div>
                    <span class="user-name">{{ usuario.nombre }} {{ usuario.apellido }}</span>
                  </div>
                </td>
                <td><span class="user-email">{{ usuario.email }}</span></td>
                <td>
                  <span :class="['pill', usuario.estado]">
                    {{ usuario.estado }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="btn-icon" title="Ver detalle" @click="viewUser(usuario.id)">👁️</button>
                  
                  <template v-if="usuario.estado === 'pendiente'">
                    <button class="btn-action approve" @click="updateUserEstado(usuario.id, 'aprobado')">Aceptar</button>
                    <button class="btn-action reject" @click="updateUserEstado(usuario.id, 'rechazado')">Rechazar</button>
                  </template>
                  
                  <button v-if="usuario.estado === 'aprobado'" class="btn-action deactivate" @click="updateUserEstado(usuario.id, 'inactivo')">Desactivar</button>
                  <button v-if="usuario.estado === 'rechazado' || usuario.estado === 'inactivo'" class="btn-action approve" @click="updateUserEstado(usuario.id, 'aprobado')">Reactivar</button>
                </td>
              </tr>
              <tr v-if="usersPaginados.length === 0">
                <td colspan="4" class="empty-state">No hay usuarios en esta categoría</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="pagination" v-if="totalUserPages > 1">
          <button class="page-btn" :disabled="currentUserPage === 1" @click="prevUserPage">Anterior</button>
          <div class="page-numbers">
            <button v-for="p in totalUserPages" :key="p" :class="['page-number', { active: p === currentUserPage }]" @click="goToPage(p)">{{ p }}</button>
          </div>
          <button class="page-btn" :disabled="currentUserPage === totalUserPages" @click="nextUserPage">Siguiente</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Layout & Basics */
.admin-layout { max-width: 1100px; margin: 2rem auto; padding: 0 1rem; font-family: 'Inter', system-ui, sans-serif; color: #1f2937; }
.main-header { margin-bottom: 2rem; }
.header-content { display: flex; justify-content: space-between; align-items: center; }
h1 { font-size: 1.75rem; font-weight: 800; margin: 0; color: #111827; }
.subtitle { color: #6b7280; margin: 4px 0 0; }

/* Stats Cards */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 12px; border: 1px solid #e5e7eb; cursor: pointer; transition: all 0.2s; }
.stat-card:hover { border-color: #10b981; transform: translateY(-2px); }
.stat-card.active { border-bottom: 4px solid #10b981; background: #f0fdf4; }
.stat-card.pending.active { border-bottom-color: #f59e0b; background: #fffbeb; }
.stat-label { display: block; color: #6b7280; font-size: 0.875rem; font-weight: 600; text-transform: uppercase; }
.stat-value { display: block; font-size: 2rem; font-weight: 800; margin-top: 0.5rem; }
.stat-card.reject.active  { border-bottom: 4px solid #ef4444; background: #fef2f2; }

/* Tabs */
.table-section { background: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.tabs-nav { display: flex; background: #f9fafb; border-bottom: 1px solid #e5e7eb; padding: 0 1rem; }
.tab-link { padding: 1rem 1.5rem; border: none; background: none; cursor: pointer; color: #6b7280; font-weight: 600; border-bottom: 2px solid transparent; }
.tab-link.active { color: #10b981; border-bottom-color: #10b981; }

/* Table Style */
.table-container { width: 100%; overflow-x: auto; }
.custom-table { width: 100%; border-collapse: collapse; text-align: left; }
.custom-table th { padding: 1rem; background: #f9fafb; color: #4b5563; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
.custom-table td { padding: 1rem; border-bottom: 1px solid #f3f4f6; }

/* User Info */
.user-info { display: flex; align-items: center; gap: 0.75rem; }
.avatar { width: 32px; height: 32px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
.user-name { font-weight: 600; }
.user-email { color: #6b7280; font-size: 0.9rem; }

/* Pills */
.pill { padding: 4px 12px; border-radius: 99px; font-size: 0.75rem; font-weight: 700; text-transform: capitalize; }
.pill.pendiente { background: #fff7ed; color: #9a3412; border: 1px solid #ffedd5; }
.pill.aprobado { background: #ecfdf5; color: #065f46; border: 1px solid #d1fae5; }
.pill.rechazado, .pill.inactivo { background: #fef2f2; color: #991b1b; border: 1px solid #fee2e2; }

/* Actions */
.actions-cell { display: flex; gap: 0.5rem; justify-content: flex-end; }
.btn-action { padding: 6px 12px; border-radius: 6px; border: none; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: 0.2s; }
.btn-action.approve { background: #10b981; color: white; }
.btn-action.reject { background: #ef4444; color: white; }
.btn-action.deactivate { background: #f3f4f6; color: #374151; }
.btn-icon { background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 4px 8px; cursor: pointer; }

/* Utils */

.empty-state { text-align: center; padding: 3rem !important; color: #9ca3af; }
.pagination { padding: 1rem; display: flex; justify-content: center; align-items: center; gap: 1.5rem; border-top: 1px solid #f3f4f6; }
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

/* Nuevo Botón Principal de Navegación */
.btn-primary-nav {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.1);
  display: flex;
  align-items: center;
}

.btn-primary-nav:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
  filter: brightness(1.05);
}

.btn-primary-nav:active {
  transform: translateY(0);
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
}

.btn-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  display: flex;
  flex-direction: column;
}

.btn-title {
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
}

.btn-desc {
  font-size: 0.75rem;
  opacity: 0.85;
  font-weight: 400;
}

/* Ajuste opcional para móviles: ocultar la descripción si no hay espacio */
@media (max-width: 640px) {
  .btn-desc { display: none; }
  .btn-primary-nav { padding: 8px 14px; }
}

/* Spinner */
.spinner { width: 24px; height: 24px; border: 3px solid #f3f4f6; border-top: 3px solid #10b981; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px; }
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
</style>