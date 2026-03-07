<script setup>
import { ref, reactive } from "vue";

const user = reactive({
  name: "María López",
  role: "Estudiante de Informática",
  avatar: "/img/avatarGroup.png",
  about:
    "Apasionada por el desarrollo web y las nuevas tecnologías. Buscando prácticas en backend o frontend donde aprender y aportar valor.",
});

const hardSkills = ref(["JavaScript", "Vue.js", "HTML", "CSS"]);
const softSkills = ref([
  "Trabajo en equipo",
  "Comunicación",
  "Resolución de problemas",
]);

const documents = ref([
  { id: 1, label: "CV PDF", url: "https://example.com/cv.pdf" },
  { id: 2, label: "LinkedIn", url: "https://linkedin.com/in/maria" },
  { id: 3, label: "GitHub", url: "https://github.com/maria" },
]);

const languages = ref([
  { id: 1, name: "Español", level: "Nativo" },
  { id: 2, name: "Inglés", level: "Intermedio" },
]);

const contact = reactive({
  email: "maria.lopez@example.com",
  phone: "+34 600 000 000",
  location: "Barcelona, España",
});

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
          <i
            :class="editing ? 'fa-solid fa-xmark' : 'fa-solid fa-pen-to-square'"
          ></i>
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
      <section class="section">
        <div class="title">
          <i class="fa-solid fa-circle-info"></i> Información personal
        </div>
        <div v-if="!editing" class="bio-content">{{ user.about }}</div>

        <form v-else class="profile-form" @submit.prevent="saveProfile">
          <div class="field">
            <label class="small">Nombre</label>
            <input v-model="form.name" class="input" />
          </div>
          <div class="field">
            <label class="small">Rol / Estudio</label>
            <input v-model="form.role" class="input" />
          </div>
          <div class="field full-width">
            <label class="small">Sobre mí</label>
            <textarea v-model="form.about" class="textarea"></textarea>
          </div>
        </form>
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
              <span
                v-for="(s, i) in softSkills"
                :key="i"
                class="skill-chip soft"
              >
                <i class="fa-solid fa-brain"></i> {{ s }}
                <button v-if="editing" @click="removeSoft(i)" class="btn-x">
                  ×
                </button>
              </span>
            </div>
          </div>
        </div>
        <div v-if="editing" class="add-box">
          <input
            v-model="newHard"
            class="input"
            placeholder="Nueva Hard skill"
          />
          <button class="btn-edit" @click.prevent="addHard">Añadir</button>
        </div>
      </section>

      <div class="grid-two-cols">
        <section class="section highlight-green">
          <div class="title">Idiomas</div>
          <div class="skill-list">
            <span
              v-for="(lang, i) in languages"
              :key="i"
              class="skill-chip lang"
            >
              {{ lang.name }} · <b>{{ lang.level }}</b>
              <button v-if="editing" @click="removeLanguage(i)" class="btn-x">
                ×
              </button>
            </span>
          </div>
        </section>

        <section class="section">
          <div class="title">Documentación</div>
          <div class="doc-list">
            <div v-for="doc in documents" :key="doc.id" class="offer-item">
              <div class="offer-info">
                <i
                  :class="[
                    doc.label.toLowerCase().includes('github')
                      ? 'fa-brands fa-github'
                      : doc.label.toLowerCase().includes('linkedin')
                        ? 'fa-brands fa-linkedin'
                        : 'fa-solid fa-file-lines',
                  ]"
                  class="doc-icon"
                ></i>
                <a :href="doc.url" target="_blank" class="offer-title">{{
                  doc.label
                }}</a>
              </div>
              <button
                v-if="editing"
                class="btn-x"
                @click="removeDocument(doc.id)"
              >
                ×
              </button>
            </div>
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
