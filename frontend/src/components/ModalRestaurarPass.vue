<template>
  <div v-if="isModalOpen" class="modal-backdrop">
    <div class="modal-content">
        <p>{{ mensaje }}</p>
        <button @click="closeMensaje" class="btn-confirm">Aceptar</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  mensaje: {
    type: String,
    default: ''
  },
});

const emit = defineEmits(['close']); // Declaramos el evento que emitiremos al padre

const mensaje = computed(() => props.mensaje);
const isModalOpen = ref(false);

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  emit('close'); // Avisamos al padre que el modal se ha cerrado
};

const closeMensaje = () => {
  closeModal();
};

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

.btn-confirm { 
  background: #059669; color: white; padding: 10px 20px; 
  border: none; border-radius: 8px; cursor: pointer; 
  margin-top: 20px;
}
.btn-confirm:hover {
  background: #047857;
}
</style>