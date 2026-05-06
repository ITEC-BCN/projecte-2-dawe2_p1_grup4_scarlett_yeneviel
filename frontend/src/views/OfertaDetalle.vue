<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useFetch } from '../composables/useFetchOfertas';
import { useFetchUser } from '../composables/userFetchUser';
import { URL_BACK } from '../../../config';
import ModalInformativo from '../components/ModalInformativo.vue';
// Importar la librería para enviar un e-mail cuando el estudiante se postula a una oferta
import emailjs from "@emailjs/browser";

const route = useRoute();
const router = useRouter();

// Construimos la URL usando el ID que viene en la ruta
const url = ref(`${import.meta.env.VITE_URL_BACK}/ofertas/${route.params.id}`);
// 1. variable para guardar el mensaje personzalido dentro del mondal
const mensajePersonalizado = ref("");
const { data: oferta, error, loading, estudiantePostula, postulaciones } = useFetch(url);
const { guardarOferta, OfertasGuardadasUser } = useFetchUser();

const volver = () => router.push({ name: "ofertas" });

const idEstudiante = localStorage.getItem("studentId")
const bodyPostulacion = ref({
  id_oferta: route.params.id,
  id_estudiante: idEstudiante
})

const yaPostulado = ref(false);
const ofertaYaGuardada = ref(false);
//Estado del estudiante
const { getEstadoEstudiante } = useFetchUser();
const estadoActual = ref('cargando...');

const actualizarEstado = async () => {
  const res = await getEstadoEstudiante();
  estadoActual.value = res.toLowerCase()
  
};

//función que verifica tanto si el estudiante ya postuló a la oferta como si ya la guardó, para actualizar ambos estados al cargar la página y desabilitar botones
const verificarEstado= async (idEstudiante, estado) => {

    try {

      if(estado=="postulacion"){
        const listaPostulados = await postulaciones(`${import.meta.env.VITE_URL_BACK}/postulaciones/${route.params.id}`)
        yaPostulado.value = listaPostulados.some(p => parseInt(p.id_usuario_estudiante) == parseInt(idEstudiante))
      }else if(estado=="guardado"){
        const listaOfertasGuardadas = await OfertasGuardadasUser(idEstudiante);
        // Asegurarnos de comparar los mismos tipos (string/number) para que la búsqueda funcione
        ofertaYaGuardada.value = listaOfertasGuardadas.some(o => String(o.id_oferta) === String(route.params.id));
      }

  } catch (err) {

    console.error("Error comprobando estado postulaciones y guardados: ", err)
  }
  
}
//2. Estado de modal para abrir el modal informativo 
const modalEstadoRef = ref(null);

const modalInformativoEstado = () => {
  modalEstadoRef.value?.openModal(); // modalEstadoRef es la instancia del componente ModalInformativo
};

// Llamamos a la función cuando el componente se carga
onMounted(() => {

  if(idEstudiante){
  verificarEstado(idEstudiante, "postulacion");
  verificarEstado(idEstudiante, "guardado");
  actualizarEstado();
  }
});

