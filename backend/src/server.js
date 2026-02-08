/*const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});*/

import express from 'express';
import cors from 'cors'


import { obtenerOfertas, crearOferta, obtenerOfertaPorId } from './supabaseClient.js'
const app = express();

// Permitir cualquier origen (para desarrollo)
app.use(cors())

app.use(express.json());

//Rutas

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

app.get('/ofertas/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const oferta = await obtenerOfertaPorId(id);
    
    if (!oferta) {
      return res.status(404).json({ error: "Oferta no encontrada" });
    }
    
    res.json(oferta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// O, si quieres restringir a tu frontend:
/* Esta parte está duplicada
app.use(cors({
  origin: 'https://expert-space-robot-97j5v99r4575cr64-5173.app.github.dev'
}))

app.use(express.json())
*/
app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
