import { ref } from 'vue';

export function useValidacionOferta() {
    const erroresValidacion = ref({});

    const validarFormulario = (datos) => {
        const errores = {};

        // EMPRESA
        if (!datos.nombre_empresa?.trim()) {
            errores.nombre_empresa = "El nombre de la empresa es obligatorio";
        }

        // TIPO DE PUESTO
        if (!datos.tipo_puesto || datos.tipo_puesto.trim().length < 3) {
            errores.tipo_puesto = "El tipo de puesto es obligatorio";
        }

        // FUNCIONES, REQUISITOS, BENEFICIOS
        const camposMinimos = ['funciones', 'requisitos', 'beneficios'];
        camposMinimos.forEach(campo => {
            if (!datos[campo] || datos[campo].trim().length < 5) {
                errores[campo] = `El campo ${campo} es obligatorio (mín. 5 caracteres)`;
            }
        });

        if (!datos.id_ubicacion) {
            errores.id_ubicacion = "La ubicación es obligatoria";
        }

        if(!datos.jornada){
            errores.jornada = "La jornada es obligatoria";
        }

        if(!datos.modelo_practicas){
            errores.modelo_practicas = "El modelo de prácticas es obligatorio";
        }

        if(!datos.modalidad){
            errores.modalidad = "La modalidad es obligatoria";
        }

        // Validación de fecha expiración
        if (datos.fecha_expiracion) {
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const exp = new Date(datos.fecha_expiracion);

            if (exp < hoy) {
                errores.fecha_expiracion = "La fecha NO puede ser menor a hoy";
            } else {
                const diffDias = Math.ceil((exp - hoy) / (1000 * 60 * 60 * 24));
                if (diffDias < 28) {
                    errores.fecha_expiracion = "La expiración debe ser al menos 30 días desde hoy";
                }
            }
        } else {
            errores.fecha_expiracion = "La fecha de expiración es obligatoria";
        }

        // Descripción
        if (!datos.descripcion || datos.descripcion.trim().split(/\s+/).length < 2) {
            errores.descripcion = "Debe tener al menos una frase";
        }

        erroresValidacion.value = errores;
        return Object.keys(errores).length === 0;
    };

    return {
        erroresValidacion,
        validarFormulario
    };
}