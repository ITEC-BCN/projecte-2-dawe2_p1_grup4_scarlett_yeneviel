const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());

// Configuración de CORS
app.use(cors({
  origin: [
    "https://internia-web.vercel.app",
    "http://localhost:3000"    // Para pruebas locales
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.get("/", (req, res) => {
  res.json({ message: "API funcionando 🚀" });
});

module.exports = app;
