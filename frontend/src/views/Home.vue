<script setup></script>

<template>
  <main>
    <section>
      <h1>
        Impulsa tu carrera <strong class="resaltar">FP</strong> con las mejores
        prácticas
      </h1>
      <p>
        La plataforma definitiva que conecta estudiantes con empresas
        innovadoras y centros educativos para una formación dual.
      </p>
      <div class="botonera">
        <button>Empezar ahora</button>
        <button>Ver ofertas</button>
      </div>
    </section>
    <img src="/img/home1_img.jpg" alt="Home Image" />
  </main>
  <section class="info_extra">
    <div class="avatarGroup">
        <img src="/img/avatarGroup.png" alt="Avatar Group" />
        <p>+5.000 Estudiantes ya confían en nosotros</p>
      </div>
  </section>
  <section>
    <div>
      <h3>Perfiles para cada necesidad</h3>
      <p>Nuestra plataforma se adapta a todos los actores de FP</p>
    </div>
    <div>
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

/* Main */
main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  gap: 2rem;
}

main section {
  flex: 1;
}

main img {
  flex: 1;
  max-width: 100%;
  border-radius: 10px;
}

/* H1 principal */
h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.resaltar {
  color:#10b981;
}

/* Párrafo principal */
main p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

/* Botonera */
.botonera {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.botonera button {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Botón "Empezar ahora" */
.botonera button:first-child {
  background: #4C1D95;
  color: white;
  border: none;
}

/* Botón "Ver ofertas" */
.botonera button:last-child {
  background: white;
  color: var(--accent-green);
  border: 2px solid var(--accent-green);
}

.avatarGroup {
  display: flex;
  align-items: center; /* Centra el texto con la imagen */
  gap: 0.6rem;        /* Espacio entre imagen y texto */
  width: max-content; /* Que solo ocupe el tamaño necesario */
  margin-top: 1rem;   /* Separación de contenido anterior */
}

.avatarGroup img {
  width: 200px;        /* Tamaño pequeño */
  height: auto;
  object-fit: cover;  /* Que no se deforme */
}

.avatarGroup p {
  margin: 0;
  font-size: 0.9rem;  /* Texto más discreto */
  color: #555;
  white-space: nowrap; /* Evita que se divida en varias líneas */
}


/* Segunda sección */
section {
  padding: 1rem 2rem;
}

/* Título y párrafo */
section {
  text-align: left;
  margin-bottom: 2rem;
}

section h3 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

section p {
  font-size: 1.1rem;
  color: #555;
}

/* Cards container */
section > div:last-child {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

/* Individual card */
.card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 1.5rem;
  flex: 1 1 200px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* Card images */
.card img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-bottom: 1rem;
}

/* Card titles */
.card h4 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

/* Card paragraphs */
.card p {
  font-size: 1rem;
  color: #555;
}
</style>

