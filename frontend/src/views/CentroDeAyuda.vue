<script setup>
import { ref } from 'vue'

const categorias = ref([
  {
    titulo: 'Para Estudiantes',
    descripcion: 'Cómo aplicar a ofertas, editar tu CV y gestionar tus entrevistas.',
    icon: '🎓',
    preguntas: ['¿Cómo aplico a una práctica?', 'Subir mi currículum', 'Estado de mi candidatura']
  },
  {
    titulo: 'Para Empresas',
    descripcion: 'Publicación de vacantes, filtrado de candidatos y gestión de convenios.',
    icon: '🏢',
    preguntas: ['Publicar oferta', 'Filtrar perfiles junior', 'Validar convenios']
  },
  {
    titulo: 'Convenios y Legal',
    descripcion: 'Todo sobre la normativa de prácticas, seguros y acuerdos de universidad.',
    icon: '⚖️',
    preguntas: ['¿Qué es un convenio?', 'Seguro escolar', 'Horas máximas']
  }
])

const busqueda = ref('')
</script>

<template>
  <section class="ayuda-container">
    <header class="ayuda-header">
      <span class="resaltar subtitle">Centro de Ayuda</span>
      <h1>¿En qué podemos <span class="resaltar">ayudarte</span>?</h1>
      <div class="search-box">
        <input 
          v-model="busqueda" 
          type="text" 
          placeholder="Busca por palabras clave: 'Convenio', 'CV', 'Registro'..."
        />
        <button class="btn-primary">Buscar</button>
      </div>
    </header>

    <div class="cards-container">
      <article v-for="(cat, index) in categorias" :key="index" class="card-ayuda">
        <div class="icon-header">
          <span class="cat-icon">{{ cat.icon }}</span>
          <h3>{{ cat.titulo }}</h3>
        </div>
        <p>{{ cat.descripcion }}</p>
        
        <ul class="lista-ayuda">
          <li v-for="pregunta in cat.preguntas" :key="pregunta">
            <a href="#">{{ pregunta }}</a>
          </li>
        </ul>
        
        <button class="btn-secondary">Ver todo</button>
      </article>
    </div>

    <footer class="ayuda-footer">
      <p>¿No encuentras lo que buscas? <a href="#" class="resaltar">Contacta con soporte</a></p>
    </footer>
  </section>
</template>

<style scoped>
.ayuda-container {
  padding: 4rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.ayuda-header {
  text-align: center;
  margin-bottom: 5rem;
}

.subtitle {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 1.5px;
}

.ayuda-header h1 {
  font-size: 2.5rem;
  margin: 1rem 0 2rem;
  color: #333;
}

/* Buscador */
.search-box {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  gap: 0.5rem;
  background: white;
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.search-box input {
  flex: 1;
  border: none;
  padding: 0.8rem 1rem;
  font-size: 1rem;
  outline: none;
}

.btn-primary {
  background: #4C1D95;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

/* Cards */
.cards-container {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
}

.card-ayuda {
  background: #fff;
  border: 1px solid #f0f0f0;
  border-radius: 15px;
  padding: 2rem;
  flex: 1 1 300px;
  display: flex;
  flex-direction: column;
}

.icon-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.cat-icon {
  font-size: 2rem;
  background: #f3f0ff;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.card-ayuda h3 {
  color: #4C1D95;
  margin: 0;
}

.card-ayuda p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.lista-ayuda {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.lista-ayuda li {
  margin-bottom: 0.8rem;
}

.lista-ayuda a {
  color: #333;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
}

.lista-ayuda a:hover {
  color: #10b981;
  text-decoration: underline;
}

.btn-secondary {
  margin-top: auto;
  background: white;
  color: #10b981;
  border: 2px solid #10b981;
  padding: 0.6rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.3s;
}

.btn-secondary:hover {
  background: #f0fdf4;
}

.ayuda-footer {
  text-align: center;
  margin-top: 4rem;
  color: #777;
}

.resaltar { color: #10b981; }

@media (max-width: 768px) {
  .search-box {
    flex-direction: column;
  }
}
</style>