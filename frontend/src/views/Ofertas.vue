<script setup>
import {ref} from 'vue'
import { useFetch } from '../composables/useFetch';
import CardOferta from '../components/cardOferta.vue';

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
    <section  v-if="data && data" class="card">
        <CardOferta v-for="oferta in data" :key="oferta.id"
        :oferta="oferta"
        @verDetalleOferta="verDetale"
        />

    </section>
    </div>

    <div>
        
    </div>
</template>

<style scoped>


</style>