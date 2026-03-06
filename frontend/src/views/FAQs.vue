<script setup>
import { ref } from 'vue'

const preguntas = ref([
  {
    interrogante: "¿Es necesario tener un convenio con mi centro de estudios?",
    respuesta: "Sí, para realizar prácticas externas es imprescindible que exista un convenio de colaboración educativa entre tu centro (universidad o instituto) y la empresa donde realizarás las prácticas.",
    abierta: false
  },
  {
    interrogante: "¿Las prácticas son remuneradas?",
    respuesta: "Depende de la oferta. En nuestra plataforma indicamos claramente si la práctica ofrece una 'ayuda al estudio' (remuneración) o si solo cubre los gastos de transporte.",
    abierta: false
  },
  {
    interrogante: "¿Puedo aplicar si ya he terminado mis estudios?",
    respuesta: "Generalmente las prácticas son para estudiantes activos. Sin embargo, si te has graduado recientemente, podrías optar a becas de postgrado o contratos de formación. Revisa los requisitos de cada oferta.",
    abierta: false
  },
  {
    interrogante: "¿Cómo sé si una empresa ha visto mi currículum?",
    respuesta: "En tu panel de usuario tienes un apartado de 'Mis Candidaturas' donde verás el estado en tiempo real: Inscrito, CV Leído, En Proceso o Descartado.",
    abierta: false
  }
])

const togglePregunta = (index) => {
  preguntas.value[index].abierta = !preguntas.value[index].abierta
}
</script>

<template>
  <section class="faq-section">
    <div class="faq-header">
      <h2 class="resaltar">Preguntas Frecuentes</h2>
      <p>Resolvemos tus dudas en un momento</p>
    </div>

    <div class="acordeon">
      <div 
        v-for="(item, index) in preguntas" 
        :key="index" 
        class="faq-item"
        :class="{ 'faq-item-active': item.abierta }"
      >
        <button class="faq-pregunta" @click="togglePregunta(index)">
          {{ item.interrogante }}
          <span class="flecha">{{ item.abierta ? '−' : '+' }}</span>
        </button>
        
        <div v-show="item.abierta" class="faq-respuesta">
          <p>{{ item.respuesta }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq-section {
  padding: 4rem 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.faq-header {
  text-align: center;
  margin-bottom: 3rem;
}

.resaltar {
  color: #10b981;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.acordeon {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.faq-item {
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item-active {
  border-color: #4C1D95;
  box-shadow: 0 4px 12px rgba(76, 29, 149, 0.1);
}

.faq-pregunta {
  width: 100%;
  padding: 1.5rem;
  background: white;
  border: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: color 0.3s;
}

.faq-pregunta:hover {
  color: #4C1D95;
}

.flecha {
  font-size: 1.5rem;
  color: #10b981;
  font-weight: bold;
}

.faq-respuesta {
  padding: 0 1.5rem 1.5rem;
  background: white;
  color: #666;
  line-height: 1.6;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>