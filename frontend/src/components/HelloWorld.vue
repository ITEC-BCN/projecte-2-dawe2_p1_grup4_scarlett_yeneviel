<script setup>
import api from '@/services/api';

const { data } = await api.get('/users');

</script>

<template>
  <h1>Pruebas</h1>
  
</template>

<style scoped>

</style>