const postularOferta = async () => {


  if(estadoActual.value !== 'aprobado' && idEstudiante){
    mensajePersonalizado.value = `Tu cuenta está en estado: ${estadoActual.value.toUpperCase()}. Solo los estudiantes con cuentas aprobadas pueden postular a ofertas. Por favor, espera a que un administrador revise tu cuenta.`;
    modalInformativoEstado();
    return;
  }else if(estadoActual.value === 'inactivo'){
    mensajePersonalizado.value = `Tu cuenta está inactiva. Por favor, contacta con soporte para más información.`;
    modalInformativoEstado();
    return;
  }

  if(idEstudiante){
    try {

      const res = await estudiantePostula(bodyPostulacion.value, `${import.meta.env.VITE_URL_BACK}/estudiante/postular`)
      if (res.error) {
        console.error("Error al hacer la incripción: ", res.error)
        alert("Error al hacer la incripción")
        return
      }

      // al inscribirse a una oferta, enviamos el correo con EmailJS
      // al inscribirse a una oferta, enviamos el correo con EmailJS
      try {
        const SERVICE_ID = "service_xznwlip"; 
        const TEMPLATE_ID = "template_xk3yqke"; 
        const PUBLIC_KEY = "fb8fbWLbHBX7mgoNz";

        const emailEstudiante = localStorage.getItem("studentEmail") || "Correo no disponible";

        console.log("Email que se enviará:", emailEstudiante); // <-- Console.log seguro

        const templateParams = {
          titulo_oferta: oferta.value?.tipo_puesto || "Puesto no especificado", 
          empresa: oferta.value?.nombre_empresa || "Empresa no especificada",
          email: emailEstudiante
        };

        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log("¡Email de aviso de postulación enviado correctamente!");

      } catch (emailError) {
        // Capturamos el error del email para no arruinar la experiencia del usuario, ya que la inscripción sí se hizo.
        console.error("La inscripción se completó, pero falló el envío del e-mail de aviso:", emailError);
      }
      
      //2. Uso la variable
      mensajePersonalizado.value = "¡Inscripción hecha correctamente!"
      modalInformativoEstado();//llamo la función que abre el modal después de guardar la oferta
      verificarEstado(idEstudiante, "postulacion")

    } catch (error) {
      console.error("Error al hacer la incripción: ", error)
      alert("Error al hacer la incripción")

    }
  }else{
     const hacerLogin= confirm("Inicia sesión para inscribirte en la oferta")

     if(hacerLogin) router.push({ name: "login" })
      
  }

 
}

const funGuardarOferta = async() => {

  if(estadoActual.value !== 'aprobado' && idEstudiante){
    mensajePersonalizado.value = `Tu cuenta está en estado: ${estadoActual.value.toUpperCase()}. Solo los estudiantes con cuentas aprobadas pueden guardar ofertas. Por favor, espera a que un administrador revise tu cuenta.`;
    modalInformativoEstado();
    return;
    
  }else if(estadoActual.value === 'inactivo'){
    mensajePersonalizado.value = `Tu cuenta está inactiva. Por favor, contacta con soporte para más información.`;
    modalInformativoEstado();
    return;
  }

  if(idEstudiante){

    const response = await guardarOferta(idEstudiante, route.params.id)

    if(response.error){
      console.error("Error al guardar la oferta: ", response.error)
      alert("Error al guardar la oferta")
      return
    }
    // Actualizamos el estado local inmediatamente para que el botón se deshabilite sin esperar la recarga
    ofertaYaGuardada.value = true
    mensajePersonalizado.value = "¡Oferta guardada correctamente!"
    modalInformativoEstado();//llamo la función que abre el modal después de guardar la oferta
    verificarEstado(idEstudiante, "guardado")
  }else{
    const hacerLogin= confirm("Inicia sesión para guardar la oferta")

   if(hacerLogin) router.push({ name: "login" })
  }
   
}
</script>

