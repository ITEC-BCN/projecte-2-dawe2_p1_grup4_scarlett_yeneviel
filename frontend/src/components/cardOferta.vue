<script setup>

const props=defineProps({
    oferta:Object
})

const emit=defineEmits(["verDetalleOferta"])

const verDetale=()=>{
    emit("verDetalleOferta", props.oferta)
}
</script>

<template>
    <article class="card">
        <span class="tag">{{ oferta.etiqueta }}</span>
        <h2 class="titulo-puesto">{{ oferta.nombre_empresa }}</h2>
        <p class="nombre-empresa">{{ oferta.nombre_empresa }}</p>
        <p class="descripcion-card">{{ oferta.descripcion }}</p>

        <div class="footer-card">
            <button @click="verDetale" class="btn-detalle">Ver detalle</button>
        </div>
    </article>

</template>

<style scoped>

.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 350px; /* Ajusta según necesites */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  border: 1px solid #f0f0f0;
}

.tag {
  background-color: #e8f5e9;
  color: #2e7d32;
  font-size: 11px;
  font-weight: bold;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  display: inline-block;
  margin-bottom: 12px;
}

.titulo-puesto {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px 0;
}

.nombre-empresa {
  font-size: 14px;
  color: #757575;
  margin: 0 0 16px 0;
}

.descripcion-card {
  font-size: 14px;
  color: #555;
  line-height: 1.5;
  margin-bottom: 24px;
  /* Limitamos a 2 líneas como en la imagen */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
}

.footer-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-detalle {
  background-color: #512da8; /* Morado de la imagen */
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-detalle:hover {
  background-color: #4527a0;
}
</style>