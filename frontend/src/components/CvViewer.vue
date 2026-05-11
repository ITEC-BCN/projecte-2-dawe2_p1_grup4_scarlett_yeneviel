<script setup>
import { computed } from "vue";

const { cvUrl } = defineProps({
  cvUrl: {
    type: String,
  },
});

const cvFullUrl = computed(() => {
  if (!cvUrl) return "";

  return `https://elayqirhsjqfupeerxjw.supabase.co/storage/v1/object/public/cvs/${cvUrl}`;
});
</script>

<template>
  <div v-if="cvUrl" class="cv-actions">
    <a
      :href="cvFullUrl"
      target="_blank"
      class="btn-primary"
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
.cv-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px 0;
}

.cv-hint {
  font-size: 0.8rem;
  color: #94a3b8;
}

.btn-primary {
  padding: 8px 16px;
  background: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 8px;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #e2e8f0;
}
</style>