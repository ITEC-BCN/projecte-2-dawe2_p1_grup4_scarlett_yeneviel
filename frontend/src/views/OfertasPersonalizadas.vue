import { ref, onMounted } from 'vue';
// Asumo que importas tu función de supabase aquí
import { obtenerEstudiantePorId } from '@/servicios/estudiantes'; 

const estudiante = ref(null);
const ofertasRecomendadas = ref([]);
const cargando = ref(true);

const inicializarDashboard = async () => {
  try {
    // 1. Obtienes el ID del usuario logueado (por ejemplo, desde tu store o auth)
    const idUsuarioLogueado = 1; // Cambia esto por tu lógica real

    // 2. Traes los datos del estudiante con la función que TÚ creaste
    estudiante.value = await obtenerEstudiantePorId(idUsuarioLogueado);

    // 3. Ahora llamas a tu API en Node para traer las ofertas compatibles
    const respuestaOfertas = await fetch(`http://localhost:3000/estudiantes/${estudiante.value.id}/ofertas-recomendadas`);
    
    if (respuestaOfertas.ok) {
      ofertasRecomendadas.value = await respuestaOfertas.json();
    }
  } catch (error) {
    console.error("Error cargando el panel:", error);
  } finally {
    cargando.value = false;
  }
};

onMounted(() => {
  inicializarDashboard();
});