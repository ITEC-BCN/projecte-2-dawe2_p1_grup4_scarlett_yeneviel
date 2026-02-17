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
        <router-link to="/login" class="btn-link">
          <button class="btn-primary">Empezar ahora</button>
        </router-link>
        <router-link to="/ofertas" class="btn-link">
          <button class="btn-secondary">Ver ofertas</button>
        </router-link>
      </div>
    </section>
    <img src="/img/home1_img.jpg" alt="Home Image" />
  </main>
  <div class="info_extra">
    <div class="avatarGroup">
      <img src="/img/avatarGroup.png" alt="Avatar Group" />
      <p>+5.000 Estudiantes ya confían en nosotros</p>
    </div>
  </div>
  <section>
    <div>
      <h1>Perfiles para cada <strong class="resaltar">Necesidad</strong></h1>
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
  padding: 1.5rem;
  gap: 2rem;
}

main img {
  flex: 1;
  max-width: 100%;
  border-radius: 10px;
}

/* H1 principal */
h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.resaltar {
  color: #10b981;
}

/* Párrafo principal */
main p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

/* Botonera contenedor */
.botonera {
  display: flex;
  margin-right: 1.5rem;
}

/* Ajuste para que el link no rompa el diseño */
.btn-link {
  flex: 1; /* Esto hace que ambos botones ocupen el mismo espacio */
  text-decoration: none;
}

.botonera button {
  width: 100%; /* Ahora sí ocupará el 100% de su router-link */
  padding: 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Botón "Empezar ahora" (Clase específica) */
.btn-primary {
  background: #4C1D95;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #3b1675;
}

/* Botón "Ver ofertas" (Clase específica) */
.btn-secondary {
  background: white;
  color: #10b981; 
  border: 2px solid #10b981;
}

.btn-secondary:hover {
  background: #f0fdf4;
}

.avatarGroup {
  display: flex;
  align-items: center; /* Centra el texto con la imagen */
  gap: 0.6rem; /* Espacio entre imagen y texto */
  width: max-content; /* Que solo ocupe el tamaño necesario */
  margin-top: 1rem; /* Separación de contenido anterior */
}

.avatarGroup img {
  width: 200px; /* Tamaño pequeño */
  height: auto;
  object-fit: cover; /* Que no se deforme */
}

.avatarGroup p {
  margin: 0;
  font-size: 0.9rem; /* Texto más discreto */
  color: #555;
  white-space: nowrap; /* Evita que se divida en varias líneas */
}

/* Título y párrafo */
section {
  text-align: left;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

section h3 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

section p {
  font-size: 1.1rem;
  color: #555;
}

/* Cards container - Ajustamos el espaciado entre cards */
section > div:last-child {
  display: flex;
  gap: 1rem; /* Reducimos el espacio entre ellas */
  flex-wrap: wrap;
}

/* Individual card - Reducimos el ancho base y el padding */
.card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 1rem; /* Relleno interno más pequeño */
  flex: 1 1 150px; /* Bajamos de 200px a 150px para que sean más estrechas */
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

/* Card images - Tamaño de iconos más contenido */
.card img {
  width: 45px; /* Bajamos de 60px a 45px */
  height: 45px;
  object-fit: contain;
  margin-bottom: 0.5rem;
}

/* Card titles - Fuente más pequeña */
.card h4 {
  font-size: 1rem; /* Bajamos de 1.2rem a 1rem */
  margin-bottom: 0.3rem;
  font-weight: 700;
}

/* Card paragraphs - Texto más compacto */
.card p {
  font-size: 0.85rem; /* Bajamos de 1rem a 0.85rem */
  color: #666;
  line-height: 1.3;
}

.info_extra {
  margin-top: -30px;
  margin-bottom: 50px;
}
</style>
