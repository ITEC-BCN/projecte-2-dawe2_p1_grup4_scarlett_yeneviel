<script setup>
import { ref, reactive, watch, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useStudents } from "../../composables/useStudents";
import {
  availableLanguagesList,
  languageLevels,
  allLinkTypes,
  validSpanishCities,
  MAX_EDUCATION,
  MAX_LANGUAGES,
  MAX_LINKS,
  MAX_HARD_SKILLS,
  MAX_SOFT_SKILLS,
} from "../../js/const.js";
import CvViewer from "../../components/CvViewer.vue";

const route = useRoute();

const studentId = route.params.id || localStorage.getItem("studentId");
const url = ref(`${import.meta.env.VITE_URL_BACK}/estudiantes/${studentId}`);

const { students } = useStudents(url);

const hasUnsavedChanges = ref(false); //Conocer si hay cambios sin guardar

// --- Estado para todas las skills de la BD ---
const allDbSkills = ref([]);

// Cargar todas las skills al montar el componente
onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_URL_BACK}/skills`);
    const data = await res.json();
    allDbSkills.value = data;
  } catch (error) {
    console.error("Error cargando skills de la BD:", error);
  }
});


const user = reactive({ name: "", role: "", avatar: "", about: "" });
const contact = reactive({ email: "", phone: "", location: "" });

// --- VALIDACIONES - Estados de error ---
const validationErrors = reactive({
  phone: "",
  location: "",
  about: "",
  educationYear: {},
  experienceYear: {},
});

const MAX_PHONE_DIGITS = 9;
const MAX_ABOUT_LENGTH = 300;

// --- FUNCIONES DE VALIDACIÓN ---

// Validar teléfono: solo dígitos y máximo 9
const validatePhone = (value) => {
  // 1. Si no hay valor (es null o undefined), limpiamos el error y salimos
  if (value === null || value === undefined) {
    validationErrors.phone = "";
    return;
  }

  // 2. Convertimos el valor a String por si acaso es un Número
  const stringValue = String(value);

  // 3. Ahora sí, usamos .replace() sin miedo
  let cleaned = stringValue.replace(/\D/g, "");

  if (cleaned.length > MAX_PHONE_DIGITS) {
    validationErrors.phone = `El teléfono no puede tener más de ${MAX_PHONE_DIGITS} dígitos`;
    return false;
  } else if (cleaned.length > 0 && cleaned.length < 9) {
    validationErrors.phone = `El teléfono debe tener ${MAX_PHONE_DIGITS} dígitos (actual: ${cleaned.length})`;
  } else {
    validationErrors.phone = "";
  }

  contact.phone = cleaned;
  return true;
};

// Validar ubicación: debe estar en la lista de ciudades españolas
function validateLocation(value) {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    validationErrors.location = "";
    return true;
  }

  // Verificar si la ubicación está en la lista de ciudades válidas (case-insensitive)
  const isValid = validSpanishCities.some(
    (city) => city.toLowerCase() === trimmedValue.toLowerCase(),
  );

  if (!isValid) {
    validationErrors.location = `La ubicación "${trimmedValue}" no es válida. Ejemplo: Barcelona, Madrid, Valencia...`;
    return false;
  } else {
    validationErrors.location = "";
    return true;
  }
}

function validateEducationYear(yearValue, index) {
  const trimmedValue = String(yearValue || "")
    .trim()
    .toLowerCase();
  const currentYear = new Date().getFullYear();

  if (!trimmedValue) {
    validationErrors.educationYear[index] = "";
    return true;
  }
  // Permite:
  // 2020
  // 2020/2024
  // 2020-2024
  // 2020/actual
  // 2020-actual
  const regex = /^(\d{4})(?:\s*[-/]\s*(\d{4}|actual))?$/;
  const match = trimmedValue.match(regex);

  if (!match) {
    validationErrors.educationYear[index] =
      "Formato inválido. Usa: 2020, 2020/2024 o 2020/actual.";
    return false;
  }
  const startYear = Number(match[1]);
  const endValue = match[2];

  // Validar año inicial
  if (startYear > currentYear) {
    validationErrors.educationYear[index] =
      `El año inicial no puede ser superior a ${currentYear}.`;
    return false;
  }

  // Si existe año final y no es "actual"
  if (endValue && endValue !== "actual") {
    const endYear = Number(endValue);

    if (endYear > currentYear) {
      validationErrors.educationYear[index] =
        `El año final no puede ser superior a ${currentYear}.`;
      return false;
    }

    if (endYear < startYear) {
      validationErrors.educationYear[index] =
        "El año final no puede ser menor al inicial.";
      return false;
    }
  }

  validationErrors.educationYear[index] = "";
  return true;
}

function validateExperienceYear(yearValue, index) {
  const trimmedValue = String(yearValue || "")
    .trim()
    .toLowerCase();

  const currentYear = new Date().getFullYear();

  if (!trimmedValue) {
    validationErrors.experienceYear[index] = "";
    return true;
  }

  const regex = /^(\d{4})(?:\s*[-/]\s*(\d{4}|actual))?$/;

  const match = trimmedValue.match(regex);

  if (!match) {
    validationErrors.experienceYear[index] =
      "Formato inválido. Usa: 2020, 2020/2024 o 2020/actual.";
    return false;
  }

  const startYear = Number(match[1]);
  const endValue = match[2];

  if (startYear > currentYear) {
    validationErrors.experienceYear[index] =
      `El año inicial no puede ser superior a ${currentYear}.`;
    return false;
  }

  if (endValue && endValue !== "actual") {
    const endYear = Number(endValue);

    if (endYear > currentYear) {
      validationErrors.experienceYear[index] =
        `El año final no puede ser superior a ${currentYear}.`;
      return false;
    }

    if (endYear < startYear) {
      validationErrors.experienceYear[index] =
        "El año final no puede ser menor al inicial.";
      return false;
    }
  }

  validationErrors.experienceYear[index] = "";
  return true;
}

// Validar "Sobre mí": máximo 300 caracteres
function validateAbout(value) {
  if (value.length > MAX_ABOUT_LENGTH) {
    validationErrors.about = `El texto no puede exceder ${MAX_ABOUT_LENGTH} caracteres (actual: ${value.length})`;
    user.about = value.substring(0, MAX_ABOUT_LENGTH);
    return false;
  } else {
    validationErrors.about = "";
    return true;
  }
}

const hardSkills = ref([]);
const softSkills = ref([]);
const languages = ref([]);
const documents = ref([]); //Lo que se gaurda en la vista (links, portfolio, etc)
const academicBackground = ref([]);

// --- NUEVO: Función para cargar/restaurar los datos originales ---
const restoreOriginalData = () => {
  const source = students.value;
  if (!source) return;

  user.name = (source.nombre || "") + " " + (source.apellido || "");
  user.role = source.role || "Estudiante";
  user.avatar = source.foto_perfil || "/img/avatarGroup.png";
  user.about = source.about || "";
  contact.email = source.email || "";
  contact.phone = source.telefono || "";
  contact.location = source.location || "";

  hardSkills.value = [];
  softSkills.value = [];
  cvUrl.value = source.documento_cv || "";

  if (source.estudiante_skill) {
    source.estudiante_skill.forEach((item) => {
      const datosSkill = item.skill;
      if (datosSkill) {
        const tipoSkill = datosSkill.tipo
          ? datosSkill.tipo.toLowerCase().trim()
          : "";
        if (tipoSkill === "hard skill") {
          hardSkills.value.push({
            id: datosSkill.id,
            nombre: datosSkill.nombre,
          });
        } else if (tipoSkill === "soft skill") {
          softSkills.value.push({
            id: datosSkill.id,
            nombre: datosSkill.nombre,
          });
        }
      }
      
    });
    
  }

  console.log(source.estudios);
console.log(source.experiencia);
console.log(source.enlaces);

  const normalizeLang = (name) => {
    if (!name) return "";
    const found = availableLanguagesList.find(
      (l) => l.toLowerCase() === name.toLowerCase(),
    );
    return found || "";
  };

  // IMPORTANTE: Hacemos copias profundas (JSON parse/stringify) para romper la
  // referencia de los objetos. Así, si el usuario edita un input y luego cancela,
  // el objeto original de 'students' se mantiene intacto.
  languages.value = source.idiomas?.idiomas
    ? source.idiomas.idiomas.map((l) => ({
        id: l.id || Date.now(),
        name: normalizeLang(l.name || l.idioma),
        level: (l.level || l.nivel || "").trim(),
      }))
    : [];

  academicBackground.value = source.estudios?.formacion
    ? JSON.parse(JSON.stringify(source.estudios.formacion))
    : [];

  experience.value = Array.isArray(source.experiencia?.experiencia)
    ? JSON.parse(JSON.stringify(source.experiencia.experiencia))
    : [];

  // Ordenar por año descendente (más recientes primero)
academicBackground.value.sort((a, b) => {
  const yearA = Number(a.anio.match(/\d{4}/)?.[0] || 0);
  const yearB = Number(b.anio.match(/\d{4}/)?.[0] || 0);

  return yearB - yearA;
});

  if (source.enlaces) {
    documents.value = source.enlaces.map((e, i) => ({
      id: e.id || Date.now() + i,
      name: e.nombre || e.name || `Enlace ${i + 1}`,
      tipo: e.tipo || "Portfolio",
      url: e.url || "#",
    }));
  } else {
    documents.value = [];
  }

  hasUnsavedChanges.value = false;
};

// El watch ahora simplemente llama a nuestra función cuando llegan los datos
watch(
  () => students.value,
  () => {
    restoreOriginalData();
  },
  { immediate: true },
);

// Watchers para detectar cambios en edición directa
watch(
  () => languages.value,
  () => {
    if (editing.value) hasUnsavedChanges.value = true;
  },
  { deep: true },
);

watch(
  () => documents.value,
  () => {
    if (editing.value) hasUnsavedChanges.value = true;
  },
  { deep: true },
);

const editing = ref(false);

// --- FUNCIONES PARA EXPERIENCIA ---

const experience = ref([]);

// Función para obtener el icono según el tipo de enlace
const getDocIcon = (tipo) => {
  if (!tipo) return "fa-solid fa-file-lines";

  const tipoFormat = tipo.toLowerCase();
  if (tipoFormat.includes("github")) return "fa-brands fa-github";
  if (tipoFormat.includes("linkedin")) return "fa-brands fa-linkedin";

  return "fa-solid fa-file-lines";
};

// --- FUNCIÓN PARA SUBIR CV ---
const cvUrl = ref("");


</script>

<template>
  <div class="profile-page">
    <aside class="profile-card">
      <div class="profile-header">
        <div class="avatar-container">
          <img :src="user.avatar" alt="avatar" class="profile-avatar" />
        </div>

        <h2 class="profile-name">{{ user.name }}</h2>
        <div class="profile-role">Estudiante</div>
      </div>

      <div class="profile-stats">
        <div class="stat">
          <div class="num">{{ hardSkills.length + softSkills.length }}</div>
          <span class="label">Skills</span>
        </div>
        <div class="stat">
          <div class="num">{{ documents.length }}</div>
          <span class="label">Enlaces</span>
        </div>
      </div>

      <div class="sidebar-block about-block">
        <h3 class="sidebar-title"><i class="fa-solid fa-user"></i> Descripción</h3>

        <div>
          <p v-if="user.about" class="sidebar-text">{{ user.about }}</p>
          <p v-else class="sidebar-text">Aún no ha escrito nada sobre su biografía.</p>
        </div>
      </div>

      <div class="sidebar-block contact-block">
        <h3 class="sidebar-title">
          <i class="fa-solid fa-address-book"></i> Contacto
        </h3>
        <div class="contact-links">
          <a :href="`mailto:${contact.email}`" class="contact-item">
            <div class="contact-icon"><i class="fa-solid fa-envelope"></i></div>
            <div class="contact-content">
              <span class="contact-label">Email</span>
              <span class="contact-value">{{
                contact.email || "Sin email"
              }}</span>
            </div>
          </a>

          <div class="contact-item">
            <div class="contact-icon"><i class="fa-solid fa-phone"></i></div>
            <div class="contact-content">
              <span class="contact-label">Teléfono</span>
              
              <span class="contact-value">{{
                contact.phone || "Sin teléfono"
              }}</span>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon">
              <i class="fa-solid fa-location-dot"></i>
            </div>
            <div class="contact-content">
              <span class="contact-label">Ubicación</span>
              <span class="contact-value">{{
                contact.location || "Sin ubicación"
              }}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="sidebar-block cv-block">
        <div class="cv-card compact">
          <h3 class="sidebar-title">
            <i class="fa-solid fa-file-pdf"></i>
            {{ cvUrl ? "CURRICULUM VITAE" : "No existe CV en PDF" }}
          </h3>

          <p class="cv-subtitle">
            {{
              cvUrl
                ? "Ver CV subido por el alumno"
                : "No existe CV visible, el alumno debe subir uno"
            }}
          </p>

          <CvViewer :cv-url="cvUrl" />

        </div>
      </div>
    </aside>

    <main class="profile-main">
      <section class="section">
        <h2 class="section-title">
          <i class="fa-solid fa-graduation-cap icon-green"></i> Formación
          Académica
        </h2>

        <div class="education-timeline">
          <div v-if="academicBackground.length === 0" class="empty-state">
            Sin formación registrada aún.
          </div>

          <div
            v-for="(edu, index) in academicBackground"
            :key="index"
            class="edu-item"
          >
            <div class="edu-year">{{ edu.anio }}</div>
            <div class="edu-dot"></div>
            <div class="edu-info">
              <div class="edu-title">{{ edu.titulo }}</div>
              <div class="edu-center">{{ edu.centro }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 💼 EXPERIENCIA -->
      <section class="section">
        <h2 class="section-title">
          <i class="fa-solid fa-briefcase icon-purple"></i> Experiencia
          Profesional
        </h2>

        <!-- 👁️ MODO VISUAL -->
        <div class="education-timeline">
          <div v-if="experience.length === 0" class="empty-state">
            Sin experiencia registrada.
          </div>

          <div v-for="(exp, index) in experience" :key="index" class="edu-item">
            <div class="edu-year">{{ exp.anio }}</div>
            <div class="edu-dot"></div>
            <div class="edu-info">
              <div class="edu-title">{{ exp.puesto }}</div>
              <div class="edu-center">{{ exp.centro }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">
          <i class="fa-solid fa-bolt icon-purple"></i> Habilidades y
          Competencias
        </h2>

        <div class="skills-grid">
          <div class="skill-group">
            <h3 class="skill-subtitle">Hard Skills</h3>
            <div class="skill-list">
              <span
                v-for="(s, i) in hardSkills"
                :key="i"
                class="skill-chip hard"
              >
                {{ s.nombre }}
                
              </span>
              <span v-if="hardSkills.length === 0" class="empty-state"
                >No hay hard skills.</span>
            </div>
            </div>
         
          <div class="skill-group">
            <h3 class="skill-subtitle">Soft Skills</h3>
            <div class="skill-list">
              <span
                v-for="(s, i) in softSkills"
                :key="i"
                class="skill-chip soft"
              >
                {{ s.nombre }}
              </span>
              <span v-if="softSkills.length === 0" class="empty-state"
                >No hay soft skills.</span
              >
            </div>
            </div>
        </div>
      </section>

      <div class="grid-two-cols">
        <section class="section">
          <h2 class="section-title">
            <i class="fa-solid fa-language icon-green"></i> Idiomas
          </h2>

          <div class="skill-list">
            <span
              v-for="(lang, i) in languages"
              :key="i"
              class="skill-chip lang"
            >
              <strong>{{ lang.name }}</strong>
              <span class="badge-level">{{ lang.level }}</span>
            </span>
            <span v-if="languages.length === 0" class="empty-state"
              >Sin idiomas registrados.</span
            >
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">
            <i class="fa-solid fa-link icon-purple"></i> Enlaces
          </h2>

          <div class="links-list">
            <div v-for="doc in documents" :key="doc.id" class="link-item">
              <a :href="doc.url" target="_blank" class="link-content">
                <i :class="getDocIcon(doc.tipo)" class="link-icon"></i>
                <span class="link-label">{{ doc.name }}</span>
              </a>
            </div>
            <div v-if="documents.length === 0" class="empty-state">
              Aún no hay enlaces.
            </div>
          </div>

        </section>
      </div>
    </main>
  </div>

</template>

<style scoped>
/* VARIABLES Y RESET BÁSICO PARA EL COMPONENTE */
.profile-page {
  --accent-green: #10b981;
  --accent-green-hover: #059669;
  --accent-purple: #8b5cf6;
  --accent-purple-hover: #7c3aed;
  --text-main: #111827;
  --text-muted: #475569;
  --bg-main: #f3f4f6;
  --bg-card: #ffffff;
  --border-color: #e2e8f0;

  display: flex;
  gap: 30px;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 40px 20px;
  background-color: var(--bg-main);
  min-height: 100vh;
  font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  box-sizing: border-box;
}

.profile-page * {
  box-sizing: border-box;
}

/* SIDEBAR CARD */
.profile-card {
  width: clamp(280px, 30%, 350px);
  background: var(--bg-card);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 30px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.profile-header {
  text-align: center;
}

.avatar-container {
  display: inline-block;
  padding: 4px;
  background: linear-gradient(
    135deg,
    var(--accent-green),
    var(--accent-purple)
  );
  border-radius: 50%;
  margin-bottom: 10px;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid #ffffff;
  object-fit: cover;
  display: block;
}

.profile-name {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 5px 0;
}

.profile-role {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary,
.btn-save {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #f1f5f9;
  color: #334155;
}

.btn-primary:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}


/* ESTADÍSTICAS */
.profile-stats {
  display: flex;
  gap: 15px;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 20px 0;
}

.stat {
  flex: 1;
  text-align: center;
}

.stat .num {
  font-weight: 800;
  color: var(--text-main);
  font-size: 1.6rem;
}

.stat .label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: var(--text-muted);
  font-weight: 700;
  letter-spacing: 0.5px;
}

/* BLOQUES DE INFORMACIÓN */
.sidebar-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-main);
  margin: 0 0 15px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.about-block,
.contact-block,
.cv-block {
  background: #f8fafc;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 20px;
}


.contact-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border-radius: 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  color: #334155;
  text-decoration: none;
  transition: all 0.2s ease;
}

.contact-item:hover {
  background: #eef2ff;
  border-color: #c7d2fe;
}

.contact-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: var(--accent-purple);
  flex-shrink: 0;
  font-size: 1.1rem;
}

.contact-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
}

.contact-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  font-weight: 700;
}

.contact-value {
  font-size: 0.95rem;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}


/* CONTENIDO PRINCIPAL */
.profile-main {
  flex: 1;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.section {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 35px;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0 0 25px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 15px;
}

.icon-green {
  color: var(--accent-green);
}

.icon-purple {
  color: var(--accent-purple);
}

/* LÍNEA DE TIEMPO (FORMACIÓN) */
.education-timeline {
  display: flex;
  flex-direction: column;
}

.edu-item {
  display: flex;
  gap: 20px;
  position: relative;
  padding-bottom: 30px;
}

.edu-item:last-child {
  padding-bottom: 0;
}

.edu-year {
  width: 60px;
  font-weight: 700;
  color: var(--accent-purple);
  font-size: 0.95rem;
  text-align: right;
  padding-top: 2px;
}

.edu-dot {
  width: 14px;
  height: 14px;
  background: var(--accent-purple);
  border-radius: 50%;
  position: relative;
  z-index: 2;
  margin-top: 5px;
  box-shadow: 0 0 0 4px #f5f3ff;
}

.edu-item:not(:last-child) .edu-dot::after {
  content: "";
  position: absolute;
  top: 14px;
  left: 6px;
  width: 2px;
  height: calc(100% + 30px);
  background: var(--border-color);
  z-index: -1;
}

.edu-title {
  font-weight: 800;
  color: #1e293b;
  font-size: 1.15rem;
  margin-bottom: 4px;
}

.edu-center {
  color: var(--text-muted);
  font-size: 0.95rem;
  font-weight: 500;
}

/* SKILLS Y CHIPS */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.skill-subtitle {
  font-size: 1rem;
  color: var(--text-muted);
  margin: 0 0 15px 0;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-start;
  max-width: 100%;
}

.skill-chip {
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
}

.skill-chip.hard {
  background: #f3e8ff;
  color: #6b21a8;
  border: 1px solid #e9d5ff;
}

.skill-chip.soft {
  background: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.skill-chip.lang {
  background: #f8fafc;
  color: #334155;
  border: 1px solid var(--border-color);
}

.badge-level {
  background: rgba(0, 0, 0, 0.08);
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
}


/* ENLACES / LINKS */
.grid-two-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.link-label {
  word-break: break-word;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid var(--border-color);
  padding: 12px 16px;
  border-radius: 16px;
  transition: all 0.2s ease;
}

.link-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
  border-color: #cbd5e1;
}

.link-content {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  text-decoration: none;
  color: #0f172a;
  font-weight: 600;
  width: 100%;
}

.link-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-purple);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

/*Decoración para texto */
.info-text {
  color: #6c757d;
  /* gris elegante */
  font-size: 0.95rem;
  font-weight: 500;
  text-align: center;
  margin: 8px 0 16px;
  text-align: center;
  width: 100%;
}

.info-text strong {
  color: #495057;
  /* un poco más oscuro para el número */
}



button {
  min-height: 44px;
  min-width: 44px;
}


.input-col label,
.form-group label,
.edit-row label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  justify-content: flex-start;
  flex-direction: column;
}

/* Botones de acción (Añadir/Eliminar) */
.btn-icon-danger,
.btn-icon-success {
  border: none;
  border-radius: 12px;
  min-width: 44px;
  height: 44px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  justify-self: center;
}

.btn-icon-danger {
  background: #fee2e2;
  color: #ef4444;
}

.btn-icon-danger:hover {
  background: #fca5a5;
  transform: translateY(-2px);
}

.btn-icon-success {
  background: var(--accent-green);
  color: white;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);
}

.btn-icon-success:hover {
  background: var(--accent-green-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3);
}

.btn-add-small {
  padding: 12px 20px;
  background: var(--accent-purple);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  margin-top: 10px;
}

.btn-add-small:hover:not(:disabled) {
  background: var(--accent-purple-hover);
  transform: translateY(-2px);
}

.btn-add-small:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}


/* ESTADOS VACÍOS */
.empty-state {
  color: #94a3b8;
  font-size: 0.95rem;
  font-style: italic;
  padding: 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}



/* Evita que el último contenedor tenga margen extra abajo */
.contenedor:last-child {
  margin-bottom: 0;
}

/* Alinea el botón de eliminar a la derecha para que se vea más ordenado */
.align-self-end {
  align-self: flex-center;
  display: flex;
  gap: 6px;
  align-items: center;
}


/* =========================================
   MEDIA QUERIES (RESPONSIVE DESIGN)
========================================== */

@media (max-width: 992px) {
  .profile-page {
    flex-direction: column;
    padding: 20px;
  }

  .profile-card {
    width: 100%;
    max-width: 100%;
    position: static;
  }

  .profile-main {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .grid-two-cols {
    grid-template-columns: 1fr;
  }

  .section {
    padding: 25px 20px;
  }

  /* Asegurarse que los campos de los formularios se apilen en móviles */
  .edit-grid-row,
  .edit-row,
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-icon-danger,
  .btn-icon-success {
    width: 100%;
    margin-top: 10px;
  }

  .toast-notification {
    bottom: 20px;
    right: 20px;
    left: 20px;
    max-width: 100%;
  }

  .edu-item {
    flex-direction: column;
    gap: 10px;
    padding-left: 24px;
  }

  .edu-year {
    text-align: left;
    width: auto;
  }

  .edu-dot {
    position: absolute;
    left: 0;
    top: 5px;
  }

  .edu-item:not(:last-child) .edu-dot::after {
    height: calc(100% + 15px);
  }
}

@media (max-width: 480px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
  .grid-two-cols {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .link-icon {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
}
.cv-subtitle {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 6px;
}

.cv-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 10px 0;
}

.cv-hint {
  font-size: 0.8rem;
  color: #94a3b8;
}
</style>
