<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import MensajeModal from "@/components/ModalRestaurarPass.vue";

const router = useRouter();
// 1. Cambiamos a modalRef para que coincida con el <template>
const modalRef = ref(null);
const mensajeExito = ref("");

const password = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const error = ref("");
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// 2. Cambiamos el nombre a handleRestorePassword para que coincida con el formulario
const handleRestorePassword = async () => {
  error.value = "";
  loading.value = true;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_URL_BACK}/restore-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.value,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      error.value = data.error || "Error al restablecer la contraseña";
      return;
    }

    mensajeExito.value =
      "Enviado un correo con instrucciones para restablecer la contraseña.";
    // Usamos modalRef en lugar de mensajeModal
    modalRef.value.openModal();
  } catch (err) {
    error.value = "Error de conexión con el servidor";
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const onModalCerrado = () => {
  router.push({ name: "login" });
};

</script>

<template>


  <div class="login-page">
    <div class="login-card">
      <h1>Recuperar Contraseña</h1>
      <div v-if="error" class="error-message">{{ error }}</div>

      <form class="login-form" @submit.prevent="handleRestorePassword">
        <label for="email">Correo Electrónico</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="tu@email.com"
          required
          :disabled="loading"
        />

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? "Enviando..." : "Solicitar Restablecimiento" }}
        </button>
      </form>
    </div>

    <MensajeModal
      ref="modalRef"
      :mensaje="mensajeExito"
      @close="onModalCerrado"
    />
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 20px;
  background: #f5f7fb;
}

.login-card {
  width: 360px;
  background: #fff;
  padding: 28px;
  border-radius: 12px;
  box-shadow:
    0 0 0 1px #4b5563,
    0 6px 16px rgba(0, 0, 0, 0.08);
  text-align: left;
  box-sizing: border-box;
}

.login-card h1 {
  margin: 0 0 18px;
  font-size: 22px;
  color: #0d1b2a;
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: #4d1b95;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: #6d28d9;
}

.form-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
}

.forgot {
  font-size: 13px;
  color: #374151;
  text-decoration: none;
}

.btn-submit {
  margin-top: 8px;
  background: #4d1b95;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(77, 27, 149, 0.3);
}

.btn-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.signup {
  margin-top: 14px;
  font-size: 13px;
  color: #374151;
  text-align: center;
}

.signup a {
  color: #4d1b95;
  text-decoration: none;
  font-weight: 600;
}

label {
  font-size: 12px;
  color: #374151;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

input {
  padding: 10px 12px;
  border: 2px solid #e6e9ef;
  border-radius: 8px;
  background: #fcfcff;
  font-size: 14px;
  color: #111827;
  transition: all 0.3s ease;
  border: 2px solid #4b5563;
  width: 90%;
}

input:focus {
  outline: none;
  border-color: #4d1b95;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(77, 27, 149, 0.2);
}

input.input-error {
  border-color: #dc2626;
  background: #fef2f2;
}

input.input-error:focus {
  border-color: #dc2626;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

::placeholder {
  color: #6b7280;
}

@media (max-width: 480px) {
  .login-page {
    padding: 16px;
  }

  .login-card {
    padding: 18px;
    border-radius: 10px;
  }

  .login-card h1 {
    font-size: 20px;
  }

  .form-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .btn-submit {
    width: 100%;
  }
}
</style>
