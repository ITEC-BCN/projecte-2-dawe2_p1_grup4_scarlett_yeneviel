<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useFetch } from "../composables/useFetchOfertas";
import CardOferta from "../components/cardOferta.vue";
import { URL_BACK } from "../../../config";

const router = useRouter();
const url = ref(`${URL_BACK}/ofertas`);
//const url = ref(`${URL_BACK}/ofertas`);
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

    const q = (searchQuery.value || '').toLowerCase().trim();
    const selectedMod = (selectedModalidad.value || '').toLowerCase().trim();
    const selectedCity = (searchUbicacion.value || '').toLowerCase().trim();
    const selectedSk = (searchSkill.value || '').toLowerCase().trim();

    return data.value.filter((oferta) => {
        const empresa = (oferta.nombre_empresa || '').toLowerCase();
        const puesto = (oferta.tipo_puesto || '').toLowerCase();
        const modalidad = (oferta.tipo_jornada?.modalidad || oferta.modalidad || '').toLowerCase();
        const ciudadOferta = (oferta.ubicacion?.ciudad || '').toLowerCase();

        // Buscador genérico
        const coincideGenerico = q === '' || empresa.includes(q) || puesto.includes(q);

        // Modalidad
        const coincideModalidad = selectedMod === '' || modalidad === selectedMod;

        // Ubicación
        const coincideUbicacion = selectedCity === '' || ciudadOferta === selectedCity;

        // Skill
        let coincideSkill = true;
        if (selectedSk !== '') {
            coincideSkill = false;
            if (oferta.oferta_skill && Array.isArray(oferta.oferta_skill)) {
                for (const os of oferta.oferta_skill) {
                    const nombreSkill = (os.skill?.nombre || '').toLowerCase();
                    if (nombreSkill === selectedSk) { coincideSkill = true; break; }
                }
            }
        }

        return coincideGenerico && coincideModalidad && coincideUbicacion && coincideSkill;
    });
});

// --- PAGINACIÓN CLIENT-SIDE ---
const currentPage = ref(1);
const pageSize = ref(9); // items por página

const totalPages = computed(() => Math.max(1, Math.ceil(ofertasFiltradas.value.length / pageSize.value)));
const ofertasPaginadas = computed(() => {
    const page = Math.max(1, Math.min(currentPage.value, totalPages.value || 1));
    const start = (page - 1) * pageSize.value;
    return ofertasFiltradas.value.slice(start, start + pageSize.value);
});

// Watchers para mantener la página en rango y reiniciar al cambiar filtros
watch([searchQuery, searchUbicacion, searchSkill, selectedModalidad], () => { currentPage.value = 1; });
watch(ofertasFiltradas, () => { currentPage.value = 1; });
watch(totalPages, (tp) => { if (currentPage.value > tp) currentPage.value = tp; });

const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const goToPage = (p) => { currentPage.value = p; };

const verDetalle = (id, namePath) => {
    router.push({ name: namePath, params: { id: id } });
};

const roleUSer = localStorage.getItem('role');

const crearOferta = () => {
    router.push('/crear');
};
</script>

