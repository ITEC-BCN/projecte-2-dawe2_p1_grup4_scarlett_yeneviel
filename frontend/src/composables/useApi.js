// Método genérico para llamar a la API. 
// Sólo se le llama una vez y manejará el estado de la petición a la que se llama.
import { ref } from "vue";

export function useApi(apiCall) {
    const data = ref(null);
    const error = ref(null);
    const loading = ref(false);

    const execute = async (...args) => {
        loading.value = true;
        error.value = null;
        try {
            const res = await apiCall(...args);
            data.value = res;
            return res;
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };

    return { data, error, loading, execute };
}