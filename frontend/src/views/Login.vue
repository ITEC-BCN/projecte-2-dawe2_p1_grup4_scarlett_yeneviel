<script setup>

</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Iniciar sesión</h1>

      <!-- Formulario: solo HTML, sin lógica JS -->
      <form class="login-form" action="#" method="post" novalidate>
        <label for="email">Correo electrónico</label>
        <input id="email" name="email" type="email" placeholder="tu@ejemplo.com" required />

        <label for="password">Contraseña</label>
        <input id="password" name="password" type="password" placeholder="••••••••" required />

        <div class="form-row">
          <label class="checkbox">
            <input type="checkbox" name="remember" />
            <span>Recordarme</span>
          </label>

          <a href="#" class="forgot">¿Olvidaste la contraseña?</a>
        </div>

        <button type="submit" class="btn-submit">Entrar</button>
      </form>

      <p class="signup">¿No tienes cuenta? <a href="/crear">Regístrate</a></p>
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

.btn-submit:hover {
  opacity: 0.95;
  transform: translateY(-1px);
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