<template>
    <div v-if="loading" class="estado-mensaje loader">
        <span class="spinner"></span>
        <p>Buscando las mejores ofertas para ti...</p>
    </div>

    <div v-else-if="error" class="estado-mensaje error">
        <p>⚠️ Ocurrió un error: {{ error }}</p>
    </div>

    <section v-else class="container-ofertas">
        <div class="ofertas-header">
            <h1 class="main-title">Ofertas de Prácticas</h1>
            <button v-if="roleUSer === 'admin'" @click="crearOferta" class="btn-admin">
                <span>+</span> Crear nueva oferta
            </button>
        </div>

        <div class="search-panel">
            <div class="search-main">
                <span class="icon-search">🔍</span>
                <input type="text" v-model="searchQuery" placeholder="Busca por empresa, puesto o palabra clave..."  aria-label="Buscar ofertas por empresa o puesto"
                    class="input-main" />
            </div>

            <div class="filters-row">
                <div class="filter-group">
                    <label for="ubicacion">Ciudad</label>
                    <select v-model="searchUbicacion" class="select-filtro" aria-label="Filtrar por ciudad">
                        <option value="">📍 Todas las ciudades</option>
                        <option v-for="ciudad in ciudadesDisponibles" :key="ciudad" :value="ciudad">
                            {{ ciudad }}
                        </option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="skill">Tecnología</label>
                    <select v-model="searchSkill" class="select-filtro" aria-label="Filtrar por tecnología">
                        <option value="">💻 Todas las tecnologías</option>
                        <option v-for="skill in skillsDisponibles" :key="skill" :value="skill">
                            {{ skill }}
                        </option>
                    </select>
                </div>

                <div class="filter-group">
                    <label for="modalidad">Modalidad</label>
                    <select v-model="selectedModalidad" class="select-filtro" aria-label="Filtrar por modalidad">
                        <option value="">🏢 Todas las modalidades</option>
                        <option value="Presencial">Presencial</option>
                        <option value="Remoto">Remoto</option>
                        <option value="Hibrido">Híbrido</option>
                    </select>
                </div>
            </div>
        </div>

        <div v-if="ofertasFiltradas.length > 0" class="grid-ofertas">
            <CardOferta v-for="oferta in ofertasPaginadas" :key="oferta.id" :oferta="oferta"
                @verDetalleOferta="verDetalle(oferta.id, roleUSer === 'admin' ? 'verOfertaAdmin' : 'OfertaDetalle')" />
        </div>

        <!-- paginación -->
        <div v-if="totalPages > 1" class="pagination-container">
            <div class="pagination">
                <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">Anterior</button>
                <button v-for="p in totalPages" :key="p" class="page-number" :class="{ active: p === currentPage }"
                    @click="goToPage(p)">{{ p }}</button>
                <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">Siguiente</button>
            </div>
        </div>

        <div v-if="ofertasFiltradas.length === 0" class="empty-state">
            <h3>No encontramos resultados</h3>
            <p>Prueba a cambiar los filtros o a usar términos más generales.</p>
            <button class="btn-clear"
                @click="searchQuery = ''; searchUbicacion = ''; searchSkill = ''; selectedModalidad = ''">
                Limpiar filtros
            </button>
        </div>
    </section>
</template>

<style scoped>
/* Contenedor principal */
.container-ofertas {
    width: 90%;
    margin: 40px auto;
    padding: 0 20px;
    font-family: "Inter", "Segoe UI", sans-serif;
}

/* Cabecera */
.ofertas-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 16px;
}

.main-title {
    font-size: 32px;
    font-weight: 800;
    color: #111827;
    margin: 0;
    letter-spacing: -0.5px;
}

input:focus,
select:focus,
button:focus {
    outline: 1px solid var(--focus);
    outline-offset: 2px;
}

/*CARDS*/
.card {
    flex: 1 1 300px;   
    max-width: 360px;  

}

/* Botón Admin */
.btn-admin {
    background-color: var(--primary);
    color: #ffffff;
    border: none;
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
    box-shadow: 0 4px 6px -1px rgba(77, 27, 149, 0.2);
}

.btn-admin:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 12px -2px rgba(77, 27, 149, 0.3);
}

.btn-admin:focus {
    outline: 3px solid black;
}

/* === PANEL DE BÚSQUEDA === */
.search-panel {
    background: #ffffff;
    padding: 24px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
    border: 1px solid #f1f5f9;
    margin-bottom: 40px;
}

/* Buscador de texto (Principal) */
.search-main {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 8px 16px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
}

.search-main:focus-within {
    border-color: #4d1b95;
    background: #ffffff;
    box-shadow: 0 0 0 4px rgba(77, 27, 149, 0.1);
}

.icon-search {
    font-size: 20px;
    color: #64748b;
    margin-right: 12px;
}

.input-main {
    flex: 1;
    border: none;
    background: transparent;
    padding: 12px 0;
    font-size: 16px;
    color: #1e293b;
    outline: none;
}

.input-main::placeholder {
    color: #475569;
}

/* Filtros secundarios (Selects) */
.filters-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

/* === LABELS DE FILTROS === */
.filter-group {
    padding: 12px;
    border-radius: 10px;
    border: 2px solid #e2e8f0;
    transition: all 0.2s ease;
}


