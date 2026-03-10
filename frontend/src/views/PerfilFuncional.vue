
/*HASTA AQUÍ*/

<script setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { URL_BACK } from "../../../config";
import { useStudents } from "../composables/useStudents";

const route = useRoute();
const router = useRouter();

const studentId = route.params.id || localStorage.getItem("studentId");
const url = ref(`${URL_BACK}/estudiantes/${studentId}`);

const { students, loadingStudents } = useStudents(url);

const user = reactive({
  name: "",
  role: "",
  avatar: "",
  about: "",
});

const contact = reactive({ email: "", phone: "", location: "" });
const hardSkills = ref([]);
const softSkills = ref([]);
const languages = ref([]);
const academicBackground = ref([]);

const editing = ref(false);
const form = reactive({ name: "", role: "", about: "", phone: "", location: "" });

const checkAuthAndFetch = async () => {
  if (!studentId) {
    router.push('/login');
    return;
  }
};

watch(
  () => students.value,
  (newVal) => {
    if (newVal) {
      user.name = `${newVal.nombre || ""} ${newVal.apellido || ""}`.trim();
      user.role = newVal.role || "Estudiante";
      user.avatar = newVal.foto_perfil || "/img/avatarGroup.png";
      user.about = newVal.about || "Sin descripción.";

      contact.email = newVal.email || "";
      contact.phone = newVal.telefono || "";
      contact.location = newVal.location || "";

      hardSkills.value = newVal.hard_skills ? newVal.hard_skills.split(",").map(s => s.trim()) : [];
      softSkills.value = newVal.soft_skills ? newVal.soft_skills.split(",").map(s => s.trim()) : [];
      
      languages.value = newVal.idiomas?.idiomas || [];
      academicBackground.value = newVal.estudios?.formacion || [];

      form.name = user.name;
      form.role = user.role;
      form.about = user.about;
      form.phone = contact.phone;
      form.location = contact.location;
    }
  },
  { immediate: true }
);

function toggleEdit() {
  editing.value = !editing.value;
  if (!editing.value) {
    form.name = user.name;
    form.role = user.role;
    form.about = user.about;
    form.phone = contact.phone;
    form.location = contact.location;
  }
}

