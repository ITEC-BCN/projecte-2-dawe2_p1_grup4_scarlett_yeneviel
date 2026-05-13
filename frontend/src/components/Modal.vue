<template>
  <div v-if="isModalOpen" class="modal-backdrop" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-body">
        <div v-if="!mensaje">
          <p class="modal-text">{{ titulo }}</p>
          <div class="modal-buttons">
            <button @click="handleConfirm" class="btn-confirm" :disabled="loading" :class="colorConfirmar">
              {{ loading ? 'Procesando...' : textoBotonConfirmar }}
            </button>
            <button @click="closeModal" class="btn-cancel">
              {{ textoBotonCancelar }}
            </button>
          </div>
        </div>

        <div v-else>
          <p class="modal-text">{{ mensaje }}</p>
          <button @click="closeModal" class="btn-cancel">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, defineExpose } from "vue";

const props = defineProps({
  titulo: { type: String, default: "¿Estás seguro?" },
  textoBotonConfirmar: { type: String, default: "Confirmar" },
  textoBotonCancelar: { type: String, default: "Cancelar" },
  colorConfirmar: { type: String, default: "danger" }, // 'danger', 'primary', 'success'
  loading: { type: Boolean, default: false }
});

const emits = defineEmits(["confirmar", "cerrar"]);

const isModalOpen = ref(false);
const mensaje = ref("");

// Métodos de control
const openModal = (msgPostAccion = "") => {
  mensaje.value = msgPostAccion; 
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  mensaje.value = "";
  emits("cerrar");
};

const handleConfirm = () => {
  emits("confirmar");
};

// Exponemos para que el padre lo controle
defineExpose({ openModal, closeModal, mensaje });
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 32px;
  border-radius: 16px;
  text-align: center;
  max-width: 350px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 24px;
  line-height: 1.5;
}

.modal-buttons {
  display: flex;
  flex-direction: column; /* Botones en columna para móviles o diseño moderno */
  gap: 10px;
}

.btn-confirm, .btn-cancel {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

/* Colores dinámicos */
.btn-confirm.danger { background: #dc2626; color: white; }
.btn-confirm.primary { background: #2563eb; color: white; }
.btn-confirm.success { background: #10b981; color: white; }

.btn-confirm:hover { filter: brightness(1.1); }
.btn-confirm:disabled { background: #cbd5e1; cursor: not-allowed; }

.btn-cancel { background: #f1f5f9; color: #475569; }
.btn-cancel:hover { background: #e2e8f0; }

/* Para que en desktop salgan uno al lado del otro si prefieres */
@media (min-width: 400px) {
  .modal-buttons { flex-direction: row-reverse; justify-content: center; }
  .btn-confirm, .btn-cancel { flex: 1; }
}
</style>