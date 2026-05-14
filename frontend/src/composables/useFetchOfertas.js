import { onMounted, ref, watch } from "vue";
import api from "../services/api";

export function useFetch(url) {

    //STATES
    const data = ref(null) // Aquí guardamos la respuesta que venga del servidor (los datos reales)
    const error = ref(null) // Si algo falla guardamos aquí un texto con el problema
    const loading = ref(false) // Indica si ahora mismo estamos esperando respuesta
    const ofertasActivas = ref(null)

    //GETTERS
    const fetchData = async () => {

        // Esta función pide los datos al servidor y los guarda arriba.
        loading.value = true
        error.value = null

        try {
            const res = await api.get(url.value, {
                withCredentials: true
            });

            if (!res.data) {
                // Si el servidor responde mal, ponemos un mensaje claro
                throw new Error('Error a la petició: ' + res.status)
            }

            // Guardamos los datos para que los componentes los usen
            const jsonResponse = res.data;

            // Guardamos todos los datos originales
            data.value = jsonResponse;
            //ofertasActivas.value = jsonResponse.filter(o => o.estado === 'ACTIVA');
            if (Array.isArray(jsonResponse)) {
                ofertasActivas.value = jsonResponse.filter(
                    o => o.estado === 'ACTIVA'
                );
            } else {
                ofertasActivas.value = [];
            }

        } catch (err) {
            // Si hay cualquier error lo guardamos en 'error' para mostrarlo al usuario
            console.error("Error obteniendo los datos:", err);
            error.value = err.message
        } finally {
            loading.value = false
        }
    }


    const postulaciones = async (urlPostulaciones) => {

        ///postulaciones/:id  id de la oferta
        try {
            const res = await api.get(urlPostulaciones, {
                withCredentials: true
            });

            if (!res.data) {
                // Si el servidor responde mal, ponemos un mensaje claro
                throw new Error('Error a la petició: ' + res.status)
            }

            // Guardamos los datos para que los componentes los usen
            return await res.data;

        } catch (err) {
            // Si hay cualquier error lo guardamos en 'error' para mostrarlo al usuario
            return err.message
        }

    }

    //ACTIONS

    // PUT/PATCH: Enviar actualizaciones
    const actualizarOferta = async (body, urlAlternativa) => {
        // body = lo que queremos cambiar. urlAlternativa = ruta donde enviarlo (a veces la pasamos desde el componente).
        loading.value = true;
        error.value = null;

        // Si pasa una url, usa esa. Si no, usa la del composable.
        try {
            const res = await api.put(urlAlternativa, body, {
                headers: { 'Content-Type': 'application/json' }
            });

            const resultado = await res.data;
            if (!res.data) {
                // Si el servidor nos devuelve un error, lo guardamos para que la UI lo muestre
                error.value = resultado.error || "Error en el servidor";
                throw new Error(error.value);
            }
            // Guardamos lo que devolvió el servidor (por ejemplo la oferta ya actualizada)
            data.value = resultado;
            return resultado // Devolvemos el resultado para que quien llame lo pueda usar

        } catch (err) {
            // Guardamos el texto del error y lo re-lanzamos para que el componente lo capture
            error.value = err.message;
            throw err; // Re-lanzamos para que el componente sepa que hubo fallo
        } finally {
            loading.value = false;
        }
    };

    const estudiantePostula = async (body, urlAlternativa) => {
        try {
            const res = await fetch(urlAlternativa, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            const resultado = await res.json();
            if (!res.ok) {
                error.value = resultado.error || "Error en el servidor";
                throw new Error(error.value);
            }
            return resultado
        } catch (err) {
            throw err;
        }

    }
    //Disparador: cuando el componente que use este archivo se monte, pedimos los datos
    onMounted(fetchData);//Ejecuta la función

    // Si cambia la URL (por ejemplo otro ID), volvemos a pedir los datos
    watch(url, fetchData)//Necesario para cada vez que se cambie el parametro se redenrise la página
    return { data, error, loading, ofertasActivas, fetchData, actualizarOferta, postulaciones, estudiantePostula }
}