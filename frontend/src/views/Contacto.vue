<script setup>
import { ref } from 'vue'

const formulario = ref({
  nombre: '',
  email: '',
  mensaje: ''
})

const enviarFormulario = () => {
  console.log('Enviando datos:', formulario.value)
  alert('¡Gracias por contactar! Te responderemos pronto.')
  // Aquí podrías resetear el formulario
  formulario.value = { nombre: '', email: '', mensaje: '' }
}

/*
Pasos para configurar EmailJS
Regístrate en emailjs.com.

Conecta tu servicio de correo (Gmail, por ejemplo).

Crea una Email Template con etiquetas como {{nombre}}, {{email}} y {{mensaje}}.

Instálalo en tu proyecto: npm install @emailjs/browser.
 */
</script>

<template>
  <section class="contacto-section">
    <div class="contacto-wrapper">
      
      <div class="info-contacto">
        <span class="resaltar subtitle">Ponte en contacto</span>
        <h1>¿Tienes alguna <span class="resaltar">duda</span>?</h1>
        <p class="intro-desc">Estamos en el corazón tecnológico de Nou Barris, preparados para ayudarte a dar el siguiente paso en tu carrera.</p>

        <div class="datos-lista">
          <div class="dato-item">
            <div class="icon-circle">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <div>
              <h4>Dirección</h4>
              <p>Avinguda de l'Aiguablava, 121<br>08033 Barcelona</p>
            </div>
          </div>

          <div class="dato-item">
            <div class="icon-circle">
              <i class="fa-solid fa-phone"></i>
            </div>
            <div>
              <h4>Teléfono</h4>
              <p>+34 937 07 00 20</p>
            </div>
          </div>

          <div class="dato-item">
            <div class="icon-circle">
              <i class="fa-solid fa-envelope"></i>
            </div>
            <div>
              <h4>Email</h4>
              <a href="mailto:secretaria@itb.cat" class="mail">secretaria@itb.cat</a>
            </div>
          </div>
        </div>
      </div>

      <div class="formulario-container">
        <form @submit.prevent="enviarFormulario" class="form-card">
          <div class="form-group">
            <label>Nombre completo</label>
            <input v-model="formulario.nombre" type="text" placeholder="Tu nombre" required>
          </div>
          
          <div class="form-group">
            <label>Correo electrónico</label>
            <input v-model="formulario.email" type="email" placeholder="email@ejemplo.com" required>
          </div>

          <div class="form-group">
            <label>Mensaje</label>
            <textarea v-model="formulario.mensaje" rows="5" placeholder="Cuéntanos cómo podemos ayudarte..." required></textarea>
          </div>

          <button type="submit" class="btn-primary">Enviar mensaje</button>
        </form>
      </div>

    </div>
  </section>
</template>

<style scoped>
.mail{
  color: #10b981;
  text-decoration: none;
  font-weight: 600;
}
.contacto-section {
  padding: 5rem 1.5rem;
  background-color: #fcfcfc;
}

.contacto-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 4rem;
  align-items: center;
}

.resaltar { color: #10b981; }

.subtitle {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 2px;
}

.info-contacto h1 {
  font-size: 2.8rem;
  margin: 1rem 0;
  color: #333;
}

.intro-desc {
  color: #666;
  margin-bottom: 3rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Lista de datos */
.datos-lista {
  display: flex;;
  flex-direction: column;
  text-align: left;
  gap: 2rem;
}

.dato-item {
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
}

.icon-circle {
  background: black;
  color: white;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.dato-item h4 {
  margin: 0 0 0.3rem 0;
  color: #4C1D95;
  font-size: 1.1rem;
}

.dato-item p {
  margin: 0;
  color: #555;
  line-height: 1.4;
}

/* Formulario */
.formulario-container {
  flex: 1;
}

.form-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.08);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #444;
  font-size: 0.9rem;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: inherit;
  transition: border-color 0.3s;
}

.form-group input:focus, .form-group textarea:focus {
  outline: none;
  border-color: #10b981;
}

.btn-primary {
  width: 100%;
  background: #4C1D95;
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #3b1675;
}

/* Responsive */
@media (max-width: 900px) {
  .contacto-wrapper {
    flex-direction: column;
    gap: 3rem;
  }
  
  .info-contacto {
    text-align: center;
  }

  .dato-item {
    justify-content: center;
    text-align: left;
  }
}
</style>