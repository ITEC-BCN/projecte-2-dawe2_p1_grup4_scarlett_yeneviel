<script setup>
import { ref, reactive } from 'vue'

const user = reactive({
  name: 'María López',
  role: 'Estudiante de Informática',
  avatar: '/img/avatarGroup.png',
  about: 'Apasionada por el desarrollo web y las nuevas tecnologías. Buscando prácticas en backend o frontend donde aprender y aportar valor.'
})

const hardSkills = ref(['JavaScript', 'Vue.js', 'HTML', 'CSS'])
const softSkills = ref(['Trabajo en equipo', 'Comunicación', 'Resolución de problemas'])

const documents = ref([
  { id: 1, label: 'CV PDF', url: 'https://example.com/cv.pdf' },
  { id: 2, label: 'LinkedIn', url: 'https://linkedin.com/in/maria' },
  { id: 3, label: 'GitHub', url: 'https://github.com/maria' }
])

// idiomas y contacto
const languages = ref([
  { id: 1, name: 'Español', level: 'Nativo' },
  { id: 2, name: 'Inglés', level: 'Intermedio' }
])

const contact = reactive({
  email: 'maria.lopez@example.com',
  phone: '+34 600 000 000',
  location: 'Barcelona, España'
})

const editing = ref(false)
const form = reactive({ name: user.name, role: user.role, about: user.about })

// campos temporales para añadir skills/doc/idiomas
const newHard = ref('')
const newSoft = ref('')
const newDocLabel = ref('')
const newDocURL = ref('')
const newLangName = ref('')
const newLangLevel = ref('')

function toggleEdit() {
  editing.value = !editing.value
  if (!editing.value) {
    // restablecer formulario si se cancela
    form.name = user.name
    form.role = user.role
    form.about = user.about
    newHard.value = ''
    newSoft.value = ''
    newDocLabel.value = ''
    newDocURL.value = ''
    newLangName.value = ''
    newLangLevel.value = ''
  }
}

function saveProfile() {
  user.name = form.name
  user.role = form.role
  user.about = form.about
  editing.value = false
}

function addHard() {
  const v = newHard.value && newHard.value.trim()
  if (v) {
    hardSkills.value.push(v)
    newHard.value = ''
  }
}
function removeHard(i) { hardSkills.value.splice(i, 1) }

function addSoft() {
  const v = newSoft.value && newSoft.value.trim()
  if (v) {
    softSkills.value.push(v)
    newSoft.value = ''
  }
}
function removeSoft(i) { softSkills.value.splice(i, 1) }

function addDocument() {
  const label = newDocLabel.value && newDocLabel.value.trim()
  const url = newDocURL.value && newDocURL.value.trim()
  if (label && url) {
    documents.value.push({ id: Date.now(), label, url })
    newDocLabel.value = ''
    newDocURL.value = ''
  }
}
function removeDocument(id) {
  documents.value = documents.value.filter(d => d.id !== id)
}

