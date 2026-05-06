<script setup>
import { ref, reactive, watch, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { URL_BACK } from "../../../config";
import { useStudents } from "../composables/useStudents";
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

// --- VALIDACIONES - Estados de error ---
const validationErrors = reactive({
  phone: "",
  location: "",
  about: "",
  educationYear: {},
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
  const trimmedValue = String(yearValue || "").trim();
  const currentYear = new Date().getFullYear();

  if (!trimmedValue) {
    validationErrors.educationYear[index] = "";
    return true;
  }

  const isValidNumber = /^\d+$/.test(trimmedValue);

  if (!isValidNumber) {
    validationErrors.educationYear[index] = "El año debe ser un número válido.";
    return false;
  }

  const year = Number(trimmedValue);

  if (year > currentYear) {
    validationErrors.educationYear[index] =
      `El año no puede ser superior a ${currentYear}.`;
    return false;
  }

  validationErrors.educationYear[index] = "";
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
const editableDocuments = ref([]); // lo que editas
const academicBackground = ref([]);
const uploadingFile = ref(false);

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

function toggleEdit() {
  if (editing.value) {
    // Si estaba editando y decide cancelar, restauramos todo a como estaba
    restoreOriginalData();
  }
  editing.value = !editing.value;
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

// --- FUNCIONES DE SKILLS CON LÍMITE DE 6 ---
function addHardFromSelect() {
  if (hardSkills.value.length >= MAX_HARD_SKILLS) {
    alert(`Has alcanzado el límite máximo de ${MAX_HARD_SKILLS} Hard Skills.`);
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
  if (softSkills.value.length >= MAX_SOFT_SKILLS) {
    alert(`Has alcanzado el límite máximo de ${MAX_SOFT_SKILLS} Soft Skills.`);
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

// --- EL BOTÓN DE GUARDAR AHORA ENVÍA DATOS AL BACKEND ---
async function saveProfile() {
  console.log("Iniciando guardado del perfil...");

  let isValid = true;

  // 🧠 VALIDAR TELÉFONO
  if (contact.phone) {
    const ok = validatePhone(contact.phone);
    if (!ok || validationErrors.phone) isValid = false;
  }

  // 🧠 VALIDAR UBICACIÓN
  if (contact.location) {
    const ok = validateLocation(contact.location);
    if (!ok) isValid = false;
  }

  // 🧠 VALIDAR ABOUT
  if (user.about) {
    const ok = validateAbout(user.about);
    if (!ok || validationErrors.about) isValid = false;
  }

  // 🧠 VALIDAR EDUCACIÓN EXISTENTE
  academicBackground.value.forEach((edu, index) => {
    const ok = validateEducationYear(edu.anio, index);
    if (!ok) isValid = false;
  });

  // 🧠 VALIDAR NUEVO ESTUDIO
  if (newEdu.anio || newEdu.titulo || newEdu.centro) {
    const ok = validateEducationYear(newEdu.anio, "new");
    if (!ok) isValid = false;
  }

  // 🚨 BLOQUEO FINAL (IMPORTANTE: SOLO UNA VEZ)
  if (!isValid) {
    alert("Corrige los errores antes de guardar.");
    return;
  }

  console.log("Validaciones OK, enviando...");

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
    idiomas: {
      idiomas: languages.value.map((l) => ({
        id: l.id,
        idioma: l.name,
        nivel: l.level,
      })),
    },
    skills_ids: allSelectedSkillIds,
    enlaces: documents.value.map((d) => ({
      name: d.name,
      label: d.name,
      tipo: d.tipo,
      url: d.url,
    })),
  };

  try {
    const response = await fetch(`${URL_BACK}/estudiantes/${studentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      await response.json();

      // 💾 actualizar estado local
      if (students.value) {
        students.value = {
          ...students.value,
          foto_perfil: user.avatar,
          about: user.about,
          telefono: contact.phone,
          location: contact.location,
          estudios: { formacion: academicBackground.value },
          idiomas: { idiomas: languages.value },
          enlaces: documents.value,
        };
      }

      editing.value = false;
      hasUnsavedChanges.value = false;

      alert("Perfil actualizado correctamente");
    } else {
      const err = await response.json();
      alert("Error al guardar: " + err.error);
    }
  } catch (error) {
    console.error(error);
    alert("Error de conexión");
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
const remainingEducation = computed(
  () => MAX_EDUCATION - academicBackground.value.length,
);
const remainingLanguages = computed(
  () => MAX_LANGUAGES - languages.value.length,
);
const remainingLinks = computed(() => MAX_LINKS - documents.value.length);
const remainingHardSkills = computed(
  () => MAX_HARD_SKILLS - hardSkills.value.length,
);
const remainingSoftSkills = computed(
  () => MAX_SOFT_SKILLS - softSkills.value.length,
);

function addEducation() {
  if (academicBackground.value.length >= MAX_EDUCATION) {
    alert(`Solo puedes añadir un máximo de ${MAX_EDUCATION} estudios.`);
    return;
  }

  if (newEdu.anio && !validateEducationYear(newEdu.anio, "new")) {
    alert("Introduce un año válido solo con números.");
    return;
  }

  if (newEdu.centro && newEdu.titulo) {
    academicBackground.value.push({ ...newEdu });
    // Ordenar por año descendente después de añadir
    academicBackground.value.sort(
      (a, b) => parseInt(b.anio) - parseInt(a.anio),
    );
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
    (lang) => lang.name.trim().toLowerCase() === name.toLowerCase(),
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
    (lang) => !languages.value.some((l) => l.name === lang),
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
  const usados = documents.value.map((d) => d.tipo?.toLowerCase().trim());
  return allLinkTypes.filter((tipo) => !usados.includes(tipo.toLowerCase()));
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

// --- FUNCIÓN PARA SUBIR CV ---
const uploadingCV = ref(false);
const showModalDatosCV = ref(false);
const datosExtraidosCV = ref(null);
const hasCV = computed(() => !!cvUrl.value);
const cvUrl = ref("");

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
    const response = await fetch(`${import.meta.env.VITE_URL_BACK}/api/upload-cv`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    if (response.ok) {
      cvUrl.value = data.documento_cv;
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
    <aside class="profile-card">
      <div class="profile-header">
        <div class="avatar-container">
          <img :src="user.avatar" alt="avatar" class="profile-avatar" />
        </div>
        <div v-if="editing" class="upload-section">
          <label for="avatar-upload" class="btn-primary">
            <i class="fa-solid fa-camera"></i> Cambiar foto
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            @change="uploadAvatar"
            :disabled="uploadingFile"
          />
          <span v-if="uploadingFile">Subiendo...</span>
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
          <span class="label">Enlaces</span>
        </div>
      </div>

      <div class="sidebar-block about-block">
        <h3 class="sidebar-title"><i class="fa-solid fa-user"></i> Sobre mí</h3>

        <textarea
          v-if="editing"
          v-model="user.about"
          @input="validateAbout(user.about)"
          class="input about-input"
          rows="4"
          placeholder="Escribe algo sobre ti..."
          maxlength="300"
        ></textarea>
        <div v-if="editing && user.about" class="char-counter">
          <span :class="{ 'char-warning': user.about.length > 250 }">
            {{ user.about.length }}/{{ MAX_ABOUT_LENGTH }} caracteres
          </span>
        </div>
        <div v-if="editing && validationErrors.about" class="error-message">
          <i class="fa-solid fa-exclamation-circle"></i>
          {{ validationErrors.about }}
        </div>
        <div v-else-if="!editing">
          <p v-if="user.about" class="sidebar-text">{{ user.about }}</p>
          <p v-else class="sidebar-text">Aún no has escrito nada sobre ti.</p>
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
              <template v-if="editing">
                <input
                  v-model="contact.phone"
                  @input="validatePhone(contact.phone)"
                  type="text"
                  class="input input-sm contact-input"
                  placeholder="Tu teléfono"
                  maxlength="9"
                />
                <div
                  v-if="validationErrors.phone"
                  class="error-message error-small"
                >
                  <i class="fa-solid fa-exclamation-circle"></i>
                  {{ validationErrors.phone }}
                </div>
              </template>
              <span v-else class="contact-value">{{
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
              <template v-if="editing">
                <select
                  v-model="contact.location"
                  @change="validateLocation(contact.location)"
                  class="input input-sm contact-input"
                >
                  <option value="" disabled>Selecciona tu ciudad</option>
                  <option
                    v-for="city in validSpanishCities"
                    :key="city"
                    :value="city"
                  >
                    {{ city }}
                  </option>
                </select>
                <div
                  v-if="validationErrors.location"
                  class="error-message error-small"
                >
                  <i class="fa-solid fa-exclamation-circle"></i>
                  {{ validationErrors.location }}
                </div>
              </template>
              <span v-else class="contact-value">{{
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
            {{ cvUrl ? "Tu CV" : "Sube tu CV en PDF" }}
          </h3>

          <p class="cv-subtitle">
            {{
              cvUrl
                ? "Puedes verlo o actualizarlo cuando quieras"
                : "Añade tu CV para que sea visible"
            }}
          </p>

          <!-- SI EXISTE CV -->
          <div v-if="cvUrl" class="cv-actions">
            <a :href="'https://elayqirhsjqfupeerxjw.supabase.co/storage/v1/object/public/cvs/' +  cvUrl" target="_blank" class="btn-primary" style="text-decoration: none;">
              <i class="fa-solid fa-eye"></i> Ver CV
            </a>
          </div>

          <!-- SI NO EXISTE CV -->
          <div v-else class="cv-actions">
            <small class="cv-hint">Todavía no has subido ningún CV</small>
          </div>

          <!-- UPLOAD SIEMPRE DISPONIBLE -->
          <input
            id="cv-upload"
            type="file"
            accept="application/pdf"
            style="display: none"
            @change="uploadCV"
            @click="$event.target.value = null"
            :disabled="uploadingCV"
          />

          <label for="cv-upload" class="btn-primary">
            <i class="fa-solid fa-upload"></i>
            {{ cvUrl ? "Actualizar CV" : "Subir CV PDF" }}
          </label>

          <span v-if="uploadingCV" style="font-size: 0.9rem; color: gray">
            Subiendo...
          </span>
        </div>
      </div>
    </aside>

    <main class="profile-main">
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
            class="edit-grid-row"
          >
            <div class="input-col">
              <label for="edu-anio">Año</label>
              <input
                v-model="edu.anio"
                @input="validateEducationYear(edu.anio, index)"
                placeholder="Año"
                class="input"
              />
              <div
                v-if="validationErrors.educationYear[index]"
                class="error-message error-small"
              >
                <i class="fa-solid fa-exclamation-circle"></i>
                {{ validationErrors.educationYear[index] }}
              </div>
            </div>
            <div class="input-col">
              <label for="edu-titulo">Título</label>
              <input v-model="edu.titulo" placeholder="Título" class="input" />
            </div>
            <div class="input-col">
              <label for="edu-centro">Centro</label>
              <input v-model="edu.centro" placeholder="Centro" class="input" />
            </div>
            <button
              @click="removeEducation(index)"
              class="btn-icon-danger"
              title="Eliminar"
            >
              <i class="fa-solid fa-trash"></i> Eliminar
            </button>
          </div>

          <div
            v-if="academicBackground.length < MAX_EDUCATION"
            class="add-box new-education-box"
          >
            <p class="subtitle">Añadir nueva titulación</p>
            <p class="info-text" v-if="remainingEducation > 1">
              {{ remainingEducation }} estudios por añadir.
            </p>
            <p class="info-text" v-else>
              {{ remainingEducation }} estudio por añadir.
            </p>

            <div class="edit-grid-row form-labels-top">
              <div class="input-col">
                <label for="edu-anio">Año</label>
                <input
                  id="edu-anio"
                  v-model="newEdu.anio"
                  @input="validateEducationYear(newEdu.anio, 'new')"
                  placeholder="Ej: 2026"
                  class="input"
                />
                <div
                  v-if="validationErrors.educationYear['new']"
                  class="error-message error-small"
                >
                  {{ validationErrors.educationYear["new"] }}
                </div>
              </div>

              <div class="input-col">
                <label for="edu-titulo">Título</label>
                <input
                  id="edu-titulo"
                  v-model="newEdu.titulo"
                  placeholder="Ej: Programación Web"
                  class="input"
                />
              </div>

              <div class="input-col">
                <label for="edu-centro">Centro</label>
                <input
                  id="edu-centro"
                  v-model="newEdu.centro"
                  placeholder="Ej: ITB"
                  class="input"
                />
              </div>

              <button
                @click.prevent="addEducation"
                class="btn-icon-success btn-align-bottom"
                title="Añadir"
              >
                <i class="fa-solid fa-plus"></i> Añadir
              </button>
            </div>
          </div>
          <p v-else class="empty-state">
            <i class="fa-solid fa-circle-exclamation"></i> Límite de
            {{ MAX_EDUCATION }} estudios alcanzado.
          </p>
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

          <div v-for="(exp, index) in experience" :key="index" class="edu-item">
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

            <div v-if="editing" class="add-box">
              <p
                v-if="hardSkills.length >= MAX_HARD_SKILLS"
                class="empty-state"
              >
                <i class="fa-solid fa-circle-exclamation"></i> Límite de
                {{ MAX_HARD_SKILLS }} hard skills alcanzado.
              </p>
              <p
                v-else-if="availableHardSkills.length === 0"
                class="empty-state"
              >
                <i class="fa-solid fa-check-double"></i> ¡Has añadido todas las
                hard skills disponibles!
              </p>
              <div v-else>
                <p class="info-text" v-if="remainingHardSkills > 1">
                  {{ remainingHardSkills }} hard skills disponibles.
                </p>
                <p class="info-text" v-else>
                  {{ remainingHardSkills }} hard skill disponible.
                </p>
                <select
                  v-model="selectedHardSkillId"
                  class="input"
                  :disabled="hardSkills.length >= MAX_HARD_SKILLS"
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
                  class="btn-icon-success"
                  @click.prevent="addHardFromSelect"
                  :disabled="!selectedHardSkillId"
                >
                  <i class="fa-solid fa-plus"></i> Añadir
                </button>
              </div>
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

            <div v-if="editing" class="add-box">
              <p
                v-if="softSkills.length >= MAX_SOFT_SKILLS"
                class="empty-state"
              >
                <i class="fa-solid fa-circle-exclamation"></i> Límite de
                {{ MAX_SOFT_SKILLS }} soft skills alcanzado.
              </p>
              <p
                v-else-if="availableSoftSkills.length === 0"
                class="empty-state"
              >
                <i class="fa-solid fa-check-double"></i> ¡Has añadido todas las
                soft skills disponibles!
              </p>
              <div v-else>
                <p class="info-text" v-if="remainingSoftSkills > 1">
                  {{ remainingSoftSkills }} soft skills disponibles.
                </p>
                <p class="info-text" v-else>
                  {{ remainingSoftSkills }} soft skill disponible.
                </p>
                <select
                  v-model="selectedSoftSkillId"
                  class="input"
                  :disabled="softSkills.length >= MAX_SOFT_SKILLS"
                >
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
                  class="btn-icon-success"
                  @click.prevent="addSoftFromSelect"
                  :disabled="!selectedSoftSkillId"
                >
                  <i class="fa-solid fa-plus"></i> Añadir
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="grid-two-cols">
        <section class="section">
          <h2 class="section-title">
            <i class="fa-solid fa-language icon-green"></i> Idiomas
          </h2>

          <div v-if="!editing" class="skill-list">
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

          <div v-else class="languages-edit-list">
            <div
              v-for="(lang, i) in languages"
              :key="'edit' + i"
              class="contenedor"
            >
              <div class="edit-grid-row">
                <div class="input-col">
                  <label>Idioma</label>
                  <select v-model="lang.name" class="input">
                    <option disabled>Selecciona idioma</option>
                    <option
                      v-for="langOption in availableLanguagesList"
                      :key="langOption"
                      :value="langOption"
                      :disabled="
                        languages.some(
                          (l) => l.name === langOption && l !== lang,
                        )
                      "
                    >
                      {{ langOption }}
                    </option>
                  </select>
                </div>

                <div class="input-col">
                  <label>Nivel</label>
                  <select v-model="lang.level" class="input">
                    <option
                      v-for="lvl in languageLevels"
                      :key="lvl"
                      :value="lvl"
                    >
                      {{ lvl }}
                    </option>
                  </select>
                </div>
              </div>

              <button
                @click="removeLanguage(i)"
                class="btn-icon-danger align-self-end"
                title="Eliminar"
              >
                <i class="fa-solid fa-trash"></i> Eliminar idioma
              </button>
            </div>

            <div v-if="languages.length === 0" class="empty-state">
              Sin idiomas registrados.
            </div>
          </div>

          <div v-if="editing">
            <p v-if="languages.length >= MAX_LANGUAGES" class="empty-state">
              <i class="fa-solid fa-circle-exclamation"></i> Límite de
              {{ MAX_LANGUAGES }} idiomas alcanzado.
            </p>
            <div v-else class="add-box">
              <p class="subtitle">Añadir nuevo idioma</p>
              <p class="info-text" v-if="remainingLanguages > 1">
                {{ remainingLanguages }} idiomas disponibles.
              </p>
              <p class="info-text" v-else>
                {{ remainingLanguages }} idioma disponible.
              </p>
              <div class="form-row">
                <div class="form-group">
                  <label>Idioma</label>
                  <select v-model="newLangName" class="input">
                    <option value="" disabled>Selecciona idioma</option>
                    <option
                      v-for="lang in filteredLanguages"
                      :key="lang"
                      :value="lang"
                    >
                      {{ lang }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Nivel</label>
                  <select v-model="newLangLevel" class="input">
                    <option
                      v-for="lvl in languageLevels"
                      :key="lvl"
                      :value="lvl"
                    >
                      {{ lvl }}
                    </option>
                  </select>
                </div>

                <button class="btn-icon-success" @click.prevent="addLanguage">
                  <i class="fa-solid fa-plus"></i>Añadir
                </button>
              </div>
            </div>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">
            <i class="fa-solid fa-link icon-purple"></i> Enlaces
          </h2>

          <div v-if="!editing" class="links-list">
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

          <div v-else class="links-edit-list">
            <div
              v-for="doc in documents"
              :key="'edit' + doc.id"
              class="contenedor"
            >
              <div class="edit-grid-row">
                <div class="input-col">
                  <label>Nombre</label>
                  <input
                    v-model="doc.name"
                    class="input"
                    placeholder="Ej: Mi Portfolio"
                  />
                </div>

                <div class="input-col">
                  <label>Tipo</label>
                  <select v-model="doc.tipo" class="input">
                    <option value="" disabled>Tipo...</option>
                    <option
                      v-for="tipo in allLinkTypes"
                      :key="tipo"
                      :value="tipo"
                      :disabled="
                        documents.some(
                          (d) => d.tipo === tipo && d.id !== doc.id,
                        )
                      "
                    >
                      {{ tipo }}
                    </option>
                  </select>
                </div>

                <div class="input-col">
                  <label>URL</label>
                  <input
                    v-model="doc.url"
                    class="input"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <button
                @click="removeDocument(doc.id)"
                class="btn-icon-danger align-self-end"
                title="Eliminar"
              >
                <i class="fa-solid fa-trash"></i> Eliminar enlace
              </button>
            </div>

            <div v-if="documents.length === 0" class="empty-state">
              Aún no hay enlaces.
            </div>
          </div>

          <div v-if="editing">
            <p v-if="documents.length >= MAX_LINKS" class="empty-state">
              <i class="fa-solid fa-circle-exclamation"></i> Límite de
              {{ MAX_LINKS }} enlaces alcanzado.
            </p>
            <div v-else class="edit-row add-box">
              <p class="subtitle">Añadir nuevo enlace</p>
              <p class="info-text" v-if="remainingLinks > 1">
                {{ remainingLinks }} enlaces por añadir.
              </p>
              <p class="info-text" v-else>
                {{ remainingLinks }} enlace por añadir.
              </p>
              <label for="input-sm">Alias:</label>
              <input
                v-model="newDocName"
                class="input input-sm"
                placeholder="Nombre (Ej: Mi perfil)"
              />
              <label for="input-sm">Tipo:</label>
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
              <label for="input-sm">URL:</label>
              <input
                v-model="newDocURL"
                class="input"
                placeholder="URL (https://...)"
              />

              <button class="btn-icon-success" @click.prevent="addDocument">
                <i class="fa-solid fa-plus"></i>Añadir
              </button>
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
        <p>
          No olvides dar al botón <strong>Guardar</strong> para que se
          registren.
        </p>
      </div>
    </div>
  </Transition>
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

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

#avatar-upload {
  display: none;
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

/* BOTONES SIDEBAR */
.profile-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

.btn-primary.btn-cancel {
  background: #fee2e2;
  color: #ef4444;
}

.btn-primary.btn-cancel:hover {
  background: #fca5a5;
}

.btn-save {
  background: var(--accent-purple);
  color: white;
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

.btn-save:hover {
  background: var(--accent-purple-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4);
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

.about-input {
  min-height: 120px;
  resize: vertical;
  width: 100%;
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

.contact-input {
  margin-top: 4px;
  width: 100%;
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

.btn-remove-chip {
  background: transparent;
  color: inherit;
  border: none;
  cursor: pointer;
  padding: 2px;
  opacity: 0.6;
  transition:
    opacity 0.2s,
    transform 0.2s;
  display: flex;
  align-items: center;
}

.btn-remove-chip:hover {
  opacity: 1;
  transform: scale(1.1);
}

.subtitle {
  width: 100%;
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
  justify-content: flex-start;
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

/* =========================================
   FORMULARIOS Y EDICIÓN (MODO RESPONSIVE)
========================================== */
.input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  font-family: inherit;
  font-size: 0.95rem;
  background: #ffffff;
  color: #1e293b;
  transition: all 0.2s ease;
}
input,
select,
textarea {
  font-size: 16px; /* evita zoom iOS y mejora legibilidad */
  min-width: 0;
}

.input:focus {
  outline: 3px solid var(--accent-purple);
  outline-offset: 3px;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
}

button {
  min-height: 44px;
  min-width: 44px;
}

.add-box {
  margin-top: 20px;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 20px;
  transition: all 0.2s ease;
}

.add-box:hover {
  border-color: var(--accent-purple);
  background: #f5f3ff;
}

.edit-education {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.edit-row,
.form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-content: center;
  justify-content: flex-start;
}

.edit-grid-row,
.form-row {
  flex-direction: column;
  align-items: stretch;
  gap: 10px;
}

.skill-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: stretch;
}

.input-col,
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  /* Flexibilidad para grids responsivos */
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

/* Estilo para la tarjeta de cada idioma */
.contenedor {
  background-color: #f8fafc;
  /* Un fondo gris muy suave */
  border: 1px solid #e2e8f0;
  /* Borde sutil */
  border-radius: 8px;
  /* Bordes redondeados */
  padding: 16px;
  margin-bottom: 16px;
  /* Separación entre cada bloque de idioma */
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* Espacio entre los inputs y el botón de eliminar */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  /* Sombra ligera para dar profundidad */
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

/* --- TOAST NOTIFICATION --- */
.toast-notification {
  position: fixed;
  bottom: 30px;
  left: 30px;
  background-color: #ffffff;
  border-left: 5px solid #f59e0b;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 18px 24px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  z-index: 9999;
  max-width: 350px;
}

.toast-icon {
  color: #f59e0b;
  font-size: 1.5rem;
}

.toast-content strong {
  display: block;
  color: #1e293b;
  font-size: 1rem;
  margin-bottom: 4px;
}

.toast-content p {
  color: var(--text-muted);
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.5;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
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
