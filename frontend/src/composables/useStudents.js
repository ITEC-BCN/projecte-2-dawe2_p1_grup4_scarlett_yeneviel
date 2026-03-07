import { useApi } from "./useApi";
import { watch, onMounted } from "vue";

export function useStudents(urlRef) {
    // 1. Definimos las funciones de "fetch"
    const fetchAllReq = async (url) => {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al obtener alumnos: " + res.status);
        return await res.json();
    };

    const postStudentReq = async (body) => {
        const res = await fetch("https://api.ejemplo.com/students", { // Tu URL de POST
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Error al crear alumno");
        return await res.json();
    };

    // 2. Creamos instancias independientes de useApi
    // Esto evita que el loading de "Crear" pise al loading de "Listar"
    const listTask = useApi(() => fetchAllReq(urlRef.value));
    const createTask = useApi(postStudentReq);

    // 3. Lógica automática (Watchers / Lifecycle)
    // Solo si quieres que se dispare solo al cargar el composable
    onMounted(() => listTask.execute());
    
    watch(urlRef, () => {
        listTask.execute();
    });

    // 4. Exponemos todo de forma organizada
    return {
        // Estado de la Lista
        students: listTask.data,
        loadingStudents: listTask.loading,
        errorStudents: listTask.error,
        refreshStudents: listTask.execute,

        // Estado de la Creación
        createStudent: createTask.execute,
        isCreating: createTask.loading,
        createError: createTask.error,
        newStudentData: createTask.data
    };
}