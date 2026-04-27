import express from 'express';
import cors from 'cors'
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';  //esto es para subir archivos, lo usaremos para subir fotos de perfil y cvs
import { SECRET_JWT_KEY } from '../config.js';
import { URL_FRONT } from '../../config.js';

.032
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
  VerPostulacionesAdmin,
  postularOferta,
  obtenerOfertasRecomendadas,
  actualizarEstadoOferta,
  guardarOferta,
  obtenerOfertasGuardadas,
  obtenerSkills,
  subirAvatarStorage,
  guardarFotoPerfil,
  updatedRequestRegistration,
  desactivarOferta,
  getCVUrl,
  getUserState


} from './supabaseClient.js'
import requireAuth from './middleware/requireAuth.js';
const app = express();

// Permitir cualquier origen (para desarrollo)
app.use(cors({
  //origin: 'http://localhost:5173', // Cambia esto por la URL de tu frontend
  origin: URL_FRONT, // Cambia esto por la URL de tu frontend
  credentials: true, // Permite enviar cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json());
app.use(cookieParser());

//Rutas
app.use(cors(corsOptions));
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
    res.status(400).json({ error: err.message || String(err) });
  }
});

app.get('/ofertas', async (req, res) => {
  try {
    const ofertas = await obtenerOfertas();
    res.json(ofertas);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
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
    res.status(500).json({ error: err.message || String(err) });
  }
});

//Actualiza las ofertas
app.put('/oferta/:id', async (req, res) => {

  try {

    const body = req.body;
    const id = req.params.id;
    const oferta = await actualizarOferta(id, body)

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

  } catch (err) {
    res.status(500).json({ error: err.message || String(err) })
  }
})

//delete

