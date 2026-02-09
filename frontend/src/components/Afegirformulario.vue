<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// CAMPOS del formulario
const nombre_empresa = ref("");
const tipo_puesto = ref("");
const fecha_expiracion = ref("");
const descripcion = ref("");
const funciones = ref("");
const requisitos = ref("");
const beneficios = ref("");

// ESTADO
const loading = ref(false);
const error = ref(null);
const erroresValidacion = ref({});

// VALIDACIÓN
const validarFormulario = () => {
const errores = {};

// Validación de fecha expiración
    if (fecha_expiracion.value) {
    const hoy = new Date();
    const exp = new Date(fecha_expiracion.value);

    if (exp < hoy) {
        errores.fecha_expiracion = "La fecha de expiración no puede ser menor a hoy";
    } else {
        // Solo si la fecha es >= hoy, chequeamos los 30 días
        const diffDias = Math.ceil((exp - hoy) / (1000 * 60 * 60 * 24));
        if (diffDias < 30) {
        errores.fecha_expiracion = "La expiración debe ser al menos 30 días desde hoy";
        }
    }
    }

    // Descripción: mínimo 1 
    if (!descripcion.value || descripcion.value.trim().split(/\s+/).length < 2) {
        errores.descripcion = "La descripción debe tener al menos uan palabra";
    }

  erroresValidacion.value = errores;

  // Retorna true si no hay errores
  return Object.keys(errores).length === 0;
};

// Observa cambios en fecha_expiracion y valida en tiempo real
watch([fecha_expiracion, descripcion], () => {
  validarFormulario();
});

// Enviar formulario
const submitFormulario = async () => {
  if (!validarFormulario()) return; // detiene envío si hay errores

  loading.value = true;
  error.value = null;

  try {
    const res = await fetch("http://localhost:3000/ofertas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre_empresa: nombre_empresa.value,
        tipo_puesto: tipo_puesto.value,
        fecha_expiracion: fecha_expiracion.value,
        descripcion: descripcion.value,
        funciones: funciones.value,
        requisitos: requisitos.value,
        beneficios: beneficios.value,
      }),
    });

    if (!res.ok) throw new Error("Error al crear la oferta");
    router.push("/");
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>


<template>
  <div class="form-wrapper">
    <div class="form-container">
      <h1 class="title">Nueva Oferta</h1>

      <form @submit.prevent="submitFormulario" class="form">
        <div class="input-group">
          <label>Empresa</label>
          <input v-model="nombre_empresa" placeholder="Nombre de la empresa" required />
        </div>

        <div class="input-group">
          <label>Tipo de puesto</label>
          <input v-model="tipo_puesto" placeholder="Ej. Desarrollador Web" />
        </div>

        <div class="input-group">
          <label>Fecha de expiración</label>
          <input v-model="fecha_expiracion" type="date" />
          <p v-if="erroresValidacion.fecha_expiracion" class="error">
            {{ erroresValidacion.fecha_expiracion }}
          </p>
        </div>

        <div class="input-group">
          <label>Descripción general</label>
          <textarea v-model="descripcion" placeholder="Describe el puesto"></textarea>
           <p v-if="erroresValidacion.descripcion" class="error">
            {{ erroresValidacion.descripcion }}
          </p>
        </div>

        <div class="input-group">
          <label>Funciones del puesto</label>
          <textarea v-model="funciones" placeholder="Responsabilidades"></textarea>
        </div>

        <div class="input-group">
          <label>Requisitos / conocimientos</label>
          <textarea v-model="requisitos" placeholder="Habilidades y conocimientos necesarios"></textarea>
        </div>

        <div class="input-group">
          <label>Beneficios</label>
          <textarea v-model="beneficios" placeholder="Beneficios que ofrece la empresa"></textarea>
        </div>

        <button type="submit" class="btn" :disabled="loading || Object.keys(erroresValidacion).length > 0">
          {{ loading ? "Guardando..." : "Crear oferta" }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>


<style scoped>
/* Wrapper centrado */
.form-wrapper {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 20px;
  background: #f3f4f6;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Contenedor del formulario */
.form-container {
  background: #fff;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.08);
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
input, textarea {
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
input:focus, textarea:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99,102,241,0.2);
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
