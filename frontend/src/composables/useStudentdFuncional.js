import { useApi } from "./useApi";
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
            const token = localStorage.getItem('token'); // Recuperamos el token

            const res = await api.get(currentUrl, {
                credentials: 'include'
            });

            if (!res.data) throw new Error("Error en la carga de datos");

            students.value = await res.data;
            errorStudents.value = null;
        } catch (err) {
            errorStudents.value = err.message;
            console.log("Token actual enviado:", localStorage.getItem('token')); // Mira si sale algo aquí
            console.error("Error detallado:", err);
        } finally {
            loadingStudents.value = false;
        }
    };

    watch(urlRef, () => {
        fetchAllReq();
    }, { immediate: true });

    return {
        students,
        loadingStudents,
        errorStudents,
        refreshStudents: fetchAllReq
    };
}