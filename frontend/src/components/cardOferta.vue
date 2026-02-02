<script setup>
import {ref} from 'vue'
import { useFetch } from '../services/api';
/*const props=defineProps({
    oferta:Object
})*/

const url= ref(`http://localhost:3000/ofertas`)
const {data, error,loading, fetchData}=useFetch(url);
const emit=defineEmits(["verDetalleOferta"])

const verDetale=()=>{
    emit("verDetalleOferta")
}
</script>

<template>
    <div v-if="loading">
      <p>loading</p>
  </div>
  <div v-else-if="error">
    <p>Error: {{ error }}</p>
  </div>

  <div v-else>
      <!--Aquí ya se cargó los datos de la api-->
    <div  v-if="data && data.song" class="containerMeals">
        <span>{{ data.etiqueta }}</span>
        <h2>{{ data.nombre_empresa }}</h2>
        <p>{{ data.descripcion }}</p>
        <button @click="verDetale">Ver detalle</button>
    </div>
    </div>

    <div>
        
    </div>
</template>

<style scoped>
</style>