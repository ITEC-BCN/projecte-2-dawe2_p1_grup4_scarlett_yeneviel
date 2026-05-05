<script setup>
const props = defineProps({
    oferta: Object,
    index: Number
})

const emit = defineEmits(["verDetalleOferta"])

const verDetalle = () => {
    emit("verDetalleOferta", props.oferta.id)
}

const limitarTexto = (texto, max = 120) => {
    if (!texto) return "";
    return texto.length > max
        ? texto.slice(0, max) + "..."
        : texto;
};

</script>

<template>
    <article 
        class="card" 
        :style="{ animationDelay: `${props.index * 0.1}s` }"
        @click="verDetalle"
    >
        <div class="card-content">
            <span class="tag">{{ oferta.modelo_practicas }}</span>
            <h2 class="titulo-puesto">{{ oferta.tipo_puesto }}</h2>
            <p class="nombre-empresa">{{ oferta.nombre_empresa }}</p>
            <p class="descripcion-card">
  {{ limitarTexto(oferta.descripcion, 120) }}
</p>
        </div>

        <div class="footer-card">
            <button class="btn-detalle">Ver detalle</button>
        </div>
    </article>
</template>

<style scoped>
/* Contenedor principal con Flexbox para mantener el botón siempre abajo */
.card {
  background-color: #ffffff;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  border: 1px solid #334155;;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeInUp 0.5s ease-out both;
}

.container-ofertas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

/* Animación */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Hover solo para dispositivos que tienen puntero (evita bugs en móvil) */
@media (hover: hover) {
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
}

.tag {
  background-color: #dcfce7; /* Verde más vivo */
  color: #166534;            /* Texto mucho más oscuro para contraste */
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 9999px;     /* Estilo píldora, más moderno */
  margin-bottom: 16px;
  align-self: flex-start;
}

.titulo-puesto {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;           /* Contraste máximo */
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.nombre-empresa {
  font-size: 0.95rem;
  font-weight: 500;
  color: #4f46e5;           /* Usamos el color primario para la marca */
  margin: 0 0 16px 0;
}

.descripcion-card {
  font-size: 0.9rem;
  color: #334155;           /* Gris más oscuro para lectura */
  line-height: 1.6;
  margin-bottom: 24px;
}

.footer-card {
  margin-top: auto; /* Empuja el footer al final si el card crece */
  display: flex;
  justify-content: flex-end; /* Botón a la derecha */
}

.btn-detalle {
  background-color: #4f46e5;
  color: #ffffff;           /* Blanco puro sobre fondo oscuro */
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
  transition: all 0.2s;
}

.btn-detalle:hover {
  background-color: #4338ca;
  box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
  transform: translateY(-1px);
}

/* --- Ajustes para Pantallas Grandes --- */
@media (min-width: 768px) {
  .btn-detalle {
    width: auto; /* En tablet/desktop el botón recupera su tamaño natural */
  }
  
  .titulo-puesto {
    font-size: 1.3rem;
  }
}
</style>