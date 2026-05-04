import emailjs from "@emailjs/browser";

export async function sendEmail(studentEmail, studentName, type, additionalInfo = {}) { 
    try {
        
        let TEMPLATE_ID = "";
        let templateParams = {};

        if (type === 'aprobado') {
            // Plantilla específica de Bienvenida
            TEMPLATE_ID = "template_dqb3voi"; 
            templateParams = {
                name: studentName,
                email: studentEmail
            };
        } 
        else if (type === 'rechazado' || type === 'inactivo') {
            // Plantilla genérica para otros estados
            TEMPLATE_ID = "template_tqj25lc";
            
            let subject = "";
            let messageBody = "";

            if (type === 'rechazado') {
                subject = "Actualización de tu perfil en Internia";
                messageBody = "Lamentamos informarte que tu perfil no cumple con los requisitos actuales. Puedes contactarnos para más detalles.";
            } else {
                subject = "Aviso de cuenta desactivada";
                messageBody = "Tu cuenta en Internia ha sido desactivada temporalmente por el administrador.";
            }

            templateParams = {
                name: studentName,
                email: studentEmail,
                subject: subject,        // Asegúrate de tener {{subject}} en la plantilla tqj25lc
                message_body: messageBody // Asegúrate de tener {{message_body}} en la plantilla tqj25lc
            };
        }else if (type === 'candidatura') {
            // Plantilla específica para candidatura
            TEMPLATE_ID = "template_tqj25lc";

            templateParams = {
                name: studentName,
                email: studentEmail,
                subject: `Actualización de tu candidatura en ${additionalInfo.offerTitle}`,
                message_body: `Tu candidatura para la oferta '${additionalInfo.offerTitle}' ha sido actualizada a: ${additionalInfo.newStatus}. Puedes revisar tu perfil para más detalles.`
            };
        }
        // Solo enviamos si se asignó una plantilla
        if (TEMPLATE_ID) {
            await emailjs.send(import.meta.env.VITE_SERVICE_ID, TEMPLATE_ID, templateParams, import.meta.env.VITE_PUBLIC_KEY);
        }
    } catch (emailError) {
        console.error("Error al enviar el email:", emailError);
    }
}