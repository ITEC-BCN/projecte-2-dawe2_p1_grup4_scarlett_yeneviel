<script setup>
import { computed } from "vue";

const props = defineProps({
  cvUrl: {
    type: String,
    default: "",
  },
});

const hasCv = computed(() => {
  return props.cvUrl?.trim() !== "";
});

const cvFullUrl = computed(() => {
  if (!hasCv.value) return "";

  if (props.cvUrl.startsWith("http")) {
    return props.cvUrl;
  }

  return `https://elayqirhsjqfupeerxjw.supabase.co/storage/v1/object/public/cvs/${props.cvUrl}`;
});
</script>

<template>
  <div v-if="hasCv" class="cv-actions">
    <a
      :href="cvFullUrl"
      class="btn-primary"
      aria-label="Ver CV del candidato"
    >
      <i class="fa-solid fa-eye"></i>
      Ver CV
    </a>
  </div>

  <div v-else class="cv-actions">
    <small class="cv-hint">
      Todavía no ha subido ningún CV
    </small>
  </div>
</template>

<style scoped>
/* CvViewer.vue - Estilos Responsive */
.cv-actions {
   display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.cv-hint {
  font-size: 0.8rem;
  color: #94a3b8;
  /* Evitamos que el texto de "no hay CV" se corte feo */
  line-height: 1.2;
}

.btn-primary {
  padding: 6px 12px;
  background: var(--primary);
  color: #ffffff;
  border-radius: 6px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center; /* Centra el contenido si el botón se estira */
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  /* Evita que el botón sea más pequeño que el texto */
  white-space: nowrap;
  width:100%; 
}

.btn-primary:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}

/* --- Ajustes para pantallas pequeñas --- */
@media (max-width: 600px) {
  .cv-actions {
     display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  }

  .btn-primary {
    width: 100%;
    padding: 8px 14px;
  }
  
  .cv-hint {
    text-align: center;
    width: 100%;
    font-style: italic;
  }
}
</style>