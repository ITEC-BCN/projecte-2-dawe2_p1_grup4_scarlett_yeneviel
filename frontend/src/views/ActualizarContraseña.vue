<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import MensajeModal from "@/components/ModalRestaurarPass.vue";
import api from '@/services/api';
import {
  validarContraseña,
  validarContraseñasCoinciden,
  validarFormularioPassword
} from '../js/validations';

const router = useRouter();
const modalRef = ref(null);
const mensajeExito = ref("");

const form = reactive({
  password_hash: ''
})

const password2 = ref('');
const loading = ref(false);
const error = ref(null);
const erroresFormulario = reactive({
  password_hash: '',
  password2: ''
});
const showPassword = ref(false);
const showConfirmPassword = ref(false);

// Validar campo en tiempo real
const validarCampo = (campo, valor) => {
  switch (campo) {
    case 'password_hash':
      erroresFormulario.password_hash = validarContraseña(valor).mensaje;
      if (password2.value) {
        const coinc = validarContraseñasCoinciden(valor, password2.value);
        erroresFormulario.password2 = coinc.mensaje;
      }
      break;
    case 'password2':
     const coincidencia = validarContraseñasCoinciden(form.password_hash, valor);
      erroresFormulario.password2 = coincidencia.mensaje;
      break;
  }
}

const handlePasswordReset = async () => {
  // Validar el formulario usando la función de validación de contraseñas
  const validacion = validarFormularioPassword(form, password2.value);

  if (!validacion.esValido) {
    Object.assign(erroresFormulario, validacion.errores);
    error.value = 'Por favor, completa correctamente todos los campos';
    mensajeExito.value = "";
    return;
  }
 error.value = null;
  loading.value = true;

  try {
    await api.post('/update-password', {
      password: form.password_hash,
      token: router.currentRoute.value.params.token,
    });

    mensajeExito.value =
      "Contraseña restablecida correctamente. Por favor, inicie sesión.";
    modalRef.value.openModal();
  } catch (err) {
    error.value = err.response?.data?.error || "Error al restablecer la contraseña";
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

      <form class="login-form" @submit.prevent="handlePasswordReset">
        <label for="password">Nueva Contraseña</label>
        <div class="password-input-wrapper">
          <input
            id="password"
            name="password"
            v-model="form.password_hash"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            required
            :disabled="loading"
            @blur="validarCampo('password_hash', form.password_hash)"
            @input="validarCampo('password_hash', form.password_hash)"
            :class="{ 'input-error': erroresFormulario.password_hash }"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showPassword = !showPassword"
            :aria-label="
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            "
          >
            <svg
              v-if="showPassword"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              width="20"
              height="20"
            >
              <path d="M1 1l22 22" />
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8 1.31-2.51 3.34-4.62 5.76-6.02"
              />
              <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5" />
              <path d="M14.47 14.47A3.5 3.5 0 0 1 12 8.5" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              width="20"
              height="20"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <span v-if="erroresFormulario.password_hash" class="campo-error">
            {{ erroresFormulario.password_hash }}
          </span>
          <p class="requisitos-password">
            <strong>Requisitos:</strong> Mínimo 8 caracteres, mayúscula,
            minúscula, número y carácter especial
          </p>
        </div>

        <label for="password2">Repetir Contraseña</label>
        <div class="password-input-wrapper">
          <input
            id="password2"
            name="password2"
            v-model="password2"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="••••••••"
            required
            :disabled="loading"
            @blur="validarCampo('password2', password2)"
            @input="validarCampo('password2', password2)"
            :class="{ 'input-error': erroresFormulario.password2 }"
          />
          <button
            type="button"
            class="toggle-password"
            @click="showConfirmPassword = !showConfirmPassword"
            :aria-label="
              showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            "
          >
            <svg
              v-if="showConfirmPassword"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              width="20"
              height="20"
            >
              <path d="M1 1l22 22" />
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8 1.31-2.51 3.34-4.62 5.76-6.02"
              />
              <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5" />
              <path d="M14.47 14.47A3.5 3.5 0 0 1 12 8.5" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              width="20"
              height="20"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
           <span v-if="erroresFormulario.password2" class="campo-error">
            {{ erroresFormulario.password2 }}
          </span>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? "Enviando..." : "Cambiar Contraseña" }}
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
