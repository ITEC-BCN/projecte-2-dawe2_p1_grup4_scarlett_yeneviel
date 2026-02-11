<template>
  <!-- Modal de confirmación -->
  <div v-if="isModalOpen" class="modal-backdrop">
    <div class="modal-content">
      <p>{{ mensajeConfirmacion }}</p>
      <div class="modal-buttons" v-if="!mensaje">
        <button @click="confirmDelete" class="btn-confirm">Sí</button>
        <button @click="closeModal" class="btn-cancel">No</button>
      </div>
      <div v-else>
        <button @click="closeMensaje" class="btn-confirm">Aceptar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";
import { URL_BACK } from '../../../config';

const props = defineProps({
  ofertaId: Number,
  mensajeConfirmacion: { type: String, default: "¿Estás seguro de eliminar?" }
});

const emits = defineEmits(["eliminado", "cerrar"]);

const router = useRouter();

const isModalOpen = ref(false);
const mensaje = ref("");

const openModal = () => isModalOpen.value = true;
const closeModal = () => {
  isModalOpen.value = false;
  emits("cerrar");
};
const closeMensaje = () => {
  mensaje.value = "";
  closeModal();
};

const loading = ref(false);

const confirmDelete = async () => {
  
  try {
     loading.value = true;
    const response = await fetch(`${URL_BACK}/ofertas/${props.ofertaId}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Error al eliminar la oferta");

    mensaje.value = "Oferta eliminada correctamente";

    emits("eliminado"); // Avisamos al padre que eliminó

    setTimeout(() => {
      router.push({ name: "ofertas" }); // redirige
    }, 1500);
  } catch (err) {
    console.error(err);
    mensaje.value = "Hubo un error al eliminar la oferta";
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

.btn-confirm { background: #dc2626; color: white; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
.btn-cancel { background: #ccc; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; }
</style>
