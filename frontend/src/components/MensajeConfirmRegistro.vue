<script setup>

import emailjs from "@emailjs/browser";

export async function sendEmail (studentEmail){ 

    try {
        const SERVICE_ID = "service_xznwlip"; 
        const TEMPLATE_ID = "template_xk3yqke"; 
        const PUBLIC_KEY = "fb8fbWLbHBX7mgoNz"; 
        
        
    const templateParams = {
        to_name: 'Nombre del Estudiante',
        from_name: 'Tu Plataforma de Prácticas',
        message: '¡Gracias por registrarte! Estamos emocionados de tenerte con nosotros. Explora las ofertas de prácticas y encuentra la oportunidad perfecta para tu desarrollo profesional.',
        to_email: studentEmail
    };
    
     await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY);
        console.log("¡Email de aviso de postulación enviado correctamente!");

    } catch (emailError) {
        console.error("La inscripción se completó, pero falló el envío del e-mail de aviso:", emailError);
    }

};
</script>
