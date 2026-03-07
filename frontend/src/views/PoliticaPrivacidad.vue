<script setup>
import { ref } from "vue";

const fechaVigencia = ref("06 de Marzo de 2026");

const puntosClave = ref([
  {
    titulo: "Responsable del Tratamiento",
    descripcion:
      "Los datos recogidos a través de esta plataforma son responsabilidad del Institut Tecnològic de Barcelona (ITB), con sede en Av. de l’Aiguablava, 121, 08033 Barcelona.",
  },
  {
    titulo: "Finalidad de los Datos",
    descripcion:
      "Utilizamos tu información exclusivamente para gestionar tu perfil profesional, permitirte aplicar a ofertas de prácticas y conectar tu talento con empresas del sector tecnológico.",
  },
  {
    titulo: "Cesión a Terceros",
    descripcion:
      "Al inscribirte en una oferta, autorizas que tus datos de contacto y CV sean compartidos con la empresa ofertante para que puedan evaluar tu candidatura.",
  },
  {
    titulo: "Tus Derechos (ARCO)",
    descripcion:
      "Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte al tratamiento de tus datos en cualquier momento enviando un correo a secretaria@itb.cat.",
  },
]);
</script>

<template>
  <section class="privacidad-container">
    <div class="privacidad-card">
      <header class="privacidad-header">
        <div class="shield-icon">
          <i class="fa-solid fa-shield-halved"></i>
        </div>

        <h1>Política de <span class="resaltar">Privacidad</span></h1>
        <p class="intro-text">
          Tu privacidad es nuestra prioridad. Aquí te explicamos cómo protegemos
          tus datos personales.
        </p>
      </header>

      <div class="privacidad-body">
        <article
          v-for="(punto, index) in puntosClave"
          :key="index"
          class="punto-privacidad"
        >
          <div class="check-box">✓</div>
          <div class="contenido">
            <h3>{{ punto.titulo }}</h3>
            <p>{{ punto.descripcion }}</p>
          </div>
        </article>

        <div class="info-adicional">
          <p>
            <strong>Conservación:</strong> Mantendremos tus datos mientras tu
            cuenta esté activa o mientras sea necesario para cumplir con los
            convenios de prácticas vigentes.
          </p>
        </div>
      </div>

      <footer class="privacidad-footer">
        <p>Versión actualizada el {{ fechaVigencia }}</p>
        <div class="botones-footer">
          <button class="btn-secondary">Configurar Cookies</button>
          <button class="btn-primary">Aceptar y Continuar</button>
        </div>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.privacidad-container {
  padding: 4rem 1.5rem;
  background-color: #f8fafc;
  display: flex;
  justify-content: center;
}

.privacidad-card {
  background: white;
  max-width: 850px;
  width: 100%;
  padding: 3rem;
  border-radius: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06);
  border-top: 6px solid #4c1d95; /* Detalle con el color principal */
}

.privacidad-header {
  text-align: center;
  margin-bottom: 3rem;
}

.shield-icon {
  font-size: 4rem; /* Un poco más grande para que destaque */
  margin-bottom: 1.5rem;
  color: black; /* Color morado de Internia */
  /* Opcional: un ligero efecto de brillo */
  filter: drop-shadow(0 4px 6px rgba(76, 29, 149, 0.2));
}

.resaltar {
  color: #10b981;
}

.privacidad-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.intro-text {
  color: #666;
  font-size: 1.1rem;
}

.punto-privacidad {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background: #fdfdfd;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  transition: transform 0.2s;
}

.punto-privacidad:hover {
  transform: translateX(5px);
  border-color: #10b981;
}

.check-box {
  background: #10b981;
  color: white;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: bold;
  flex-shrink: 0;
}

.contenido h3 {
  margin: 0 0 0.5rem 0;
  color: #4c1d95;
  font-size: 1.2rem;
}

.contenido p {
  margin: 0;
  color: #555;
  line-height: 1.6;
}

.info-adicional {
  background: #f3f0ff;
  padding: 1.2rem;
  border-radius: 10px;
  color: #4c1d95;
  font-size: 0.95rem;
  margin-bottom: 3rem;
}

.privacidad-footer {
  text-align: center;
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.privacidad-footer p {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 1.5rem;
}

.botones-footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn-primary {
  background: #4c1d95;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-secondary {
  background: white;
  color: #4c1d95;
  border: 2px solid #4c1d95;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 600px) {
  .privacidad-card {
    padding: 1.5rem;
  }
  .botones-footer {
    flex-direction: column;
  }
  .punto-privacidad {
    flex-direction: column;
    gap: 0.8rem;
  }
}
</style>
