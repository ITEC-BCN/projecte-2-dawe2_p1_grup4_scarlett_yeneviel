<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api.js'

const ofertas = ref([])
const error = ref(null)
const API_URL = 'https://expert-space-robot-97j5v99r4575cr64-5173.app.github.dev/'

const cargarOfertas = async () => {
  try {
    const res = await api.get(`${API_URL}`,{
      withCredentials: true
    })
    if (!res.data) throw new Error('Error al cargar ofertas')

    const data = await res.data
    ofertas.value = data
    console.log('JSON:', data)
  } catch (err) {
    error.value = err.message
    console.error(err)
  }
}

onMounted(cargarOfertas)
</script>

<template>
  <div>
    <h2>Ofertas</h2>

    <p v-if="error" style="color:red">{{ error }}</p>

    <pre>{{ ofertas }}</pre>
  </div>
</template>