<template>
  <div class="detalle-page">
    <div class="detalle-container">

      <button @click="volver" class="btn-back">
        ← Volver al listado
      </button>

      <div v-if="loading" class="state-msg">
        Buscando los mejores detalles... ✨
      </div>

      <div v-else-if="error" class="state-msg error">
        Vaya, algo salió mal al cargar la oferta 😢
      </div>

      <article v-else-if="oferta" class="oferta-card-new">

  <!-- HEADER tipo TechTalent -->
  <header class="header-top">
    <div class="empresa-info">
      <div class="logo-box">🏢</div>

      <div>
        <h1 class="titulo-puesto">{{ oferta.tipo_puesto }}</h1>
        <p class="empresa-nombre">{{ oferta.nombre_empresa }}</p>

        <div class="tags">
          <span class="tag">C#</span>
          <span class="tag">.NET</span>
          <span class="tag">Azure</span>
          <span class="tag">SQL</span>
        </div>
      </div>
    </div>

    <div class="acciones-header">
      <button class="btn-postular-main"
        @click="postularOferta"
        :disabled="yaPostulado || estadoActual === 'pendiente' || estadoActual === 'inactivo'">
        Postularme
      </button>
    </div>
  </header>

  <!-- GRID -->
  <div class="contenido-grid-new">

    <!-- IZQUIERDA -->
    <main class="info-principal-new">

      <section class="bloque">
        <h3>Descripción</h3>
        <p>{{ oferta.descripcion }}</p>
      </section>

      <section class="bloque">
        <h3>Funciones</h3>
        <p>{{ oferta.funciones }}</p>
      </section>

      <section class="bloque">
        <h3>Requisitos</h3>
        <p>{{ oferta.requisitos }}</p>
      </section>

      <section class="bloque beneficios">
        <h3>Beneficios</h3>
        <div class="beneficios-grid">
          <div>Contrato indefinido</div>
          <div>Plan de carrera</div>
          <div>Certificaciones</div>
        </div>
      </section>

    </main>

    <!-- SIDEBAR DERECHA -->
    <aside class="sidebar-new">
      <div class="info-box-new">

        <h4>Detalles de la oferta</h4>

        <div class="info-item-new">
          <span>Publicado</span>
          <strong>{{ oferta.fecha_publicacion }}</strong>
        </div>

        <div class="info-item-new">
          <span>Expira</span>
          <strong class="expira">{{ oferta.fecha_expiracion }}</strong>
        </div>

        <div class="info-item-new">
          <span>Ubicación</span>
          <strong>Barcelona</strong>
        </div>

        <div class="info-item-new">
          <span>Modalidad</span>
          <strong>{{ oferta.modalidad }}</strong>
        </div>

        <div class="info-item-new">
          <span>Jornada</span>
          <strong>{{ oferta.jornada }}</strong>
        </div>

        <div class="estado-box">
          <span>Estado</span>
          <strong class="activa">ACTIVA</strong>
        </div>

        <button
          @click="funGuardarOferta"
          :disabled="ofertaYaGuardada"
          class="btn-guardar-oferta">
          🤍 Guardar oferta
        </button>

      </div>

      <!-- MAPA FAKE -->
      <div class="mapa-box">
        <div class="mapa"></div>
        <p>Oficinas en Barcelona</p>
      </div>

    </aside>

  </div>

</article>

    </div>
  </div>

  <!-- 4. Llamada al modal para mostrar mensaje de oferta guardada correctamente se asigna una instancia del componente ModalInformativo a modalEstadoRef -->
  <modal-informativo ref="modalEstadoRef" :mensaje="mensajePersonalizado" />
</template>

