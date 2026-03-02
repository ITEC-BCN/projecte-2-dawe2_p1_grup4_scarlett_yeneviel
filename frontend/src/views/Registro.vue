<script setup>
import { useFetchUser } from '../composables/userFetchUser';
import { URL_BACK } from '../../../config';
import { ref } from 'vue';
import { useRouter } from 'vue-router';



const urlNewStudent=ref (`${URL_BACK}/estudiantes`)
const router=useRouter()
const userFetch=useFetchUser(URL_BACK)

const form={}
const password2=ref(null)

 const InsertNewStudent=async()=>{

    try {

        if(form.password_hash!= password2.value){
            throw new Error('Las contraseñas no coinciden')
        }
        
        await userFetch.NewStudent(form, urlNewStudent.value);

        router.push('/perfil')
    } catch (error) {
        console.error("Fallo en el registro:",error);
    }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Registro</h1>

      <form class="login-form" @submit.prevent="InsertNewStudent">
        <label for="nombre">Nombre</label>
        <input id="nombre" name="nombre" type="text" placeholder="ej: Juanito" required v-model="form.nombre"/>

        <label for="apellido">Apellido</label>
        <input id="apellido" name="apellido" type="text" placeholder="ej: Pepe Pepe" required v-model="form.apellido"/>

        <label for="telefono">Teléfono</label>
        <input id="telefono" name="telefono" type="tel" placeholder="ej: 601 555 55" required maxlength="11" v-model="form.telefono"/>

        <label for="email">Correo electrónico</label>
        <input id="email" name="email" type="email" placeholder="ej: juanitoPepe@gmail.com" required v-model="form.email"/>

        <label for="password">Contraseña</label>
        <input id="password" name="password" type="password" placeholder="••••••••" required v-model="form.password_hash"/>

        <label for="password2">confirmar contraseña</label>
        <input id="password2" name="password2" type="password" placeholder="••••••••" required v-model="password2" />

        <button type="submit" class="btn-submit">Entrar</button>
      </form>

      <p class="signup">
        ¿Ya tienes una cuenta?
        <RouterLink to="/login" > Iniciar sesión</RouterLink>
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


input {
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

