<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useFetchUser } from '../../composables/userFetchUser';
import { URL_BACK } from '../../../../config';

const router = useRouter();

// Usuarios
const urlUsers = ref(`${URL_BACK}/estudiantes`);
const { data: users, error: usersError, loading: loadingUsers, fetchData: fetchUsers, actualizarEstado } = useFetchUser(urlUsers);

// pagination usuarios
const currentUserPage = ref(1);
const userPageSize = ref(10);
const totalUserPages = computed(() => Math.max(1, Math.ceil((users.value || []).length / userPageSize.value)));
const usersPaginados = computed(() => {
  const arr = users.value || [];
  const start = (currentUserPage.value - 1) * userPageSize.value;
  return arr.slice(start, start + userPageSize.value);
});
const prevUserPage = () => { if (currentUserPage.value > 1) currentUserPage.value--; };
const nextUserPage = () => { if (currentUserPage.value < totalUserPages.value) currentUserPage.value++; };
const goToUserPage = (p) => { currentUserPage.value = p; };

const usersTotal = computed(() => (users.value || []).length);
const pendingCount = computed(() => (users.value || []).filter(u => (u.estado || '').toLowerCase() === 'pendiente').length);

// actions
const viewUser = (id) => { router.push({ name: 'PerfilDetalleSolo', params: { id } }); };
const updateUserEstado = async (id, newEstado) => {

  try {
    await actualizarEstado(id, newEstado);
    await fetchUsers();
  } catch (err) {
    console.error('Error actualizando estado', err);
    alert('No se pudo actualizar el estado del usuario');
  }
};

const acceptUser = (id) => updateUserEstado(id, 'activo');
const rejectUser = (id) => updateUserEstado(id, 'inactivo');
const deactivateUser = (id) => updateUserEstado(id, 'inactivo');
const activateUser = (id) => updateUserEstado(id, 'activo');

</script>


<template>
  <header class="pa-header">
    <h2>Panel Administrador - Usuarios</h2>
    <p class="muted">Gestiona cuentas de estudiantes y revisa solicitudes pendientes</p>
    <div class="header-actions">
      <button class="link-btn" @click="router.push({ name: 'PanelOfertasAdmin' })">Ir al Gestor de Ofertas</button>
    </div>
  </header>

  <div class="panel-admin">
    <section class="pa-list">
      <div v-if="loadingUsers" class="pa-status-msg">
        <span class="loader"></span> Cargando usuarios...
      </div>
      <div v-else-if="usersError" class="pa-status-msg error">
        ⚠️ Error: {{ usersError }}
      </div>

      <div v-else>
        <div class="users-overview">
          <div class="overview-item">Total usuarios: <strong>{{ usersTotal }}</strong></div>
          <div class="overview-item">Solicitudes pendientes: <strong class="pending-count">{{ pendingCount }}</strong></div>
        </div>

        <div class="users-container">
          <div class="users-headers">
            <div>Nombre</div>
            <div>Email</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>

          <ul class="users-list">
            <li v-for="usuario in usersPaginados" :key="usuario.id" class="user-item">
              <div class="user-name">{{ usuario.nombre }} {{ usuario.apellido }}</div>
              <div class="user-email">{{ usuario.email }}</div>
              <div class="user-estado">
                <span :class="['estado-pill', usuario.estado === 'activo' ? 'activo' : usuario.estado === 'pendiente' ? 'pendiente' : 'inactivo']">{{ usuario.estado }}</span>
              </div>
              <div class="user-actions">
                <button class="btn" @click="viewUser(usuario.id)">Ver</button>
                <button v-if="usuario.estado === 'pendiente'" class="btn" @click="acceptUser(usuario.id)">Aceptar</button>
                <button v-if="usuario.estado === 'pendiente'" class="btn btn-danger" @click="rejectUser(usuario.id)">Rechazar</button>
                <button v-if="usuario.estado === 'activo'" class="btn btn-danger" @click="deactivateUser(usuario.id)">Desactivar</button>
                <button v-if="usuario.estado === 'inactivo'" class="btn" @click="activateUser(usuario.id)">Activar</button>
              </div>
            </li>
          </ul>
        </div>

        <div class="pa-pagination" v-if="totalUserPages > 1">
          <button class="page-btn" :disabled="currentUserPage === 1" @click="prevUserPage">Anterior</button>
          <div class="page-numbers">
            <button v-for="p in totalUserPages" :key="p" :class="['page-number', { active: p === currentUserPage }]" @click="goToUserPage(p)">{{ p }}</button>
          </div>
          <button class="page-btn" :disabled="currentUserPage === totalUserPages" @click="nextUserPage">Siguiente</button>
        </div>
      </div>
    </section>
  </div>
</template>


<style scoped>
.panel-admin { background: white; padding: 24px; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); max-width: 1000px; margin: 0 auto 30px; }
.pa-header { margin-bottom: 12px; }
.pa-header h2 { margin:0; font-size:1.4rem }
.muted { color:#6b7280 }

.users-overview { display:flex; gap:16px; margin-bottom:12px; }
.overview-item { background:#f8fafc; padding:8px 12px; border-radius:8px; border:1px solid #eef2ff; }
.pending-count { color:#b45309; font-weight:700 }

.users-container { border:1px solid #f3f4f6; border-radius:12px; overflow:hidden }
.users-headers { display:grid; grid-template-columns: 2fr 2fr 1fr 1fr; gap:12px; padding:12px 16px; background:#fafafa; color:#6b7280; font-weight:700 }
.users-list { list-style:none; padding:0; margin:0 }
.user-item { display:grid; grid-template-columns: 2fr 2fr 1fr 1fr; gap:12px; padding:12px 16px; border-bottom:1px solid #f3f4f6; align-items:center }
.user-name { font-weight:700 }
.user-email { color:#6b7280 }
.estado-pill { padding:6px 10px; border-radius:999px; font-weight:700; text-transform:capitalize }
.estado-pill.activo { background:#ecfdf5; color:#065f46 }
.estado-pill.pendiente { background:#fff7ed; color:#92400e }
.estado-pill.inactivo { background:#fff1f2; color:#981b1b }

.user-actions { display:flex; gap:8px }
.btn { background:#10b981; color:white; border:none; padding:8px 12px; border-radius:8px; cursor:pointer }
.btn-danger { background:#ef4444 }

.pa-pagination { display:flex; align-items:center; justify-content:center; gap:12px; margin-top:16px }
.page-number { border:1px solid #e6e6e6; padding:8px 12px; border-radius:8px; cursor:pointer }
.page-number.active { background:#10b981; color:white; border-color:#10b981 }

.pa-status-msg { padding:24px; text-align:center; color:#6b7280 }
.pa-status-msg.error { color:#ef4444 }

.header-actions { margin-top: 10px; }
.link-btn { background: transparent; border: 1px solid #10b981; color: #10b981; padding: 6px 10px; border-radius: 8px; cursor: pointer; font-weight:700; }
.link-btn:hover { background: #ecfdf5; }
</style>

