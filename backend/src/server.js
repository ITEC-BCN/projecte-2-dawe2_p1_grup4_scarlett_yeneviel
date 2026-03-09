/*const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});*/

import express from 'express';
import cors from 'cors'
import bcrypt from 'bcryptjs';


import { 
  obtenerOfertas, 
  crearOferta, 
  obtenerOfertaPorId, 
  actualizarOferta, 
  eliminarOferta,
  crearEstudiante, 
  obtenerEstudiantes, 
  obtenerEstudiantePorId, 
  actualizarEstudiante,
  crearAdmin, 
  obtenerAdmins, 
  obtenerAdminPorId,
  actualizarAdmin,
  obtenerEstudiantePorEmail,
  obtenerAdminPorEmail,
  VerPostulacionesAdmin

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
      console.log("BODY:", req.body); // prueba esto

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
    const newPassword_hash =  bcrypt.hashSync(req.body.password_hash, 12);
    req.body.password_hash=newPassword_hash
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

//================ Adminsitrador ====================

// --- RUTAS PARA ADMINISTRADORES ---

// POST: Registrar un nuevo administrador
app.post("/admins", async (req, res) => {
  try {
    // Aquí podrías hashear la contraseña antes de enviarla
    // const { password, ...datos } = req.body;
    // const hash = await bcrypt.hash(password, 10);
    // const nuevo = await crearAdmin({ ...datos, password_hash: hash });

    const nuevo = await crearAdmin(req.body);
    res.status(201).json({
      message: "Registro de administrador exitoso",
      data: nuevo[0]
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Listar todos los administradores
app.get("/admins", async (req, res) => {
  try {
    const lista = await obtenerAdmins();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Obtener un administrador por ID
app.get("/admins/:id", async (req, res) => {
  try {
    const admin = await obtenerAdminPorId(req.params.id);
    res.json(admin);
  } catch (err) {
    res.status(404).json({ error: "Administrador no encontrado" });
  }
});

// PUT: Actualizar datos del administrador
app.put("/admins/:id", async (req, res) => {
  try {
    const actualizado = await actualizarAdmin(req.params.id, req.body);
    if (!actualizado || actualizado.length === 0) {
        return res.status(404).json({ error: "Administrador no encontrado" });
    }
    res.json({
        message: "Administrador actualizado con éxito",
        data: actualizado[0]
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//================ LOGIN ====================

// POST: Login de estudiante
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos" });
    }

    // Buscar estudiante por email
    const estudiante = await obtenerEstudiantePorEmail(email);

    if (!estudiante) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Comparar contraseñas (en producción usar bcrypt)
    // Comparar usando compareSync
    const isSuccess = await bcrypt.compareSync(password, estudiante.password_hash);
    if (!isSuccess) {
      // si quieres ver tu contraseña, al lado de error poner una coma y: pass: await bcrypt.hashSync(password, 12)
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Login exitoso
    res.status(200).json({
      message: "Login exitoso",
      token: "tu-token-jwt-aqui", // Implementar JWT en el futuro
      //pasamos el id del estudiante para que el frontend pueda usarlo en futuras peticiones
      data: {
        id: estudiante.id,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Login de admin
app.post("/login-admin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email y contraseña requeridos" });
    }

    // Buscar admin por email
    const admin = await obtenerAdminPorEmail(email);

    if (!admin) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Comparar contraseñas
    if (admin.password_hash !== password) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Login exitoso
    res.status(200).json({
      message: "Login de admin exitoso",
      token: "tu-token-jwt-aqui",
      data: {
        id: admin.id,
        nombre: admin.nombre_admi,
        apellido: admin.apellido_admin,
        email: admin.email,
        tipo: "admin"
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//=================== Funcionalidades administrador ===================

// GET: Obtener las postulaciones de ua oferta
app.get("/postulaciones/:id", async (req, res) => {
  try {
    const datos = await VerPostulacionesAdmin(req.params.id);
    res.json(datos);
  } catch (err) {
    res.status(404).json({ error: "Postulaciones para esta ofert no encontradas" });
  }
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));
