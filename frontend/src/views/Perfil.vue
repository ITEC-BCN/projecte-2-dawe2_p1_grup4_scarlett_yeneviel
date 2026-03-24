<script setup>
import { ref, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { URL_BACK } from "../../../config";
import { useStudents } from "../composables/useStudents";

const route = useRoute();
const router = useRouter();
const studentId = route.params.id || localStorage.getItem("studentId");
const url = ref(`${URL_BACK}/estudiantes/${studentId}`);

 const role = localStorage.getItem('role'); 

 

const { students, loadingStudents, isCreating, createStudent } =
  useStudents(url);

const user = reactive({
  name: "",
  role: "",
  avatar: "",
  about: "",
});

console.log("Datos del estudiante desde el composable:", students);
const hardSkills = ref([]);
const softSkills = ref([]);
const languages = ref([]);
const contact = reactive({
  email: "",
  phone: "",
  location: "",
});

const documents = ref([]);
const academicBackground = ref([]);

watch(
  () => students.value,
  (newStudents) => {
    if (newStudents) {
      Object.assign(user, {
        name: newStudents.nombre + " " + newStudents.apellido || "Sin nombre",
        role: newStudents.role || "Sin rol",
        avatar: newStudents.avatar || "/img/avatarGroup.png",
        about: newStudents.about || "Sin descripción.",
      });

      /* 1. Limpiamos los arrays antes de llenarlos */
      hardSkills.value = [];
      softSkills.value = [];

      /* 2. Clasificar las skills */
      if (newStudents.estudiante_skill && Array.isArray(newStudents.estudiante_skill)) {
        console.log("Procesando skills:");
        
        newStudents.estudiante_skill.forEach((item) => {
          // Accedemos de forma segura a item.skill
          const datosSkill = item.skill; 
          
          if (datosSkill && datosSkill.nombre) {
            // Limpiamos el tipo para evitar errores de mayúsculas o espacios
            const tipoSkill = datosSkill.tipo ? datosSkill.tipo.toLowerCase().trim() : '';

            if (tipoSkill === 'hard skill') {
              hardSkills.value.push(datosSkill.nombre);
            } else if (tipoSkill === 'soft skill') {
              softSkills.value.push(datosSkill.nombre);
            }
          }
        });
      }
      //console.log("¿Hay skills en el estudiante?:", newStudents.estudiante_skill);

      /* Añadimos los idiomas del estudiante */
      if (
        newStudents.idiomas &&
        newStudents.idiomas.idiomas &&
        newStudents.idiomas.idiomas.length > 0
      ) {
        languages.value = newStudents.idiomas.idiomas.map((lang) => ({
          name: lang.name,
          level: lang.level,
        }));
      }

      /* Cargamos los datos de contacto del estudiante */
      if (newStudents.email) {
        contact.email = newStudents.email;
      }

      if (newStudents.telefono) {
        contact.phone = newStudents.telefono;
      }

      if (newStudents.location) {
        contact.location = newStudents.location;
      }

      /* Añadimos los links del estudiante */
      if (newStudents.enlaces && newStudents.enlaces.length > 0) {

        // 2. Procesar los enlaces mapeando el ID y cubriendo name/nombre
        documents.value = newStudents.enlaces.map((enlace, index) => ({
          id: enlace.id || Date.now() + index, // <-- ¡CRÍTICO! Añadimos un ID para el v-for
          label: enlace.nombre || enlace.name || `Enlace ${index + 1}`, // <-- Cubrimos 'nombre' y 'name'
          tipo: enlace.tipo || "Enlace",
          url: enlace.url || "#",
        }));
      } else {
        console.log("El backend no envió enlaces o el array está vacío.");
      }

      // Función segura para obtener el icono
      

      /* Añadimos la formación académica del estudiante */
      if (newStudents.estudios && Array.isArray(newStudents.estudios.formacion)) {
        academicBackground.value = newStudents.estudios.formacion.map((f) => ({
          centro: f.centro || "Centro no especificado",
          anio: f.anio || "N/A",
          titulo: f.titulo || "Título no especificado",
        }));
      }
    }
  },
  { immediate: true }
);

const editing = ref(false);
const form = reactive({ name: user.name, role: user.role, about: user.about });

const newHard = ref("");
const newSoft = ref("");
const newDocLabel = ref("");
const newDocURL = ref("");
const newLangName = ref("");
const newLangLevel = ref("");

function toggleEdit() {
  editing.value = !editing.value;
  if (!editing.value) {
    form.name = user.name;
    form.role = user.role;
    form.about = user.about;
  }
}

function saveProfile() {
  user.name = form.name;
  user.role = form.role;
  user.about = form.about;
  editing.value = false;
}

function addHard() {
  const v = newHard.value && newHard.value.trim();
  if (v) {
    hardSkills.value.push(v);
    newHard.value = "";
  }
}
function removeHard(i) {
  hardSkills.value.splice(i, 1);
}

function addSoft() {
  const v = newSoft.value && newSoft.value.trim();
  if (v) {
    softSkills.value.push(v);
    newSoft.value = "";
  }
}
function removeSoft(i) {
  softSkills.value.splice(i, 1);
}

function addDocument() {
  const label = newDocLabel.value && newDocLabel.value.trim();
  const url = newDocURL.value && newDocURL.value.trim();
  if (label && url) {
    documents.value.push({ id: Date.now(), label, url });
    newDocLabel.value = "";
    newDocURL.value = "";
  }
}
function removeDocument(id) {
  documents.value = documents.value.filter((d) => d.id !== id);
}

function addLanguage() {
  const name = newLangName.value && newLangName.value.trim();
  const level = newLangLevel.value && newLangLevel.value.trim();
  if (name) {
    languages.value.push({ id: Date.now(), name, level: level || "Básico" });
    newLangName.value = "";
    newLangLevel.value = "";
  }
}
function removeLanguage(i) {
  languages.value.splice(i, 1);
}

// Funciones para editar
const newEdu = reactive({ centro: "", anio: "", titulo: "" });

function addEducation() {
  if (newEdu.centro && newEdu.titulo) {
    academicBackground.value.push({ ...newEdu });
    newEdu.centro = "";
    newEdu.anio = "";
    newEdu.titulo = "";
  }
}

function removeEducation(index) {
  academicBackground.value.splice(index, 1);
}

// Función segura para obtener el icono
const getDocIcon = (tipo) => {
  if (!tipo) return 'fa-solid fa-file-lines';

  const tipoFormat = tipo.toLowerCase();
  if (tipoFormat.includes('github')) return 'fa-brands fa-github';
  if (tipoFormat.includes('linkedin')) return 'fa-brands fa-linkedin';

  return 'fa-solid fa-file-lines';
};

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

      <div class="profile-actions" v-if="role == 'estudiante'">
        <button class="btn-primary" :class="{ 'btn-cancel': editing }" @click="toggleEdit">
          <i :class="editing ? 'fa-solid fa-xmark' : 'fa-solid fa-pen-to-square'"></i>
          {{ editing ? " Cancelar" : " Editar perfil" }}
        </button>
        <button v-if="editing" class="btn-save" @click="saveProfile">
          <i class="fa-solid fa-floppy-disk"></i> Guardar
        </button>
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

      <div class="sidebar-block">
        <h3 class="sidebar-title"><i class="fa-solid fa-user"></i> Sobre mí</h3>
        <p class="sidebar-text">{{ user.about }}</p>
      </div>

      <div class="sidebar-block">
        <h3 class="sidebar-title"><i class="fa-solid fa-address-book"></i> Contacto</h3>
        <div class="contact-links">
          <a :href="`mailto:${contact.email}`" class="contact-item">
            <i class="fa-solid fa-envelope"></i>
            <span>{{ contact.email || 'Sin email' }}</span>
          </a>
          <div class="contact-item">
            <i class="fa-solid fa-phone"></i>
            <span>{{ contact.phone || 'Sin teléfono' }}</span>
          </div>
          <div class="contact-item">
            <i class="fa-solid fa-location-dot"></i>
            <span>{{ contact.location || 'Sin ubicación' }}</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="profile-main">
      
      <section class="section">
        <h2 class="section-title">
          <i class="fa-solid fa-graduation-cap icon-green"></i> Formación Académica
        </h2>

        <div v-if="!editing" class="education-timeline">
          <div v-if="academicBackground.length === 0" class="empty-state">
            Sin formación registrada aún.
          </div>
          <div v-for="(edu, index) in academicBackground" :key="index" class="edu-item">
            <div class="edu-year">{{ edu.anio }}</div>
            <div class="edu-dot"></div>
            <div class="edu-info">
              <div class="edu-title">{{ edu.titulo }}</div>
              <div class="edu-center">{{ edu.centro }}</div>
            </div>
          </div>
        </div>

        <div v-else class="edit-education">
          <div v-for="(edu, index) in academicBackground" :key="'edit' + index" class="edit-row">
            <input v-model="edu.anio" placeholder="Año" class="input input-sm" />
            <input v-model="edu.titulo" placeholder="Título" class="input" />
            <input v-model="edu.centro" placeholder="Centro" class="input" />
            <button @click="removeEducation(index)" class="btn-icon-danger"><i class="fa-solid fa-trash"></i></button>
          </div>
          <div class="add-box">
            <p class="subtitle">Añadir nueva titulación</p>
            <div class="edit-row">
              <input v-model="newEdu.anio" placeholder="Ej: 2024" class="input input-sm" />
              <input v-model="newEdu.titulo" placeholder="Título" class="input" />
              <input v-model="newEdu.centro" placeholder="Centro" class="input" />
              <button @click.prevent="addEducation" class="btn-icon-success"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">
          <i class="fa-solid fa-bolt icon-purple"></i> Habilidades y Competencias
        </h2>
        
        <div class="skills-grid">
          <div class="skill-group">
            <h3 class="skill-subtitle">Hard Skills</h3>
            <div class="skill-list">
              <span v-for="(s, i) in hardSkills" :key="i" class="skill-chip hard">
                {{ s }}
                <button v-if="editing" @click="removeHard(i)" class="btn-remove-chip"><i class="fa-solid fa-xmark"></i></button>
              </span>
              <span v-if="hardSkills.length === 0" class="empty-state">No hay hard skills.</span>
            </div>
            <div v-if="editing" class="add-inline">
              <input v-model="newHard" class="input" placeholder="Añadir..." @keyup.enter="addHard" />
              <button class="btn-add-small" @click.prevent="addHard">Añadir</button>
            </div>
          </div>

          <div class="skill-group">
            <h3 class="skill-subtitle">Soft Skills</h3>
            <div class="skill-list">
              <span v-for="(s, i) in softSkills" :key="i" class="skill-chip soft">
                {{ s }}
                <button v-if="editing" @click="removeSoft(i)" class="btn-remove-chip"><i class="fa-solid fa-xmark"></i></button>
              </span>
              <span v-if="softSkills.length === 0" class="empty-state">No hay soft skills.</span>
            </div>
            <div v-if="editing" class="add-inline">
              <input v-model="newSoft" class="input" placeholder="Añadir..." @keyup.enter="addSoft" />
              <button class="btn-add-small" @click.prevent="addSoft">Añadir</button>
            </div>
          </div>
        </div>
      </section>

      <div class="grid-two-cols">
        <section class="section">
          <h2 class="section-title"><i class="fa-solid fa-language icon-green"></i> Idiomas</h2>
          <div class="skill-list">
            <span v-for="(lang, i) in languages" :key="i" class="skill-chip lang">
              <strong>{{ lang.name }}</strong> <span class="badge-level">{{ lang.level }}</span>
              <button v-if="editing" @click="removeLanguage(i)" class="btn-remove-chip"><i class="fa-solid fa-xmark"></i></button>
            </span>
            <span v-if="languages.length === 0" class="empty-state">Sin idiomas registrados.</span>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title"><i class="fa-solid fa-link icon-purple"></i> Enlaces</h2>
          <div class="links-list">
            <div v-for="doc in documents" :key="doc.id" class="link-item">
              <a :href="doc.url" target="_blank" class="link-content">
                <i :class="getDocIcon(doc.tipo)" class="link-icon"></i>
                <span class="link-label">{{ doc.label }}</span>
              </a>
              <button v-if="editing" class="btn-icon-danger-small" @click="removeDocument(doc.id)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <div v-if="documents.length === 0" class="empty-state">Aún no hay enlaces.</div>
          </div>
        </section>
      </div>

    </main>
  </div>
</template>

<style scoped>
/* GENERAL */
.profile-page {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  background-color: #F3F4F6; /* Fondo gris muy suave y limpio */
  min-height: 100vh;
  font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* SIDEBAR CARD */
.profile-card {
  width: 320px;
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
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
  background: linear-gradient(135deg, var(--accent-green), var(--accent-purple));
  border-radius: 50%;
  margin-bottom: 15px;
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
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 5px 0;
}

.profile-role {
  color: #64748b;
  font-size: 1rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* BOTONES SIDEBAR */
.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-primary, .btn-save {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
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

.btn-primary:hover { background: #e2e8f0; }

.btn-primary.btn-cancel {
  background: #fee2e2;
  color: #ef4444;
}

.btn-save {
  background: var(--accent-purple);
  color: white;
}
.btn-save:hover { background: #7c3aed; }

/* ESTADÍSTICAS */
.profile-stats {
  display: flex;
  gap: 15px;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  padding: 20px 0;
}

.stat {
  flex: 1;
  text-align: center;
}

.stat .num {
  font-weight: 800;
  color: #111827;
  font-size: 1.5rem;
}

.stat .label {
  font-size: 0.8rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* TEXTOS SIDEBAR */
.sidebar-title {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-text {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.6;
  margin: 0;
  text-align: left;
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #475569;
  font-size: 0.9rem;
  text-decoration: none;
}

.contact-item i {
  color: var(--accent-purple);
  width: 16px;
  text-align: center;
}

.contact-item span {
  word-break: break-all;
}

/* CONTENIDO PRINCIPAL */
.profile-main {
  flex: 1;
  max-width: 850px;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.section {
  background: #ffffff;
  border-radius: 20px;
  padding: 35px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 25px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 2px solid #f1f5f9;
  padding-bottom: 15px;
}

.icon-green { color: var(--accent-green); }
.icon-purple { color: var(--accent-purple); }

/* LÍNEA DE TIEMPO (FORMACIÓN) */
.education-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
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
  color: #64748b;
  font-size: 0.95rem;
  text-align: right;
  padding-top: 2px;
}

.edu-dot {
  width: 12px;
  height: 12px;
  background: var(--accent-green);
  border-radius: 50%;
  position: relative;
  z-index: 2;
  margin-top: 6px;
  box-shadow: 0 0 0 4px #ecfdf5;
}

.edu-item:not(:last-child) .edu-dot::after {
  content: '';
  position: absolute;
  top: 12px;
  left: 5px;
  width: 2px;
  height: calc(100% + 30px);
  background: #e2e8f0;
  z-index: -1;
}

.edu-info {
  flex: 1;
  text-align: left;
}

.edu-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.edu-center {
  color: #64748b;
  font-size: 0.95rem;
}

/* SKILLS CHIPS */
.skills-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.skill-subtitle {
  font-size: 1rem;
  color: #475569;
  margin: 0 0 15px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-chip {
  padding: 8px 14px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Colores pastel para los chips */
.skill-chip.hard {
  background: #f3e8ff;
  color: #6b21a8;
}

.skill-chip.soft {
  background: #dcfce7;
  color: #166534;
}

.skill-chip.lang {
  background: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.badge-level {
  background: rgba(0,0,0,0.1);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.75rem;
}

/* ENLACES / LINKS */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.link-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 12px 16px;
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.link-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.link-content {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #1e293b;
  font-weight: 600;
}

.link-icon {
  font-size: 1.4rem;
  color: var(--accent-purple);
}

/* FORMULARIOS DE EDICIÓN (Mejorados) */
.edit-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}

.input {
  flex: 1;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  font-family: inherit;
  font-size: 0.95rem;
}

.input:focus {
  outline: none;
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.input-sm { width: 80px; flex: none; }

.btn-icon-danger, .btn-icon-success, .btn-remove-chip {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.btn-icon-success {
  background: #dcfce7;
  color: #16a34a;
}

.btn-remove-chip {
  background: transparent;
  color: inherit;
  width: auto;
  height: auto;
  opacity: 0.7;
  padding: 0;
}
.btn-remove-chip:hover { opacity: 1; }

.add-inline {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-add-small {
  padding: 0 15px;
  background: var(--accent-purple);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.empty-state {
  color: #94a3b8;
  font-size: 0.9rem;
  font-style: italic;
}

.grid-two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

/* RESPONSIVE */
@media (max-width: 860px) {
  .profile-page { flex-direction: column; }
  .profile-card { width: 100%; box-sizing: border-box; position: static; }
  .grid-two-cols, .skills-grid { grid-template-columns: 1fr; }
  .edit-row { flex-direction: column; align-items: stretch; }
  .input-sm { width: 100%; }
}
</style>