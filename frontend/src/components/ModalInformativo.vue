<template>
  <!-- Modal para actualizar el estado de la candidatura -->
  <div v-if="isModalOpen" class="modal-backdrop">
    <div class="modal-content">
        <p>{{ mensaje }}</p>
        <div v-if="payload" style="text-align:left; margin-top:12px;">
          <pre style="white-space:pre-wrap; font-size:0.9rem; color:#333">{{ formattedPayload }}</pre>
        </div>
        <button @click="closeMensaje" class="btn-confirm">Aceptar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineExpose, computed } from "vue";

// Props para mensaje personalizado
const props = defineProps({
  mensaje: {
    type: String,
    default: ''
  },
});

// Exponer la prop como un computed para garantizar reactividad en la plantilla
const mensaje = computed(() => props.mensaje);

const isModalOpen = ref(false);
const estado = ref("");
const loading = ref(false);
const payload = ref(null);

// formatted payload for display
const formattedPayload = computed(() => {
  if (!payload.value) return "";
  try {
    return typeof payload.value === "string"
      ? payload.value
      : JSON.stringify(payload.value, null, 2);
  } catch (e) {
    return String(payload.value);
  }
});

const openModal = (p = null) => {
  // reset state when opening
  estado.value = "";
  payload.value = p;
  isModalOpen.value = true;
};
const closeModal = () => {
  isModalOpen.value = false;
  payload.value = null;

};
const closeMensaje = () => {
  closeModal();
};

// Exponer función para abrir modal desde el padre (acepta payload opcional)
defineExpose({ openModal, closeModal });
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

.btn-confirm { background: #059669; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }

</style>
