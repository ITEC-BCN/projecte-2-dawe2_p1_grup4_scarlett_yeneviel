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
  <div class="form-wrapper">
    <button @click="volver" class="btn-volver">
      ← Volver 
    </button>
    <div class="form-container">
      <h1 class="title">Nueva Oferta</h1>

      <form @submit.prevent="submitFormulario" class="form">
        <div class="input-group">
          <label>Empresa</label>
          <input v-model="form.nombre_empresa" placeholder="Nombre de la empresa" required
            @blur="touched.nombre_empresa = true" />
          <p v-if="touched.nombre_empresa && erroresValidacion.nombre_empresa" class="error">
            {{ erroresValidacion.nombre_empresa }}
          </p>
        </div>

        <div class="input-group">
          <label>Tipo de puesto</label>
          <input v-model="form.tipo_puesto" placeholder="Ej. Desarrollador Web" @blur="touched.tipo_puesto = true" />
          <p v-if="touched.tipo_puesto && erroresValidacion.tipo_puesto" class="error">
            {{ erroresValidacion.tipo_puesto }}
          </p>
        </div>

        <div class="input-group">
          <label>Fecha de expiración</label>
          <input v-model="form.fecha_expiracion" type="date" @blur="touched.fecha_expiracion = true" />
          <p v-if="touched.fecha_expiracion && erroresValidacion.fecha_expiracion" class="error">
            {{ erroresValidacion.fecha_expiracion }}
          </p>
        </div>

        <div class="input-group">
          <label>Tipo de jornada</label>
          <select v-model="form.jornada" @blur="touched.jornada = true">
            <option value="" disabled>Seleciona un tipo de jornada</option>
            <option value="completa">Jornada Completa</option>
            <option value="Jornada parcial">Jornada Parcial</option>
          </select>
            <p v-if="touched.jornada && erroresValidacion.jornada" class="error">
              {{ erroresValidacion.jornada }}
            </p>
        </div>

        <div class="input-group">
          <label>Modalidad</label>
          <select v-model="form.modalidad" @blur="touched.modalidad = true">
            <option value="" disabled>Seleciona una modalidad</option>
            <option value="Presencial">Presencial</option>
            <option value="Remoto">Remoto</option>
            <option value="Híbrido">Híbrido</option>
          </select>
            <p v-if="touched.modalidad && erroresValidacion.modalidad" class="error">
              {{ erroresValidacion.modalidad }}
            </p>
        </div>

        <div class="input-group">
          <label>Modelo de practicas</label>
          <select v-model="form.modelo_practicas" @blur="touched.modelo_practicas = true">
            <option value="" disabled>Seleciona un modelo de prácticas</option>
            <option value="INTENSIVAS">Intensivas</option>
            <option value="GENERAL">General</option>
          </select>
            <p v-if="touched.modelo_practicas && erroresValidacion.modelo_practicas" class="error">
              {{ erroresValidacion.modelo_practicas }}
            </p>
        </div>

        <div class="input-group">
          <label>Descripción general</label>
          <textarea v-model="form.descripcion" placeholder="Describe el puesto"
            @blur="touched.descripcion = true"></textarea>
          <p v-if="touched.descripcion && erroresValidacion.descripcion" class="error">
            {{ erroresValidacion.descripcion }}
          </p>
        </div>

        <div class="input-group">
          <label>Funciones del puesto</label>
          <textarea v-model="form.funciones" placeholder="Responsabilidades" @blur="touched.funciones = true"></textarea>
          <p v-if="touched.funciones && erroresValidacion.funciones" class="error">
            {{ erroresValidacion.funciones }}
          </p>
        </div>

        <div class="input-group">
        <label>Ubicación</label>
        <select v-model="form.id_ubicacion" @blur="touched.id_ubicacion = true">
          <option value="" disabled>Selecciona una ciudad</option>
          <option v-for="c in ubicaciones" :key="c.id" :value="c.id">
            {{ c.ciudad }} ({{ c.comunidad }})
          </option>
        </select>
          <p v-if="touched.id_ubicacion && erroresValidacion.id_ubicacion" class="error">
            {{ erroresValidacion.id_ubicacion }}
          </p>
        </div>
        <div class="input-group">
          <label>Requisitos / conocimientos</label>
          <textarea v-model="form.requisitos" placeholder="Habilidades y conocimientos necesarios"
            @blur="touched.requisitos = true"></textarea>
          <p v-if="touched.requisitos && erroresValidacion.requisitos" class="error">
            {{ erroresValidacion.requisitos }}
          </p>
        </div>

        <div class="input-group">
          <label>Beneficios</label>
          <textarea v-model="form.beneficios" placeholder="Beneficios que ofrece la empresa"
            @blur="touched.beneficios = true"></textarea>
          <p v-if="touched.beneficios && erroresValidacion.beneficios" class="error">
            {{ erroresValidacion.beneficios }}
          </p>
        </div>

        <button type="submit" class="btn" :disabled="loading || Object.keys(erroresValidacion).length > 0">
          {{ loading ? "Guardando..." : "Crear oferta" }}
        </button>

        <p v-if="serverError" class="error">{{ serverError }}</p>
      </form>
    </div>
  </div>
</template>


<style scoped>
/* Botón Volver */
.btn-volver {
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  transition: color 0.3s;
}

.btn-volver:hover {
  color: #000;
  text-decoration: underline;
}

/* Wrapper centrado */
.form-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  background: #f3f4f6;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Contenedor del formulario */
.form-container {
  background: #fff;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  max-width: 700px;
  width: 100%;
}

/* Título */
.title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 25px;
  text-align: center;
}

/* Formulario */
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Grupo input + label */
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* Labels */
.input-group label {
  font-weight: 600;
  color: #4b5563;
  font-size: 0.9rem;
}

/* Inputs y textarea */
input,
textarea {
  padding: 12px 15px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border 0.2s, box-shadow 0.2s;
  width: 100%;
  font-family: inherit;
}

/* Focus en inputs */
input:focus,
textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

/* Estilo específico para el Select (Ubicación) */
select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fcfcfc;
  font-size: 1rem;
  appearance: none; /* Elimina la flecha por defecto en algunos navegadores */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
  cursor: pointer;
  transition: border-color 0.3s, box-shadow 0.3s;
}

select:focus {
  outline: none;
border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}
/* Textarea más grande */
textarea {
  min-height: 100px;
  resize: vertical;
}

/* Botón */
.btn {
  background: #6366f1;
  color: white;
  font-weight: 600;
  padding: 14px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.btn:hover:not(:disabled) {
  background: #4f46e5;
  transform: translateY(-2px);
}

.btn:disabled {
  background: #a5b4fc;
  cursor: not-allowed;
}

/* Mensaje de error */
.error {
  color: #dc2626;
  font-weight: 500;
  font-size: 0.9rem;
  margin-top: 5px;
}

/* Responsive */
@media (max-width: 768px) {
  .form-container {
    padding: 30px 20px;
  }
}
</style>
