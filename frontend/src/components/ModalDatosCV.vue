<template>
  <div class="modal-bg" @click.self="close">
    <div class="modal-content">
      <button class="close-btn" @click="close">&times;</button>
      <h2>Datos extraídos del CV</h2>
      <div v-if="datos">
        <p><strong>Nombre:</strong> {{ datos.nombre }} {{ datos.apellido }}</p>
        <p><strong>Email:</strong> {{ datos.email }}</p>
        <p><strong>Teléfono:</strong> {{ datos.telefono }}</p>
        <p><strong>Ubicación:</strong> {{ datos.location }}</p>
        <p><strong>Sobre mí:</strong> {{ datos.about }}</p>
        <div>
          <strong>Idiomas:</strong>
          <ul>
            <li v-for="(idioma, i) in datos.idiomas?.idiomas || []" :key="i">
              {{ idioma.name }} ({{ idioma.level }})
            </li>
          </ul>
        </div>
        <div>
          <strong>Estudios:</strong>
          <ul>
            <li v-for="(est, i) in datos.estudios?.formacion || []" :key="i">
              {{ est.titulo }} - {{ est.centro }} ({{ est.anio }})
            </li>
          </ul>
        </div>
        <p><strong>Hard skills:</strong> {{ datos.hard_skills }}</p>
        <p><strong>Soft skills:</strong> {{ datos.soft_skills }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  datos: Object
});
const emit = defineEmits(['close']);
function close() {
  emit('close');
}
</script>

<style scoped>
.modal-bg {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  border-radius: 16px;
  padding: 32px 24px 24px 24px;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  position: relative;
}
.close-btn {
  position: absolute;
  top: 12px;
  right: 16px;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
}
</style>