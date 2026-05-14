<template>
  <div class="notfound-container">
    <div class="card">
      <div class="icon">🚫</div>

      <h1>404 - Página no encontrada</h1>

      <p>
        La página que estás buscando no existe, ha sido movida o no está disponible.
      </p>

      <div class="actions">
        <button class="btn-primary" @click="goHome">
          Volver al inicio
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

</script>

<style scoped>
.notfound-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f8fafc;
  padding: 2rem;
  font-family: system-ui, sans-serif;
}

.card {
  background: white;
  padding: 3rem;
  border-radius: 1.5rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
  max-width: 500px;
  width: 100%;
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: #1e293b;
}

p {
  color: #64748b;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

button {
  padding: 0.8rem 1.2rem;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.btn-primary {
  background: #4f46e5;
  color: white;
}

.btn-primary:hover {
  background: #4338ca;
}

.btn-secondary {
  background: #e2e8f0;
  color: #1e293b;
}

.btn-secondary:hover {
  background: #cbd5e1;
}
</style>