<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFetch } from '../composables/useFetch';
import { URL_BACK } from '../../../config';
import { watch } from 'vue';


const route = useRoute();
const router = useRouter();

// Construimos la URL usando el ID que viene en la ruta

const url = ref(`${URL_BACK}/ofertas/${route.params.id}`);
const { data: ofertaOriginal, error, loading, actualizarOferta } = useFetch(url);

//Estado para los datos que el usuario edita
const form=ref({})

// Cuando los datos cargan, creamos una copia para el formulario, cuando 'ofertaOriginal' deje de ser null
watch(ofertaOriginal, (newData) => {
    if (newData) {
        form.value = { ...newData };
    }
}, { immediate: true });


const actualizar = async () => {
    // Calculamos solo lo que cambió (PUT PARCIAL)
    const datosCambiados = {};
    for (const key in form.value) {
        if (form.value[key] !== ofertaOriginal.value[key]) {
            datosCambiados[key] = form.value[key];
        }
    }

    if (Object.keys(datosCambiados).length === 0) return alert("Sin cambios");

    // Usamos la función del composable
    try {
      const urlPut=`http://localhost:3000/oferta/${route.params.id}`;

     
        await actualizarOferta(datosCambiados, urlPut);
        alert("Actualizado correctamente");
        router.push('/ofertas');
        
    } catch (err) {
      console.error("Fallo en la actualización:",err);
        
    }
};


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
      <div v-else-if="ofertaOriginal">

      <!--Evito que se envie el formulario y llamo a la función actualizar-->
        <form id="formPutOferta" @submit.prevent="actualizar">
            <label for="puesto">Nombre del puesto:</label>
            <input  type="text" id="puesto" name="puesto" v-model="form.tipo_puesto"/>

            <label for="nombre_empresa">Nombre de la empresa:</label>
            <input  type="text" id="empresa" name="nombre_empresa" v-model="form.nombre_empresa" />

            <label for="funciones_puesto">funciones del puesto:</label>
            <textarea id="funciones" name="funciones_puesto" v-model="form.funciones" > 
               
            </textarea>


            <label for="beneficios">Beneficios:</label>
            <textarea   id="beneficios" name="beneficios" v-model="form.beneficios" > 
                
            </textarea>

            <label for="requisitos">Requisitos:</label>
            <textarea  id="requisitos" name="requisitos" v-model="form.requisitos" >
                
            </textarea>

            <label for="fecha_expiracion">Fecha de expiración</label>
            <input type="date" id="fecha_expiracion" name="fecha_expiracion" v-model="form.fecha_expiracion" />

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
