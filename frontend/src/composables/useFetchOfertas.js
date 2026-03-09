import { onMounted, ref, watch } from "vue";

export function useFetch(url) {

    //STATES
    const data = ref(null) // Aquí guardamos la respuesta que venga del servidor (los datos reales)
    const error = ref(null) // Si algo falla guardamos aquí un texto con el problema
    const loading = ref(false) // Indica si ahora mismo estamos esperando respuesta

    //GETTERS
    const fetchData = async () => {

        // Esta función pide los datos al servidor y los guarda arriba.
        loading.value = true
        error.value = null

        try {
            const res = await fetch(url.value);

            if (!res.ok) {
                // Si el servidor responde mal, ponemos un mensaje claro
                throw new Error('Error a la petició: ' + res.status)
            }

            // Guardamos los datos para que los componentes los usen
            data.value = await res.json();

        } catch (err) {
            // Si hay cualquier error lo guardamos en 'error' para mostrarlo al usuario
            error.value = err.message
        } finally {
            loading.value = false
        }
    }


    const postulaciones= async(urlPostulaciones)=>{

        ///postulaciones/:id
        try {
            const res = await fetch(urlPostulaciones);

            if (!res.ok) {
                // Si el servidor responde mal, ponemos un mensaje claro
                throw new Error('Error a la petició: ' + res.status)
            }

            // Guardamos los datos para que los componentes los usen
          return  data.value = await res.json();

        } catch (err) {
            // Si hay cualquier error lo guardamos en 'error' para mostrarlo al usuario
           return  err.message
        }

    }

    //ACTIONS

    // PUT/PATCH: Enviar actualizaciones
    const actualizarOferta = async (body, urlAlternativa) => {
        // Explicación simple: esta función manda los cambios al servidor.
        // body = lo que queremos cambiar. urlAlternativa = ruta donde enviarlo (a veces la pasamos desde el componente).
        loading.value = true;
        error.value = null;

        // Si pasa una url, usa esa. Si no, usa la del composable.
        try {
            const res = await fetch(urlAlternativa, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const resultado = await res.json();
            if (!res.ok) {
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
    //Disparador: cuando el componente que use este archivo se monte, pedimos los datos
    onMounted(fetchData);//Ejecuta la función

    // Si cambia la URL (por ejemplo otro ID), volvemos a pedir los datos
    watch(url, fetchData)//Necesario para cada vez que se cambie el parametro se redenrise la página
    return { data, error, loading, fetchData, actualizarOferta, postulaciones }
}