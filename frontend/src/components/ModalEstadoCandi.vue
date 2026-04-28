<template>
  <!-- Modal para actualizar el estado de la candidatura -->
  <div v-if="isModalOpen" class="modal-backdrop">
    <div class="modal-content">
      <select v-model="estado" v-show="!mensaje" >
        <option value="" disabled>Selecciona un estado</option>
        <option v-for="estadoOption in estadosCandidatura" :key="estadoOption" :value="estadoOption">
          {{ estadoOption }}
        </option>
      </select>
      <div class="modal-buttons" v-if="!mensaje">
        <button @click="actualizarEstado" class="btn-confirm" :disabled="!estado || loading">
          {{ loading ? "Actualizando..." : "Actualizar" }}
        </button>
        <button @click="closeModal" class="btn-cancel">No</button>
      </div>
      <div v-else>
        <p>{{ mensaje }}</p>
        <button @click="closeMensaje" class="btn-confirm">Aceptar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, defineExpose } from "vue";
import { useRouter } from "vue-router";
import { URL_BACK } from '../../../config';

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
    const url = `${URL_BACK}/candidatura/estado/${encodeURIComponent(props.ofertaId)}/${encodeURIComponent(props.estudiante.id)}`;

    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: estado.value })
    });

    if (!response.ok) throw new Error("Error al actualizar la candidatura");

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
.modal-backdrop {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white; padding: 30px; border-radius: 12px;
  text-align: center; max-width: 400px;
}

.modal-buttons { margin-top: 20px; display: flex; justify-content: space-around; }

.btn-confirm { background: #2E7D32; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
.btn-cancel { background: #ccc; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
</style>
