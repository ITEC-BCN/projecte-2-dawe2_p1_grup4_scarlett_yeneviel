/*const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});*/

import express from 'express';
import { obtenerOfertas, crearOferta } from './supabaseClient.js'
const app = express();
app.use(express.json());

app.post('/ofertas', async (req, res) => {
  try {
    const { nombre_empresa, fecha_publicacion } = req.body;
    const nuevaOferta = await crearOferta(nombre_empresa, fecha_publicacion);
    res.status(201).json(nuevaOferta);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/ofertas', async (req, res) => {
  try {
    const ofertas = await obtenerOfertas();
    res.json(ofertas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
