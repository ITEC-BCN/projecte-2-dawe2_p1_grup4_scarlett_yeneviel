<script setup>
import { ref, reactive, watch, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { URL_BACK } from "../../../config";
import { useStudents } from "../composables/useStudents";
import { availableLanguagesList, languageLevels, allLinkTypes } from "../js/const.js"

const route = useRoute();
const router = useRouter();
const studentId = route.params.id || localStorage.getItem("studentId");
const url = ref(`${URL_BACK}/estudiantes/${studentId}`);
const role = localStorage.getItem('role');

const { students, loadingStudents } = useStudents(url);

const hasUnsavedChanges = ref(false); //Conocer si hay cambios sin guardar

// --- Estado para todas las skills de la BD ---
const allDbSkills = ref([]);
const selectedHardSkillId = ref("");
const selectedSoftSkillId = ref("");

// Cargar todas las skills al montar el componente
onMounted(async () => {
  try {
    const res = await fetch(`${URL_BACK}/skills`);
    const data = await res.json();
    allDbSkills.value = data;
  } catch (error) {
    console.error("Error cargando skills de la BD:", error);
  }
});

// Filtramos las skills para los selects
const availableHardSkills = computed(() => {
  return allDbSkills.value.filter(s =>
    s.tipo === 'hard skill' && !hardSkills.value.some(hs => hs.id === s.id)
  );
});

const availableSoftSkills = computed(() => {
  return allDbSkills.value.filter(s =>
    s.tipo === 'soft skill' && !softSkills.value.some(ss => ss.id === s.id)
  );
});

const user = reactive({ name: "", role: "", avatar: "", about: "" });
const contact = reactive({ email: "", phone: "", location: "" });

const hardSkills = ref([]);
const softSkills = ref([]);
const languages = ref([]);
const documents = ref([]);
const academicBackground = ref([]);
const uploadingFile = ref(false);

//Añadir la FOTO DE PERFIL

const uploadAvatar = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  uploadingFile.value = true;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('studentId', students.value.id);

  try {
    const response = await fetch(`${URL_BACK}/upload-avatar`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      // Como Node ya actualizó Supabase, solo actualizamos la pantalla
      user.avatar = data.url;

      if (students.value) {
        students.value.foto_perfil = data.url;
      }

      alert('¡Foto actualizada con éxito!');
    } else {
      alert('Error al subir: ' + data.error);
    }

  } catch (error) {
    console.error('Error de conexión:', error);
  } finally {
    uploadingFile.value = false;
  }
};

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

  if (source.estudiante_skill) {
    source.estudiante_skill.forEach((item) => {
      const datosSkill = item.skill;
      if (datosSkill) {
        const tipoSkill = datosSkill.tipo ? datosSkill.tipo.toLowerCase().trim() : '';
        if (tipoSkill === 'hard skill') {
          hardSkills.value.push({ id: datosSkill.id, nombre: datosSkill.nombre });
        } else if (tipoSkill === 'soft skill') {
          softSkills.value.push({ id: datosSkill.id, nombre: datosSkill.nombre });
        }
      }
    });
  }

  // IMPORTANTE: Hacemos copias profundas (JSON parse/stringify) para romper la 
  // referencia de los objetos. Así, si el usuario edita un input y luego cancela,
  // el objeto original de 'students' se mantiene intacto.
  languages.value = source.idiomas?.idiomas
    ? JSON.parse(JSON.stringify(source.idiomas.idiomas))
    : [];

  academicBackground.value = source.estudios?.formacion
    ? JSON.parse(JSON.stringify(source.estudios.formacion))
    : [];

  // Ordenar por año descendente (más recientes primero)
  academicBackground.value.sort((a, b) => parseInt(b.anio) - parseInt(a.anio));

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
  { immediate: true }
);

const editing = ref(false);

function toggleEdit() {
  if (editing.value) {
    // Si estaba editando y decide cancelar, restauramos todo a como estaba
    restoreOriginalData();
  }
  editing.value = !editing.value;
}