<style scoped>
/* Página base*/
.detalle-page {
  background: #F3F4F6;
  min-height: 100vh;
  padding: 50px 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.detalle-container {
  max-width: 1200px;
  margin: auto;
}

/* Card principal rediseñada */
.oferta-card-new {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 40px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
}

/* Header */
.header-detalle-new {
  margin-bottom: 35px;
  text-align: left;
}

.header-meta {
  display: flex;
  justify-content: flex-start;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.empresa-new {
  font-size: 2.2rem;
  font-weight: 800;
  color: #0d1b2a;
  line-height: 1.2;
}

.badge-new {
  background: #2E7D32;
  color: white;
  padding: 8px 14px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
}

/* Layout principal */
.contenido-grid-new {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
  align-items: start;
}

/* Información Principal */
.info-principal-new {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.seccion-detalle-new {
  background: #ffffff;
  border: 2px solid #111827;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 10px;
}

.seccion-detalle-new h3 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 10px;
  border-left: 4px solid #4C1D95;
  padding-left: 10px;
}

.seccion-detalle-new p {
  color: #1f2937;
  line-height: 1.7;
  font-size: 0.95rem;
}

/* Sidebar Pegajoso */
.sidebar-new {
  position: sticky;
  top: 30px;
}

.info-box-new {
  background: #ffffff;
  border: 2px solid #111827;
  border-radius: 12px;
  padding: 20px;
}

.info-item-new {
  margin-bottom: 18px;
}

.info-item-new strong {
  display: block;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #374151;
  margin-bottom: 5px;
}

.info-item-new span {
  color: #000000;
  font-weight: 600;
  font-size: 1.1rem;
}

.detalle-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.detalle-meta p {
  background: #111827;
  color: #ffffff;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Botones */
.btn-postular {
  width: 100%;
  margin-top: 15px;
  padding: 15px;
  border-radius: 10px;
  border: none;
  background: var(--primary);
  color: white;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-postular:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
}

.btn-guardar-oferta {
  width: 100%;
  margin-top: 10px;
  padding: 12px;
  border-radius: 10px;
  border: 2px solid #111827;
  background: transparent;
  color: #111827;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.btn-guardar-oferta:hover {
  background: #111827;
  color: white;
  transform: translateY(-1px);
}

button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
  border: none;
}

.btn-back {
  background: none;
  border: none;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 20px;
  cursor: pointer;
  font-size: 1rem;
}

/* Estados */
.state-msg {
  padding: 40px;
  text-align: center;
  font-size: 1.2rem;
  color: #6B7280;
}

.state-msg.error {
  color: #DC2626;
}

/* HEADER tipo tarjeta */
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.empresa-info {
  display: flex;
  gap: 15px;
}

.logo-box {
  width: 55px;
  height: 55px;
  background: #e5e7eb;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.titulo-puesto {
  font-size: 1.8rem;
  font-weight: 800;
}

.empresa-nombre {
  color: #2563eb;
  font-weight: 600;
  margin-bottom: 5px;
}

.tags {
  display: flex;
  gap: 8px;
}

.tag {
  background: #e5e7eb;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
}

/* BOTÓN PRINCIPAL */
.btn-postular-main {
  background: #2563eb;
  color: white;
  padding: 14px 22px;
  border-radius: 10px;
  font-weight: 700;
  border: none;
  cursor: pointer;
}

/* BLOQUES SUAVES */
.bloque {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
}

.bloque h3 {
  font-weight: 800;
  margin-bottom: 10px;
}

/* BENEFICIOS */
.beneficios-grid {
  display: flex;
  gap: 10px;
}

.beneficios-grid div {
  background: #e0e7ff;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.9rem;
}

/* SIDEBAR */
.info-box-new h4 {
  margin-bottom: 15px;
}

.info-item-new {
  margin-bottom: 15px;
}

.info-item-new span {
  display: block;
  font-size: 0.8rem;
  color: #6b7280;
}

.info-item-new strong {
  font-size: 1rem;
}

.expira {
  color: #dc2626;
}

.estado-box {
  margin-top: 10px;
}

.activa {
  color: #16a34a;
  font-weight: 700;
}

/* MAPA */
.mapa-box {
  margin-top: 20px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.mapa {
  height: 150px;
  background: linear-gradient(135deg, #c7d2fe, #a7f3d0);
}

/* Responsive */
@media (max-width: 1024px) {
  .contenido-grid-new {
    grid-template-columns: 1fr 280px;
    gap: 30px;
  }
  .oferta-card-new {
    padding: 30px;
  }
  .empresa-new {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .detalle-page {
    padding: 30px 15px;
  }
  .oferta-card-new {
    padding: 25px;
  }
  .contenido-grid-new {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  .empresa-new {
    font-size: 1.8rem;
  }
  .header-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .sidebar-new {
    position: static;
  }
  .info-box-new {
    padding: 15px;
  }
  .btn-postular, .btn-guardar-oferta {
    font-size: 14px;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .detalle-container {
    max-width: 100%;
  }
  .oferta-card-new {
    padding: 20px;
    border-radius: 12px;
  }
  .empresa-new {
    font-size: 1.5rem;
  }
  .seccion-detalle-new {
    padding: 15px;
  }
  .seccion-detalle-new h3 {
    font-size: 1.1rem;
  }
  .seccion-detalle-new p {
    font-size: 0.9rem;
  }
  .info-item-new span {
    font-size: 1rem;
  }
  .detalle-meta p {
    font-size: 0.75rem;
    padding: 5px 8px;
  }
  .btn-postular, .btn-guardar-oferta {
    font-size: 13px;
    padding: 10px;
  }
  .state-msg {
    padding: 20px;
    font-size: 1rem;
  }
}
</style>