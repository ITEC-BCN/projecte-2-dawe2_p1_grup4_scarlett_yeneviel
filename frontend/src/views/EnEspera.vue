<script setup>
import { useRouter } from 'vue-router';
import ModalInformativo from '../components/ModalInformativo.vue';
import { ref, onMounted } from 'vue';
import { useFetchUser } from '../composables/userFetchUser.js';

const router = useRouter();

const { getEstadoEstudiante } = useFetchUser();
const estadoActual = ref('cargando...');

const actualizarEstado = async () => {
  const res = await getEstadoEstudiante();
  estadoActual.value = res.toLowerCase()

};

// 1. variable para guardar el mensaje personzalido dentro del mondal
const mensajePersonalizado = ref("");
//2. Estado de modal para abrir el modal informativo 
const modalEstadoRef = ref(null);

const modalInformativoEstado = () => {
  modalEstadoRef.value?.openModal(); // modalEstadoRef es la instancia del componente ModalInformativo
};
const reprobarEstado = async () => {
  await actualizarEstado ()
  if (estadoActual.value === 'aprobado') {
    //3. Uso la variable
    mensajePersonalizado.value = '¡Tu cuenta ha sido aprobada! Redirigiendo al dashboard...';
    modalInformativoEstado();
    router.push('/dashboard');
  } else {
    mensajePersonalizado.value = `Tu cuenta sigue en estado: ${estadoActual.value.toUpperCase()}. Por favor, espera a que un administrador la revise.`;
    modalInformativoEstado();
  }
}

onMounted(() => {
  actualizarEstado();
});
</script>
<template>
  <div class="espera-container">
    <div v-if="estadoActual === 'pendiente'" class="card">
      <div class="icon">⏳</div>
      <h1>Perfil en revisión</h1>
      <p>Hola! Un administrador está revisando tu documentación. Recibirás un correo cuando tu cuenta sea activada.</p>
      <div class="actions">
        <button @click="reprobarEstado" class="btn-primary">Refrescar estado</button>
      </div>
    </div>
    <div v-if="estadoActual === 'inactivo'" class="card">
      <div class="icon">🚫​</div>
      <h1>Perfil inactivo</h1>
      <p>Hola! Tu cuenta está inactiva. Por favor, contacta con soporte para más información.</p>
    </div>

    <div v-if="estadoActual === 'rechazado'" class="card">
      <div class="icon">🚫​</div>
      <h1>Cuenta rechazada</h1>
      <p>Hola! Tu cuenta ha sido rechazada. Si es un error por favor contacta con soporte para más información.</p>
    </div>
  </div>
  <!-- 4. Llamada al modal para mostrar mensaje de oferta guardada correctamente se asigna una instancia del componente ModalInformativo a modalEstadoRef -->
  <modal-informativo ref="modalEstadoRef" :mensaje="mensajePersonalizado" />
</template>

<style scoped>
.espera-container {
  height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.card {
  background: white;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  max-width: 450px;
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

h1 {
  color: #111827;
  margin-bottom: 1rem;
}

p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.btn-primary {
  background: #10b981;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
}

.btn-link {
  background: none;
  border: none;
  color: #ef4444;
  margin-top: 1rem;
  cursor: pointer;
  text-decoration: underline;
}
</style>