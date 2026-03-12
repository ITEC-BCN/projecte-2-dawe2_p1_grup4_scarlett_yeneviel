<script setup>
import { ref, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { URL_BACK } from "../../../config";
import { useStudents } from "../composables/useStudents";

const route = useRoute();
const router = useRouter();
const studentId = route.params.id || localStorage.getItem("studentId");
const url = ref(`${URL_BACK}/estudiantes/${studentId}`);

console.log(studentId)

const { students, loadingStudents, isCreating, createStudent } =
  useStudents(url);

const user = reactive({
  name: "",
  role: "",
  avatar: "",
  about: "",
});


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
        console.log("Procesando skills:", newStudents.estudiante_skill);
        
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
      console.log("¿Hay skills en el estudiante?:", newStudents.estudiante_skill);

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
        // 1. Un console.log para ver exactamente qué nos manda Supabase
        console.log("Enlaces recibidos del back:", newStudents.enlaces);

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
        <img :src="user.avatar" alt="avatar" class="profile-avatar" />
        <div>
          <h2 class="profile-name">{{ user.name }}</h2>
          <div class="profile-role">{{ user.role }}</div>
        </div>
      </div>

      <div class="profile-actions">
        <button class="btn-edit" @click="toggleEdit">
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
          <span class="label">Documentos</span>
        </div>
      </div>

      <div class="sidebar-block">
        <strong><i class="fa-solid fa-user"></i> Sobre mí</strong>
        <p>{{ user.about }}</p>
      </div>

      <div class="sidebar-block">
        <strong><i class="fa-solid fa-address-book"></i> Contacto</strong>
        <div class="contact-links">
          <div class="small">
            <i class="fa-solid fa-envelope"></i>
            <a :href="`mailto:${contact.email}`">{{ contact.email }}</a>
          </div>
          <div class="small">
            <i class="fa-solid fa-phone"></i> {{ contact.phone }}
          </div>
          <div class="small">
            <i class="fa-solid fa-location-dot"></i> {{ contact.location }}
          </div>
        </div>
      </div>
    </aside>

    <main class="profile-main">
      <section class="section highlight-green">
        <div class="title"> Formación Reglada
        </div>

        <div v-if="!editing" class="education-timeline">
          <div v-for="(edu, index) in academicBackground" :key="index" class="edu-item">
            <div class="edu-year">{{ edu.anio }}</div>
            <div class="edu-info">
              <div class="edu-title">{{ edu.titulo }}</div>
              <div class="edu-center">{{ edu.centro }}</div>
            </div>
          </div>
          <div v-if="academicBackground.length === 0" class="small">Sin formación registrada.</div>
        </div>

        <div v-else class="edit-education">
          <div class="profile-form" style="display: block;">
            <div v-for="(edu, index) in academicBackground" :key="'edit' + index" class="edit-edu-row">
              <input v-model="edu.anio" placeholder="Año" class="input input-sm" />
              <input v-model="edu.titulo" placeholder="Título" class="input" />
              <input v-model="edu.centro" placeholder="Centro" class="input" />
              <button @click="removeEducation(index)" class="btn-x">×</button>
            </div>
          </div>

          <div class="add-box" style="margin-top: 1rem; flex-direction: column; align-items: flex-start;">
            <p class="subtitle">Nueva titulación</p>
            <div class="edit-edu-row" style="width: 100%;">
              <input v-model="newEdu.anio" placeholder="Ej: 2024" class="input input-sm" />
              <input v-model="newEdu.titulo" placeholder="Título..." class="input" />
              <input v-model="newEdu.centro" placeholder="Centro..." class="input" />
              <button @click.prevent="addEducation" class="btn-edit" style="flex: 0; padding: 0 15px;">+</button>
            </div>
          </div>
        </div>
      </section>

      <section class="section highlight-purple">
        <div class="title">Habilidades</div>
        <div class="profile-form">
          <div>
            <div class="subtitle">Hard skills</div>
            <div class="skill-list">
              <span v-for="(s, i) in hardSkills" :key="i" class="skill-chip">
                <i class="fa-solid fa-code"></i> {{ s }}
                <button v-if="editing" @click="removeHard(i)" class="btn-x">
                  ×
                </button>
              </span>
            </div>
          </div>
          <div>
            <div class="subtitle">Soft skills</div>
            <div class="skill-list">
              <span v-for="(s, i) in softSkills" :key="i" class="skill-chip soft">
                <i class="fa-solid fa-brain"></i> {{ s }}
                <button v-if="editing" @click="removeSoft(i)" class="btn-x">
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>
        <div v-if="editing" class="add-box">
          <input v-model="newHard" class="input" placeholder="Nueva Hard skill" />
          <button class="btn-edit" @click.prevent="addHard">Añadir</button>
        </div>
      </section>

      <div class="grid-two-cols">
        <section class="section highlight-green">
          <div class="title">Idiomas</div>
          <div class="skill-list">
            <span v-for="(lang, i) in languages" :key="i" class="skill-chip lang">
              {{ lang.name }} · <b>{{ lang.level }}</b>
              <button v-if="editing" @click="removeLanguage(i)" class="btn-x">
                ×
              </button>
            </span>
          </div>
        </section>

        <section class="section">
          <div class="title">Enlaces</div>

          <div v-if="documents.length > 0" class="doc-list">
            <div v-for="doc in documents" :key="doc.id" class="offer-item">
              <div class="offer-info">
                <i :class="getDocIcon(doc.tipo)" class="doc-icon"></i>
                <a :href="doc.url" target="_blank" class="offer-title">
                  {{ doc.label }}
                </a>
              </div>
              <button v-if="editing" class="btn-x" @click="removeDocument(doc.id)">
                ×
              </button>
            </div>
          </div>

          <div v-else class="small" style="color: #64748b; padding-left: 0.5rem;">
            Aún no hay enlaces añadidos.
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* GENERAL */
i {
  color: black;
  padding-right: 4px;
}

.profile-page {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1.5rem;
  background-color: #f8fafc;
  min-height: 78vh;
}

/* ASIDE */
.profile-card {
  width: 340px;
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 2rem;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid var(--accent-green);
  object-fit: cover;
  margin-bottom: 0.5rem;
}

.profile-name {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--accent-purple);
  margin: 0;
}

