<script setup>
import { ref, reactive, watch } from "vue";
import { useRoute } from "vue-router";
import { URL_BACK } from "../../../../config";
import { useStudents } from "../../composables/useStudents";

const route = useRoute();
const studentId = route.params.id;
const url = ref(`${URL_BACK}/estudiantes/${studentId}`);

const { students, loadingStudents, verCV } = useStudents(url);

const user = reactive({ name: "", role: "", avatar: "", about: "", documento:[]});
const contact = reactive({ email: "", phone: "", location: "" });

const hardSkills = ref([]);
const softSkills = ref([]);
const languages = ref([]);
const documents = ref([]);
const academicBackground = ref([]);

// Rellenar datos desde la fuente cuando lleguen
const restoreOriginalData = () => {
  const source = students.value;
  if (!source) return;

  user.name = (source.nombre || "") + " " + (source.apellido || "");
  user.role = source.role || "Estudiante";
  user.avatar = source.foto_perfil || "/img/avatarGroup.png";
  user.about = source.about || "";
  user.documento = source.documento;
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

  languages.value = source.idiomas?.idiomas
    ? JSON.parse(JSON.stringify(source.idiomas.idiomas))
    : [];

  academicBackground.value = source.estudios?.formacion
    ? JSON.parse(JSON.stringify(source.estudios.formacion))
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
};
watch(
  () => students.value,
  () => {
    restoreOriginalData();
  },
  { immediate: true }
);

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
        <div class="profile-role">{{ user.role || 'Estudiante' }}</div>
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
        <p class="sidebar-text">{{ user.about || 'Aún no hay información.' }}</p>
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
        <div class="contact-item">
          <button
            class="btn-view"
            :disabled="!user.documento || user.documento.length === 0 || !user.documento[0]?.ruta_archivo"
            @click="(user.documento && user.documento.length && user.documento[0]?.ruta_archivo) && verCV(user.documento[0].ruta_archivo)"
          >
            Ver CV
          </button>
        </div>

      </div>
    </aside>

    <main class="profile-main">

      <section class="section">
        <h2 class="section-title">
          <i class="fa-solid fa-graduation-cap icon-green"></i> Formación Académica
        </h2>

        <div class="education-timeline">
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
      </section>

      <section class="section">
        <h2 class="section-title">
          <i class="fa-solid fa-bolt icon-purple"></i> Habilidades y Competencias
        </h2>

        <div class="skills-grid">
          <div class="skill-group">
            <h3 class="skill-subtitle">Hard Skills</h3>
            <div class="skill-list">
              <span v-for="(s, i) in hardSkills" :key="i" class="skill-chip hard">{{ s.nombre }}</span>
              <span v-if="hardSkills.length === 0" class="empty-state">No hay hard skills.</span>
            </div>
          </div>

          <div class="skill-group">
            <h3 class="skill-subtitle">Soft Skills</h3>
            <div class="skill-list">
              <span v-for="(s, i) in softSkills" :key="i" class="skill-chip soft">{{ s.nombre }}</span>
              <span v-if="softSkills.length === 0" class="empty-state">No hay soft skills.</span>
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
                <span class="link-label">{{ doc.name }}</span>
              </a>
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
  background-color: #F3F4F6;
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

 .btn-view {
  background: #6b46c1;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  margin: 5px;
  font-weight: 600;
}

/* Disabled state for buttons (especially 'Ver CV' when no documento) */
.btn-view[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
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
  transition: transform 0.2s, box-shadow 0.2s;
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