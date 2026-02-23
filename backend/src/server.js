/*const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});*/

import express from 'express';
import cors from 'cors'


import { 
  obtenerOfertas, 
  crearOferta, 
  obtenerOfertaPorId, 
  actualizarOferta, 
  eliminarOferta,
  crearEstudiante, 
  obtenerEstudiantes, 
  obtenerEstudiantePorId, 
  actualizarEstudiante
} from './supabaseClient.js'
const app = express();

// Permitir cualquier origen (para desarrollo)
app.use(cors())

app.use(express.json());

//Rutas

app.post("/ofertas", async (req, res) => {
  try {

    console.log("Body", req.body)

    const nuevaOferta = await crearOferta({
      nombre_empresa: req.body.nombre_empresa,
      tipo_puesto: req.body.tipo_puesto,
      fecha_expiracion: req.body.fecha_expiracion,
      descripcion: req.body.descripcion,
      funciones: req.body.funciones,
      requisitos: req.body.requisitos,
      beneficios: req.body.beneficios || null,
    });
      console.log("BODY:", req.body); // 👈 prueba esto

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

//Actualiza las ofertas
app.put('/oferta/:id',async (req, res)=>{

  try{

    const body=req.body;
    const id=req.params.id;
    const oferta=await actualizarOferta (id, body)

    //Valido que exista la oferta
    // Supabase devuelve un array vacío [] si no encuentra el ID al usar .select()
    if (!oferta || oferta.length === 0) {
      return res.status(404).json({ error: "Oferta no encontrada" });
    }

    //  Respuesta exitosa
    res.status(200).json({
      message: "Oferta actualizada con éxito",
      data: oferta[0] // Devolvemos el registro actualizado
    });

  }catch (err){
    res.status(500).json({error:err.message})
  }
})

//delete

app.delete('/ofertas/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const resultado = await eliminarOferta(id);

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//====================== Usuario Estudiante =======================

// POST: Registrar un nuevo estudiante
app.post("/estudiantes", async (req, res) => {
  try {
    const nuevo = await crearEstudiante(req.body);
    res.status(201).json({
      message: "Registro exitoso",
      data: nuevo[0]
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Listar todos los estudiantes
app.get("/estudiantes", async (req, res) => {
  try {
    const lista = await obtenerEstudiantes();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Obtener un estudiante por ID
app.get("/estudiantes/:id", async (req, res) => {
  try {
    const estudiante = await obtenerEstudiantePorId(req.params.id);
    res.json(estudiante);
  } catch (err) {
    res.status(404).json({ error: "Estudiante no encontrado" });
  }
});

// PUT: Actualizar datos (por ejemplo, cambiar el estado de 'pendiente' a 'aprobado')
app.put("/estudiantes/:id", async (req, res) => {
  try {
    const actualizado = await actualizarEstudiante(req.params.id, req.body);
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
