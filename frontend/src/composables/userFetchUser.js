import { onMounted, ref, watch } from "vue";
import { URL_BACK } from "../../../config";

export function useFetchUser(url) {

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

    const OfertasGuardadasUser = async (id_estudiante) => {

        try {
            const res = await fetch(`${URL_BACK}/estudiante/ofertas-guardadas/${id_estudiante}`);

            // Guardamos los datos para que los componentes los usen
            const resultado= await res.json()
            if (!res.ok) {
                throw new Error('Error a la petició: ' + res.status)
            }

            return resultado
        } catch (err) {
            throw err 
        }
    }

     const getOneStudent=async()=>{

              try {
            const res = await fetch(urlAlternativa, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
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
    }

    //ACTIONS

    // POST
    const NewStudent = async (body, urlAlternativa) => {
        // body = datos del registr. urlAlternativa = ruta donde enviarlo .
        try {
            const res = await fetch(urlAlternativa, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const resultado = await res.json();
            if (!res.ok) {
                throw new Error(error.value);
            }
            return resultado // Devolvemos el resultado para que quien llame lo pueda usar
            
        } catch (err) {
            throw err; // Re-lanzamos para que el componente sepa que hubo fallo
        }
    };


    const guardarOferta = async (id_estudiante, id_oferta) => {
        try {
            const res = await fetch(`${URL_BACK}/guardar-oferta`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id_estudiante, id_oferta })
            });

            const resultado = await res.json();
            if (!res.ok) {
                throw new Error(resultado.error || "Error en el servidor");
            }
            return resultado; // Devolvemos el resultado para que quien llame lo pueda usar
            
        } catch (err) {
            throw err; // Re-lanzamos para que el componente sepa que hubo fallo
        }
    };

    //Actualiza el estado de la solicitud (aceptada/rechazada) de un estudiante por el administrador 
    const actualizarEstado = async (idEstudiante, nuevoEstado) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${URL_BACK}/actualizar-estado/${idEstudiante}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ estado: nuevoEstado })
            });

            if (!res.ok) throw new Error("Error al actualizar el estado");

            const data = await res.json();
            //console.log("Estado actualizado:");
            // Aquí podrías actualizar el estado en el objeto `students`
        } catch (err) {
            console.error("Error detallado:", err.message);
        }
    };
    //Disparador: cuando el componente que use este archivo se monte, pedimos los datos
    onMounted(fetchData);//Ejecuta la función

    // Si cambia la URL (por ejemplo otro ID), volvemos a pedir los datos
    watch(url, fetchData)//Necesario para cada vez que se cambie el parametro se redenrise la página
    return { data, error, loading, fetchData, NewStudent, guardarOferta, getOneStudent,OfertasGuardadasUser , actualizarEstado}
}