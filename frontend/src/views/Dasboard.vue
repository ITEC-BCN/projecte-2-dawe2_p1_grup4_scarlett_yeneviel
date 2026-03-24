<script setup>
import { ref, reactive, watch,computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { URL_BACK } from "../../../config";
import { useStudents } from "../composables/useStudents";

const userRole = ref('estudiante') 
const userName = ref('Alex ITB')

const route = useRoute();
const router = useRouter();
const studentId = route.params.id || localStorage.getItem("studentId");
const url = ref(`${URL_BACK}/estudiantes/${studentId}`);


const { students, loadingStudents, isCreating, createStudent } =
  useStudents(url);

  const ofertasIncritas = ref([]);
  const ofertasGuardadas = ref([]);
  const documentos = ref([]);
  const user=reactive({
    name:"",
    role:localStorage.getItem('role')
  })

  watch(students, (newStudents) => {
    if (newStudents) {
      user.name = newStudents.nombre || "Usuario";
      user.role = newStudents.rol || "estudiante";
      ofertasIncritas.value = newStudents.postulaciones || [];
      ofertasGuardadas.value = newStudents.oferta_guardada || [];
      documentos.value = newStudents.enlaces || [];
    }
  }, { immediate: true });
// Datos de estadísticas
const stats = computed(() => {
  if (user.role === 'estudiante') {
    return [
      { label: 'Inscritas', valor: ofertasIncritas.value.length, icon: '📝' },
      { label: 'Guardadas', valor: ofertasGuardadas.value.length, icon: '⭐' },
      { label: 'CV', valor: 1, icon: '📝' },
      { label: 'Otros documentos', valor: documentos.value.length, icon: '📝' }
    ]
  }
  return [
    { label: 'Ofertas', valor: 4, icon: '🏢' },
    { label: 'Candidatos', valor: 28, icon: '👥' },
    { label: 'IA Sugerencias', valor: 8, icon: '🤖' }
  ]
})

const quickActions = computed(() => {
  if (userRole.value === 'estudiante') return ['Editar CV', 'Mis Candidaturas', 'Filtros']
  return ['Publicar Oferta', 'Ver Candidatos', 'Chat IA']
})

</script>

<template>
  <div class="dashboard-simple">
    <main class="content">
      
      <header class="main-header">
        <div class="header-text">
          <h1>Hola, <span class="resaltar">{{ user.name }}</span></h1>
          <p>Resumen de actividad: <strong>{{ user.role }}</strong></p>
        </div>
        <button class="btn-primary">Cerrar Sesión</button>
      </header>

      <section class="stats-row">
        <div v-for="stat in stats" :key="stat.label" class="stat-box">
          <span class="stat-icon">{{ stat.icon }}</span>
          <div class="stat-info">
            <span class="stat-value">{{ stat.valor }}</span>
            <span class="stat-label">{{ stat.label }}</span>
          </div>
        </div>
      </section>

      <div class="main-grid">
        
        <section class="panel list-panel">
          <div class="panel-header">
            <h3>{{ userRole === 'estudiante' ? 'Candidaturas' : 'Últimas' }} <strong class="resaltar">{{ userRole === 'estudiante' ? 'Recientes' : 'Publicaciones' }}</strong></h3>
            <a href="#" class="ver-mas">Ver todas</a>
          </div>
          <div class="items-list">
            <div v-for="(item, index) in ofertasIncritas" :key="index" class="item-row">
              <div class="item-info">
                <strong>{{ item.oferta.tipo_puesto }}</strong>
                <span>{{ item.oferta.nombre_empresa }}</span>
              </div>
              <span class="pill" :class="item.estado === 'En proceso' ? 'status-1' : item.estado === 'CV Leído' ? 'status-2' : 'status-3'">{{ item.estado }}</span>
            </div>
          </div>
        </section>

        <section class="panel actions-panel">
          <h3>Gestión <strong class="resaltar">Rápida</strong></h3>
          <div class="actions-grid">
            <button v-for="action in quickActions" :key="action" class="btn-action">
              {{ action }}
            </button>
          </div>
          <div class="ia-box">
            <small class="resaltar-ia">Internia IA ✨</small>
            <p>Sugerencia: Tu perfil encaja con 2 nuevas ofertas de <strong>Frontend</strong> en Barcelona.</p>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<style scoped>
/* BOTÓN MORADO */
.btn-primary {
  background: #4C1D95;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #3b1675;
}

/* BASE */
.dashboard-simple {
  background-color: #fcfcfc;
  min-height: auto; 
  color: #333;
}

.resaltar { color: #10b981; }

.content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem 1rem 1.5rem; 
}

/* HEADER */
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.main-header h1 { font-size: 2.2rem; margin: 0; }
.main-header p { color: #666; margin-top: 0.3rem; }

/* TÍTULOS H3 ESTILO PERSONALIZADO */
h3 {
  font-size: 1.5rem;
  margin: 0;
  color: #333;
  font-weight: 400; /* Normal para que el strong resalte */
}

h3 .resaltar {
  font-weight: 800;
}

/* STATS */
.stats-row {
  display: flex;
  gap: 1.2rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.stat-box {
  background: white;
  flex: 1;
  min-width: 180px;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon { font-size: 1.8rem; }
.stat-value { display: block; font-size: 1.5rem; font-weight: 700; color: #333; }
.stat-label { color: #999; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px; }

/* GRID */
.main-grid {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.panel {
  background: white;
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid #eee;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.ver-mas { color: #10b981; font-size: 0.85rem; text-decoration: none; font-weight: 700; }

/* LISTA */
.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 0;
  border-bottom: 1px solid #f8f8f8;
}
.item-row:last-child { border-bottom: none; }

.item-info strong { display: block; font-size: 1rem; color: #444; }
.item-info span { font-size: 0.85rem; color: #999; }

/* PILLS */
.pill {
  font-size: 0.75rem;
  padding: 5px 12px;
  border-radius: 20px;
  font-weight: 700;
}
.status-1 { background: #f0fdf4; color: #10b981; }
.status-2 { background: #eff6ff; color: #3b82f6; }
.status-3 { background: #faf5ff; color: #a855f7; }

/* ACCIONES */
.actions-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.8rem;
  margin: 1.5rem 0;
}

.btn-action {
  background: #f9f9f9;
  border: 1px solid #eee;
  padding: 0.9rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  color: #4C1D95;
  transition: 0.2s;
}

.btn-action:hover {
  background: white;
  border-color: #4C1D95;
}

.ia-box {
  margin-top: 1.5rem;
  background: #fdfdfd;
  padding: 1.2rem;
  border-radius: 10px;
  border: 1px dashed #ddd;
}

.resaltar-ia { color: #10b981; font-weight: 800; text-transform: uppercase; font-size: 0.7rem; }
.ia-box p { font-size: 0.88rem; color: #666; margin: 8px 0 0; line-height: 1.4; }

/* RESPONSIVO */
@media (max-width: 900px) {
  .main-grid { grid-template-columns: 1fr; }
  .main-header { flex-direction: column; text-align: center; gap: 1rem; }
}
</style>