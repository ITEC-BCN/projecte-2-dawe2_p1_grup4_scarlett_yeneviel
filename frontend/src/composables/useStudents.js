import { useApi } from "./useApi";
import { ref, watch } from "vue";

export function useStudents(urlRef) {
    const students = ref(null);
    const loadingStudents = ref(true);
    const errorStudents = ref(null);

    const fetchAllReq = async (url) => {
        const currentUrl = urlRef.value;
        if (!currentUrl || currentUrl.includes('null')) return;

        loadingStudents.value = true;
        try {
            const token = localStorage.getItem('token'); // Recuperamos el token
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

    watch(urlRef, () => {
        fetchAllReq();
    }, { immediate: true });

    return {
        students,
        loadingStudents,
        errorStudents,
        refreshStudents: fetchAllReq,
    };
}