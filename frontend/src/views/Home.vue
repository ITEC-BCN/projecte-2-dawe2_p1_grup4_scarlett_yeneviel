<script setup>
import { ref, onMounted } from 'vue';
import { checkAuthStatus, isAuthenticated } from '@/js/role.js';

const startLink = ref('/login');

onMounted(async () => {
  await checkAuthStatus();
  startLink.value = isAuthenticated.value ? '/ofertas' : '/login';
});

</script>

<template>
  <main>
    <section class="hero-text">
      <h1>
        Impulsa tu carrera <strong class="resaltar">FP</strong> con las mejores
        prácticas
      </h1>
      <p>
        La plataforma definitiva que conecta estudiantes con empresas
        innovadoras y centros educativos para una formación dual.
      </p>
      <div class="botonera">
        <router-link :to="startLink" class="btn-link">
          <button class="btn-primary">Empezar ahora</button>
        </router-link>
        <router-link to="/ofertas" class="btn-link">
          <button class="btn-secondary">Ver ofertas</button>
        </router-link>
      </div>

      <div class="info_extra">
        <div class="avatarGroup">
          <img src="/img/avatarGroup.png" alt="Avatar Group" />
          <p>+5.000 Estudiantes ya confían en nosotros</p>
        </div>
      </div>
      </section>
    <img src="/img/home1_img.jpg" alt="Home Image" class="home-img" />
  </main>

  <section class="perfiles">
    <div>
      <h1>Perfiles para cada <strong class="resaltar">Necesidad</strong></h1>
    </div>
    <div class="cards-container">
      <article class="card">
        <img src="/img/sombrero.png" alt="" />
        <h4>Estudiantes</h4>
        <p>Encuentra prácticas alineadas con tu ciclo formativo.</p>
      </article>
      <article class="card">
        <img src="/img/maleta.png" alt="" />
        <h4>Profesionales</h4>
        <p>Mentoriza y guía a la nueva generación de expertos.</p>
      </article>
      <article class="card">
        <img src="/img/empresario.png" alt="" />
        <h4>Empresas</h4>
        <p>Descubre nuevos talentos para tus proyectos.</p>
      </article>
      <article class="card">
        <img src="/img/instituto.png" alt="" />
        <h4>Centros Educativos</h4>
        <p>Gestiona convenios y validaciones de forma ágil.</p>
      </article>
    </div>
  </section>
</template>
<style scoped>

.resaltar {
  color: var(--accent);
}

/* =========================
   LAYOUT GENERAL
========================= */
main,
.perfiles {
  width: 90%;
  max-width: 1200px;
  margin-inline: auto;
  padding: clamp(1rem, 3vw, 2rem);
}

/* =========================
   HERO
========================= */
main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: center;
}

/* Texto */
.hero-text {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

main h1 {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1.2;
  color: var(--text);
  margin: 0;
}

main p {
  font-size: clamp(1rem, 1.3vw, 1.1rem);
  color: var(--muted);
  line-height: 1.6;
  margin: 0;
}

/* Imagen */
.home-img {
  width: 100%;
  height: auto;
  max-height: 420px;
  object-fit: cover;
  border-radius: 12px;
}

/* =========================
   BOTONES
========================= */
.botonera {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
  max-width: 420px;
}

.btn-link {
  flex: 1;
  min-width: 140px;
}

.botonera button {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  font-size: 1rem;
  transition: 0.2s ease;
}

.btn-primary {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background: var(--primary);
  color: white;
  padding: 12px 16px;
  border-radius: 10px;
  cursor: pointer;
}

.btn-primary:hover {
  background: #3b1675;
}

.btn-secondary {
  color: var(--accent);
  border: 2px solid var(--accent);
}

.btn-secondary:hover {
  background: #f0fdf4;
}

/* =========================
   INFO EXTRA
========================= */
.info_extra {
  margin-top: 1rem;
}

.avatarGroup {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.avatarGroup img {
  width: 120px;
  max-width: 100%;
}

.avatarGroup p {
  font-size: 0.9rem;
  color: var(--muted);
  margin: 0;
}

/* =========================
   PERFILES
========================= */
.perfiles h1 {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  margin-bottom: 1.5rem;
  text-align: center;
}

/* GRID PRINCIPAL */
.cards-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  width: 100%;
}

/* CARD */
.card {
  background: #f9f9f9;
  border-radius: 14px;
  padding: 1.5rem;
  text-align: center;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);

  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
}

.card img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.card h4 {
  font-size: 1.1rem;
  margin: 0;
  color: var(--text, #111827);
}

.card p {
  font-size: 0.95rem;
  color: var(--muted, #6b7280);
  margin: 0;
  line-height: 1.4;
}

/* =========================
   RESPONSIVE BREAKPOINTS
========================= */

@media (max-width: 1024px) {
  .cards-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Tablet */
@media (max-width: 900px) {
  main {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .hero-text {
    align-items: center;
  }

  .botonera {
    justify-content: center;
    max-width: 100%;
  }

  .avatarGroup {
    justify-content: center;
  }
}

/* Mobile */
@media (max-width: 600px) {
  .home-img {
    max-height: 220px;
  }

  .btn-link {
    flex: 1 1 100%;
  }

  .cards-container {
    grid-template-columns: 1fr;
  }

  .card {
    padding: 1.25rem;
  }
  
  .card img {
    width: 50px;
    height: 50px;
  }

}

/* Extra pequeño (WCAG / móviles muy pequeños) */
@media (max-width: 360px) {
  main {
    padding: 1rem;
  }

  .avatarGroup img {
    width: 90px;
  }

  .botonera {
    gap: 0.75rem;
  }
} 
</style>