// idiomas
function addLanguage() {
  const name = newLangName.value && newLangName.value.trim()
  const level = newLangLevel.value && newLangLevel.value.trim()
  if (name) {
    languages.value.push({ id: Date.now(), name, level: level || 'Básico' })
    newLangName.value = ''
    newLangLevel.value = ''
  }
}
function removeLanguage(i) { languages.value.splice(i, 1) }
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
        <button class="btn-edit" @click="toggleEdit">{{ editing ? 'Cancelar' : 'Editar perfil' }}</button>
        <button v-if="editing" class="btn-edit" @click="saveProfile">Guardar</button>
      </div>

      <div class="profile-stats">
        <div class="stat">
          <div class="num">{{ hardSkills.length }}</div>
          <span class="label">Habilidades</span>
        </div>
        <div class="stat">
          <div class="num">{{ languages.length }}</div>
          <span class="label">Idiomas</span>
        </div>
        <div class="stat">
          <div class="num">{{ documents.length }}</div>
          <span class="label">Documentos</span>
        </div>
      </div>

      <div style="margin-top:1rem;" class="small">
        <strong>Sobre mí</strong>
        <p style="margin:0.4rem 0 0;">{{ user.about }}</p>
      </div>

      <div style="margin-top:1rem;" class="small">
        <strong>Contacto</strong>
        <div style="margin-top:0.4rem;">
          <div class="small">✉️ <a :href="`mailto:${contact.email}`">{{ contact.email }}</a></div>
          <div class="small">📞 {{ contact.phone }}</div>
          <div class="small">📍 {{ contact.location }}</div>
        </div>
      </div>

      <div style="margin-top:1rem;" class="small">
        <strong>Idiomas</strong>
        <div class="skill-list" style="margin-top:0.5rem;">
          <span v-for="lang in languages" :key="lang.id" class="skill-chip">{{ lang.name }} · {{ lang.level }}</span>
        </div>
      </div>

    </aside>

    <main class="profile-main">
      <section class="section">
        <div class="title">Información personal</div>

        <div v-if="!editing" class="small" style="white-space:pre-wrap">{{ user.about }}</div>

        <form v-else class="profile-form" @submit.prevent="saveProfile">
          <div class="field">
            <label class="small">Nombre</label>
            <input v-model="form.name" class="input" />
          </div>
          <div class="field">
            <label class="small">Rol / Estudio</label>
            <input v-model="form.role" class="input" />
          </div>
          <div class="field" style="grid-column: 1 / -1;">
            <label class="small">Sobre mí</label>
            <textarea v-model="form.about" class="textarea"></textarea>
          </div>
        </form>
      </section>

      <section class="section">
        <div class="title">Skills</div>
        <div class="profile-form" style="grid-template-columns: 1fr 1fr; gap:1rem;">
          <div>
            <div class="small" style="margin-bottom:0.5rem; font-weight:700; color:var(--accent-purple)">Hard skills</div>
            <div class="skill-list">
              <span v-for="(s, i) in hardSkills" :key="s + i" class="skill-chip">
                {{ s }}
                <button v-if="editing" @click="removeHard(i)" class="btn-edit" style="padding:0.15rem 0.4rem; font-weight:600; background:#ef4444;">x</button>
              </span>
            </div>

            <div v-if="editing" style="margin-top:0.5rem; display:flex; gap:0.5rem;">
              <input v-model="newHard" class="input" placeholder="Añadir hard skill" />
              <button class="btn-edit" @click.prevent="addHard">Añadir</button>
            </div>
          </div>

          <div>
            <div class="small" style="margin-bottom:0.5rem; font-weight:700; color:var(--accent-purple)">Soft skills</div>
            <div class="skill-list">
              <span v-for="(s, i) in softSkills" :key="s + i" class="skill-chip">
                {{ s }}
                <button v-if="editing" @click="removeSoft(i)" class="btn-edit" style="padding:0.15rem 0.4rem; font-weight:600; background:#ef4444;">x</button>
              </span>
            </div>

            <div v-if="editing" style="margin-top:0.5rem; display:flex; gap:0.5rem;">
              <input v-model="newSoft" class="input" placeholder="Añadir soft skill" />
              <button class="btn-edit" @click.prevent="addSoft">Añadir</button>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="title">Idiomas</div>
        <div class="skill-list" style="margin-bottom:0.75rem;">
          <span v-for="(lang, i) in languages" :key="lang.id" class="skill-chip">
            {{ lang.name }} · {{ lang.level }}
            <button v-if="editing" @click="removeLanguage(i)" class="btn-edit" style="padding:0.15rem 0.4rem; font-weight:600; background:#ef4444; margin-left:0.4rem;">x</button>
          </span>
        </div>

        <div v-if="editing" style="display:grid; grid-template-columns: 2fr 1fr; gap:0.5rem; align-items:center;">
          <input v-model="newLangName" class="input" placeholder="Idioma (ej. Inglés)" />
          <input v-model="newLangLevel" class="input" placeholder="Nivel (ej. Avanzado)" />
          <div style="grid-column:1 / -1; display:flex; justify-content:flex-end;">
            <button class="btn-edit" @click.prevent="addLanguage">Añadir idioma</button>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="title">Documentación</div>
        <div class="doc-list">
          <div v-for="doc in documents" :key="doc.id" class="offer-item" style="align-items:center;">
            <div class="offer-info">
              <a :href="doc.url" target="_blank" rel="noopener" class="offer-title">{{ doc.label }}</a>
              <div class="offer-meta small">{{ doc.url }}</div>
            </div>
            <div>
              <button v-if="editing" class="btn-edit" @click="removeDocument(doc.id)" style="background:#ef4444;">Eliminar</button>
            </div>
          </div>
        </div>

        <div v-if="editing" style="margin-top:0.75rem; display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;">
          <input v-model="newDocLabel" class="input" placeholder="Etiqueta (CV, LinkedIn...)" />
          <input v-model="newDocURL" class="input" placeholder="URL" />
          <div style="grid-column:1 / -1; display:flex; justify-content:flex-end; gap:0.5rem;">
            <button class="btn-edit" @click.prevent="addDocument">Añadir documento</button>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>

