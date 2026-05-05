<script setup>
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useValidacionOferta } from '../composables/useValidacionOferta';

const router = useRouter();
const { erroresValidacion, validarFormulario } = useValidacionOferta();

// CAMPOS del formulario FALTAN MÁS LAS FK (id_ubicación, id_tipo_jornada, contenido_extra )
// Agrupamos los refs en un objeto para facilitar la validación
const form = ref({
  nombre_empresa: "",
  tipo_puesto: "",
  fecha_expiracion: "",
  descripcion: "",
  funciones: "",
  requisitos: "",
  beneficios: "",
  id_ubicacion: 0,
  jornada: "",
  modelo_practicas: "",
  modalidad: "",
});

//Ha accedido al input
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
});

const ubicaciones = ref([]);

const cargarCiudades = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_URL_BACK}/ubicaciones`);
    if (!res.ok) {
      throw new Error("Error al cargar ubicaciones");
    }
    return ubicaciones.value = await res.json();
  } catch (err) {
    console.error("Error cargando ubicaciones:", err);
    return [];
  }
};

onMounted(() => {
  cargarCiudades();
});

// ESTADO
const loading = ref(false);
const serverError = ref(null);

// Validar cada vez que cambie cualquier campo del objeto form
watch(form, () => {
  validarFormulario(form.value);
}, { deep: true });

// Enviar formulario
const submitFormulario = async () => {

  if (!validarFormulario(form.value)) return;

  loading.value = true;
  serverError.value = null;

  try {
    const res = await fetch(`${import.meta.env.VITE_URL_BACK}/ofertas/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre_empresa: form.value.nombre_empresa,
        tipo_puesto: form.value.tipo_puesto,
        fecha_expiracion: form.value.fecha_expiracion,
        descripcion: form.value.descripcion,
        funciones: form.value.funciones,
        requisitos: form.value.requisitos,
        beneficios: form.value.beneficios,
        id_ubicacion: parseInt(form.value.id_ubicacion),
        jornada: form.value.jornada,
        modelo_practicas: form.value.modelo_practicas,
        modalidad:form.value.modalidad,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!validarFormulario(form.value)) {
      console.log(" Validación falló", erroresValidacion.value);
      return;
    }

    console.log(" Validación OK, enviando POST...");

    if (!res.ok) {
      console.error("Error response body:", data);
      throw new Error(data?.error || data?.message || "Error del servidor");
    }

    router.push("/ofertas");
  } catch (err) {
    console.error(err);
    serverError.value = err.message;
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
        Volver al listado
      </button>
    </nav>

    <main class="form-card">
      <header class="form-header">
        <h1>Nueva Oferta de Empleo</h1>
        <p>Completa los campos para publicar una nueva oportunidad en la plataforma.</p>
      </header>

      <form @submit.prevent="submitFormulario" class="modern-form">
        
        <section class="form-section">
          <h2 class="section-title">Información General</h2>
          <div class="grid-row">
            <div class="field-group full-width">
              <label for="empresa">Nombre de la Empresa</label>
              <input 
                id="empresa" v-model="form.nombre_empresa" 
                type="text" placeholder="Ej. Tech Solutions S.L."
                :class="{ 'input-error': touched.nombre_empresa && erroresValidacion.nombre_empresa }"
                @blur="touched.nombre_empresa = true" 
              />
              <span v-if="touched.nombre_empresa && erroresValidacion.nombre_empresa" class="error-text">{{ erroresValidacion.nombre_empresa }}</span>
            </div>

            <div class="field-group ">
              <label for="puesto">Título del Puesto</label>
              <input 
                id="puesto" v-model="form.tipo_puesto" 
                placeholder="Ej. Frontend Developer"
                :class="{ 'input-error': touched.tipo_puesto && erroresValidacion.tipo_puesto }"
                @blur="touched.tipo_puesto = true" 
              />
              <span v-if="touched.tipo_puesto && erroresValidacion.tipo_puesto" class="error-text">{{ erroresValidacion.tipo_puesto }}</span>
            </div>

            <div class="field-group fecha-field">
              <label for="fecha">Fecha de Expiración</label>
              <input 
                id="fecha" type="date" v-model="form.fecha_expiracion"
                @blur="touched.fecha_expiracion = true"
              />
            </div>
          </div>
        </section>

        <section class="form-section">
          <h2 class="section-title">Condiciones y Ubicación</h2>
          <div class="grid-row three-cols">
            <div class="field-group">
              <label>Jornada</label>
              <select v-model="form.jornada">
                <option value="" disabled>Seleccionar...</option>
                <option value="completa">Completa</option>
                <option value="parcial">Parcial</option>
              </select>
            </div>

            <div class="field-group">
              <label>Modalidad</label>
              <select v-model="form.modalidad">
                <option value="" disabled>Seleccionar...</option>
                <option value="Presencial">Presencial</option>
                <option value="Remoto">Remoto</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>

            <div class="field-group">
              <label>Ubicación</label>
              <select v-model="form.id_ubicacion">
                <option value="0" disabled>Ciudad...</option>
                <option v-for="c in ubicaciones" :key="c.id" :value="c.id">{{ c.ciudad }}</option>
              </select>
            </div>
          </div>
        </section>

        <section class="form-section">
          <h2 class="section-title">Detalles de la Oferta</h2>
          <div class="field-group">
            <label>Descripción del puesto</label>
            <textarea v-model="form.descripcion" rows="4" placeholder="¿Qué buscamos?"></textarea>
          </div>
          
          <div class="field-group">
            <label>Requisitos</label>
            <textarea v-model="form.requisitos" rows="3" placeholder="Tecnologías, experiencia..."></textarea>
          </div>
        </section>

        <div class="form-actions">
          <p v-if="serverError" class="server-error-msg">{{ serverError }}</p>
          <button type="submit" class="btn-submit" :disabled="loading || Object.keys(erroresValidacion).length > 0">
            <span v-if="!loading">Publicar Oferta</span>
            <span v-else class="loader"></span>
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
:simple-vars {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --bg-page: #f8fafc;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --error: #ef4444;
  --border: #e2e8f0;
}

.form-page {
  background-color: var(--bg-page);
  min-height: 100vh;
  padding: 2rem 1rem;
  color: var(--text-main);
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
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
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.1rem;
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
}

.field-group  label {
  margin: 0.5rem;
}

.fecha-field { margin-left: 2rem;}
.full-width { grid-column: span 2; }

label {
  font-size: 0.875rem;
  font-weight: 600;
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.6rem;
  background-color: #fff;
  font-size: 1rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
}

.input-error { border-color: var(--error); }

.error-text {
  color: var(--error);
  font-size: 0.75rem;
  font-weight: 500;
}

.form-actions {
  margin-top: 3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
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
  transition: transform 0.1s, background-color 0.2s;
}

.btn-submit:hover:not(:disabled) {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loader simple */
.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
  display: inline-block;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Media Queries para Responsividad */
@media (max-width: 768px) {
  .grid-row, .three-cols {
    grid-template-columns: 1fr;
  }
  .full-width { grid-column: auto; }
  .form-card { padding: 1.5rem; }
}
</style>