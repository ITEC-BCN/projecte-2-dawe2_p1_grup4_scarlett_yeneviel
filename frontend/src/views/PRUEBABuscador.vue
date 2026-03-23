<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useFetch } from "../composables/useFetchOfertas";
import CardOferta from "../components/cardOferta.vue";
import { URL_BACK } from "../../../config";

const router = useRouter();
const url = ref(`${URL_BACK}/ofertas`);
const { data, error, loading, fetchData } = useFetch(url);

// 1. Variables de estado para los filtros
const searchQuery = ref("");
const selectedModalidad = ref(""); // Para: Hibrido, Presencial, Remoto
const searchUbicacion = ref("");   // Para buscar por ciudad
const searchSkill = ref("");       // Para buscar por tecnología

// ESTO DEBE ESTAR AQUÍ ADENTRO:
const ciudadesDisponibles = computed(() => {
    if (!data.value) return [];
    const ciudades = data.value.map(oferta => oferta.ubicacion?.ciudad);
    const ciudadesValidas = ciudades.filter(ciudad => ciudad != null && ciudad !== "");
    return [...new Set(ciudadesValidas)].sort();
});

// MAGIA DE VUE: Sacamos una lista de skills únicas de todas las ofertas
const skillsDisponibles = computed(() => {
    if (!data.value) return [];

    const skillsSet = new Set(); // El Set evita duplicados automáticamente

    data.value.forEach(oferta => {
        // Verificamos que la oferta tenga skills asociadas
        if (oferta.oferta_skill && Array.isArray(oferta.oferta_skill)) {
            oferta.oferta_skill.forEach(os => {
                if (os.skill?.nombre) {
                    skillsSet.add(os.skill.nombre); // Añadimos el nombre exacto
                }
            });
        }
    });

    // Convertimos el Set a un Array y lo ordenamos alfabéticamente
    return [...skillsSet].sort();
});

// 2. MAGIA DE VUE: Filtramos la data combinando todos los criterios
const ofertasFiltradas = computed(() => {
    if (!data.value) return [];

    return data.value.filter((oferta) => {
        // --- A. Buscador Genérico (Empresa o Puesto) ---
        const query = searchQuery.value.toLowerCase();
        const empresa = (oferta.nombre_empresa || "").toLowerCase();
        const puesto = (oferta.tipo_puesto || "").toLowerCase();
        const coincideGenerico = empresa.includes(query) || puesto.includes(query);

        // --- B. Filtro Modalidad (Hibrido, Presencial, Remoto) ---
        const modalidad = oferta.tipo_jornada?.modalidad || "";
        const coincideModalidad = selectedModalidad.value === "" || modalidad === selectedModalidad.value;

        // --- C. Filtro Ubicación (Ciudad) - OPTIMIZADO PARA EL SELECT ---
        const ciudadOferta = oferta.ubicacion?.ciudad || "";
        // Si no hay ciudad seleccionada, mostramos todas. Si hay, comparamos que sea exactamente igual.
        const coincideUbicacion = searchUbicacion.value === "" || ciudadOferta === searchUbicacion.value;

        // --- D. Filtro Skills ---
        // --- D. Filtro Skills - OPTIMIZADO PARA EL SELECT ---
        const coincideSkill = searchSkill.value === "" || (
            oferta.oferta_skill && oferta.oferta_skill.some(os =>
                os.skill?.nombre === searchSkill.value
            )
        );

        // La oferta debe cumplir con TODOS los filtros activos para mostrarse
        return coincideGenerico && coincideModalidad && coincideUbicacion && coincideSkill;
    });
});

const verDetalle = (id, namePath) => {
    router.push({ name: namePath, params: { id: id } });
};

const roleUSer = localStorage.getItem('role');

const crearOferta = () => {
    router.push('/crear');
};
</script>

<template>
    <div v-if="loading" class="estado-mensaje">
        <p>Loading...</p>
    </div>
    <div v-else-if="error" class="estado-mensaje error">
        <p>Error: {{ error }}</p>
    </div>

    <section v-else class="container-ofertas">
        <h1 class="main-title">Ofertas de Prácticas</h1>

        <div class="filtros-container">
            <input type="text" v-model="searchQuery" placeholder="🔍 Empresa o puesto..." class="input-filtro" />

            <select v-model="searchUbicacion" class="input-filtro select-filtro">
                <option value="">📍 Todas las ciudades</option>

                <option v-for="ciudad in ciudadesDisponibles" :key="ciudad" :value="ciudad">
                    {{ ciudad }}
                </option>
            </select>

            <select v-model="searchSkill" class="input-filtro select-filtro">
                <option value="">💻 Todas las tecnologías</option>

                <option v-for="skill in skillsDisponibles" :key="skill" :value="skill">
                    {{ skill }}
                </option>
            </select>

            <select v-model="selectedModalidad" class="input-filtro select-filtro">
                <option value="">Todas las modalidades</option>
                <option value="Presencial">Presencial</option>
                <option value="Remoto">Remoto</option>
                <option value="Hibrido">Híbrido</option>
            </select>
        </div>

        <div v-if="roleUSer == 'admin'">
            <button @click="crearOferta" class="addOferta">+ Crear nueva oferta</button>

            <div v-if="ofertasFiltradas.length > 0" class="grid-ofertas">
                <CardOferta v-for="oferta in ofertasFiltradas" :key="oferta.id" :oferta="oferta"
                    @verDetalleOferta="verDetalle(oferta.id, 'verOfertaAdmin')" />
            </div>
            <div v-else class="estado-mensaje">
                <p>No se encontraron ofertas con estos filtros.</p>
            </div>
        </div>

        <div v-else>
            <div v-if="ofertasFiltradas.length > 0" class="grid-ofertas">
                <CardOferta v-for="oferta in ofertasFiltradas" :key="oferta.id" :oferta="oferta"
                    @verDetalleOferta="verDetalle(oferta.id, 'OfertaDetalle')" />
            </div>
            <div v-else class="estado-mensaje">
                <p>No se encontraron ofertas con estos filtros.</p>
            </div>
        </div>

    </section>
</template>

<style scoped>
/* Contenedor principal */
.container-ofertas {
    max-width: 1200px;
    margin: 40px auto;
    padding: 0 20px;
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.main-title {
    font-size: 28px;
    font-weight: 800;
    color: #0d1b2a;
    margin-bottom: 20px;
    text-align: left;
}

/* ESTILOS DEL BUSCADOR */
.buscador-container {
    margin-bottom: 30px;
}

.input-buscador {
    width: 100%;
    max-width: 500px;
    padding: 12px 16px;
    font-size: 16px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.3s ease;
}

.input-buscador:focus {
    border-color: #512da8;
}

/* Botón admin */
.addOferta {
    background-color: #512da8;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    margin-bottom: 1.5rem;
    transition: background-color 0.2s;
}

.addOferta:hover {
    background-color: #4527a0;
}

/* Grid */
.grid-ofertas {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
}

.estado-mensaje {
    text-align: center;
    margin-top: 2rem;
    color: #666;
}

.filtros-container {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    margin-bottom: 30px;
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 12px;
}

.input-filtro {
    flex: 1;
    min-width: 200px;
    padding: 12px 16px;
    font-size: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    outline: none;
    transition: border-color 0.3s ease;
}

.input-filtro:focus {
    border-color: #512da8;
}

.select-filtro {
    cursor: pointer;
    background-color: white;
}

@media (max-width: 1024px) {
    .grid-ofertas {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .grid-ofertas {
        grid-template-columns: 1fr;
    }
}
</style>