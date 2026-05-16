<template>
  <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content">
      <header class="modal-header">
        <h3>Actualizar Estado</h3>
        <button @click="closeModal" class="btn-close">&times;</button>
      </header>

      <div class="modal-body">
        <div v-if="!mensaje">
          <p class="modal-instruction">Selecciona el nuevo estado para <strong>{{ estudiante.nombre }}</strong></p>
          <div class="select-wrapper">
            <select v-model="estado" class="custom-select">
              <option value="" disabled selected>Elige una opción...</option>
              <option v-for="estadoOption in estadosCandidatura" :key="estadoOption" :value="estadoOption">
                {{ estadoOption }}
              </option>
            </select>
          </div>
        </div>
        
        <div v-else class="message-container">
          <p class="message-text">{{ mensaje }}</p>
        </div>
      </div>

      <footer class="modal-footer">
        <div class="modal-buttons" v-if="!mensaje">
          <button @click="closeModal" class="btn-secondary">Cancelar</button>
          <button 
            @click="actualizarEstado" 
            class="btn-primary" 
            :disabled="!estado || loading"
          >
            <span v-if="loading" class="loader"></span>
            {{ loading ? "Guardando..." : "Actualizar Estado" }}
          </button>
        </div>
        <div v-else>
          <button @click="closeMensaje" class="btn-primary">Aceptar</button>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, defineExpose } from "vue";
import { useRouter } from "vue-router";
import api from '../services/api'

const estadosCandidatura = ["En Proceso", "Aceptado", "Rechazada","CV leido","Finalista"];
// Props (camelCase to match Vue conventions)
const props = defineProps({
  ofertaId: Number,
  estudiante: {
    id: Number,
    email: String,
    nombre: String,
    titulo: String
  }
});

const emit = defineEmits(["actualizado", "cerrar"]);

const router = useRouter();

const isModalOpen = ref(false);
const estado = ref("");
const mensaje = ref("");
const loading = ref(false);

const openModal = () => {
  // reset state when opening
  estado.value = "";
  mensaje.value = "";
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
  emit("cerrar");
};
const closeMensaje = () => {
  mensaje.value = "";
  closeModal();
};

const actualizarEstado = async () => {
  try {
    loading.value = true;

    // Asegurarse de tener los ids antes de llamar al backend
    if (!props.ofertaId || !props.estudiante.id) {
      mensaje.value = 'Faltan datos de oferta o estudiante';
      loading.value = false;
      return;
    }

    // Usar path params: /candidatura/estado/:ofertaId/:estudianteId
    const url = `${import.meta.env.VITE_URL_BACK}/candidatura/estado/${encodeURIComponent(props.ofertaId)}/${encodeURIComponent(props.estudiante.id)}`;

    const response = await api.put(url, { estado: estado.value },{
      headers: { "Content-Type": "application/json" }
    });

    if (!response.data) throw new Error("Error al actualizar la candidatura");

    mensaje.value = "Candidatura actualizada correctamente";

    emit("actualizado", estado.value); // Avisamos al padre que se actualizó

  } catch (err) {
    console.error(err);
    mensaje.value = "Hubo un error al actualizar la candidatura";
  } finally {
    loading.value = false;
  }
};

// Exponer función para abrir modal desde el padre
defineExpose({ openModal });
</script>

<style scoped>
/* Contenedor Principal */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.7); /* Azul oscuro traslúcido */
  backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
  padding: 20px;
}

/* Tarjeta del Modal */
.modal-content {
  background: white;
  width: 100%;
  max-width: 450px;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  animation: modalIn 0.3s ease-out;
}

@keyframes modalIn {
  from { opacity: 0; transform: translateY(10px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* Cabecera */
.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #94a3b8;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-close:hover { color: #475569; }

/* Cuerpo */
.modal-body {
  padding: 24px;
}

.modal-instruction {
  color: #64748b;
  margin-bottom: 16px;
  font-size: 0.95rem;
}

.message-text {
  font-size: 1.1rem;
  color: #334155;
  text-align: center;
}

/* Select Estilizado */
.select-wrapper {
  position: relative;
}

.custom-select {
  width: 100%;
  padding: 12px 16px;
  font-size: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  background-color: #f8fafc;
  color: #1e293b;
  appearance: none;
  transition: all 0.2s;
  cursor: pointer;
}

.custom-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Pie de página y Botones */
.modal-footer {
  padding: 16px 24px;
  background: #f8fafc;
  display: flex;
  justify-content: flex-end;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  width: 100%;
}

.btn-primary, .btn-secondary {
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) { background: #1d4ed8; }
.btn-primary:disabled { background: #94a3b8; cursor: not-allowed; }

.btn-secondary {
  background: #e2e8f0;
  color: #475569;
}

.btn-secondary:hover { background: #cbd5e1; }

/* Loader simple */
.loader {
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