async function saveProfile() {
  try {
    const payload = {
      nombre: form.name.split(' ')[0] || "",
      apellido: form.name.split(' ').slice(1).join(' ') || "",
      role: form.role,
      about: form.about,
      telefono: form.phone,
      location: form.location,
      hard_skills: hardSkills.value.join(','),
      soft_skills: softSkills.value.join(','),
      estudios: { formacion: academicBackground.value },
      idiomas: { idiomas: languages.value }
    };

    const token = localStorage.getItem('token');
    const response = await fetch(`${URL_BACK}/estudiantes/${studentId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      credentials: 'include'
    });

    if (response.ok) {
      user.name = form.name;
      user.role = form.role;
      user.about = form.about;
      contact.phone = form.phone;
      contact.location = form.location;
      editing.value = false;
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// Lógica de añadir/quitar omitida por brevedad para centrarse en estilos
const logout = () => {
  localStorage.clear();
  router.push('/');
};

onMounted(checkAuthAndFetch);
</script>

<template>
  <div v-if="loadingStudents" class="loading-state">
    <div class="spinner"></div>
    <p>Cargando tu perfil profesional...</p>
  </div>
  
  <div v-else class="profile-layout">
    <aside class="sidebar">
      <div class="sidebar-card main-info">
        <div class="avatar-container">
          <img :src="user.avatar" alt="avatar" class="avatar" />
          <button v-if="editing" class="btn-change-photo"><i class="fa-solid fa-camera"></i></button>
        </div>
        
        <div v-if="!editing" class="user-meta">
          <h2 class="name">{{ user.name }}</h2>
          <span class="badge">{{ user.role }}</span>
        </div>
        <div v-else class="edit-meta">
          <input v-model="form.name" class="modern-input" placeholder="Nombre completo" />
          
        </div>

        <div class="action-buttons">
          <button :class="['btn-action', editing ? 'btn-cancel' : 'btn-edit']" @click="toggleEdit">
            <i :class="editing ? 'fa-solid fa-xmark' : 'fa-solid fa-pen-to-square'"></i>
            {{ editing ? "Cancelar" : "Editar Perfil" }}
          </button>
          <button v-if="editing" class="btn-action btn-save" @click="saveProfile">
            <i class="fa-solid fa-check"></i> Guardar Cambios
          </button>
        </div>
      </div>

      <div class="sidebar-card">
        <h3><i class="fa-solid fa-circle-user"></i> Sobre mí</h3>
        <p v-if="!editing" class="description">{{ user.about }}</p>
        <textarea v-else v-model="form.about" class="modern-textarea"></textarea>
      </div>

      <div class="sidebar-card">
        <h3><i class="fa-solid fa-paper-plane"></i> Contacto</h3>
        <ul class="contact-list">
          <li><i class="fa-solid fa-envelope"></i> {{ contact.email }}</li>
          <li>
            <i class="fa-solid fa-phone"></i> 
            <span v-if="!editing">{{ contact.phone || 'Sin teléfono' }}</span>
            <input v-else v-model="form.phone" class="modern-input-sm" />
          </li>
          <li>
            <i class="fa-solid fa-location-dot"></i>
            <span v-if="!editing">{{ contact.location || 'Sin ubicación' }}</span>
            <input v-else v-model="form.location" class="modern-input-sm" />
          </li>
        </ul>
      </div>

      <button class="btn-logout" @click="logout">
        <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
      </button>
    </aside>

    <main class="main-content">
      <section class="content-section">
        <div class="section-header">
          <i class="fa-solid fa-graduation-cap"></i>
          <h2>Formación Académica</h2>
        </div>
        <div class="timeline">
          <div v-for="(edu, index) in academicBackground" :key="index" class="timeline-item">
            <div class="year-circle">{{ edu.anio }}</div>
            <div class="timeline-content">
              <h4>{{ edu.titulo }}</h4>
              <p>{{ edu.centro }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="content-section">
        <div class="section-header">
          <i class="fa-solid fa-bolt"></i>
          <h2>Habilidades & Skills</h2>
        </div>
        <div class="skills-grid">
          <div class="skill-group">
            <label>Hard Skills</label>
            <div class="tags">
              <span v-for="s in hardSkills" :key="s" class="tag tag-hard">{{ s }}</span>
            </div>
          </div>
          <div class="skill-group">
            <label>Soft Skills</label>
            <div class="tags">
              <span v-for="s in softSkills" :key="s" class="tag tag-soft">{{ s }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="content-section">
        <div class="section-header">
          <i class="fa-solid fa-language"></i>
          <h2>Idiomas</h2>
        </div>
        <div class="tags">
          <span v-for="lang in languages" :key="lang.name" class="tag tag-lang">
            {{ lang.name }} • <b>{{ lang.level }}</b>
          </span>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Contenedor Principal con Grid */
.profile-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 30px;
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
  font-family: 'Inter', sans-serif;
  color: #2d3748;
}

/* Sidebar */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sidebar-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 30%;
  object-fit: cover;
  border: 4px solid #f7fafc;
}

.user-meta { text-align: center; }
.name { font-size: 20px; font-weight: 800; margin-bottom: 5px; }
.badge { background: #ebf4ff; color: #4d1b95; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; }

/* Botones */
.action-buttons { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
.btn-action { padding: 10px; border-radius: 10px; border: none; cursor: pointer; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.2s; }
.btn-edit { background: #4d1b95; color: white; }
.btn-save { background: #38a169; color: white; }
.btn-cancel { background: #edf2f7; color: #4a5568; }
.btn-logout { margin-top: 10px; background: transparent; color: #e53e3e; border: 1px solid #fed7d7; padding: 10px; border-radius: 10px; cursor: pointer; }

/* Main Content */
.main-content { display: flex; flex-direction: column; gap: 25px; }
.content-section { background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); }
.section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; color: #4d1b95; }
.section-header h2 { font-size: 18px; font-weight: 700; color: #1a202c; }

/* Timeline Académica */
.timeline { border-left: 2px solid #edf2f7; margin-left: 20px; padding-left: 30px; display: flex; flex-direction: column; gap: 20px; }
.timeline-item { position: relative; }
.year-circle { position: absolute; left: -46px; top: 0; background: #4d1b95; color: white; font-size: 11px; padding: 4px 8px; border-radius: 8px; font-weight: 700; }
.timeline-content h4 { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
.timeline-content p { font-size: 14px; color: #718096; }

/* Tags/Skills */
.tags { display: flex; flex-wrap: wrap; gap: 10px; }
.tag { padding: 6px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; }
.tag-hard { background: #faf5ff; color: #6b46c1; border: 1px solid #e9d8fd; }
.tag-soft { background: #f0fff4; color: #2f855a; border: 1px solid #c6f6d5; }
.tag-lang { background: #fffaf0; color: #9c4221; border: 1px solid #feebc8; }

/* Inputs modernos */
.modern-input, .modern-textarea { width: 100%; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 10px; font-size: 14px; }
.description { line-height: 1.6; color: #4a5568; font-size: 14px; }
.contact-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 12px; font-size: 14px; }
.contact-list i { color: #a0aec0; width: 20px; }

/* Loading State */
.loading-state { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: #4d1b95; }
.spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; border-top-color: #4d1b95; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 900px) {
  .profile-layout { grid-template-columns: 1fr; }
}
</style>