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
        <router-link to="/login" class="btn-link">
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
/* Estilos Globales/Utiles */
.resaltar {
  color: #10b981;
}

/* --- MAIN (Hero Section) --- */
main {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  padding: 1.5rem;
  gap: 2rem;
  margin: 2rem 0; 

}

.hero-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centra el texto verticalmente respecto a la imagen */
}

.home-img {
  flex: 1;
  max-width: 52%; 
  object-fit: cover; /* Asegura que la imagen cubra el área sin deformarse */
  border-radius: 10px;
}

/* Títulos y Párrafos Main */
main h1 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  margin-top: 0; /* Quita márgenes por defecto */
}

main p {
  font-size: 1.1rem;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  color: #333;
}

/* Botonera */
.botonera {
  display: flex;
  gap: 1rem; /* Espacio entre botones más limpio */
  margin-bottom: 2rem; /* Espacio antes de los avatares */
  max-width: 400px; /* Opcional: limita el ancho de la botonera */
}

.btn-link {
  flex: 1;
  text-decoration: none;
}

.botonera button {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-primary {
  background: #4C1D95;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #3b1675;
}

.btn-secondary {
  background: white;
  color: #10b981;
  border: 2px solid #10b981;
}

.btn-secondary:hover {
  background: #f0fdf4;
}

/* --- Info Extra (Avatares) --- */
.info_extra {
  margin-top: 1rem;
}

.avatarGroup {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.avatarGroup img {
  width: 150px; 
  height: auto;
}

.avatarGroup p {
  margin: 0;
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
}

/* --- SECCIÓN PERFILES (Cards) --- */
.perfiles {
  text-align: left;
  padding: 0 1.5rem; /* Alineado con el padding del main */
  margin-bottom: 3rem;
}

.perfiles h1 {
  font-size: 2rem;
  margin-bottom: 1.5rem;
}

.cards-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.card {
  background: #f9f9f9;
  border-radius: 10px;
  padding: 1.5rem 1rem;
  flex: 1 1 200px; /* Un poco más de ancho base */
  text-align: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card img {
  width: 50px;
  height: 50px;
  object-fit: contain;
  margin-bottom: 1rem;
}

.card h4 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  margin-top: 0;
  font-weight: 700;
  color: #333;
}

.card p {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

/* Responsivo básico */
@media (max-width: 768px) {
  main {
    flex-direction: column-reverse; /* Imagen arriba en móvil */
  }
  .home-img {
    max-width: 100%;
    height: 250px; /* Altura fija en móvil */
  }
  .botonera {
    margin-right: 0;
  }
}
</style>