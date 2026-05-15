<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/api';
import {
  validarNombre,
  validarApellido,
  validarTelefono,
  validarEmail,
  validarContraseña,
  validarContraseñasCoinciden,
  validarFormulario
} from '../js/validations';

const router = useRouter()

const errorGeneral = ref(null)
const successMessage = ref(null)
const form = reactive({
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  password_hash: ''
})
const password2 = ref('')
const erroresFormulario = reactive({
  nombre: '',
  apellido: '',
  telefono: '',
  email: '',
  password_hash: '',
  password2: ''
})
const cargando = ref(false)
const showPassword = ref(false)
const showPassword2 = ref(false)

// Validar campo en tiempo real
const validarCampo = (campo, valor) => {
  switch (campo) {
    case 'nombre':
      erroresFormulario.nombre = validarNombre(valor).mensaje;
      break;
    case 'apellido':
      erroresFormulario.apellido = validarApellido(valor).mensaje;
      break;
    case 'telefono':
      erroresFormulario.telefono = validarTelefono(valor).mensaje;
      break;
    case 'email':
      erroresFormulario.email = validarEmail(valor).mensaje;
      break;
    case 'password_hash':
      erroresFormulario.password_hash = validarContraseña(valor).mensaje;
      // Validar coincidencia si ya hay contraseña2
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

const InsertNewStudent = async () => {
  try {
    // Validar todo el formulario
    const validacion = validarFormulario(form, password2.value);

    if (!validacion.esValido) {
      Object.assign(erroresFormulario, validacion.errores);
      errorGeneral.value = 'Por favor, completa correctamente todos los campos';
      successMessage.value = null;
      return;
    }

    errorGeneral.value = null;
    cargando.value = true;

    const { data } = await api.post('/estudiantes', form);

    // --- LÓGICA DE GUARDADO CORREGIDA ---
    const userId = data.user?.id;
    const userToken = data.token;

    localStorage.setItem('token', userToken);
    localStorage.setItem('role', 'estudiante');
    localStorage.setItem('studentId', userId);

    successMessage.value = '¡Registro exitoso! Redirigiendo...';
    setTimeout(() => {
      router.push(`/perfil`);
    }, 1500);

  } catch (error) {
    console.error("Error al registrarse: ", error);
    errorGeneral.value = error.response?.data?.error || error.message || 'Error al registrarse. Intenta de nuevo.';
    successMessage.value = null;
    cargando.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Registro</h1>

      <!-- Mensaje de error general -->
      <div v-if="errorGeneral" class="error-message General">
        <span class="icon">⚠️</span>
        {{ errorGeneral }}
      </div>

      <!-- Mensaje de éxito -->
      <div v-if="successMessage" class="success-message">
        <span class="icon">✓</span>
        {{ successMessage }}
      </div>

      <form class="login-form" @submit.prevent="InsertNewStudent">
        <!-- Campo Nombre -->
        <div class="form-group">
          <label for="nombre">Nombre</label>
          <input id="nombre" name="nombre" type="text" placeholder="ej: Juan" required v-model="form.nombre"
            @blur="validarCampo('nombre', form.nombre)" @input="validarCampo('nombre', form.nombre)"
            :class="{ 'input-error': erroresFormulario.nombre }" />
          <span v-if="erroresFormulario.nombre" class="campo-error">
            {{ erroresFormulario.nombre }}
          </span>
        </div>

        <!-- Campo Apellido -->
        <div class="form-group">
          <label for="apellido">Apellido</label>
          <input id="apellido" name="apellido" type="text" placeholder="ej: Pérez" required v-model="form.apellido"
            @blur="validarCampo('apellido', form.apellido)" @input="validarCampo('apellido', form.apellido)"
            :class="{ 'input-error': erroresFormulario.apellido }" />
          <span v-if="erroresFormulario.apellido" class="campo-error">
            {{ erroresFormulario.apellido }}
          </span>
        </div>

        <!-- Campo Teléfono -->
        <div class="form-group">
          <label for="telefono">Teléfono</label>
          <input id="telefono" name="telefono" type="tel" placeholder="ej: 612345678" required maxlength="11"
            v-model="form.telefono" @blur="validarCampo('telefono', form.telefono)"
            @input="validarCampo('telefono', form.telefono)" :class="{ 'input-error': erroresFormulario.telefono }" />
          <span v-if="erroresFormulario.telefono" class="campo-error">
            {{ erroresFormulario.telefono }}
          </span>
        </div>

        <!-- Campo Email -->
        <div class="form-group">
          <label for="email">Correo electrónico</label>
          <input id="email" name="email" type="email" placeholder="ej: juanp@gmail.com" required v-model="form.email"
            @blur="validarCampo('email', form.email)" @input="validarCampo('email', form.email)"
            :class="{ 'input-error': erroresFormulario.email }" />
          <span v-if="erroresFormulario.email" class="campo-error">
            {{ erroresFormulario.email }}
          </span>
        </div>

        <!-- Campo Contraseña -->
        <div class="form-group">
          <label for="password">Contraseña</label>
          <div class="password-input-wrapper">
            <input id="password" name="password" :type="showPassword ? 'text' : 'password'" placeholder="••••••"
              required v-model="form.password_hash" @blur="validarCampo('password_hash', form.password_hash)"
              @input="validarCampo('password_hash', form.password_hash)"
              :class="{ 'input-error': erroresFormulario.password_hash }"/>
            <button type="button" class="toggle-password" @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20"
                height="20">
                <path d="M1 1l22 22" />
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8 1.31-2.51 3.34-4.62 5.76-6.02" />
                <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5" />
                <path d="M14.47 14.47A3.5 3.5 0 0 1 12 8.5" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
            
          </div>
          <span v-if="erroresFormulario.password_hash" class="campo-error">
            {{ erroresFormulario.password_hash }}
          </span>
          <p class="requisitos-password">
            <strong>Requisitos:</strong> Mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial
          </p>
        </div>

        <!-- Campo Confirmar Contraseña -->
        <div class="form-group">
          <label for="password2">Confirmar contraseña</label>
          <div class="password-input-wrapper">
            <input id="password2" name="password2" :type="showPassword2 ? 'text' : 'password'" placeholder="••••••••"
              required v-model="password2" @blur="validarCampo('password2', password2)"
              @input="validarCampo('password2', password2)" :class="{ 'input-error': erroresFormulario.password2 }" />
            <button type="button" class="toggle-password" @click="showPassword2 = !showPassword2"
              :aria-label="showPassword2 ? 'Ocultar contraseña' : 'Mostrar contraseña'">
              <svg v-if="showPassword2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20"
                height="20">
                <path d="M1 1l22 22" />
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8 1.31-2.51 3.34-4.62 5.76-6.02" />
                <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5" />
                <path d="M14.47 14.47A3.5 3.5 0 0 1 12 8.5" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          <span v-if="erroresFormulario.password2" class="campo-error">
            {{ erroresFormulario.password2 }}
          </span>
        </div>

        <button type="submit" class="btn-submit" :disabled="cargando">
          {{ cargando ? 'Registrando...' : 'Entrar' }}
        </button>
      </form>

      <p class="signup">
        ¿Ya tienes una cuenta?
        <RouterLink to="/login">Iniciar sesión</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 40px;
  background: #f5f7fb;
}

.login-card {
  width: 360px;
  background: #fff;
  padding: 28px;
  border-radius: 12px;
  text-align: left;
  box-shadow: 0 0 0 1px #4b5563, 0 6px 16px rgba(0, 0, 0, 0.08);

}

.login-card h1 {
  margin: 0 0 18px;
  font-size: 22px;
  color: #0d1b2a;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

input {
  padding: 10px 12px;
  border: 2px solid #4b5563;
  border-radius: 8px;
  background: #fcfcff;
  font-size: 14px;
  color: #111827;
  transition: all 0.3s ease;
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

.campo-error {
  font-size: 12px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
  font-weight: 500;
}

.campo-error::before {
  content: '✕';
  font-weight: bold;
}

.error-message {
  background: #fee2e2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: slideDown 0.3s ease;
}

.error-message.General {
  background: #fef2f2;
  border-color: #dcfce7;
  color: #991b1b;
}

.success-message {
  background: #dcfce7;
  border: 1px solid #bbf7d0;
  color: #166534;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  animation: slideDown 0.3s ease;
}

.error-message .icon,
.success-message .icon {
  font-size: 16px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.requisitos-password {
  font-size: 11px;
  color: #6b7280;
  margin-top: 4px;
  padding: 8px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #4d1b95;
}

.password-input-wrapper {
  position: relative;
  width: 100%;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  background: transparent;
  border: none;
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
  color: #6b7280;
  text-decoration: none;
}

.btn-submit {
  margin-top: 12px;
  background: #4d1b95;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
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
  color: #6b7280;
  text-align: center;
}

.signup a {
  color: #4d1b95;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.signup a:hover {
  color: #6d28d9;
}

@media (max-width: 420px) {
  .login-card {
    width: 100%;
    padding: 20px;
  }

  .login-form {
    gap: 14px;
  }
}
</style>
