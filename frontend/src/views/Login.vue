<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { URL_BACK } from '../../../config'

const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)
const loading = ref(false)
const error = ref('')

const handleLogin = async (e) => {
  e.preventDefault()
  loading.value = true
  error.value = ''

  try {
    const response = await fetch(`${URL_BACK}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.error || 'Error al iniciar sesión'
      return
    }

    // --- LÓGICA DE GUARDADO CORREGIDA ---
    const userId = data.user?.id || data.id
    const userToken = data.token

    if (userToken) {
      localStorage.setItem('token', userToken)
      localStorage.setItem('role','estudiante')
      // Guardamos la cookie para el middleware del backend
      document.cookie = `access_token=${userToken}; path=/; SameSite=None; Secure`
    } else {
      console.error("EL BACKEND NO ENVIÓ TOKEN")
    }

    if (userId) {
      localStorage.setItem('studentId', userId)
    }

    // Redirigir al perfil
    router.push('/perfil')

  } catch (err) {
    error.value = 'Error de conexión con el servidor'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Iniciar sesión</h1>

      <!-- Mostrar errores -->
      <div v-if="error" class="error-message">{{ error }}</div>

      <!-- Formulario conectado al backend -->
      <form class="login-form" @submit="handleLogin" novalidate>
        <label for="email">Correo electrónico</label>
        <input 
          id="email" 
          v-model="email"
          type="email" 
          placeholder="tu@ejemplo.com" 
          required 
          :disabled="loading"
        />

        <label for="password">Contraseña</label>
        <input 
          id="password" 
          v-model="password"
          type="password" 
          placeholder="••••••••" 
          required 
          :disabled="loading"
        />

        <div class="form-row">
          <label class="checkbox">
            <input v-model="remember" type="checkbox" :disabled="loading" />
            <span>Recordarme</span>
          </label>

          <a href="#" class="forgot">¿Olvidaste la contraseña?</a>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
      </form>

      <p class="signup">¿No tienes cuenta? <router-link to="/registro">Regístrate</router-link></p>
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
  box-shadow: 0 8px 30px rgba(13, 27, 42, 0.08);
  text-align: left;
}

.login-card h1 {
  margin: 0 0 18px;
  font-size: 22px;
  color: #0d1b2a;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 13px;
  border-left: 3px solid #c33;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

input[type="email"],
input[type="password"] {
  padding: 10px 12px;
  border: 1px solid #e6e9ef;
  border-radius: 8px;
  background: #fcfcff;
  font-size: 14px;
  color: #111827;
}

input:disabled {
  background: #f0f0f0;
  cursor: not-allowed;
  opacity: 0.6;
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
  margin-top: 8px;
  background: #4d1b95;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-1px);
}

.btn-submit:disabled {
  opacity: 0.6;
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
}

@media (max-width: 420px) {
  .login-card {
    width: 100%;
    padding: 20px;
  }
}
</style>

