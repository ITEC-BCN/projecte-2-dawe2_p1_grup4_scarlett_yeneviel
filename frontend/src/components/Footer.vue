<template>
  <footer class="basic-footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-brand">
          <picture>
            <source
              srcset="../../public/logos/InterniaBlanco.webp"
              type="image/webp"
            />
            <img
              class="footer-logo"
              src="../../public/logos/InterniaBlanco.png"
              alt="Logo de la empresa"
            />
          </picture>
        </div>

        <nav class="footer-columns">
          <div class="footer-column">
            <h4>Compañía</h4>
            <router-link to="/nosotros">Sobre Nosotras</router-link>
            <router-link to="/servicios">Nuestros servicios</router-link>
          </div>

          <div class="footer-column">
            <h4>Soporte</h4>
            <router-link to="/ayuda">Centro de Ayuda</router-link>
            <router-link to="/contacto">Contacto</router-link>
            <router-link to="/faqs">FAQs</router-link>
          </div>

          <div class="footer-column">
            <h4>Legal</h4>
            <router-link to="/servTerms">Términos de Servicio</router-link>
            <router-link to="/privacidad">Política de Privacidad</router-link>
          </div>

          <div class="footer-column">
            <h4>Redes Sociales</h4>
            <a
              href="https://www.linkedin.com/company/internia/"
              target="_blank"
              rel="noopener"
              >LinkedIn</a
            >
            <a
              href="https://www.instagram.com/interniaverde/"
              target="_blank"
              rel="noopener"
              >Instagram</a
            >
            <a
              href="https://www.twitter.com/interniaverde"
              target="_blank"
              rel="noopener"
              >Twitter</a
            >
          </div>
        </nav>
      </div>

      <div class="footer-bottom">
        <hr />
        <p>&copy; Internia. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.basic-footer {
  background-color: #2c3e50;
  color: white;
  padding: 20px 0;
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

.footer-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px; /* Margen interno para que el texto no toque los bordes en móvil */
}

.footer-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 40px;
  margin-bottom: 10px;
}

.footer-brand {
  flex: 1;
  min-width: 200px;
}

.brand-text {
  color: #ecf0f1; /* Blanco suave */
  font-size: 0.9rem;
  margin-top: 10px;
}

.footer-columns {
  display: flex;
  flex: 3;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
}

.footer-column {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

/* Tipografía y Enlaces */
h4 {
  color: #ffffff;
  margin-bottom: 15px;
  font-size: 1.1rem;
  font-weight: 600;
  display: inline-block;
  border-bottom: 2px solid #10b981;
  padding-bottom: 5px;
}

.footer-column a {
  color: #bdc3c7; /* Gris claro para links */
  text-decoration: none;
  margin-bottom: 8px;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.footer-column a:hover {
  color: #ffffff; /* Blanco puro al pasar el mouse */
}

/* Logo */
.footer-logo {
  width: 120px;
  height: auto;
  display: block;
}

/* Parte Inferior */
.footer-bottom {
  text-align: center;
}

.footer-bottom hr {
  border: 0;
  border-top: 1px solid #3e4f5f;
  margin-bottom: 20px;
}

.footer-bottom p {
  color: #ecf0f1;
  font-size: 0.85rem;
  margin: 0;
}

/* Responsivo para móviles */
@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }

  .footer-brand,
  .footer-logo {
    margin: 0 auto;
  }

  .footer-columns {
    flex-direction: column;
    align-items: center;
  }
}
</style>