app.delete('/ofertas/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const resultado = await eliminarOferta(id);

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

//Desactivar oferta (en lugar de eliminarla físicamente, la marcamos como inactiva)

app.put('/ofertas/:id', async (req, res) => {
  try {
    const id = req.params.id;
    // Leer el nuevo estado desde el body
    const { estado } = req.body;
    if (!estado) return res.status(400).json({ error: 'Falta el campo "estado" en el body' });

    const resultado = await desactivarOferta(id, estado);

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

/*========OFERTAS Filtradas=========*/

app.get('/estudiantes/:id/ofertas-recomendadas', async (req, res) => {
  try {
    const estudianteId = req.params.id;

    // Llamamos a la función limpia
    const ofertas = await obtenerOfertasRecomendadas(estudianteId);

    // Devolvemos el resultado al frontend
    res.json(ofertas);

  } catch (err) {
    console.error("🔥 Error en el endpoint de recomendaciones:", err);
    res.status(500).json({ error: err.message || "Error interno del servidor" });
  }
});

//====================== Usuario Estudiante =======================

// POST: Registrar un nuevo estudiante
app.post("/estudiantes", async (req, res) => {
  try {
    const newPassword_hash = bcrypt.hashSync(req.body.password_hash, 12);
    req.body.password_hash = newPassword_hash
    const nuevoEstudiante = await crearEstudiante(req.body);

    // 3. GENERAR EL TOKEN JWT
    // Guardamos el ID y el email dentro del token
    const token = jwt.sign(
      { id: nuevoEstudiante.id, email: nuevoEstudiante.email },
      SECRET_JWT_KEY,
      { expiresIn: '2h' }
    );

    // 4. GUARDAR EN COOKIE
    res.cookie('access_token', token, {
      httpOnly: true,    // Seguridad: No accesible desde JS del frontend
      secure: true,      // Obligatorio para SameSite: 'none'
      sameSite: 'none',  // Necesario si tu Front y Back están en dominios/puertos distintos (como en Codespaces)
      maxAge: 1000 * 60 * 60 // 1 hora
    });

    res.status(201).json({
      message: "Registro exitoso",
      user: {
        id: nuevoEstudiante.id,
        email: nuevoEstudiante.email
      },
      token: token
    });
  } catch (err) {
    res.status(400).json({ error: err.message || String(err) });
  }
});

// GET: Listar todos los estudiantes
app.get("/estudiantes", async (req, res) => {
  try {
    const lista = await obtenerEstudiantes();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// GET: Obtener un estudiante por ID
// GET: Obtener un estudiante por ID
app.get("/estudiantes/:id", requireAuth, async (req, res) => {
  try {

    const { id } = req.params;
    const userRequesting = req.user; // Datos del token (id, role, etc.)

    // --- VALIDACIÓN DE AUTORIZACIÓN ---
    // Un usuario solo puede verse a sí mismo, A MENOS que sea admin
    if (userRequesting.role !== 'admin' && userRequesting.id !== parseInt(id)) {
        return res.status(403).json({ 
            error: "No tienes permiso para ver este perfil" 
        });
    }

    const estudiante = await obtenerEstudiantePorId(id);

    if (!estudiante) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }
    res.json(estudiante);

  } catch (err) {
    console.error("Error obteniendo estudiante:", err);
    res.status(404).json({ error: err.message || "Estudiante no encontrado" });
  }
});

// PUT: Actualizar datos completos del estudiante
app.put("/estudiantes/:id", async (req, res) => {
  try {
    const actualizado = await actualizarEstudiante(req.params.id, req.body);
    res.json(actualizado);
  } catch (err) {
    console.error("Error actualizando estudiante:", err);
    res.status(400).json({ error: err.message || String(err) });
  }
});

app.post("/estudiante/postular", async (req, res) => {

  try {
    const { id_oferta, id_estudiante } = req.body
    const postulacion = await postularOferta(id_oferta, id_estudiante)
    res.json(postulacion);
    console.log("inscripción hecha correctamente")

  } catch (err) {
    res.status(400).json({ error: err.message || String(err) });
  }
})

app.put("/actualizar-estado/:idEstudiante", async (req, res) => {
  try {
    const { estado } = req.body;
    const id_estudiante = req.params.idEstudiante;
    if (!estado) {
      return res.status(400).json({ error: "Faltan datos en el body" });
    }

    const resultado = await updatedRequestRegistration(id_estudiante, estado);
    res.status(200).json({
      message: "Solicitud actualizada exitosamente",
      data: resultado
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/estudiante/estado/:idEstudiante", async (req, res) => {
  try {
    const id_estudiante = req.params.idEstudiante;
    if (!id_estudiante) {
      return res.status(400).json({ error: "Falta el id del estudiante en la URL" });
    }

    const resultado = await getUserState(id_estudiante);
    res.status(200).json({
      message: "Estado obtenido exitosamente",
      estado: resultado
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/guardar-oferta", async (req, res) => {
  try {
    const { id_estudiante, id_oferta } = req.body;

    if (!id_estudiante || !id_oferta) {
      return res.status(400).json({ error: "Falta id del estudiante o id de la oferta en el body" });
    }

    const resultado = await guardarOferta(id_estudiante, id_oferta);
    res.status(200).json({
      message: "Oferta guardada exitosamente",
      data: resultado
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/estudiante/ofertas-guardadas/:id", async (req, res) => {
  try {
    const estudianteId = req.params.id;

    if (!estudianteId) {
      return res.status(400).json({ error: "Falta el id del estudiante en la URL" });
    }
    // Llamamos a la función  de supabaseCliente.js
    const data = await obtenerOfertasGuardadas(estudianteId);

    // Devolvemos al frontend
    res.json(data);

  } catch (err) {
    console.error("Error en endpoint de ofertas guardadas:", err);
    res.status(500).json({ error: err.message });
  }

});

// Multer guarda la foto temporalmente en memoria
const upload = multer({ storage: multer.memoryStorage() });

app.post('/upload-avatar', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const studentId = req.body.studentId;

    if (!file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    if (!file.mimetype.startsWith('image/')) return res.status(400).json({ error: 'Solo se permiten imágenes' });
    if (file.size > 2 * 1024 * 1024) return res.status(400).json({ error: 'El tamaño máximo es 2MB' });

    const fileExt = file.originalname.split('.').pop();
    const fileName = `avatar_${studentId}_${Date.now()}.${fileExt}`;

    // 1. Subir a Supabase Storage
    const urlPublica = await subirAvatarStorage(
      fileName,
      file.buffer,
      file.mimetype
    );

    // 2. GUARDAR EN LA BASE DE DATOS (AQUÍ, NO EN VUE)
    await guardarFotoPerfil(studentId, urlPublica);

    return res.json({
      message: 'Subida exitosa',
      url: urlPublica,
      studentId
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Falló la subida', details: error.message }); 
  }
  });


//================ Adminsitrador ====================

// --- RUTAS PARA ADMINISTRADORES ---

// POST: Registrar un nuevo administrador
app.post("/admin/registro", async (req, res) => {
  try {
    const newPassword_hash = bcrypt.hashSync(req.body.password_hash, 12);
    req.body.password_hash = newPassword_hash
    const nuevo = await crearAdmin(req.body);
    res.status(201).json({
      message: "Registro de administrador exitoso",
      data: nuevo[0],
    });
  } catch (err) {
    res.status(400).json({ error: err.message || String(err) });
  }
});

// GET: Listar todos los administradores
app.get("/admins", async (req, res) => {
  try {
    const lista = await obtenerAdmins();
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

// GET: Obtener un administrador por ID
app.get("/admins/:id", async (req, res) => {
  try {
    const admin = await obtenerAdminPorId(req.params.id);
    res.json(admin);
  } catch (err) {
    res.status(404).json({ error: err.message || "Administrador no encontrado" });
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
    res.status(400).json({ error: err.message || String(err) });
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

    // 1. Buscar estudiante
    let estudiante;
    try {
      estudiante = await obtenerEstudiantePorEmail(email);
    } catch (err) {
      // Manejar caso específico de PostgREST cuando no hay filas (PGRST116)
      if (err && err.code === 'PGRST116') {
        return res.status(401).json({ error: "Email o contraseña incorrectos" });
      }
      throw err; // re-lanzar para que el catch exterior lo trate
    }

    // Normalizar diferentes retornos: objeto o array
    if (!estudiante || (Array.isArray(estudiante) && estudiante.length === 0)) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    if (Array.isArray(estudiante)) estudiante = estudiante[0];

    // 2. Comparar contraseñas
    const isSuccess = await bcrypt.compare(password, estudiante.password_hash);
    if (!isSuccess) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // 3. GENERAR EL TOKEN JWT
    // Guardamos el ID y el email dentro del token
    const token = jwt.sign(
      { id: estudiante.id, email: estudiante.email },
      SECRET_JWT_KEY,
      { expiresIn: '2h' }
    );

    // 4. GUARDAR EN COOKIE
    res.cookie('access_token', token, {
      httpOnly: true,    // Seguridad: No accesible desde JS del frontend
      secure: true,      // Obligatorio para SameSite: 'none'
      sameSite: 'none',  // Necesario si tu Front y Back están en dominios/puertos distintos (como en Codespaces)
      maxAge: 1000 * 60 * 60 // 1 hora
    });

    // 5. Respuesta al Frontend
    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: estudiante.id,
        email: estudiante.email
      },
      token
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Error interno del servidor" });
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
    let admin;
    try {
      admin = await obtenerAdminPorEmail(email);
    } catch (err) {
      if (err && err.code === 'PGRST116') {
        return res.status(401).json({ error: "Email o contraseña incorrectos" });
      }
      throw err;
    }

    if (!admin || (Array.isArray(admin) && admin.length === 0)) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }
    if (Array.isArray(admin)) admin = admin[0];

    // Comparar contraseñas
    const isSuccess = await bcrypt.compare(password, admin.password_hash);
    if (!isSuccess) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Generar el token JWT igual que estudiante
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      SECRET_JWT_KEY,
      { expiresIn: '2h' }
    );

    // Guardar en cookie (nombre correcto)
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 1000 * 60 * 60 // 1 hora
    });

    // Respuesta consistente con login estudiante
    res.status(200).json({
      message: "Login de admin exitoso",
      user: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
        role: "admin"
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});


//=================== Funcionalidades administrador ===================

// GET: Obtener las postulaciones de ua oferta
app.get("/postulaciones/:id", async (req, res) => {
  try {
    const datos = await VerPostulacionesAdmin(req.params.id);
    res.json(datos);
  } catch (err) {
    res.status(404).json({ error: err.message || "Postulaciones para esta ofert no encontradas" });
  }
});

// PUT: Actualizar el estado de una candidatura (ahora acepta ofertaId y estudianteId por la URL)
app.put("/candidatura/estado/:ofertaId/:estudianteId", async (req, res) => {
  try {
    const { ofertaId, estudianteId } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: "Falta el campo 'estado' en el body" });
    }

    const datos = await actualizarEstadoOferta(ofertaId, estudianteId, estado);
    res.json(datos);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: err.message || "Oferta o estudiante no encontrado" });
  }
});

app.listen(3000, () => console.log('Servidor en http://localhost:3000'));


// GET: Obtener todas las skills para el menú desplegable del frontend
app.get("/skills", async (req, res) => {
  try {
    const skills = await obtenerSkills();
    res.json(skills);
  } catch (err) {
    console.error("Error obteniendo skills:", err);
    res.status(500).json({ error: err.message });
  }
});


app.get('/get-cv/:nombreArchivo', async (req, res) => {
  try {
    const { nombreArchivo } = req.params;


    if(!nombreArchivo) {
      return res.status(400).json({ error: "Nombre de archivo requerido" });
    }
    const url = getCVUrl(nombreArchivo);
    res.json({ url });
  } catch (err) {
    console.error("Error obteniendo CV:", err);
    res.status(500).json({ error: err.message || "Error interno del servidor" });
   }
});