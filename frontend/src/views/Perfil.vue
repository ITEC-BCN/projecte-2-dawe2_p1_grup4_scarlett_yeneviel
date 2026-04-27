<script setup>
import { ref, reactive, watch, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { URL_BACK } from "../../../config";
import { useStudents } from "../composables/useStudents";
import ModalDatosCV from "../components/ModalDatosCV.vue";
import {
  availableLanguagesList,
  languageLevels,
  allLinkTypes,
} from "../js/const.js";

const route = useRoute();
const router = useRouter();
const studentId = route.params.id || localStorage.getItem("studentId");
const url = ref(`${URL_BACK}/estudiantes/${studentId}`);
const role = localStorage.getItem("role");

const { students, loadingStudents, refreshStudents } = useStudents(url);

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
  return allDbSkills.value.filter(
    (s) =>
      s.tipo === "hard skill" && !hardSkills.value.some((hs) => hs.id === s.id),
  );
});

const availableSoftSkills = computed(() => {
  return allDbSkills.value.filter(
    (s) =>
      s.tipo === "soft skill" && !softSkills.value.some((ss) => ss.id === s.id),
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
const uploadingCV = ref(false);
const cvUrl = ref("");

// --- FILTROS Y HELPERS DE IDIOMAS Y ENLACES ---
const filteredLanguages = computed(() => {
  return availableLanguagesList.filter(
    (lang) => !languages.value.some((l) => l.name === lang),
  );
});

const availableLanguages = computed(() => {
  return languageLevels.filter(
    (lvl) => !languages.value.some((lang) => lang.level === lvl),
  );
});

const availableLinkTypes = computed(() => {
  const usados = documents.value.map((d) => d.tipo?.toLowerCase().trim());
  return allLinkTypes.filter((tipo) => !usados.includes(tipo.toLowerCase()));
});

//Añadir la FOTO DE PERFIL

const uploadAvatar = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  uploadingFile.value = true;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("studentId", students.value.id);

  try {
    const response = await fetch(`${URL_BACK}/upload-avatar`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      // Como Node ya actualizó Supabase, solo actualizamos la pantalla
      user.avatar = data.url;

      if (students.value) {
        students.value.foto_perfil = data.url;
      }

      alert("¡Foto actualizada con éxito!");
    } else {
      alert("Error al subir: " + data.error);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
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

hardSkills.value = Array.isArray(source.skills?.hard)
  ? JSON.parse(JSON.stringify(source.skills.hard))
  : [];

softSkills.value = Array.isArray(source.skills?.soft)
  ? JSON.parse(JSON.stringify(source.skills.soft))
  : [];

  // IMPORTANTE: Hacemos copias profundas (JSON parse/stringify) para romper la
  // referencia de los objetos. Así, si el usuario edita un input y luego cancela,
  // el objeto original de 'students' se mantiene intacto.
  languages.value = Array.isArray(source.idiomas?.idiomas)
    ? JSON.parse(JSON.stringify(source.idiomas.idiomas))
    : [];

  academicBackground.value = Array.isArray(source.estudios?.formacion)
    ? JSON.parse(JSON.stringify(source.estudios.formacion))
    : [];

  experience.value = Array.isArray(source.experiencia?.experiencia)
    ? JSON.parse(JSON.stringify(source.experiencia.experiencia))
    : [];

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

  if (source.cv_url) {
    cvUrl.value = source.cv_url;
  } else {
    cvUrl.value = "";
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
  const skill = allDbSkills.value.find(
    (s) => s.id === selectedHardSkillId.value,
  );
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
  const skill = allDbSkills.value.find(
    (s) => s.id === selectedSoftSkillId.value,
  );
  if (skill) {
    softSkills.value.push({ id: skill.id, nombre: skill.nombre });
    selectedSoftSkillId.value = "";
  }
  hasUnsavedChanges.value = true;
}

function removeHard(i) {
  hardSkills.value.splice(i, 1);
  hasUnsavedChanges.value = true;
}
function removeSoft(i) {
  softSkills.value.splice(i, 1);
  hasUnsavedChanges.value = true;
}

// --- FUNCIONES PARA EXPERIENCIA ---

const experience = ref([]);
const newExp = reactive({ centro: "", anio: "", puesto: "" });
function addExperience() {
  if (newExp.centro && newExp.puesto) {
    experience.value.push({ ...newExp });
    newExp.centro = "";
    newExp.anio = "";
    newExp.puesto = "";
  }
  hasUnsavedChanges.value = true;
}

function removeExperience(index) {
  experience.value.splice(index, 1);
  hasUnsavedChanges.value = true;
}

// --- EL BOTÓN DE GUARDAR AHORA ENVÍA DATOS AL BACKEND ---
async function saveProfile() {
  const allSelectedSkillIds = [
    ...hardSkills.value.map((s) => s.id),
    ...softSkills.value.map((s) => s.id),
  ];

  const payload = {
    foto_perfil: user.avatar,
    about: user.about,
    telefono: contact.phone,
    location: contact.location,
    estudios: { formacion: academicBackground.value },
    idiomas: { idiomas: languages.value },
    experiencia: { experiencia: experience.value },
    skills_ids: allSelectedSkillIds,
    enlaces: documents.value,
  };
console.log(payload);
  try {
    const response = await fetch(`${URL_BACK}/estudiantes/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      editing.value = false;
      alert("¡Perfil actualizado con éxito!");
      hasUnsavedChanges.value = false;

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
  if (!tipo) return "fa-solid fa-file-lines";

  const tipoFormat = tipo.toLowerCase();
  if (tipoFormat.includes("github")) return "fa-brands fa-github";
  if (tipoFormat.includes("linkedin")) return "fa-brands fa-linkedin";

  return "fa-solid fa-file-lines";
};

// --- VARIABLES Y FUNCIONES PARA AÑADIR EDUCACIÓN ---
const newEdu = reactive({ centro: "", anio: "", titulo: "" });

function addEducation() {
  if (newEdu.centro && newEdu.titulo) {
    academicBackground.value.push({ ...newEdu });
    newEdu.centro = "";
    newEdu.anio = "";
    newEdu.titulo = "";
  }
  hasUnsavedChanges.value = true;
}

function removeEducation(index) {
  academicBackground.value.splice(index, 1);
  hasUnsavedChanges.value = true;
}

// --- VARIABLES Y FUNCIONES PARA AÑADIR IDIOMAS ---
const newLangName = ref("");
const newLangLevel = ref("");

function addLanguage() {
  const name = newLangName.value?.trim();
  const level = newLangLevel.value?.trim() || "A1";

  if (!name) return;

  if (languages.value.length >= 5) {
    alert("Has alcanzado el límite máximo de 5 idiomas.");
    return;
  }

  languages.value.push({ id: Date.now(), name, level });
  newLangName.value = "";
  newLangLevel.value = "";
  hasUnsavedChanges.value = true;
}

function removeLanguage(i) {
  languages.value.splice(i, 1);
  hasUnsavedChanges.value = true;
}

// --- VARIABLES Y FUNCIONES PARA AÑADIR ENLACES ---
const newDocName = ref("");
const newDocURL = ref("");
const newDocTipo = ref("");

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
      tipo,
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

// --- NUEVO: FUNCIÓN PARA SUBIR CV ---
const showModalDatosCV = ref(false);
const datosExtraidosCV = ref(null);

const uploadCV = async (event) => {
  const file = event.target.files[0];
  if (!file || file.type !== "application/pdf") {
    alert("Por favor, selecciona un archivo PDF.");
    return;
  }
  uploadingCV.value = true;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("studentId", students.value.id);

  try {
    const response = await fetch(`${URL_BACK}/api/upload-cv`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (response.ok) {
      cvUrl.value = data.url;
      // Mostrar modal con datos extraídos si existen
      if (data.datosExtraidos) {
        datosExtraidosCV.value = data.datosExtraidos;
        showModalDatosCV.value = true;
      }
      await refreshStudents();
      restoreOriginalData(); // 🔥 fuerza sincronización UI
      alert("¡CV subido con éxito!");
    } else {
      alert("Error al subir el CV: " + data.error);
    }
  } catch (error) {
    console.error("Error de conexión:", error);
  } finally {
    uploadingCV.value = false;
  }
};
</script>

<template>
  <div class="profile-page">
    <div class="sidebar">
      <aside class="profile-card">
        <div class="profile-header">
          <div class="avatar-container">
            <img :src="user.avatar" alt="avatar" class="profile-avatar" />

            <div v-if="editing" class="upload-section" style="margin-top: 10px">
              <label
                for="avatar-upload"
                class="btn-primary"
                style="cursor: pointer; font-size: 0.8rem"
              >
                <i class="fa-solid fa-camera"></i> Cambiar foto
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                style="display: none"
                @change="uploadAvatar"
                :disabled="uploadingFile"
              />
              <span v-if="uploadingFile" style="font-size: 0.8rem; color: gray"
                >Subiendo...</span
              >
            </div>
          </div>
          <h2 class="profile-name">{{ user.name }}</h2>
          <div class="profile-role">Estudiante</div>
        </div>

        <div class="profile-actions" v-if="role == 'estudiante'">
          <button
            class="btn-primary"
            :class="{ 'btn-cancel': editing }"
            @click="toggleEdit"
          >
            <i
              :class="
                editing ? 'fa-solid fa-xmark' : 'fa-solid fa-pen-to-square'
              "
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
            <span class="label">Enlaces</span>
          </div>
        </div>

        <div class="sidebar-block">
          <h3 class="sidebar-title">
            <i class="fa-solid fa-user"></i> Sobre mí
          </h3>
          <p v-if="editing && hasUnsavedChanges" class="alert-warning">
            ⚠️ No olvides dar al botón <strong>Guardar</strong> para que los
            cambios se registren.
          </p>
          <textarea
            v-if="editing"
            v-model="user.about"
            class="input"
            rows="4"
            placeholder="Escribe algo sobre ti..."
          ></textarea>
          <p v-else class="sidebar-text">
            {{ user.about || "Aún no has escrito nada sobre ti." }}
          </p>
        </div>

        <div class="sidebar-block">
          <h3 class="sidebar-title">
            <i class="fa-solid fa-address-book"></i> Contacto
          </h3>
          <div class="contact-links">
            <a :href="`mailto:${contact.email}`" class="contact-item">
              <i class="fa-solid fa-envelope"></i>
              <span>{{ contact.email || "Sin email" }}</span>
            </a>

            <div class="contact-item">
              <i class="fa-solid fa-phone"></i>
              <input
                v-if="editing"
                v-model="contact.phone"
                type="text"
                class="input input-sm"
                placeholder="Tu teléfono"
              />
              <span v-else>{{ contact.phone || "Sin teléfono" }}</span>
            </div>

            <div class="contact-item">
              <i class="fa-solid fa-location-dot"></i>
              <input
                v-if="editing"
                v-model="contact.location"
                type="text"
                class="input input-sm"
                placeholder="Tu ciudad/ubicación"
              />
              <span v-else>{{ contact.location || "Sin ubicación" }}</span>
            </div>
          </div>
        </div>
      </aside>

      <aside class="cv-card compact">
        <h3 class="sidebar-title">
          <i class="fa-solid fa-file-pdf"></i> Sube tu CV en PDF
        </h3>
        <div>
          <input
            id="cv-upload"
            type="file"
            accept="application/pdf"
            style="display: none"
            @change="uploadCV"
            :disabled="uploadingCV"
          />
          <label for="cv-upload" class="btn-primaryCV" style="cursor: pointer">
            <i class="fa-solid fa-upload"></i> Seleccionar archivo PDF
          </label>
          <span v-if="uploadingCV" style="font-size: 0.9rem; color: gray"
            >Subiendo...</span
          >
          <div v-if="cvUrl" style="margin-top: 10px">
            <a :href="cvUrl" target="_blank" class="cv-link">
              <i class="fa-solid fa-file-pdf"></i> Ver CV subido
            </a>
          </div>
        </div>
      </aside>
    </div>

    <main class="profile-main">
      <div class="grid-two-cols">
        <!-- 🎓 FORMACIÓN ACADÉMICA -->
        <section class="section">
          <h2 class="section-title">
            <i class="fa-solid fa-graduation-cap icon-green"></i> Formación
            Académica
          </h2>

          <div v-if="!editing" class="education-timeline">
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

          <div v-else class="edit-education">
            <div
              v-for="(edu, index) in academicBackground"
              :key="'edit' + index"
              class="edit-row"
            >
              <input
                v-model="edu.anio"
                placeholder="Año"
                class="input input-sm"
              />
              <input v-model="edu.titulo" placeholder="Título" class="input" />
              <input v-model="edu.centro" placeholder="Centro" class="input" />
              <button @click="removeEducation(index)" class="btn-icon-danger">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <div class="add-box">
              <p class="subtitle">Añadir nueva titulación</p>
              <div class="edit-row">
                <input
                  v-model="newEdu.anio"
                  placeholder="Ej: 2024"
                  class="input input-sm"
                />
                <input
                  v-model="newEdu.titulo"
                  placeholder="Título"
                  class="input"
                />
                <input
                  v-model="newEdu.centro"
                  placeholder="Centro"
                  class="input"
                />
                <button @click.prevent="addEducation" class="btn-icon-success">
                  <i class="fa-solid fa-plus"></i>
                </button>
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
          <div v-if="!editing" class="education-timeline">
            <div v-if="experience.length === 0" class="empty-state">
              Sin experiencia registrada.
            </div>

            <div
              v-for="(exp, index) in experience"
              :key="index"
              class="edu-item"
            >
              <div class="edu-year">{{ exp.anio }}</div>
              <div class="edu-dot"></div>
              <div class="edu-info">
                <div class="edu-title">{{ exp.puesto }}</div>
                <div class="edu-center">{{ exp.centro }}</div>
              </div>
            </div>
          </div>

          <!-- ✏️ MODO EDICIÓN -->
          <div v-else class="edit-education">
            <div
              v-for="(exp, index) in experience"
              :key="'exp' + index"
              class="edit-row"
            >
              <input
                v-model="exp.anio"
                placeholder="Periodo"
                class="input input-sm"
              />
              <input v-model="exp.puesto" placeholder="Puesto" class="input" />
              <input v-model="exp.centro" placeholder="Empresa" class="input" />
              <button @click="removeExperience(index)" class="btn-icon-danger">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>

            <div class="add-box">
              <p class="subtitle">Añadir experiencia</p>
              <div class="edit-row">
                <input
                  v-model="newExp.anio"
                  placeholder="Periodo"
                  class="input input-sm"
                />
                <input
                  v-model="newExp.puesto"
                  placeholder="Puesto"
                  class="input"
                />
                <input
                  v-model="newExp.centro"
                  placeholder="Empresa"
                  class="input"
                />
                <button @click.prevent="addExperience" class="btn-icon-success">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

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
                <button
                  v-if="editing"
                  @click="removeHard(i)"
                  class="btn-remove-chip"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </span>
              <span v-if="hardSkills.length === 0" class="empty-state"
                >No hay hard skills.</span
              >
            </div>

            <div v-if="editing" class="add-inline" style="margin-top: 10px">
              <p
                v-if="hardSkills.length >= 6"
                class="empty-state"
                style="color: #e74c3c"
              >
                <i class="fa-solid fa-circle-exclamation"></i> Límite de 6 hard
                skills alcanzado.
              </p>
              <p
                v-else-if="availableHardSkills.length === 0"
                class="empty-state"
              >
                <i class="fa-solid fa-check-double"></i> ¡Has añadido todas las
                hard skills disponibles!
              </p>
              <template v-else>
                <select
                  v-model="selectedHardSkillId"
                  class="input"
                  :disabled="hardSkills.length >= 6"
                >
                  <option value="" disabled>Selecciona una skill...</option>
                  <option
                    v-for="skill in availableHardSkills"
                    :key="skill.id"
                    :value="skill.id"
                  >
                    {{ skill.nombre }}
                  </option>
                </select>
                <button
                  class="btn-add-small"
                  @click.prevent="addHardFromSelect"
                  :disabled="!selectedHardSkillId"
                >
                  Añadir
                </button>
              </template>
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
                <button
                  v-if="editing"
                  @click="removeSoft(i)"
                  class="btn-remove-chip"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </span>
              <span v-if="softSkills.length === 0" class="empty-state"
                >No hay soft skills.</span
              >
            </div>

            <div v-if="editing" class="add-inline" style="margin-top: 10px">
              <p
                v-if="softSkills.length >= 6"
                class="empty-state"
                style="color: #e74c3c"
              >
                <i class="fa-solid fa-circle-exclamation"></i> Límite de 6 soft
                skills alcanzado.
              </p>
              <p
                v-else-if="availableSoftSkills.length === 0"
                class="empty-state"
              >
                <i class="fa-solid fa-check-double"></i> ¡Has añadido todas las
                soft skills disponibles!
              </p>
              <template v-else>
                <select v-model="selectedSoftSkillId" class="input">
                  <option value="" disabled>Selecciona una skill...</option>
                  <option
                    v-for="skill in availableSoftSkills"
                    :key="skill.id"
                    :value="skill.id"
                  >
                    {{ skill.nombre }}
                  </option>
                </select>
                <button
                  class="btn-add-small"
                  @click.prevent="addSoftFromSelect"
                  :disabled="!selectedSoftSkillId"
                >
                  Añadir
                </button>
              </template>
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
              <button
                v-if="editing"
                @click="removeLanguage(i)"
                class="btn-remove-chip"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </span>
            <span v-if="languages.length === 0" class="empty-state"
              >Sin idiomas registrados.</span
            >
          </div>

          <div v-if="editing" class="add-inline">
            <p
              v-if="languages.length >= 5"
              class="empty-state"
              style="color: #e74c3c"
            >
              <i class="fa-solid fa-circle-exclamation"></i> Límite de 5 idiomas
              alcanzado.
            </p>
            <p v-else-if="availableLanguages.length === 0" class="empty-state">
              <i class="fa-solid fa-check-double"></i> ¡Has añadido todos los
              idiomas disponibles!
            </p>
            <template v-else>
              <input
                v-model="newLangName"
                class="input input-sm"
                placeholder="Idioma (Ej: Inglés)"
              />
              <select v-model="newLangLevel" class="input input-sm">
                <option v-for="lvl in languageLevels" :key="lvl" :value="lvl">
                  {{ lvl }}
                </option>
              </select>
              <button class="btn-add-small" @click.prevent="addLanguage">
                Añadir
              </button>
            </template>
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
              <button
                v-if="editing"
                class="btn-icon-danger-small"
                @click="removeDocument(doc.id)"
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
            <div v-if="documents.length === 0" class="empty-state">
              Aún no hay enlaces.
            </div>
          </div>

          <div v-if="editing" class="add-box" style="margin-top: 1rem">
            <p
              v-if="documents.length >= 3"
              class="empty-state"
              style="color: #e74c3c; text-align: center"
            >
              <i class="fa-solid fa-lock"></i> Has alcanzado el límite máximo de
              3 enlaces.
            </p>

            <div v-else class="edit-row">
              <input
                v-model="newDocName"
                class="input input-sm"
                placeholder="Nombre (Ej: Mi perfil)"
              />

              <select v-model="newDocTipo" class="input input-sm">
                <option value="" disabled>Tipo...</option>
                <option
                  v-for="tipo in availableLinkTypes"
                  :key="tipo"
                  :value="tipo"
                >
                  {{ tipo }}
                </option>
              </select>

              <input
                v-model="newDocURL"
                class="input"
                placeholder="URL (https://...)"
              />

              <button class="btn-icon-success" @click.prevent="addDocument">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>

    <ModalDatosCV
      v-if="showModalDatosCV"
      :datos="datosExtraidosCV"
      @close="showModalDatosCV = false"
    />
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
  background-color: #f3f4f6;
  /* Fondo gris muy suave y limpio */
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
  background: linear-gradient(
    135deg,
    var(--accent-green),
    var(--accent-purple)
  );
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
  content: "";
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
  background: rgba(0, 0, 0, 0.1);
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
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.link-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
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

.input-sm {
  width: 80px;
  flex: none;
}

.btn-icon-danger,
.btn-icon-success,
.btn-remove-chip {
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

.btn-remove-chip:hover {
  opacity: 1;
}

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

/* NUEVO: ESTILOS PARA LA CARD DEL CV */
.cv-card {
  width: 320px;
  background: #ffffff;
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.cv-card.compact {
  width: 320px;
  background: #fff;
  border-radius: 16px;
  padding: 24px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  margin-top: 15px;
  margin-bottom: 0;
  display: block;
}

.btn-primaryCV {
  width: 100%;
  background: #f1f5f9;
  color: #334155;
  width: 90%;
  padding: 10px;
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

.cv-link {
  color: #e74c3c;
  font-weight: 600;
  text-decoration: none;
  font-size: 1rem;
}
.cv-link i {
  margin-right: 6px;
}

/* RESPONSIVE */
@media (max-width: 860px) {
  .profile-page {
    flex-direction: column;
  }

  .sidebar {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
  }

  .profile-card {
    width: 100%;
    box-sizing: border-box;
    position: static;
  }

  .cv-card.compact {
    width: 100%;
    padding: 16px 10px;
  }

  .grid-two-cols,
  .skills-grid {
    grid-template-columns: 1fr;
  }

  .edit-row {
    flex-direction: column;
    align-items: stretch;
  }

  .input-sm {
    width: 100%;
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
