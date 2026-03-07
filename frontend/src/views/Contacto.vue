<script setup>
import { ref } from "vue";
// IMPORTANTE: Debes importar la librería que instalaste
import emailjs from "@emailjs/browser";

const formulario = ref({
  nombre: "",
  email: "",
  mensaje: "",
});

// Esta variable es necesaria para que el botón funcione y no dé error
const enviando = ref(false);

const enviarFormulario = () => {
  enviando.value = true;

  // Valores de tu cuenta EmailJS
  const SERVICE_ID = "service_xznwlip";
  const TEMPLATE_ID = "template_s4ohqws";
  const PUBLIC_KEY = "fb8fbWLbHBX7mgoNz";

  const templateParams = {
    nombre: formulario.value.nombre,
    email: formulario.value.email,
    mensaje: formulario.value.mensaje,
  };

  emailjs
    .send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
    .then((response) => {
      console.log("ÉXITO!", response.status, response.text);
      alert("¡Mensaje enviado correctamente! Revisaremos tu duda pronto.");
      formulario.value = { nombre: "", email: "", mensaje: "" };
    })
    .catch((err) => {
      console.error("ERROR AL ENVIAR:", err);
      alert("Algo ha fallado al conectar con el servidor de correo.");
    })
    .finally(() => {
      enviando.value = false;
    });
};
</script>

<template>
  <section class="contacto-section">
    <div class="contacto-wrapper">
      <div class="info-contacto">
        <span class="resaltar subtitle">Ponte en contacto</span>
        <h1>¿Tienes alguna <span class="resaltar">duda</span>?</h1>
        <p class="intro-desc">
          Estamos en el corazón tecnológico de Nou Barris, preparados para
          ayudarte a dar el siguiente paso en tu carrera.
        </p>

        <div class="datos-lista">
          <div class="dato-item">
            <div class="icon-circle">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <div>
              <h4>Dirección</h4>
              <p>Avinguda de l'Aiguablava, 121<br />08033 Barcelona</p>
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
              <a href="mailto:secretaria@itb.cat" class="mail"
                >secretaria@itb.cat</a
              >
            </div>
          </div>
        </div>
      </div>

      <div class="formulario-container">
        <form @submit.prevent="enviarFormulario" class="form-card">
          <div class="form-group">
            <label>Nombre completo</label>
            <input
              v-model="formulario.nombre"
              type="text"
              placeholder="Tu nombre"
              required
            />
          </div>

          <div class="form-group">
            <label>Correo electrónico</label>
            <input
              v-model="formulario.email"
              type="email"
              placeholder="email@ejemplo.com"
              required
            />
          </div>

          <div class="form-group">
            <label>Mensaje</label>
            <textarea
              v-model="formulario.mensaje"
              rows="5"
              placeholder="Cuéntanos cómo podemos ayudarte..."
              required
            ></textarea>
          </div>

          <button type="submit" class="btn-primary" :disabled="enviando">
            <span v-if="enviando">Enviando...</span>
            <span v-else>Enviar mensaje</span>
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Reset local para evitar que el padding rompa el layout */
* {
  box-sizing: border-box;
}

.mail {
  color: #10b981;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.mail:hover {
  color: #059669;
}

.contacto-section {
  padding: 5rem 1.5rem;
  background-color: #fcfcfc;
  display: flex;
  justify-content: center;
}

.contacto-wrapper {
  max-width: 1200px; /* Un poco más de margen para que respire */
  width: 100%;
  display: flex;
  gap: 5rem; /* Espacio generoso entre columnas */
  align-items: flex-start; /* Alineado arriba para que no flote en el centro */
}

/* Columna de info: ocupa el 40% aprox */
.info-contacto {
  flex: 0 0 40%;
}

.resaltar {
  color: #10b981;
}

.subtitle {
  display: block;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
}

.info-contacto h1 {
  font-size: 2.8rem;
  margin: 0.5rem 0 1.5rem 0;
  color: #333;
  line-height: 1.2;
}

.intro-desc {
  color: #666;
  margin-bottom: 3rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

/* Lista de datos */
.datos-lista {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dato-item {
  display: flex;
  gap: 1.2rem;
  align-items: flex-start;
  text-align: left;
}

.icon-circle {
  background: #1e1b4b; /* Un tono oscuro más acorde al morado */
  color: white;
  width: 45px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.dato-item h4 {
  margin: 0 0 0.3rem 0;
  color: #4c1d95;
  font-size: 1.1rem;
  font-weight: 700;
}

.dato-item p {
  margin: 0;
  color: #555;
  line-height: 1.4;
}

/* Formulario: ocupa el resto del espacio (aprox 60%) */
.formulario-container {
  flex: 1;
  width: 100%;
}

.form-card {
  background: white;
  padding: 4rem; /* Más padding para que se vea robusto */
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 600;
  color: #1e1b4b;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-family: inherit;
  font-size: 1rem;
  background-color: #f8fafc;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #10b981;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.btn-primary {
  width: 100%;
  background: #4c1d95;
  color: white;
  border: none;
  padding: 1.2rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.btn-primary:hover {
  background: #3b1675;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(76, 29, 149, 0.2);
}

/* Responsive */
@media (max-width: 1024px) {
  .contacto-wrapper {
    gap: 3rem;
  }
  .info-contacto h1 {
    font-size: 2.2rem;
  }
}

@media (max-width: 900px) {
  .contacto-wrapper {
    flex-direction: column;
    gap: 3rem;
  }

  .info-contacto,
  .formulario-container {
    width: 100%;
    flex: none;
  }

  .info-contacto {
    text-align: center;
  }

  .dato-item {
    justify-content: center;
    text-align: left;
  }

  .form-card {
    padding: 2rem;
  }
}
</style>
