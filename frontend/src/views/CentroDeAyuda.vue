<script setup>
import { ref } from "vue";

const categorias = ref([
  {
    titulo: "Estudiantes",
    icon: "fa-solid fa-graduation-cap",
    preguntas: [
      {
        titulo: "¿Cómo aplico?",
        descripcion: "1. Ve a ofertas.\n2. Selecciona la práctica.\n3. Pulsa 'Aplicar'."
      },
      {
        titulo: "Subir CV",
        descripcion: "En 'Editar perfil', sube tu CV en PDF y guarda cambios."
      }
    ]
  },
  {
    titulo: "Empresas",
    icon: "fa-solid fa-building",
    preguntas: [
      {
        titulo: "Publicar oferta",
        descripcion: "Accede al panel, pulsa 'Publicar' y completa los datos."
      },
      {
        titulo: "Convenios",
        descripcion: "Revisa los datos del alumno y acepta el documento legal."
      }
    ]
  },
  {
    titulo: "Legal",
    icon: "fa-solid fa-scale-balanced",
    preguntas: [
      {
        titulo: "Seguro escolar",
        descripcion: "Cubre todo el periodo de prácticas establecido en convenio."
      },
      {
        titulo: "Horas máximas",
        descripcion: "No pueden superar el límite marcado por el centro educativo."
      }
    ]
  }
]);

const preguntaActiva = ref(null);

function togglePregunta(catIndex, pregIndex) {
  const id = `${catIndex}-${pregIndex}`;
  preguntaActiva.value = preguntaActiva.value === id ? null : id;
}
</script>

<template>
  <div class="ayuda-wrapper">
    <section class="ayuda-container">
      
      <header class="ayuda-header">
        <span class="resaltar-label">Soporte ITB</span>
        <h1>Centro de <span class="resaltar">Ayuda</span></h1>
        <p class="intro-text">Respuestas rápidas a tus dudas.</p>
      </header>

      <div class="cards-container">
        <article v-for="(cat, catIndex) in categorias" :key="catIndex" class="ayuda-card">
          <header class="card-header">
            <div class="icon-box">
              <i :class="cat.icon"></i>
            </div>
            <h2>{{ cat.titulo }}</h2>
          </header>

          <div class="card-body">
            <div
              v-for="(preg, pregIndex) in cat.preguntas"
              :key="pregIndex"
              class="punto-ayuda"
              @click="togglePregunta(catIndex, pregIndex)"
              :class="{ 'is-active': preguntaActiva === `${catIndex}-${pregIndex}` }"
            >
              <div class="check-box">
                <i class="fa-solid fa-question"></i>
              </div>
              <div class="contenido">
                <h3>{{ preg.titulo }}</h3>
                <p v-if="preguntaActiva === `${catIndex}-${pregIndex}`" class="respuesta">
                  {{ preg.descripcion }}
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <footer class="ayuda-footer">
        <p>¿No encuentras lo que buscas?</p>
        <a href="mailto:secretaria@itb.cat" class="btn-primary">
          <i class="fa-solid fa-envelope"></i>
          Contacta con nosotros
        </a>
      </footer>

    </section>
  </div>
</template>

<style scoped>
/* Tipografía */
.ayuda-wrapper {
  width: 100%;
  background-color: #f9f9f9;
  display: flex;
  justify-content: center;

}

.ayuda-container {
  padding: 3rem 1.5rem;
  width: 100%;
  max-width: 1200px; /* Ancho optimizado */
}

.ayuda-header {
  text-align: center;
  margin-bottom: 3rem;
}

.resaltar-label {
  color: #10b981;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 1px;
}

.ayuda-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin: 0.5rem 0;
}

.resaltar {
  color: #10b981;
}

.intro-text {
  color: #777;
  font-size: 1rem;
}

/* Grid de Cards */
.cards-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.ayuda-card {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  border-top: 6px solid #4C1D95; /* Color morado ITB */
  display: flex;
  flex-direction: column;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.icon-box {
  color: #4C1D95;
  font-size: 1.5rem;
}

.card-header h2 {
  color: #4C1D95;
  font-size: 1.3rem;
  margin: 0;
  font-weight: 700;
}

/* Preguntas compactas */
.punto-ayuda {
  display: flex;
  gap: 0.8rem;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  border-radius: 10px;
  border: 1px solid #eee;
  cursor: pointer;
  transition: all 0.2s;
}

.punto-ayuda:hover {
  border-color: #10b981;
}

.punto-ayuda.is-active {
  background: #f9f9fb;
  border-color: #4C1D95;
}

.check-box {
  background: #10b981;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  flex-shrink: 0;
  margin-top: 2px;
}

.contenido h3 {
  margin: 0;
  font-size: 1rem;
  color: #333;
  font-weight: 600;
}

.respuesta {
  margin-top: 0.5rem;
  color: #555;
  line-height: 1.5;
  font-size: 0.9rem;
  white-space: pre-line;
}

/* Footer estilo Legal */
.ayuda-footer {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
  text-align: center;
}

.ayuda-footer p {
  color: #777;
  margin-bottom: 1rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  background: #4C1D95;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s, background 0.2s;
}

.btn-primary:hover {
  transform: scale(1.02);
  background: #3b1675;
}

/* Responsivo */
@media (max-width: 992px) {
  .cards-container { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 650px) {
  .cards-container { grid-template-columns: 1fr; }
  .ayuda-header h1 { font-size: 2rem; }
}
</style>