// --- FUNCIONES DE SKILLS CON LÍMITE DE 6 ---
function addHardFromSelect() {
  if (hardSkills.value.length >= 6) {
    alert("Has alcanzado el límite máximo de 6 Hard Skills.");
    return;
  }
  const skill = allDbSkills.value.find(s => s.id === selectedHardSkillId.value);
  if (skill) {
    hardSkills.value.push({ id: skill.id, nombre: skill.nombre });
    selectedHardSkillId.value = "";
  }
  hasUnsavedChanges.value = true;
}

function addSoftFromSelect() {
  if (softSkills.value.length >= 6) {
    alert("Has alcanzado el límite máximo de 6 Soft Skills.");
    return;
  }
  const skill = allDbSkills.value.find(s => s.id === selectedSoftSkillId.value);
  if (skill) {
    softSkills.value.push({ id: skill.id, nombre: skill.nombre });
    selectedSoftSkillId.value = "";
  }
  hasUnsavedChanges.value = true;
}

function removeHard(i) { hardSkills.value.splice(i, 1); hasUnsavedChanges.value = true; }
function removeSoft(i) { softSkills.value.splice(i, 1); hasUnsavedChanges.value = true; }

// --- EL BOTÓN DE GUARDAR AHORA ENVÍA DATOS AL BACKEND ---
async function saveProfile() {
  const allSelectedSkillIds = [
    ...hardSkills.value.map(s => s.id),
    ...softSkills.value.map(s => s.id)
  ];

  const payload = {
    foto_perfil: user.avatar,
    about: user.about,
    telefono: contact.phone,
    location: contact.location,
    estudios: { formacion: academicBackground.value },
    idiomas: { idiomas: languages.value },
    skills_ids: allSelectedSkillIds,
    enlaces: documents.value
  };

  try {
    const response = await fetch(`${URL_BACK}/estudiantes/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      editing.value = false;
      alert("¡Perfil actualizado con éxito!");
      hasUnsavedChanges.value = false;

      // Ordenar academicBackground después de guardar para asegurar el orden
      academicBackground.value.sort((a, b) => parseInt(b.anio) - parseInt(a.anio));

      // NOTA: Aquí lo ideal sería volver a ejecutar tu 'useStudents(url)' o recargar 
      // los datos del backend para que 'students.value' tenga la información fresca.
    } else {
      const err = await response.json();
      alert("Error al guardar: " + err.error);
    }
  } catch (error) {
    console.error(error);
    alert("Error de conexión al guardar el perfil.");
  }
}

// Función para obtener el icono según el tipo de enlace
const getDocIcon = (tipo) => {
  if (!tipo) return 'fa-solid fa-file-lines';

  const tipoFormat = tipo.toLowerCase();
  if (tipoFormat.includes('github')) return 'fa-brands fa-github';
  if (tipoFormat.includes('linkedin')) return 'fa-brands fa-linkedin';

  return 'fa-solid fa-file-lines';
};

// --- VARIABLES Y FUNCIONES PARA AÑADIR EDUCACIÓN ---
const newEdu = reactive({ centro: "", anio: "", titulo: "" });

function addEducation() {
  if (newEdu.centro && newEdu.titulo) {
    academicBackground.value.push({ ...newEdu });
    // Ordenar por año descendente después de añadir
    academicBackground.value.sort((a, b) => parseInt(b.anio) - parseInt(a.anio));
    newEdu.centro = "";
    newEdu.anio = "";
    newEdu.titulo = "";
  }
  hasUnsavedChanges.value = true;
}

function removeEducation(index) {
  academicBackground.value.splice(index, 1);
  // Reordenar por año descendente después de remover
  academicBackground.value.sort((a, b) => parseInt(b.anio) - parseInt(a.anio));
  hasUnsavedChanges.value = true;
}

// --- VARIABLES Y FUNCIONES PARA AÑADIR IDIOMAS ---
const newLangName = ref("");
const newLangLevel = ref("");


function addLanguage() {
  const name = newLangName.value?.trim();
  const level = newLangLevel.value?.trim() || "A1";

  if (!name) return;

  //Evita que pueda añadir más de 5 idiomas
  if (languages.value.length >= 5) {
    alert("Has alcanzado el límite máximo de 5 idiomas.");
    return;
  }

  //evitar duplicados
  const exists = languages.value.some(
    lang => lang.name.trim().toLowerCase() === name.toLowerCase()
  );

  if (exists) {
    alert("Este idioma ya está añadido");
    return;
  }

  languages.value.push({ id: Date.now(), name, level });
  newLangName.value = "";
  newLangLevel.value = "";
  hasUnsavedChanges.value = true;
}

const filteredLanguages = computed(() => {
  return availableLanguagesList.filter(
    lang => !languages.value.some(l => l.name === lang)
  );
});

const availableLanguages = computed(() => {
  return languageLevels.filter(lvl =>
    !languages.value.some(lang => lang.level === lvl)
  );
});

function removeLanguage(i) {
  languages.value.splice(i, 1);
  hasUnsavedChanges.value = true;
}

// --- VARIABLES Y FUNCIONES PARA AÑADIR ENLACES ---
const newDocName = ref("");
const newDocURL = ref("");
const newDocTipo = ref("");



const availableLinkTypes = computed(() => {
  const usados = documents.value.map(d => d.tipo?.toLowerCase().trim());
  return allLinkTypes.filter(tipo =>
    !usados.includes(tipo.toLowerCase())
  );
});

watch(documents, () => {
  if (!availableLinkTypes.value.includes(newDocTipo.value)) {
    newDocTipo.value = "";
  }
});

function addDocument() {
  if (documents.value.length >= 3) {
    alert("Solo puedes añadir un máximo de 3 enlaces.");
    return;
  }

  const name = newDocName.value?.trim();
  const url = newDocURL.value?.trim();
  const tipo = newDocTipo.value;

  if (name && url && tipo) {
    documents.value.push({
      id: Date.now(),
      name,
      url,
      tipo
    });

    newDocName.value = "";
    newDocURL.value = "";
    newDocTipo.value = "";
  }
  hasUnsavedChanges.value = true;
}

function removeDocument(id) {
  documents.value = documents.value.filter((d) => d.id !== id);
  hasUnsavedChanges.value = true;
}
</script>

<template>
  <div class="profile-page">

    <aside class="profile-card">
      <div class="profile-header">
        <div class="avatar-container">
          <img :src="user.avatar" alt="avatar" class="profile-avatar" />
        </div>
        <div v-if="editing" class="upload-section" style="margin-top: 10px;">
          <label for="avatar-upload" class="btn-primary" style="cursor: pointer; font-size: 0.8rem;">
            <i class="fa-solid fa-camera"></i> Cambiar foto
          </label>
          <input id="avatar-upload" type="file" accept="image/*" style="display: none;" @change="uploadAvatar"
            :disabled="uploadingFile" />
          <span v-if="uploadingFile" style="font-size: 0.8rem; color: gray;">Subiendo...</span>
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

      <div class="sidebar-block about-block">
        <h3 class="sidebar-title"><i class="fa-solid fa-user"></i> Sobre mí</h3>

        <textarea v-if="editing" v-model="user.about" class="input about-input" rows="4"
          placeholder="Escribe algo sobre ti..."></textarea>
        <p v-else class="sidebar-text">
          {{ user.about || 'Aún no has escrito nada sobre ti.' }}
        </p>
      </div>

      <div class="sidebar-block contact-block">
        <h3 class="sidebar-title"><i class="fa-solid fa-address-book"></i> Contacto</h3>
        <div class="contact-links">
          <a :href="`mailto:${contact.email}`" class="contact-item">
            <div class="contact-icon"><i class="fa-solid fa-envelope"></i></div>
            <div class="contact-content">
              <span class="contact-label">Email</span>
              <span class="contact-value">{{ contact.email || 'Sin email' }}</span>
            </div>
          </a>

          <div class="contact-item">
            <div class="contact-icon"><i class="fa-solid fa-phone"></i></div>
            <div class="contact-content">
              <span class="contact-label">Teléfono</span>
              <template v-if="editing">
                <input v-model="contact.phone" type="text" class="input input-sm contact-input"
                  placeholder="Tu teléfono" />
              </template>
              <span v-else class="contact-value">{{ contact.phone || 'Sin teléfono' }}</span>
            </div>
          </div>

          <div class="contact-item">
            <div class="contact-icon"><i class="fa-solid fa-location-dot"></i></div>
            <div class="contact-content">
              <span class="contact-label">Ubicación</span>
              <template v-if="editing">
                <input v-model="contact.location" type="text" class="input input-sm contact-input"
                  placeholder="Tu ciudad/ubicación" />
              </template>
              <span v-else class="contact-value">{{ contact.location || 'Sin ubicación' }}</span>
            </div>
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
          <div v-for="(edu, index) in academicBackground" :key="'edit' + index" class="edit-grid-row">
            <input v-model="edu.anio" placeholder="Año" class="input" />
            <input v-model="edu.titulo" placeholder="Título" class="input" />
            <input v-model="edu.centro" placeholder="Centro" class="input" />
            <button @click="removeEducation(index)" class="btn-icon-danger" title="Eliminar">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>

          <div class="add-box new-education-box">
            <p class="subtitle"> Añadir nueva titulación</p>

            <div class="edit-grid-row form-labels-top">
              <div class="input-col">
                <label for="edu-anio">Año</label>
                <input id="edu-anio" v-model="newEdu.anio" placeholder="Ej: 2026" class="input" />
              </div>

              <div class="input-col">
                <label for="edu-titulo">Título</label>
                <input id="edu-titulo" v-model="newEdu.titulo" placeholder="Ej: Programación Web" class="input" />
              </div>

              <div class="input-col">
                <label for="edu-centro">Centro</label>
                <input id="edu-centro" v-model="newEdu.centro" placeholder="Ej: ITB" class="input" />
              </div>

              <button @click.prevent="addEducation" class="btn-icon-success btn-align-bottom" title="Añadir">
                <i class="fa-solid fa-plus"></i>
              </button>
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
                {{ s.nombre }}
                <button v-if="editing" @click="removeHard(i)" class="btn-remove-chip"><i
                    class="fa-solid fa-xmark"></i></button>
              </span>
              <span v-if="hardSkills.length === 0" class="empty-state">No hay hard skills.</span>

            </div>

            <div v-if="editing" class="add-inline" style="margin-top: 10px;">
              <p v-if="hardSkills.length >= 6" class="empty-state" style="color: #e74c3c;">
                <i class="fa-solid fa-circle-exclamation"></i> Límite de 6 hard skills alcanzado.
              </p>
              <p v-else-if="availableHardSkills.length === 0" class="empty-state">
                <i class="fa-solid fa-check-double"></i> ¡Has añadido todas las hard skills disponibles!
              </p>
              <template v-else>
                <select v-model="selectedHardSkillId" class="input" :disabled="hardSkills.length >= 6">
                  <option value="" disabled>Selecciona una skill...</option>
                  <option v-for="skill in availableHardSkills" :key="skill.id" :value="skill.id">
                    {{ skill.nombre }}
                  </option>
                </select>
                <button class="btn-add-small" @click.prevent="addHardFromSelect"
                  :disabled="!selectedHardSkillId">Añadir</button>
              </template>
            </div>
          </div>

          <div class="skill-group">
            <h3 class="skill-subtitle">Soft Skills</h3>
            <div class="skill-list">
              <span v-for="(s, i) in softSkills" :key="i" class="skill-chip soft">
                {{ s.nombre }}
                <button v-if="editing" @click="removeSoft(i)" class="btn-remove-chip"><i
                    class="fa-solid fa-xmark"></i></button>
              </span>
              <span v-if="softSkills.length === 0" class="empty-state">No hay soft skills.</span>
            </div>

            <div v-if="editing" class="add-inline" style="margin-top: 10px;">
              <p v-if="softSkills.length >= 6" class="empty-state" style="color: #e74c3c;">
                <i class="fa-solid fa-circle-exclamation"></i> Límite de 6 soft skills alcanzado.
              </p>
              <p v-else-if="availableSoftSkills.length === 0" class="empty-state">
                <i class="fa-solid fa-check-double"></i> ¡Has añadido todas las soft skills disponibles!
              </p>
              <template v-else>
                <select v-model="selectedSoftSkillId" class="input">
                  <option value="" disabled>Selecciona una skill...</option>
                  <option v-for="skill in availableSoftSkills" :key="skill.id" :value="skill.id">
                    {{ skill.nombre }}
                  </option>
                </select>
                <button class="btn-add-small" @click.prevent="addSoftFromSelect"
                  :disabled="!selectedSoftSkillId">Añadir</button>
              </template>
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
              <button v-if="editing" @click="removeLanguage(i)" class="btn-remove-chip"><i
                  class="fa-solid fa-xmark"></i></button>
            </span>
            <span v-if="languages.length === 0" class="empty-state">Sin idiomas registrados.</span>
          </div>

          <div v-if="editing" class="add-inline">
            <p v-if="languages.length >= 5" class="empty-state" style="color: #e74c3c;">
              <i class="fa-solid fa-circle-exclamation"></i> Límite de 5 idiomas alcanzado.
            </p>
            <p v-else-if="availableLanguages.length === 0" class="empty-state">
              <i class="fa-solid fa-check-double"></i> ¡Has añadido todos los idiomas disponibles!
            </p>
            <div v-else-if="editing" class="add-box">
              <div class="form-row">

                <div class="form-group">
                  <label>Idioma</label>
                  <select v-model="newLangName" class="input">
                    <option value="" disabled>Selecciona idioma</option>
                    <option v-for="lang in filteredLanguages" :key="lang" :value="lang">
                      {{ lang }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Nivel</label>
                  <select v-model="newLangLevel" class="input">
                    <option v-for="lvl in languageLevels" :key="lvl" :value="lvl">
                      {{ lvl }}
                    </option>
                  </select>
                </div>

                <button class="btn-icon-success" @click.prevent="addLanguage">
                  <i class="fa-solid fa-plus"></i>
                </button>

              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title"><i class="fa-solid fa-link icon-purple"></i> Enlaces</h2>

          <div class="links-list">
            <div v-for="doc in documents" :key="doc.id" class="link-item">
              <a :href="doc.url" target="_blank" class="link-content">
                <i :class="getDocIcon(doc.tipo)" class="link-icon"></i>
                <span class="link-label">{{ doc.name }}</span>
              </a>
              <button v-if="editing" class="btn-icon-danger" @click="removeDocument(doc.id)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <div v-if="documents.length === 0" class="empty-state">Aún no hay enlaces.</div>
          </div>

          <div v-if="editing" class="add-box">
            <p v-if="documents.length >= 3" class="empty-state warning-text">
              <i class="fa-solid fa-lock"></i> Has alcanzado el límite máximo de 3 enlaces.
            </p>

            <div v-else class="edit-row">
              <label for="input-sm">Alias:</label>
              <input v-model="newDocName" class="input input-sm" placeholder="Nombre (Ej: Mi perfil)" />
              <label for="input-sm">Tipo:</label>
              <select v-model="newDocTipo" class="input input-sm">
                <option value="" disabled>Tipo...</option>
                <option v-for="tipo in availableLinkTypes" :key="tipo" :value="tipo">
                  {{ tipo }}
                </option>
              </select>
              <label for="input-sm">URL:</label>
              <input v-model="newDocURL" class="input" placeholder="URL (https://...)" />

              <button class="btn-icon-success" @click.prevent="addDocument"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
        </section>
      </div>

    </main>
  </div>

  <Transition name="toast">
    <div v-if="editing && hasUnsavedChanges" class="toast-notification">
      <div class="toast-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <div class="toast-content">
        <strong>Cambios sin guardar</strong>
        <p>No olvides dar al botón <strong>Guardar</strong> para que se registren.</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* GENERAL */
.profile-page {
  display: flex;
  gap: 30px;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px;
  background-color: #F3F4F6;
  /* Fondo gris muy suave y limpio */
  min-height: 100vh;
  font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* SIDEBAR CARD */
.profile-card {
  width: clamp(260px, 28%, 340px);
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
  padding-top: 15px;
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

.btn-primary,
.btn-save {
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

.btn-primary:hover {
  background: #e2e8f0;
}

.btn-primary.btn-cancel {
  background: #fee2e2;
  color: #ef4444;
}

.btn-save {
  background: var(--accent-purple);
  color: white;
}

.btn-save:hover {
  background: #7c3aed;
}

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
  margin: 0 0 14px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.sidebar-text {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.7;
  margin: 0;
  text-align: left;
  min-height: 90px;
}

.about-block,
.contact-block {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 22px;
}

.about-input {
  min-height: 100px;

}

.contact-links {
  display: grid;
  gap: 12px;
}

.contact-item {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  align-items: center;
  min-height: 56px;
  padding: 12px 14px;
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #334155;
  text-decoration: none;
}

.contact-item:hover {
  background: #eef2ff;
}

.contact-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eef2ff;
  color: #4338ca;
  flex-shrink: 0;
}

.contact-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.contact-label {
  font-size: 0.78rem;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.contact-value {
  font-size: 0.95rem;
  color: #111827;
  word-break: break-word;
}

.contact-input {
  width: 100%;
  margin-top: 4px;
  padding: 10px 12px;
}

.sidebar-text:empty {
  opacity: 0.7;
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
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
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 6px;
  font-size: 0.75rem;
}

/* ENLACES / LINKS */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 16px;
}

.link-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 14px 16px;
  border-radius: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.link-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
}

.link-content {
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  color: #0f172a;
  font-weight: 600;
  width: 100%;
  min-width: 0;
}

.link-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(139, 92, 246, 0.12);
  color: var(--accent-purple);
  font-size: 1.1rem;
}

.link-label {
  display: inline-block;
  color: #0f172a;
  font-size: 0.96rem;
}

.add-box {
margin-top: 1rem;
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  transition: 0.2s;
}

.add-box:hover {
  border-color: var(--accent-purple);
  background: #f5f3ff;
}
/* === FORMULARIOS PRO === */

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: end;
}

.form-row-4 {
  display: grid;
  grid-template-columns: 1fr 120px 2fr auto;
  gap: 12px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.7rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
}

.btn-icon-success {
  background: #16a34a;
  color: white;
  border-radius: 10px;
  width: 42px;
  height: 42px;
  border: none;
  cursor: pointer;
  transition: 0.2s;
}

.btn-icon-success:hover {
  background: #15803d;
  transform: scale(1.05);
}

/* mejora visual cajas edición */
.add-box {
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
  padding: 18px;
  border-radius: 14px;
}

/* responsive */
@media (max-width: 768px) {

  .form-row,
  .form-row-4 {
    grid-template-columns: 1fr;
  }

  .btn-icon-success {
    width: 100%;
  }
}


.input {
  flex: 1;
  text-align: center;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  font-family: inherit;
  font-size: 0.95rem;
  min-width: 0;
  /* evita overflow en flex/grid */
  background: #ffffff;
}

.input:focus {
  outline: none;
  border-color: var(--accent-purple);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.12);
}

.input-sm {
  width:80%;
  min-width: 0;
}

.btn-icon-danger,
.btn-icon-success {
  border: none;
  border-radius: 14px;
  width: 42px;
  height: 42px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.btn-icon-danger {
  background: #fee2e2;
  color: #ef4444;
}

.btn-icon-danger:hover {
  background: #fca5a5;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.14);
  transform: translateY(-1px);
}

.btn-icon-success {
  background: #dcfce7;
  color: #16a34a;
}

.btn-icon-success:hover {
  background: #86efac;
  box-shadow: 0 4px 10px rgba(16, 163, 77, 0.14);
  transform: translateY(-1px);
}

.btn-remove-chip {
  background: transparent;
  color: inherit;
  width: auto;
  height: auto;
  opacity: 0.7;
  padding: 0;
}

.btn-remove-chip:hover {
  opacity: 1;
}


.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 6px;
  text-align: left;
}

.btn-add-small {
  padding: 0.95rem 1.2rem;
  background: var(--accent-purple);
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.btn-add-small:hover {
  background: #7c3aed;
  transform: translateY(-1px);
}

.warning-text {
  color: #ef4444;
  text-align: center;
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

/* --- MEJORAS DE LA EDICIÓN DE FORMACIÓN --- */

.edit-education {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 15px;
}

/* Usamos Grid para que las columnas siempre midan lo mismo */
.edit-grid-row {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: 10px;
}

/* Estilo para destacar la caja de añadir nuevo elemento */
.new-education-box {
  background-color: #f8fafc;
  border: 2px dashed #e2e8f0;
  padding: 20px;
  border-radius: 12px;
  margin-top: 10px;
}

.new-education-box .subtitle {
  font-weight: 700;
  color: #334155;
  margin: 0 0 15px 0;
  font-size: 0.95rem;
}

/* Colocamos los labels encima de los inputs */
.input-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-col label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}



.btn-align-bottom {
  height: 40px;
  /* Esto asegura que el botón no se estire */
}

/* --- NOTIFICACIÓN EMERGENTE (TOAST) --- */
.toast-notification {
  position: fixed;
  bottom: 30px;
  left: 30px;
  /* ¡Aquí está el cambio principal! */
  background-color: #ffffff;
  border-left: 5px solid #f59e0b;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  z-index: 9999;
  max-width: 320px;
}

.toast-icon {
  color: #f59e0b;
  font-size: 1.4rem;
  margin-top: 2px;
}

.toast-content strong {
  display: block;
  color: #1e293b;
  font-size: 0.95rem;
  margin-bottom: 4px;
}

.toast-content p {
  color: #64748b;
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.4;
}

/* Animación de entrada y salida de Vue */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  /* Efecto de rebote */
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
  /* Entra desde abajo y un poco más pequeño */
}

/* Adaptación para móviles */
@media (max-width: 768px) {
  .toast-notification {
    bottom: 20px;
    right: 20px;
    left: 20px;
    max-width: none;
    width: auto;
  }
}

/* --- RESPONSIVE OBLIGATORIO --- */
@media (max-width: 860px) {
  .edit-grid-row {
    grid-template-columns: 1fr;
    /* En móvil, todo se pone en una sola columna hacia abajo */
    gap: 10px;
  }

  .btn-icon-danger,
  .btn-icon-success {
    width: 100%;
    margin-top: 5px;
  }
}

/* RESPONSIVE */
@media (max-width: 860px) {
  .profile-page {
    flex-direction: column;
  }

  .profile-card {
    width: 100%;
    box-sizing: border-box;
    position: static;
  }

  .grid-two-cols,
  .skills-grid {
    grid-template-columns: 1fr;
  }


  .edit-row {
  display: grid;
  grid-template-columns: 1fr 140px 2fr auto;
  gap: 12px;
  align-items: end;
}

  .input-sm {
    width: 85%;
  }

  .alert-warning {
    background-color: #fff3cd;
    color: #856404;
    padding: 0.5rem 1rem;
    border: 1px solid #ffeeba;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }
}
</style>