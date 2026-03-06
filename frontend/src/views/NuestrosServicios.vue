<script setup>
import { ref } from 'vue'

const servicios = ref([
  {
    titulo: 'Perfil Profesional',
    icono: '👤', // Puedes sustituir por SVG o FontAwesome
    descripcion: 'Crea un perfil optimizado para destacar tus habilidades académicas y proyectos personales ante las empresas.',
    tag: 'Talento'
  },
  {
    titulo: 'Match de Prácticas',
    icono: '🎯',
    descripcion: 'Nuestro algoritmo te conecta con las ofertas que realmente encajan con tu formación y aspiraciones.',
    tag: 'Inteligencia'
  },
  {
    titulo: 'Gestión de Convenios',
    icono: '📝',
    descripcion: 'Simplificamos la burocracia entre tu universidad y la empresa para que empieces cuanto antes.',
    tag: 'Agilidad'
  }
])
</script>

<template>
  <section class="servicios-section">
    <div class="header-servicios">
      <p class="resaltar subtitle">¿Qué ofrecemos?</p>
      <h1>Impulsamos tu <span class="resaltar">carrera</span></h1>
      <p class="intro-text">
        Hemos creado la herramienta definitiva para que encontrar tus primeras prácticas sea tan sencillo como hacer un click.
      </p>
    </div>

    <div class="cards-container">
      <article v-for="(servicio, index) in servicios" :key="index" class="card-servicio">
        <div class="icon-box">{{ servicio.icono }}</div>
        <span class="service-tag">{{ servicio.tag }}</span>
        <h4>{{ servicio.titulo }}</h4>
        <p>{{ servicio.descripcion }}</p>
        <button class="btn-mini">Saber más</button>
      </article>
    </div>
  </section>
</template>

<style scoped>
.servicios-section {
  padding: 4rem 1.5rem;
  background-color: #fff;
  max-width: 1200px;
  margin: 0 auto;
}

.header-servicios {
  text-align: center;
  margin-bottom: 4rem;
}

.subtitle {
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 2px;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.resaltar {
  color: #10b981;
}

.intro-text {
  max-width: 600px;
  margin: 1rem auto;
  color: #666;
  font-size: 1.1rem;
}

.cards-container {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.card-servicio {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 15px;
  padding: 2.5rem 1.5rem;
  flex: 1 1 300px;
  max-width: 380px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Alineación a la izquierda para variar del footer */
  text-align: left;
}

.card-servicio:hover {
  border-color: #4C1D95;
  box-shadow: 0 10px 30px rgba(76, 29, 149, 0.1);
  transform: translateY(-5px);
}

.icon-box {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  background: #f3f0ff;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.service-tag {
  background: #10b98120;
  color: #10b981;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.card-servicio h4 {
  font-size: 1.4rem;
  color: #4C1D95; /* Usamos el violeta para los títulos de servicios */
  margin-bottom: 1rem;
}

.card-servicio p {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.btn-mini {
  background: transparent;
  border: none;
  color: #4C1D95;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  font-size: 0.9rem;
  text-decoration: underline;
}

/* Responsivo */
@media (max-width: 768px) {
  .card-servicio {
    max-width: 100%;
  }
}
</style>