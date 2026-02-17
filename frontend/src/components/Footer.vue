<script setup>
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="basic-footer">
    <div class="copyright">
      <picture>
        <source srcset="../../public/logos/InterniaBlanco.webp" type="image/webp">
        <img class="footer-logo" src="../../public/logos/InterniaBlanco.png" alt="Logo de la empresa">
      </picture>
      
      <p>&copy; {{ currentYear }} Internia. Todos los derechos reservados.</p>
    </div>
  </footer>
</template>

<style scoped>
.basic-footer {
  background-color: #2c3e50;
  color: white;
  padding: 10px 0; /* Padding vertical, el horizontal lo maneja el container */
  margin-top: auto; 
  
  /* ESTO ASEGURA EL ANCHO TOTAL */
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

.footer-container {
  max-width: 1200px; /* Alineado con el ancho de tu Navbar */
  margin: 0 auto;
  box-sizing: border-box;
}

.copyright p {
  margin: 0;
  text-align: center;
  font-size: 0.9rem;
  color: #95a5a6;
}

/*Logo*/
.footer-logo {
  width: 120px; /* ajusta el tamaño como quieras */
  height: auto; /* mantiene la proporción */
  display: block;
  margin: 0 auto 10px auto; /* centra el logo y agrega un poco de espacio abajo */
}

</style>