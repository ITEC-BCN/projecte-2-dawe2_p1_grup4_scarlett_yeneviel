import { ref, watch } from "vue";
import { URL_BACK } from "../../../config";

export function useStudents(urlRef) {
    const students = ref(null);
    const loadingStudents = ref(true);
    const errorStudents = ref(null);


    const fetchAllReq = async (url) => {
        const currentUrl = urlRef.value;
        if (!currentUrl || currentUrl.includes('null')) return;

        loadingStudents.value = true;
        try {
             // Recuperamos el token
            const token = localStorage.getItem('token');
            const res = await fetch(currentUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`, // Por si falla la cookie
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!res.ok) throw new Error("Error en la carga de datos");

            students.value = await res.json();
            errorStudents.value = null;
        } catch (err) {
            errorStudents.value = err.message;
            console.error("Error detallado:", err);
        } finally {
            loadingStudents.value = false;
        }
    };

    //Ver cv
    const verCV=async(nombreArchivo)=>{

        if (!nombreArchivo) {
            alert('No se proporcionó el nombre del archivo');
            return;
        }
        try {
            // Llamada a tu API de Node
            const token = localStorage.getItem('token');
            const response = await fetch(`${URL_BACK}/get-cv/${nombreArchivo}`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            credentials: 'include'
            });
            const data = await response.json();
            const urlPublica = data.url;

            // Abrir en pestaña nueva
            window.open(urlPublica, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Error al obtener el CV de la API:', error);
            alert('No se pudo abrir el archivo');
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