<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFetch } from '../composables/useFetch';

const route = useRoute();
const router = useRouter();

// Construimos la URL usando el ID que viene en la ruta
const url = ref(`http://localhost:3000/ofertas/${route.params.id}`);
const { data: oferta, error, loading } = useFetch(url);

const volver = () => router.back();
</script>

<template>
    <!--Contenedor Principal-->
    <div class="container">
        <button @click="volver" class="btn-volver">
             ← Volver al detalle
        </button>

        <!-- Estados -->
      <div v-if="loading" class="state-msg">
        Cargando detalles...
      </div>

      <div v-else-if="error" class="state-msg error">
        Error al cargar la oferta
      </div>

      <!--Formulario-->
      <div v-else-if="oferta">

      
        <form id="formPutOferta">
            <label for="puesto">Nombre del puesto:</label>
            <input  type="text" id="puesto" name="puesto" :value="oferta.tipo_puesto" />

            <label for="nombre_empresa">Nombre de la empresa:</label>
            <input  type="text" id="empresa" name="nombre_empresa" :value="oferta.nombre_empresa" />

            <label for="funciones_puesto">funciones del puesto:</label>
            <textarea id="funciones" name="funciones_puesto" > 
                {{ oferta.funciones }}
            </textarea>


            <label for="beneficios">Beneficios:</label>
            <textarea   id="beneficios" name="beneficios"> 
                {{ oferta.beneficios }}
            </textarea>

            <label for="beneficios">Requisitos:</label>
            <textarea  id="requisitos" name="beneficios" >
                {{ oferta.beneficios }}
            </textarea>

            <label for="fecha_expiracion">Fecha de expiración</label>
            <input type="date" id="fecha_expiracion" name="fecha_expiracion" :value="oferta.fecha_expiracion"/>

            <button class="btn-submit ">Actualizar oferta</button>
        </form>
        </div>

    </div>


</template>

<style scoped>

/* Contenedor Principal */
.container {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', Roboto, sans-serif;
  color: #333;
}

/* Botón Volver */
.btn-volver {
  background: none;
  border: none;
  color: black;
  cursor: pointer;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  transition: color 0.3s;
}

.btn-volver:hover {
  color: #000;
  text-decoration: underline;
}

/* Formulario */
#formPutOferta {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

label {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #2d7a33; /* Verde de la etiqueta 'Backend Developer' */
  margin-bottom: -0.5rem;
}

input[type="text"],
input[type="date"],
textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fcfcfc;
  font-size: 1rem;
  transition: border-color 0.3s, box-shadow 0.3s;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #4d1b95; /* Púrpura del botón Inscribirme */
  box-shadow: 0 0 0 3px rgba(77, 27, 149, 0.1);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

/* Botón Guardar (Basado en 'Inscribirme') */
.btn-submit {
  background-color: #4d1b95;
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-top: 1rem;
  transition: opacity 0.3s;
}

.btn-submit:hover {
  opacity: 0.9;
}

/* Estados */
.state-msg {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  color: #d32f2f;
  background: #ffebee;
  border-radius: 8px;
}

</style>
