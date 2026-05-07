<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useFetch } from "../composables/useFetchOfertas";
import CardOferta from "../components/cardOferta.vue";

const router = useRouter();
const url = ref(`${import.meta.env.VITE_URL_BACK}/ofertas`);
const { data, error, loading, fetchData } = useFetch(url);

// 1. Variables de estado para los filtros
const searchQuery = ref("");
const selectedModalidad = ref("");
const searchUbicacion = ref("");
const selectedSkills = ref([]); // Array para multiselect
const skillToAdd = ref("");
const selectedModeloPracticas = ref('');

const ciudadesDisponibles = computed(() => {
    if (!data.value) return [];
    const ciudades = data.value.map(oferta => oferta.ubicacion?.ciudad);
    const ciudadesValidas = ciudades.filter(ciudad => ciudad != null && ciudad !== "");
    return [...new Set(ciudadesValidas)].sort();
});

const skillsDisponibles = computed(() => {
    if (!data.value) return [];

    const set = new Set();

    data.value.forEach(oferta => {
        oferta.oferta_skill?.forEach(os => {
            if (os.skill?.nombre) set.add(os.skill.nombre);
        });
    });

    return [...set].sort();
});

const skillsDisponiblesFiltradas = computed(() => {
    return skillsDisponibles.value.filter(skill =>
        !selectedSkills.value.includes(skill)
    );
});

const addSkill = () => {
    if (!skillToAdd.value) return;

    if (!selectedSkills.value.includes(skillToAdd.value)) {
        selectedSkills.value.push(skillToAdd.value);
    }

    skillToAdd.value = "";
};

const removeSkill = (skill) => {
    selectedSkills.value = selectedSkills.value.filter(s => s !== skill);
};

// 2. Lógica de Filtrado Combinada
const ofertasFiltradas = computed(() => {
    if (!data.value) return [];

    const q = searchQuery.value.toLowerCase().trim();
    const city = searchUbicacion.value.toLowerCase().trim();
    const modalidad = selectedModalidad.value.toLowerCase().trim();
    const modelo = selectedModeloPracticas.value.toLowerCase().trim();

    return data.value.filter((oferta) => {
        // Preparar datos de la oferta
        const ciudadOferta = (oferta.ubicacion?.ciudad || '').toLowerCase();
        const modalidadOferta = (oferta.modalidad || '').toLowerCase();
        const modeloOferta = (oferta.modelo_practicas || '').toLowerCase();

        // Extraer nombres de skills de la oferta actual para comparar fácilmente
        const skillsDeLaOferta = oferta.oferta_skill?.map(os =>
            (os.skill?.nombre || '').toLowerCase()
        ) || [];

        // Filtro búsqueda global, Texto global
        const textoBusqueda = `
    ${oferta.nombre_empresa || ''}
    ${oferta.tipo_puesto || ''}
    ${oferta.descripcion || ''}
    ${oferta.funciones || ''}
    ${oferta.requisitos || ''}
    ${oferta.beneficios || ''}
    ${oferta.modalidad || ''}
    ${oferta.modelo_practicas || ''}
    ${oferta.jornada || ''}
`.toLowerCase();

        const matchSearch =
            !q || textoBusqueda.includes(q);

        // Filtro ciudad
        const matchCity = !city || ciudadOferta === city;

        // Filtro modalidad
        const matchModalidad = !modalidad || modalidadOferta === modalidad;

        // Filtro modelo prácticas
        const matchModelo = !modelo || modeloOferta === modelo;

        // --- FILTRO MULTI-SKILL (Aquí estaba el fallo) --
        // SKILLS (OR lógico: basta con 1 coincidencia)
        const matchSkill =
            selectedSkills.value.length === 0 ||
            selectedSkills.value.every(skillSel =>
                skillsDeLaOferta.includes(skillSel.toLowerCase())
            );

        return matchSearch && matchCity && matchModalidad && matchSkill && matchModelo;
    });
});

// --- PAGINACIÓN ---
const currentPage = ref(1);
const pageSize = ref(9);

const totalPages = computed(() => Math.max(1, Math.ceil(ofertasFiltradas.value.length / pageSize.value)));
const ofertasPaginadas = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return ofertasFiltradas.value.slice(start, start + pageSize.value);
});

// Reiniciar página cuando cambie cualquier filtro
watch([searchQuery, searchUbicacion, selectedSkills, selectedModalidad, selectedModeloPracticas], () => {
    currentPage.value = 1;
});

const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const goToPage = (p) => { currentPage.value = p; };

const verDetalle = (id, namePath) => {
    router.push({ name: namePath, params: { id: id } });
};

const roleUSer = localStorage.getItem('role');
const crearOferta = () => { router.push('/crear'); };

