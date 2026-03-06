<script setup>
import { ref } from 'vue';

const isOpen = ref(false);
const mensaje = ref('');
const conversacion = ref([
  { text: "¡Hola! ¿En qué puedo ayudarte?", isBot: true }
]);

const toggleChat = () => {
  isOpen.value = !isOpen.value;
};

const enviarMensaje = () => {
  if (mensaje.value.trim() === '') return;
  
  // Añadir mensaje del usuario
  conversacion.value.push({ text: mensaje.value, isBot: false });
  
  // Simular respuesta del bot
  setTimeout(() => {
    conversacion.value.push({ text: "Gracias por contactar. Un asesor te atenderá pronto.", isBot: true });
  }, 1000);

  mensaje.value = '';
};
</script>

<template>
  <div class="chatbot-wrapper">
    <div v-if="isOpen" class="chat-window">
      <div class="chat-header">
        <span>Soporte Internia</span>
        <button @click="toggleChat">×</button>
      </div>
      
      <div class="chat-messages">
        <div v-for="(msg, index) in conversacion" :key="index" 
             :class="['bubble', msg.isBot ? 'bot' : 'user']">
          {{ msg.text }}
        </div>
      </div>

      <div class="chat-input">
        <input v-model="mensaje" @keyup.enter="enviarMensaje" placeholder="Escribe un mensaje..." />
        <button @click="enviarMensaje">➤</button>
      </div>
    </div>

    <div class="chat-icon" @click="toggleChat">
      <span v-if="!isOpen">💬</span>
      <span v-else>↓</span>
    </div>
  </div>
</template>

<style scoped>
.chatbot-wrapper {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
  font-family: sans-serif;
}

/* El botón circular */
.chat-icon {
  width: 70px;
  height: 70px;
  background: #10b981;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.chat-icon:hover {
  transform: scale(1.1);
}

/* La ventana de chat */
.chat-window {
  width: 300px;
  height: 400px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 20px;
}

.chat-header {
  background: #4C1D95; /* Tu púrpura */
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f9f9f9;
}

.bubble {
  padding: 8px 12px;
  border-radius: 12px;
  max-width: 80%;
  font-size: 0.9rem;
}

.bot {
  background: #e5e7eb;
  align-self: flex-start;
}

.user {
  background: #10b981;
  color: white;
  align-self: flex-end;
}

.chat-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #eee;
}

.chat-input input {
  flex: 1;
  border: none;
  padding: 8px;
  outline: none;
}

.chat-input button {
  background: none;
  border: none;
  color: #10b981;
  cursor: pointer;
  font-size: 1.2rem;
}
</style>