.profile-role {
  color: #64748b;
  font-size: 0.95rem;
  font-weight: 500;
}

.profile-actions {
  display: flex;
  gap: 0.5rem;
  margin: 1.2rem 0;
}

.btn-edit,
.btn-save {
  flex: 1;
  border: none;
  padding: 0.6rem;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--accent-green);
  color: white;
}

.btn-save {
  background: var(--accent-purple);
}

.btn-edit:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.profile-stats {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stat {
  flex: 1;
  background: #f1f5f9;
  padding: 0.8rem;
  border-radius: 12px;
  text-align: center;
}

.stat .num {
  font-weight: 800;
  color: var(--accent-purple);
  font-size: 1.2rem;
}

.stat .label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 600;
}

.sidebar-block {
  border-top: 1px solid #f1f5f9;
  padding-top: 1rem;
  margin-top: 1rem;
}

.sidebar-block strong {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.sidebar-block p,
.contact-links .small {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.5;
  text-align: start;
  padding-left: 20px;
}

/* MAIN CONTENT */
.profile-main {
  flex: 1;
  max-width: 800px;
}

.section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(0, 0, 0, 0.04);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

.section .title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--accent-purple);
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.education-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-left: 0.5rem;
}

.edu-item {
  display: flex;
  gap: 1.5rem;
  position: relative;
}


.edu-item::before {
  content: "";
  position: absolute;
  left: 3.5rem;
  top: 0;
  bottom: -1.5rem;
  width: 2px;
  background: #e2e8f0;
}

.edu-item:last-child::before {
  display: none;
}

.edu-year {
  min-width: 3.5rem;
  font-weight: 800;
  color: var(--accent-purple);
  font-size: 0.85rem;
  padding-top: 2px;
}

.edu-title {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
  text-align: start;
}

.edu-center {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
  text-align: start;
}

/* Estilos para edición */
.edit-edu-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
  align-items: center;
}

.input-sm {
  width: 80px;
}

.add-edu-form {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px dashed #e2e8f0;
}

/* Colores de sección */
.highlight-purple {
  background: linear-gradient(to right, #ffffff, #f5f3ff);
  border-left: 4px solid var(--accent-purple);
}

.highlight-green {
  background: linear-gradient(to right, #ffffff, #f0fdf4);
  border-left: 4px solid var(--accent-green);
}

.subtitle {
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 0.8rem;
}

.bio-content {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #334155;
}

/* SKILLS CHIPS */
.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.skill-chip {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--accent-purple);
}

.skill-chip.soft {
  color: var(--accent-green);
}

.skill-chip i {
  font-size: 0.7rem;
}

/* DOCS */
.offer-item {
  display: flex;
  justify-content: space-between;
  padding: 0.8rem;
  background: white;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
  margin-bottom: 0.5rem;
}

.doc-icon {
  font-size: 1.2rem;
  margin-right: 0.5rem;
}

.offer-title {
  font-weight: 700;
  text-decoration: none;
  color: #1e293b;
  font-size: 0.9rem;
}

/* UTILS */
.grid-two-cols {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 1rem;
}

.btn-x {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  padding: 0 4px;
  font-weight: bold;
}

.full-width {
  grid-column: 1 / -1;
}

.profile-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.input,
.textarea {
  width: 100%;
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .profile-page {
    flex-direction: column;
  }

  .profile-card {
    width: 100%;
    position: static;
  }

  .grid-two-cols {
    grid-template-columns: 1fr;
  }
}
</style>