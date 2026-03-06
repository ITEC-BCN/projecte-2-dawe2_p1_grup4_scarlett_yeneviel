<script setup>
import { ref } from 'vue'

const fechaActualizacion = ref('06 de Marzo de 2026')

const secciones = ref([
  {
    id: 'aceptacion',
    titulo: '1. Aceptación de los Términos',
    contenido: 'Al acceder y utilizar esta plataforma de búsqueda de prácticas del ITB, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo, por favor, no utilices el servicio.'
  },
  {
    id: 'estudiantes',
    titulo: '2. Uso para Estudiantes',
    contenido: 'Los estudiantes se comprometen a proporcionar información veraz en su currículum. La inscripción en una oferta no garantiza la obtención de la práctica, la cual depende del proceso de selección de la empresa.'
  },
  {
    id: 'empresas',
    titulo: '3. Responsabilidad de las Empresas',
    contenido: 'Las empresas que publiquen ofertas deben cumplir con la normativa vigente sobre prácticas académicas externas y garantizar un entorno de aprendizaje adecuado para el alumno.'
  },
  {
    id: 'privacidad',
    titulo: '4. Privacidad y Datos',
    contenido: 'Tus datos serán tratados conforme al RGPD. El ITB actúa como intermediario para facilitar la conexión entre el talento académico y el mundo laboral.'
  }
])
</script>

<template>
  <section class="terms-container">
    <div class="terms-card">
      <header class="terms-header">
        <span class="resaltar">Documentación Legal</span>
        <h1>Términos de <span class="resaltar">Servicio</span></h1>
        <p class="last-update">Última actualización: {{ fechaActualizacion }}</p>
      </header>

      <div class="terms-content">
        <div v-for="seccion in secciones" :key="seccion.id" class="terms-section">
          <h3>{{ seccion.titulo }}</h3>
          <p>{{ seccion.contenido }}</p>
        </div>
      </div>

      <footer class="terms-footer">
        <p>Si tienes dudas sobre estos términos, contacta con <a href="mailto:secretaria@itb.cat">secretaria@itb.cat</a></p>
        <button class="btn-primary">Descargar en PDF</button>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.terms-container {
  padding: 4rem 1.5rem;
  background-color: #f4f4f9;
  display: flex;
  justify-content: center;
}

.terms-card {
  background: white;
  max-width: 900px;
  width: 100%;
  padding: 3rem;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
}

.terms-header {
  text-align: center;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 2rem;
  margin-bottom: 2rem;
}

.resaltar {
  color: #10b981;
  font-weight: 700;
}

.terms-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin: 0.5rem 0;
}

.last-update {
  font-size: 0.9rem;
  color: #999;
}

.terms-content {
  text-align: left;
}

.terms-section {
  margin-bottom: 2rem;
}

.terms-section h3 {
  color: #4C1D95;
  font-size: 1.3rem;
  margin-bottom: 0.8rem;
}

.terms-section p {
  color: #555;
  line-height: 1.7;
  font-size: 1.05rem;
}

.terms-footer {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #eee;
  text-align: center;
}

.terms-footer p {
  color: #777;
  margin-bottom: 1.5rem;
}

.terms-footer a {
  color: #10b981;
  text-decoration: none;
  font-weight: 600;
}

.btn-primary {
  background: #4C1D95;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-primary:hover {
  transform: scale(1.02);
  background: #3b1675;
}

/* Responsivo */
@media (max-width: 600px) {
  .terms-card {
    padding: 1.5rem;
  }
  .terms-header h1 {
    font-size: 1.8rem;
  }
}
</style>