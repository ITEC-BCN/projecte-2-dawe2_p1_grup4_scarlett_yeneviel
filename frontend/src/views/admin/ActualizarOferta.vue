<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFetch } from '../../composables/useFetchOfertas';
import { useValidacionOferta } from '../../composables/useValidacionOferta';

const route = useRoute();
const router = useRouter();
const url = ref(`${import.meta.env.VITE_URL_BACK}/ofertas/${route.params.id}`);

const { data: ofertaOriginal, error, loading: loadingFetch, actualizarOferta } = useFetch(url);
const { erroresValidacion, validarFormulario } = useValidacionOferta();

const form = ref({});
const loading = ref(false);
const serverError = ref(null);

const skills=ref([]);
const selectedSkills = ref([]);//Array para multiselect
const skillToAdd = ref('');

const touched = ref({
  nombre_empresa: false,
  tipo_puesto: false,
  fecha_expiracion: false,
  descripcion: false,
  funciones: false,
  requisitos: false,
  beneficios: false,
  id_ubicacion: false,
  jornada: false,
  modelo_practicas: false,
  modalidad: false,
  selectedSkills: false
});

const ubicaciones = ref([]);

const cargarCiudades = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_URL_BACK}/ubicaciones`);
    if (!res.ok) throw new Error("Error al cargar ubicaciones");
    ubicaciones.value = await res.json();
  } catch (err) {
    console.error("Error cargando ubicaciones:", err);
  }
};

const skillsDisponibles = computed(() => {
    if (!skills.value) return [];
    const set = []
    skills.value.forEach(s => {
      if (s.nombre) set.push({
        id: s.id,
        nombre: s.nombre
      }); 
    });
    return [...set].sort();
});

const skillsDisponiblesFiltradas = computed(() => {
    return skillsDisponibles.value.filter(skill =>
        !selectedSkills.value.includes(skill)
    );
});

const addSkill = () => {
    if (!skillToAdd.value) return;

    if (!selectedSkills.value.includes(skillToAdd.value)) {
        selectedSkills.value.push(skillToAdd.value);
    }

    skillToAdd.value = "";
};

const removeSkill = (skill) => {
    selectedSkills.value = selectedSkills.value.filter(s => s !== skill);
};

const cargarSkills=async()=>{
  try {

    const res = await fetch(`${import.meta.env.VITE_URL_BACK}/skills`);
    if (!res.ok) {
      throw new Error("Error al cargar skills");
    }
    return skills.value = await res.json();

  } catch (err) {
    console.error("Error cargando skills:", err);
    return [];
  }
}


onMounted(() => {
  cargarCiudades();
cargarSkills()
});

// Sincronizar datos de la API al formulario
watch(ofertaOriginal, (newData) => {
  if (newData) {
    form.value = { ...newData };

    if (newData.oferta_skill) {
      selectedSkills.value = newData.oferta_skill.map(item => ({
        id: item.skill.id || item.id_skill,
        nombre: item.skill.nombre
      }));
    }
  }
}, { immediate: true });

// Validar en tiempo real
watch(form, (val) => {
  validarFormulario(val);
}, { deep: true });

const submitFormulario = async () => {
  const payload= {...form.value, selectedSkills: selectedSkills.value.map(skill => skill.id)};
  
  if (!validarFormulario(payload)) {
    Object.keys(touched.value).forEach(key => touched.value[key] = true);
    return;
  }

  const datosCambiados = {};
  for (const key in payload) {
    if (payload[key] !== ofertaOriginal.value[key]) {
      datosCambiados[key] = payload[key];
    }
  }

  if (Object.keys(datosCambiados).length === 0) return alert("No has realizado ningún cambio.");

  loading.value = true;
  serverError.value = null;

  try {
    const urlPut = `${import.meta.env.VITE_URL_BACK}/oferta/${route.params.id}`;
    await actualizarOferta(datosCambiados, urlPut);
    alert("¡Oferta actualizada!");
    router.push(`/admin/oferta/${route.params.id}`);
  } catch (err) {
    serverError.value = "Error al conectar con el servidor.";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const volver = () => router.back();
</script>

<template>
  <div class="form-page">
    <nav class="top-nav">
      <button @click="volver" class="btn-back">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Volver al detalle
      </button>
    </nav>

    <main class="form-card">
      <div v-if="loadingFetch" class="loading-state">
        <span class="loader-dark"></span>
        <p>Cargando detalles de la oferta...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p>Error al cargar la oferta. Por favor, reintente.</p>
      </div>

      <div v-else-if="ofertaOriginal">
        <header class="form-header">
          <h1>Actualizar Oferta</h1>
          <p>Modifica los campos necesarios para actualizar la información de la vacante.</p>
        </header>

        <form @submit.prevent="submitFormulario" class="modern-form">
          
          <section class="form-section">
            <h2 class="section-title">Información General</h2>
            <div class="grid-row">
              <div class="field-group full-width">
                <label for="empresa">Nombre de la Empresa</label>
                <input 
                  id="empresa" v-model="form.nombre_empresa" type="text"
                  :class="{ 'input-error': touched.nombre_empresa && erroresValidacion.nombre_empresa }"
                  @blur="touched.nombre_empresa = true" 
                />
                <span v-if="touched.nombre_empresa && erroresValidacion.nombre_empresa" class="error-text">{{ erroresValidacion.nombre_empresa }}</span>
              </div>

              <div class="field-group">
                <label for="puesto">Título del Puesto</label>
                <input 
                  id="puesto" v-model="form.tipo_puesto" type="text"
                  :class="{ 'input-error': touched.tipo_puesto && erroresValidacion.tipo_puesto }"
                  @blur="touched.tipo_puesto = true" 
                />
                <span v-if="touched.tipo_puesto && erroresValidacion.tipo_puesto" class="error-text">{{ erroresValidacion.tipo_puesto }}</span>
              </div>

              <div class="field-group">
                <label for="fecha">Fecha de Expiración</label>
                <input 
                  id="fecha" type="date" v-model="form.fecha_expiracion"
                  :class="{ 'input-error': touched.fecha_expiracion && erroresValidacion.fecha_expiracion }"
                  @blur="touched.fecha_expiracion = true"
                />
                <span v-if="touched.fecha_expiracion && erroresValidacion.fecha_expiracion" class="error-text">{{ erroresValidacion.fecha_expiracion }}</span>
              </div>
            </div>
          </section>

          <section class="form-section">
            <h2 class="section-title">Condiciones y Ubicación</h2>
            <div class="grid-row three-cols">
              <div class="field-group">
                <label>Jornada</label>
                <select v-model="form.jornada" @blur="touched.jornada = true" :class="{'input-error': touched.jornada && erroresValidacion.jornada}">
                  <option value="" disabled>Seleccionar...</option>
                  <option value="Completa">Jornada Completa</option>
                  <option value="Jornada parcial">Jornada Parcial</option>
                </select>
                <span v-if="touched.jornada && erroresValidacion.jornada" class="error-text">{{ erroresValidacion.jornada }}</span>
              </div>

              <div class="field-group">
                <label>Modalidad</label>
                <select v-model="form.modalidad" @blur="touched.modalidad = true" :class="{'input-error': touched.modalidad && erroresValidacion.modalidad}">
                  <option value="" disabled>Seleccionar...</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Remoto">Remoto</option>
                  <option value="Híbrido">Híbrido</option>
                </select>
                <span v-if="touched.modalidad && erroresValidacion.modalidad" class="error-text">{{ erroresValidacion.modalidad }}</span>
              </div>

              <div class="field-group">
                <label>Ubicación</label>
                <select v-model="form.id_ubicacion" @blur="touched.id_ubicacion = true" :class="{'input-error': touched.id_ubicacion && erroresValidacion.id_ubicacion}">
                  <option value="0" disabled>Ciudad...</option>
                  <option v-for="c in ubicaciones" :key="c.id" :value="c.id">{{ c.ciudad }}</option>
                </select>
                <span v-if="touched.id_ubicacion && erroresValidacion.id_ubicacion" class="error-text">{{ erroresValidacion.id_ubicacion }}</span>
              </div>
            </div>
            
            <div class="grid-row" style="margin-top: 1.5rem;">
               <div class="field-group">
                <label>Modelo de Prácticas</label>
                <select v-model="form.modelo_practicas" @blur="touched.modelo_practicas = true" :class="{'input-error': touched.modelo_practicas && erroresValidacion.modelo_practicas}">
                  <option value="" disabled>Seleccionar...</option>
                  <option value="INTENSIVAS">Intensivas</option>
                  <option value="GENERAL">General</option>
                </select>
                <span v-if="touched.modelo_practicas && erroresValidacion.modelo_practicas" class="error-text">{{ erroresValidacion.modelo_practicas }}</span>
              </div>
            </div>
          </section>

          <section class="form-section">
            <h2 class="section-title">Detalles de la Oferta</h2>
            <div class="field-group">
              <label>Descripción del puesto</label>
              <textarea v-model="form.descripcion" rows="4" @blur="touched.descripcion = true" :class="{'input-error': touched.descripcion && erroresValidacion.descripcion}"></textarea>
              <span v-if="touched.descripcion && erroresValidacion.descripcion" class="error-text">{{ erroresValidacion.descripcion }}</span>
            </div>
            
            <div class="field-group">
              <label>Skills</label>
              <select v-model="skillToAdd" @change="addSkill" @blur="touched.selectedSkills=true" :class="{'input-error':touched.selectedSkills && erroresValidacion.selectedSkills}">
                <option value="0" disabled>Skills...</option>
                <option v-for="skill in skillsDisponiblesFiltradas" :key="skill.id" :value="skill">{{ skill.nombre}}</option>
              </select>

              <div v-if="selectedSkills.length > 0" class="skills-selected">
              <transition-group name="list">
                  <span v-for="skill in selectedSkills" :key="skill.id" class="chip">
                      {{ skill.nombre }}
                      <button @click="removeSkill(skill)" class="btn-remove-skill">✕</button>
                  </span>
              </transition-group>
              </div>
            </div>

            <div class="field-group">
              <label>Funciones</label>
              <textarea v-model="form.funciones" rows="3" @blur="touched.funciones = true" :class="{'input-error': touched.funciones && erroresValidacion.funciones}"></textarea>
              <span v-if="touched.funciones && erroresValidacion.funciones" class="error-text">{{ erroresValidacion.funciones }}</span>
            </div>

            <div class="field-group">
              <label>Requisitos</label>
              <textarea v-model="form.requisitos" rows="3" @blur="touched.requisitos = true" :class="{'input-error': touched.requisitos && erroresValidacion.requisitos}"></textarea>
              <span v-if="touched.requisitos && erroresValidacion.requisitos" class="error-text">{{ erroresValidacion.requisitos }}</span>
            </div>

            <div class="field-group">
              <label>Beneficios</label>
              <textarea v-model="form.beneficios" rows="3" @blur="touched.beneficios = true" :class="{'input-error': touched.beneficios && erroresValidacion.beneficios}"></textarea>
              <span v-if="touched.beneficios && erroresValidacion.beneficios" class="error-text">{{ erroresValidacion.beneficios }}</span>
            </div>
          </section>

          <div class="form-actions">
            <p v-if="serverError" class="server-error-msg">{{ serverError }}</p>
            <button type="submit" class="btn-submit" :disabled="loading || Object.keys(erroresValidacion).length > 0">
              <span v-if="!loading">Guardar Cambios</span>
              <span v-else class="loader"></span>
            </button>
          </div>
        </form>
      </div>

      <div v-else class="error-container">
        <p>Oferta no encontrada.</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Variables de diseño */
.form-page {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --bg-page: #f8fafc;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --error: #ef4444;
  --border: #e2e8f0;
  
  background-color: var(--bg-page);
  min-height: 100vh;
  padding: 2rem 1rem;
  color: var(--text-main);
  font-family: 'Inter', system-ui, sans-serif;
}

.top-nav {
  max-width: 900px;
  margin: 0 auto 1.5rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: var(--text-muted);
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-back:hover { color: var(--primary); }

.form-card {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 1.25rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2.5rem;
}

.form-header {
  margin-bottom: 2.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1.5rem;
}

.form-header h1 {
  font-size: 1.875rem;
  font-weight: 800;
  letter-spacing: -0.025em;
}

.form-header p {
  color: var(--text-muted);
  margin-top: 0.5rem;
}

.form-section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.three-cols {
  grid-template-columns: repeat(3, 1fr);
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.full-width { grid-column: span 2; }

label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  background-color: #fff;
  font-size: 1rem;
  transition: all 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.input-error { border-color: var(--error); }

.error-text {
  color: var(--error);
  font-size: 1rem;
  font-weight: 500;
}

.server-error-msg {
  color: var(--error);
  font-weight: 600;
}

.skills-selected {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px dashed #e2e8f0;
    /* Evita saltos de layout */
}


.chip {
    background: #4d1b95;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    /* Más redondeado queda más moderno */
    font-size: 13px;
    display: inline-flex;
    /* Cambiado de display: flex */
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.chip:hover {
    background: var(--primary-hover);
    color: #ffffff;
    /* mantener contraste */
}

.chip button {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
}

.btn-remove-skill {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 10px;
    line-height: 1;
    padding: 0;
    transition: all 0.2s;
}

.btn-remove-skill:hover {
    background: #ef4444;
    /* Rojo al pasar el ratón */
    transform: scale(1.1);
}

.form-actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  border-top: 1px solid var(--border);
  padding-top: 2rem;
}

.btn-submit {
  width: 100%;
  max-width: 300px;
  padding: 1rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state, .error-container {
  text-align: center;
  padding: 3rem;
  color: var(--text-muted);
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s infinite linear;
  display: inline-block;
}

.loader-dark {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s infinite linear;
  display: block;
  margin: 0 auto 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .grid-row, .three-cols { grid-template-columns: 1fr; }
  .full-width { grid-column: auto; }
  .form-card { padding: 1.5rem; }
}
</style>