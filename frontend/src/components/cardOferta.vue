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
        <!-- HEADER -->
        <div class="card-header">
            <div class="empresa-box">

                <div>
                    <h2 class="titulo-puesto" v-if="oferta.tipo_puesto">{{ oferta.tipo_puesto }}</h2>
                    <h2 class="titulo-puesto" v-else>Puesto no especificado</h2>
                    <p class="nombre-empresa" v-if="oferta.nombre_empresa">{{ oferta.nombre_empresa }}</p>
                    <p class="nombre-empresa" v-else>Empresa no especificada</p>

                </div>
            </div>

            <span class="tag" v-if="oferta.modelo_practicas">
                {{ oferta.modelo_practicas }}
            </span>
            <p v-else>No modelo de prácticas especificado</p>
        </div>

        <!-- DESCRIPCIÓN -->
        <p class="descripcion-card" v-if="oferta.descripcion">
            {{ limitarTexto(oferta.descripcion, 120) }}
        </p>
        <p v-else>Descripción no disponible</p>

        <!-- SKILLS -->
        <div v-if="oferta.oferta_skill?.length" class="skills">
            <span v-for="skill in oferta.oferta_skill" :key="skill">
                {{ skill.skill?.nombre }}
            </span>
        </div>
        <p v-else>Skills no disponibles</p>

        <!-- INFO EXTRA -->
        <div class="info">
            <span v-if="oferta.ubicacion?.ciudad">📍 {{ oferta.ubicacion.ciudad }}</span>
            <p v-else>Ubicación no disponible</p>
            <span v-if="oferta.modalidad">🏢 {{ oferta.modalidad }}</span>
            <p v-else>Modalidad no disponible</p>
        </div>

        <!-- FOOTER -->
        <div class="footer-card">
            <button class="btn-detalle">
                Ver detalle
            </button>
        </div>
    </article>
</template>

<style scoped>
.card {
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  border: 1px solid #e2e8f0;
  transition: all 0.25s ease;
  animation: fadeInUp 0.5s ease-out both;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 15px 30px rgba(0,0,0,0.08);
}

/* HEADER */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.empresa-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.logo {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  object-fit: cover;
  background: #f1f5f9;
}

.titulo-puesto {
  font-size: 1.1rem;
  font-weight: 800;
  color: #0f172a;
}

.nombre-empresa {
  font-size: 0.9rem;
  color: #4f46e5;
  font-weight: 600;
}

/* TAG */
.tag {
  background: #dcfce7;
  color: #166534;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
}

/* DESCRIPCIÓN */
.descripcion-card {
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.5;
  margin: 12px 0;
}

/* SKILLS */
.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.skills span {
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
}

/* INFO */
.info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 12px;
}

/* FOOTER */
.footer-card {
  margin-top: auto;
}

.btn-detalle {
  width: 100%;
  background: #4d1b95;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.btn-detalle:hover {
  background: #3b1475;
}

/* ANIMACIÓN */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>