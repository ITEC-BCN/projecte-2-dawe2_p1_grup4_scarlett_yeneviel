<script setup>
import { ref } from "vue";

// Datos
const equipo = ref([
  {
    nombre: "Silvia Serra",
    rol: "Frontend Developer",
    especialidad: "Maquetación y estilos",
    img: new URL('@/assets/silvia.jpg', import.meta.url).href,
    descripcion:
      "Especialista en interfaces visuales y experiencia de usuario adaptable.",
  },
  {
    nombre: "Scarlett Toala",
    rol: "Fullstack Developer",
    especialidad: "Backend",
    img: "https://via.placeholder.com/150",
    descripcion:
      "Enfocada en la lógica de servidor, APIs y arquitectura robusta.",
  },
  {
    nombre: "Yeneviel Roberts",
    rol: "Fullstack Developer",
    especialidad: "Base de Datos",
    img: "https://via.placeholder.com/150",
    descripcion:
      "Experta en el diseño, gestión y optimización de grandes volúmenes de datos.",
  },
]);
</script>

<template>
  <footer class="perfiles">
    <div class="header-section">
      <span class="resaltar subtitle">Talento y Compromiso</span>
      <h1>Sobre <span class="resaltar">nosotras</span></h1>
      <p class="intro-texto">
        Somos un equipo multidisciplinar apasionado por la tecnología y la educación. <br>
        Combinamos nuestras especialidades para crear la mejor experiencia en la formación dual de FP.
      </p>
    </div>

    <div class="cards-container">
      <article v-for="(miembro, index) in equipo" :key="index" class="card">
        <img :src="miembro.img" :alt="miembro.nombre" class="avatar-img" />
        <h2 class="nombre">{{ miembro.nombre }}</h2>
        <p class="resaltar rol-tag">{{ miembro.rol }}</p>
        <p class="descripcion">
          <strong>{{ miembro.especialidad }}</strong>: {{ miembro.descripcion }}
        </p>
      </article>
    </div>
  </footer>
</template>

<style scoped>
.resaltar {
  color: #10b981;
}
.header-section {
  max-width: 800px; 
  margin-bottom: 3rem;
  text-align: left;
}

.subtitle {
  display: block;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 2px;
  margin-bottom: 0.5rem;
}

.nombre {
  color: #4C1D95;
  font-size: 1.8rem; 
  font-weight: 800;   
  margin-bottom: 0.2rem;
  letter-spacing: -0.5px;
}

.perfiles {
  text-align: left;
  padding: 2rem 1.5rem;
  margin-top: 0.5rem;
  border-top: 1px solid #eee;
}

.perfiles h1 {
  font-size: 3rem;
  margin-bottom: 2rem;
  font-weight: 700;
}

.intro-texto {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
}

.cards-container {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.card {
  background: #f9f9f9;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  flex: 1 1 280px;
  max-width: 350px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  margin-bottom: 1.2rem;
  border: 3px solid #10b981;
  padding: 3px;
}

.card h4 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.rol-tag {
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  margin-bottom: 1rem;
}

.card p.descripcion {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.6;
}

/* Responsivo */
@media (max-width: 768px) {
  .perfiles {
    text-align: center;
  }

  .cards-container {
    flex-direction: column;
    align-items: center;
  }

  .card {
    width: 100%;
    max-width: none;
  }
}
</style>
