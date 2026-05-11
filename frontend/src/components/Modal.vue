<template>
  <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content">

      <div v-if="!mensaje">
        <p>{{ textoConfirmacion }}</p>
        <div class="modal-buttons">
          <button @click="confirmAction" class="btn-confirm" :disabled="loading">
            {{ loading ? 'Procesando...' : 'Sí' }}
          </button>
          <button @click="closeModal" class="btn-cancel">No</button>
        </div>
      </div>

      <div v-else>
        <p>{{ mensaje }}</p>
        <button @click="closeModal" class="btn-cancel">Cerrar</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, defineExpose, computed } from "vue";
import { useRouter } from "vue-router";

const props = defineProps({
  ofertaId: Number,
  estado: String,
});

const emits = defineEmits(["eliminado", "cerrar"]);
const router = useRouter();

const isModalOpen = ref(false);
const mensaje = ref("");
const loading = ref(false);

const openModal = () => {
  mensaje.value = ""; // Limpiar mensajes previos al abrir
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  mensaje.value = ""; // Limpiamos el mensaje al cerrar
  emits("cerrar");
};
// USAMOS COMPUTED: Así el mensaje cambia automáticamente según el estado de la oferta
const textoConfirmacion = computed(() => {
  return props.estado === "INACTIVA"
    ? "¿Estás seguro de desactivar esta oferta?"
    : "¿Estás seguro de activar esta oferta?";
});

const confirmAction = async () => {
  try {
    loading.value = true;
    const res = await fetch(`${import.meta.env.VITE_URL_BACK}/ofertaDesactivar/${props.ofertaId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: props.estado })
    });

    if (!res.ok) throw new Error('Error desactivando oferta');

    // Definimos un mensaje amigable
    const accionRealizada = props.estado === 'ACTIVA' ? 'activandose...' : 'desactivandose...';
    mensaje.value = `Oferta ${accionRealizada}.`;

    if (router.currentRoute.value.name === 'verOfertaAdmin' && props.estado === 'INACTIVA') {
        mensaje.value = `Oferta ${accionRealizada}. Redirigiendo al listado...`;
      }

    emits("eliminado");

    // 3. Lógica de cierre y redirección universal
    setTimeout(() => {
      isModalOpen.value = false;

      // Si el nombre de tu ruta de detalle es 'verOfertaAdmin', redirigimos.
      // Si estamos en el listado, simplemente se queda ahí con el modal cerrado.
      if (router.currentRoute.value.name === 'verOfertaAdmin' && props.estado === 'INACTIVA') {
        router.push({ name: "ofertas" });
      }
    }, 2500);

  } catch (err) {
    console.error(err);
    mensaje.value = "Hubo un error al actualizar el estado de la oferta";
    // En caso de error, no redirigimos para que el usuario vea qué pasó
  } finally {
    loading.value = false;
  }
};

defineExpose({ openModal });
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  max-width: 400px;
}

.modal-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}

.btn-confirm {
  background: #dc2626;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.btn-cancel {
  background: #ccc;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
</style>
