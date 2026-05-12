import { ref, watch } from "vue";
import api from "../services/api";

export function useStudents(urlRef) {
    const students = ref(null);
    const loadingStudents = ref(true);
    const errorStudents = ref(null);

    const fetchAllReq = async () => {
        const currentUrl = urlRef.value;
        if (!currentUrl || currentUrl.includes('null')) return;

        loadingStudents.value = true;
        try {

            const res = await api.get(currentUrl, {
                withCredentials: true
            });

            students.value = await res.data;
            errorStudents.value = null;
        } catch (err) {
            errorStudents.value = err.response?.data?.message || err.message || "Error en la carga de datos";
            console.error("Error detallado:", err);
        } finally {
            loadingStudents.value = false;
        }
    };

    //Ver cv
    const verCV = async (idEstudiante) => {

        if (!idEstudiante) {
            alert('No se proporcionó el id del estudiante');
            return;
        }

        try {
            const response = await api.get(`/get-cv/${idEstudiante}`)

            const data = await response.data;
            const urlPublica = data.url;

            if (urlPublica) {
                // Abrir en pestaña nueva
                window.open(urlPublica, '_blank', 'noopener,noreferrer');
            } else {
                alert('El estudiante no tiene un CV registrado.');
            }

        } catch (error) {
            console.error('Error al obtener el CV de la API:', error);
            const mensajeError = error.response?.data?.error || 'No se pudo abrir el archivo';
            alert(mensajeError);
        }
    };

    watch(urlRef, () => {
        fetchAllReq();
    }, { immediate: true });

    return {
        students,
        loadingStudents,
        errorStudents,
        verCV,
        refreshStudents: fetchAllReq,

    };
}

export async function getSkills(url) {
    try {
        const response = await api.get(url)

        return await response.data;
    } catch (error) {
        console.error("Error cargando skills de la BD:", error);
    }
}

export async function postAvatar(url, formData) {
   try {
        // 1. Pasamos formData DIRECTAMENTE, sin llaves { }
        // 2. Le indicamos explícitamente a Axios que es un formulario multipart
        const response = await api.post(url, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // Devolvemos directamente la data
        return response.data; 
    } catch (error) {
        console.error("Error subiendo el avatar:", error);
        // Es MUY importante lanzar el error de nuevo para que 
        // el bloque catch de 'uploadAvatar' pueda enterarse de que falló
        throw error; 
    }
}