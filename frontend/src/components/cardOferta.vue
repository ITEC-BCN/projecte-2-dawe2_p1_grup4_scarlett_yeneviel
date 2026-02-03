<script setup>
import {ref} from 'vue'
import { useFetch } from '../services/api';
/*const props=defineProps({
    oferta:Object
})*/

const url= ref(`https://effective-invention-7vpw99955p743wwg6-3000.app.github.dev/ofertas`)
const {data, error,loading, fetchData}=useFetch(url);
const emit=defineEmits(["verDetalleOferta"])

console.log(data)
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
    <div  v-if="data && data[0]" class="card">
        <span>{{ data[0].etiqueta }}</span>
        <h2>{{ data[0].nombre_empresa }}</h2>
        <p>{{ data[0].descripcion }}</p>
        <button @click="verDetale">Ver detalle</button>
    </div>
    </div>

    <div>
        
    </div>
</template>

<style scoped>

</style>