<template>
  <!--ESTE CÓDIGO YA NO ES NECESARIO, EL BOT SE LLAMA DES DE UN LINK EN EL index.html-->
  <div id="botpress-webchat-container"></div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
  // 1. Inyectamos el script principal (inyector)
  const scriptInject = document.createElement('script');
  scriptInject.src = "https://cdn.botpress.cloud/webchat/v3.6/inject.js";
  scriptInject.async = true;
  document.body.appendChild(scriptInject);

  // 2. Inyectamos tu configuración personalizada específica
  const scriptConfig = document.createElement('script');
  scriptConfig.src = "https://files.bpcontent.cloud/2026/01/12/14/20260112143554-XFQUIFEW.js";
  scriptConfig.defer = true;
  document.body.appendChild(scriptConfig);
});
</script>