/* Estilos para la vista Perfil */
.profile-page {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
}

.profile-card {
  width: 360px;
  background: linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.82));
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 8px 20px rgba(33,53,71,0.06);
  text-align: left;
  border: 1px solid rgba(33,53,71,0.04);
}

.profile-header {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid var(--accent-green);
  box-shadow: 0 8px 18px rgba(16,185,129,0.12);
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-purple);
  margin: 0;
}

.profile-role {
  margin-top: 0.25rem;
  color: rgba(33,53,71,0.6);
  font-size: 0.95rem;
}

.profile-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
}

.btn-edit {
  background: var(--accent-green);
  color: #fff;
  border: none;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
}

.btn-edit:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(16,185,129,0.12);
}

.profile-stats {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.stat {
  flex: 1;
  background: linear-gradient(135deg, rgba(139,92,246,0.04), rgba(16,185,129,0.03));
  padding: 0.75rem;
  border-radius: 10px;
  text-align: center;
}

.stat .num {
  font-weight: 700;
  color: var(--accent-purple);
  font-size: 1.1rem;
}

.stat .label {
  display: block;
  margin-top: 0.25rem;
  color: rgba(33,53,71,0.6);
  font-size: 0.9rem;
}

.profile-main {
  flex: 1;
  max-width: 760px;
  text-align: left;
}

.section {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(33,53,71,0.04);
  box-shadow: 0 6px 18px rgba(33,53,71,0.03);
}

.section .title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  color: var(--accent-purple);
  margin-bottom: 0.5rem;
}

.offers-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
}

.offer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 10px;
  background: linear-gradient(180deg, #fff, #fbfdff);
  border: 1px solid rgba(33,53,71,0.06);
}

.offer-info {
  text-align: left;
}

.offer-title {
  font-weight: 600;
  color: rgba(33,53,71,0.9);
}

.offer-meta {
  font-size: 0.9rem;
  color: rgba(33,53,71,0.55);
}

/* Skills y documentos */
.skill-list { display:flex; flex-wrap:wrap; gap:0.5rem; }
.skill-chip {
  background: linear-gradient(90deg, rgba(139,92,246,0.06), rgba(16,185,129,0.04));
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  display:inline-flex;
  align-items:center;
  gap:0.45rem;
  font-weight:600;
  color: rgba(33,53,71,0.85);
}

.doc-list .offer-item { padding:0.6rem; }

/* Formularios dentro del perfil */
.profile-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.profile-form .field {
  display: flex;
  flex-direction: column;
}

.input, .textarea {
  padding: 0.6rem;
  border-radius: 8px;
  border: 1px solid rgba(33,53,71,0.08);
  background: #fbfbfd;
}

.textarea { min-height: 100px; resize: vertical; }

/* Pequeñas utilidades coherentes con el resto de la web */
.small { font-size: 0.9rem; color: rgba(33,53,71,0.6); }

/* Responsive */
@media (max-width: 992px) {
  .profile-page { gap: 1rem; padding: 1.25rem; }
  .profile-card { width: 320px; }
}

@media (max-width: 768px) {
  .profile-page { flex-direction: column; padding: 1rem; }
  .profile-card { width: 100%; display: flex; align-items: center; }
  .profile-header { flex-direction: row; }
  .profile-avatar { width: 96px; height: 96px; }
  .profile-form { grid-template-columns: 1fr; }
}

</style>