/* Label bonito y legible */
.filter-group label {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    gap: 6px;
}

/* Hover suave */
.filter-group:hover {
    background: #f1f5f9;
}

/* Focus dentro del grupo */
.filter-group:focus-within {
    border-color: #4d1b95;
    box-shadow: 0 0 0 3px rgba(77, 27, 149, 0.1);
}

.select-filtro {
    width: 100%;
    padding: 14px 16px;
    font-size: 15px;
    color: var(--text-main);
    background-color: white;
    border: 2px solid var(--border);
    border-radius: 10px;
    outline: none;
    cursor: pointer;
    transition: all 0.3s ease;
    appearance: none;
    /* Flechita personalizada para el select */
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 16px center;
    background-size: 16px;
}

.select-filtro:focus {
    border-color: #4d1b95;
    background-color: #ffffff;
    box-shadow: 0 0 0 4px rgba(77, 27, 149, 0.1);
}

/* === GRID DE OFERTAS === */
.grid-ofertas {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 24px;
}

/* === ESTADOS (Carga, Error, Vacío) === */
.estado-mensaje {
    text-align: center;
    margin-top: 60px;
    color: #64748b;
    font-size: 18px;
}

.estado-mensaje.error {
    color: #ef4444;
    background: #fef2f2;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #fca5a5;
    display: inline-block;
}

.empty-state {
    text-align: center;
    padding: 60px 20px;
    background: #f8fafc;
    border-radius: 16px;
    border: 2px dashed #e2e8f0;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.empty-state h3 {
    color: #0f172a;
    font-size: 20px;
    margin-bottom: 8px;
}

.empty-state p {
    color: #64748b;
    margin-bottom: 24px;
}

.btn-clear {
    background: white;
    border: 2px solid #e2e8f0;
    padding: 10px 20px;
    border-radius: 8px;
    color: #475569;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-clear:hover {
    background: #f1f5f9;
    color: #0f172a;
}

/* === PAGINACIÓN === */
.pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.pagination {
    display: flex;
    gap: 8px;
    align-items: center;
}

.page-btn,
.page-number {
    border: 1px solid #e6e6e6;
    background: white;
    padding: 8px 12px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    color: #4d1b95;
}

.page-btn[disabled] {
    opacity: 0.45;
    cursor: not-allowed;
}

.page-number.active {
    background: #065f46;
    /* verde oscuro AAA */
    color: #ffffff;
}

/* Ajuste responsive para los botones */
@media (max-width:600px) {
    .page-number {
        padding: 6px 8px;
    }
}

/* === RESPONSIVE === */
@media (max-width: 1200px) {
    .grid-ofertas {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
    }
}

@media (max-width: 1024px) {
    .container-ofertas {
        padding: 0 15px;
    }
    .grid-ofertas {
        grid-template-columns: repeat(2, 1fr);
        gap: 18px;
    }
    .search-panel {
        padding: 20px;
    }
}

@media (max-width: 768px) {
    .ofertas-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
    }
    .main-title {
        font-size: 28px;
    }
    .grid-ofertas {
        grid-template-columns: 1fr;
        gap: 16px;
    }
    .filter-group {
        min-width: 100%;
    }
    .filters-row {
        grid-template-columns: 1fr;
        gap: 12px;
    }
    .search-panel {
        padding: 16px;
        margin-bottom: 30px;
    }
    .pagination {
        flex-wrap: wrap;
        justify-content: center;
    }
    .page-btn,
    .page-number {
        padding: 6px 10px;
        font-size: 14px;
    }
}

@media (max-width: 480px) {
    .container-ofertas {
        margin: 20px auto;
        padding: 0 10px;
    }
    .main-title {
        font-size: 24px;
    }
    .search-main {
        padding: 6px 12px;
    }
    .input-main {
        font-size: 14px;
    }
    .select-filtro {
        padding: 12px 14px;
        font-size: 14px;
    }
    .btn-admin {
        padding: 10px 20px;
        font-size: 14px;
    }
    .pagination-container {
        margin-top: 15px;
    }

        .grid-ofertas > * {
        flex: 1 1 100%;
        max-width: 100%;
    }
}
</style>