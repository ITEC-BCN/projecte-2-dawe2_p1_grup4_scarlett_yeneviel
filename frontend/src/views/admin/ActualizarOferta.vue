<script setup>
import { ref, watch,onMounted } from 'vue';
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

const touched = ref({
  nombre_empresa: false,
  tipo_puesto: false,
  fecha_expiracion: false,
  descripcion: false,
  funciones: false,
  requisitos: false,
  beneficios: false,
  ciudad: false,
  modelo_practicas: false,
  jornada: false,
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


// Sincronizar datos de la API al formulario
watch(ofertaOriginal, (newData) => {
    if (newData) {
        form.value = { ...newData };
    }
}, { immediate: true });

// Validar en tiempo real
watch(form, (val) => {
    validarFormulario(val);
}, { deep: true });

const submitFormulario = async () => {
    // 1. Validar antes de hacer nada
    if (!validarFormulario(form.value)) {
        // Si hay errores, marcamos todos como tocados para que se vean en rojo
        Object.keys(touched.value).forEach(key => touched.value[key] = true);
        return;
    }

    // 2. Calcular cambios (PUT parcial)
    const datosCambiados = {};
    for (const key in form.value) {
        if (form.value[key] !== ofertaOriginal.value[key]) {
            datosCambiados[key] = form.value[key];
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
    <!--Contenedor Principal-->
    <div class="container">
        <button @click="volver" class="btn-volver">
             ← Volver al detalle
        </button>

        <!-- Estados -->
      <div v-if="loading" class="state-msg">
        Cargando detalles...
      </div>

      <div v-else-if="error" class="state-msg error">
        Error al cargar la oferta
      </div>

      <!--Formulario-->
      <div v-else-if="ofertaOriginal" >
          <h1 class="title">Actualizar Oferta</h1>

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
              <label>Ubicación</label>
              <select v-model="form.id_ubicacion" @blur="touched.id_ubicacion = true">
                <option value="" disabled>Seleciona una ciudad</option>
                <option v-for="c in ubicaciones" :key="c.id" :value="c.id">
                  {{ c.ciudad }} ({{ c.comunidad }})
                </option>
              </select>
                <p v-if="touched.id_ubicacion && erroresValidacion.id_ubicacion" class="error">
                  {{ erroresValidacion.id_ubicacion }}
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
                <option value="Completa">Jornada Completa</option>
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
              {{ loading ? "Guardando..." : "Actualizar oferta" }}
            </button>

            <p v-if="serverError" class="error">{{ serverError }}</p>
          </form>
        </div>
         <div v-else class="state-msg">
            Oferta no encontrada
         </div>
    </div>
</template>

<style scoped>

/* Contenedor Principal */
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', Roboto, sans-serif;
  color: #333;
}

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