// Función para limpiar filtros
const clearFilters = () => {
    searchQuery.value = '';
    searchUbicacion.value = '';
    selectedSkills.value = [];
    selectedModalidad.value = '';
    selectedModeloPracticas.value = '';
    currentPage.value = 1;
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
                <input type="text" v-model="searchQuery" placeholder="Busca por empresa, puesto o palabra clave..."
                    aria-label="Buscar ofertas por empresa o puesto" class="input-main" />
            </div>

            <div class="filters-row">
                <div class="filter-group">
                    <label>📍 Ciudad</label>
                    <select v-model="searchUbicacion" class="select-filtro">
                        <option value="">Todas las ciudades</option>
                        <option v-for="ciudad in ciudadesDisponibles" :key="ciudad" :value="ciudad">
                            {{ ciudad }}
                        </option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>✨ Skills</label>
                    <select v-model="skillToAdd" class="select-filtro" @change="addSkill">
                        <option value="">Seleccionar skill</option>
                        <option v-for="skill in skillsDisponiblesFiltradas" :key="skill" :value="skill">
                            {{ skill }}
                        </option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>🏢 Modalidad</label>
                    <select v-model="selectedModalidad" class="select-filtro">
                        <option value="">Todas</option>
                        <option value="Presencial">Presencial</option>
                        <option value="Remoto">Remoto</option>
                        <option value="Hibrido">Híbrido</option>
                    </select>
                </div>

                <div class="filter-group">
                    <label>📚 Modelo</label>
                    <select v-model="selectedModeloPracticas" class="select-filtro">
                        <option value="">Todos</option>
                        <option value="GENERAL">General</option>
                        <option value="INTENSIVAS">Intensivas</option>
                    </select>
                </div>

                <div class=" action-group">
                    <button class="btn-clear-filters" @click="clearFilters" title="Limpiar todos los filtros">
                        🧹 Limpiar
                    </button>
                </div>
            </div>

            <div v-if="selectedSkills.length > 0" class="skills-selected">
                <transition-group name="list">
                    <span v-for="skill in selectedSkills" :key="skill" class="chip">
                        {{ skill }}
                        <button @click="removeSkill(skill)" class="btn-remove-skill">✕</button>
                    </span>
                </transition-group>
            </div>
        </div>

        <div v-if="ofertasFiltradas.length > 0" class="grid-ofertas">
            <CardOferta v-for="oferta in ofertasPaginadas" :key="oferta.id" :oferta="oferta"
                @verDetalleOferta="verDetalle(oferta.id, roleUSer === 'admin' ? 'verOfertaAdmin' : 'OfertaDetalle')" />
        </div>

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
    background: var(--bg-main);
    color: var(--text);
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
    outline: none;
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
    box-shadow: 0 0 0 1px #4b5563, 0 6px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid #dde1e7;
    margin-bottom: 30px;
}

/* Buscador de texto (Principal) */
.search-main {
    display: flex;
    align-items: center;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 12px;
    padding: 8px 16px;
    margin-bottom: 20px;
    transition: all 0.2s ease;
}

.search-main:focus-within {
    border-color: #4d1b95;
    box-shadow: 0 0 0 3px rgba(77, 27, 149, 0.15);
}

/* SOLO el div reacciona */
.search-main:hover {
    border-color: #94a3b8;
}

.icon-search {
    font-size: 20px;
    color: var(--text);
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
    color: #64748b;
}

/* Filtros secundarios (Selects) */
.filters-row {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 16px;

}

/* === LABELS DE FILTROS === */
.filter-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}


/* Label bonito y legible */
.filter-group label {
    font-size: 12px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 2px;

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

/* Ocultar el botón original de añadir si no lo borraste del HTML */
.filter-group button:not(.btn-remove-skill):not(.btn-admin) {
    display: none;
}

.select-filtro,
.btn-clear-filters {
    height: 44px;
}

.select-filtro {
    width: 100%;
    padding: 12px 16px;
    font-size: 14px;
    box-shadow: 0 0 0 4px rgba(77, 27, 149, 0.1);
    border-radius: 10px;
    background-color: #f8fafc;
    transition: all 0.2s ease;
    cursor: pointer;
}

.select-filtro:hover {
    border-color: var(--primary);
}

.select-filtro:focus {
    border-color: var(--primary);
    background-color: #fff;
    box-shadow: 0 0 0 3px rgba(77, 27, 149, 0.1);
}

/* === GRID DE OFERTAS === */
.grid-ofertas {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
    border: 1px solid (var(--danger));
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

.skills-selected {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px dashed #e2e8f0;
    /* Evita saltos de layout */
}

.chip {
    background: #4d1b95;
    color: white;
    padding: 6px 12px;
    border-radius: 20px;
    /* Más redondeado queda más moderno */
    font-size: 13px;
    display: inline-flex;
    /* Cambiado de display: flex */
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.chip:hover {
    background: var(--primary-hover);
    color: #ffffff;
    /* mantener contraste */
}

.chip button {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
}

.btn-remove-skill {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 10px;
    line-height: 1;
    padding: 0;
    transition: all 0.2s;
}

.btn-remove-skill:hover {
    background: #ef4444;
    /* Rojo al pasar el ratón */
    transform: scale(1.1);
}

/* Animación para que aparezcan suaves */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.clear-box {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    border: none;
}


.btn-clear-filters {
    height: 44px;
    /* Misma altura que los selects */
    background: #fee2e2;

    color: #ef4444;
    border: 1px solid var(--danger-hover);
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
}

.btn-clear-filters:hover {
    background: #ef4444;
    color: white;
}

.action-group {
    display: flex;
    align-items: flex-end;
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

    .filters-row {
        grid-template-columns: repeat(2, 1fr);
    }

    .action-group {
        grid-column: span 2;
    }
}

@media (max-width: 768px) {

    .filters-row {
        /* En tablets usamos 2 columnas */
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    .action-group {
        grid-column: span 2;
        /* Botón limpiar ocupa todo el ancho abajo */
    }

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
        gap: 20px;
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


@media (max-width: 600px) {
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

    .grid-ofertas>* {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transition: all 0.2s ease;
    }

    .filters-row {
        grid-template-columns: 1fr;
    }

    .action-group {
        grid-column: span 1;
    }


}
</style>