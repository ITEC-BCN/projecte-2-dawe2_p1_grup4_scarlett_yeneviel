import { onMounted, ref, watch } from "vue";

export function useFetch(url){

    //STATES
    const data=ref(null)
    const error=ref(null)
    const loading=ref(false)//Estado de la carga. si es false es que todavia no termina de cargas

    //GETTERS
    const fetchData= async()=>{

        loading.value=true
        error.value=null

        try {
            const res= await fetch(url.value);

            if(!res.ok){
                throw new Error('Error a la petició: '+res.status)
            }

            data.value=await res.json();

        } catch (err) {
            error.value=err.message
        }finally{
            loading.value=false
        }
    }

    //ACTIONS

  // PUT/PATCH: Enviar actualizaciones
    const actualizarOferta = async (body,urlAlternativa = null ) => {
        loading.value = true;
        error.value = null;

        // Si pasa una url, usa esa. Si no, usa la del composable.
    const urlDestino = urlAlternativa || url.value;
        try {
            const res = await fetch(urlDestino, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error('Error al actualizar');

            return await res.json();
        } catch (err) {
            error.value = err.message;
            throw err;
        } finally {
            loading.value = false;
        }
    };
    //Disparador que esta que no cargue el componente no pasa los datos, no llama la función
    onMounted(fetchData);//Ejecuta la función

    watch(url,fetchData)//Necesario para cada vez que se cambie el paramtro se redenrise la página
    return {data, error,loading, fetchData,actualizarOferta}
}