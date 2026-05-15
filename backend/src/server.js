import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import dotenv from "dotenv";

import { SECRET_JWT_KEY } from "../config.js";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";

import {
  obtenerOfertas,
  crearOferta,
  obtenerOfertaPorId,
  actualizarOferta,
  eliminarOferta,
  desactivarOferta,
  crearEstudiante,
  obtenerEstudiantes,
  obtenerEstudiantePorId,
  actualizarEstudiante,
  getUserState,
  crearAdmin,
  obtenerAdmins,
  obtenerAdminPorId,
  actualizarAdmin,
  obtenerEstudiantePorEmail,
  actualizarContrasenyaEstudiante,
  obtenerAdminPorEmail,
  VerPostulacionesAdmin,
  postularOferta,
  obtenerOfertasRecomendadas,
  actualizarEstadoOferta,
  guardarOferta,
  obtenerOfertasGuardadas,
  updatedRequestRegistration,
  obtenerSkills,
  subirAvatarStorage,
  guardarFotoPerfil,
  cargarCiudades,
  getCVUrl
} from "./supabaseClient.js";
import requireAuth from "./middleware/requireAuth.js";
import e from "express";
import { sendEmail } from "./email.js";
import { generarTokenRestauracion } from "./utils/authentication.js";

/* ================= INIT ================= */
dotenv.config();
const app = express();

/* ================= MIDDLEWARE ================= */

// Permitir múltiples orígenes y soportar credentials correctamente
const allowedOrigins = [
  "https://expert-space-robot-97j5v99r4575cr64-5173.app.github.dev",
  process.env.URL_FRONT, //Variable de entorno de Render
  "https://internia-web.vercel.app",
  "http://localhost:5173",
  "https://internia-web-yeneviel-roberts-projects.vercel.app"
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir requests sin origin (herramientas como curl o requests del servidor)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
// Manejar preflight para todas las rutas explícitamente
// Evitamos usar app.options('*', ...) porque la librería path-to-regexp no acepta '*'.
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    // Ejecutar cors para asegurarse de que los headers apropiados se añadan
    return cors(corsOptions)(req, res, () => res.sendStatus(204));
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

/* ================= MULTER ================= */
// Multer guarda archivos temporalmente en memoria (fotos, pdf...)
const upload = multer({ storage: multer.memoryStorage() });

/* ================= RUTAS ================= */

/* ================= ofertas ================= */

app.post("/ofertas", requireAuth,async (req, res) => {
  try {
    console.log("Body", req.body);

    const nuevaOferta = await crearOferta({
      nombre_empresa: req.body.nombre_empresa,
      tipo_puesto: req.body.tipo_puesto,
      fecha_expiracion: req.body.fecha_expiracion,
      descripcion: req.body.descripcion,
      funciones: req.body.funciones,
      requisitos: req.body.requisitos,
      beneficios: req.body.beneficios || null,
      id_ubicacion: req.body.id_ubicacion,
      modalidad: req.body.modalidad,
      jornada: req.body.jornada,
      modelo_practicas: req.body.modelo_practicas,
      selectedSkills: req.body.selectedSkills,
    });
    res.status(201).json(nuevaOferta);
  } catch (err) {
    res.status(400).json({ error: err.message || String(err) });
  }
});

app.get("/ofertas", async (req, res) => {
  try {
    const ofertas = await obtenerOfertas();
    res.json(ofertas);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

app.get("/ofertas/:id", async (req, res) => {
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
app.put("/oferta/:id", async (req, res) => {
  try {
    const body = req.body;
    const id = req.params.id;
    const oferta = await actualizarOferta(id, body);

    //Valido que exista la oferta
    // Supabase devuelve un array vacío [] si no encuentra el ID al usar .select()
    if (!oferta || oferta.length === 0) {
      return res.status(404).json({ error: "Oferta no encontrada" });
    }

    //  Respuesta exitosa
    res.status(200).json({
      message: "Oferta actualizada con éxito",
      data: oferta[0], // Devolvemos el registro actualizado
    });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

//delete

app.delete("/ofertas/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const resultado = await eliminarOferta(id);

    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});


//Desactivar oferta (en lugar de eliminarla físicamente, la marcamos como inactiva)

app.put('/ofertaDesactivar/:id', async (req, res) => {
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

/*========OFERTAS RECOMENDADAS Filtradas=========*/

app.get("/estudiantes/:id/ofertas-recomendadas", requireAuth,async (req, res) => {
  try {
    const estudianteId = req.params.id;

    // Llamamos a la función limpia
    const ofertas = await obtenerOfertasRecomendadas(estudianteId);

    // Devolvemos el resultado al frontend
    res.json(ofertas);
  } catch (err) {
    console.error("🔥 Error en el endpoint de recomendaciones:", err);
    res
      .status(500)
      .json({ error: err.message || "Error interno del servidor" });
  }
});

//====================== ESTUDIANTES =======================

// POST: Registrar un nuevo estudiante
app.post("/estudiantes", async (req, res) => {
  try {
    console.log(req.body)
    const existeEmail = await obtenerEstudiantePorEmail(req.body.email);

    if (existeEmail) {
      return res.status(400).json({ error: "El email ya está en uso" });
    }

    const newPassword_hash = bcrypt.hashSync(req.body.password_hash, 12);
    req.body.password_hash = newPassword_hash;
    const nuevoEstudiante = await crearEstudiante(req.body);

    // 3. GENERAR EL TOKEN JWT
    // Guardamos el ID y el email dentro del token
    const token = jwt.sign(
      { id: nuevoEstudiante.id, email: nuevoEstudiante.email },
      SECRET_JWT_KEY,
      { expiresIn: "2h" },
    );

    // 4. GUARDAR EN COOKIE
    res.cookie("access_token", token, {
      httpOnly: true, // Seguridad: No accesible desde JS del frontend
      secure: true, // Obligatorio para SameSite: 'none'
      sameSite: "none", // Necesario si tu Front y Back están en dominios/puertos distintos (como en Codespaces)
      maxAge: 1000 * 60 * 60, // 1 hora
    });

    res.status(201).json({
      message: "Registro exitoso",
      user: {
        id: nuevoEstudiante.id,
        email: nuevoEstudiante.email,
      },
      token: token,
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
app.get("/estudiantes/:id", requireAuth, async (req, res) => {
  try {
    const estudiante = await obtenerEstudiantePorId(req.params.id);
    res.json(estudiante);
  } catch (err) {
    console.error("Error obteniendo estudiante:", err);
    res.status(404).json({ error: err.message || "Estudiante no encontrado" });
  }
});

// PUT: Actualizar datos completos del estudiante
app.put("/estudiantes/:id", requireAuth,  async (req, res) => {
  try {
    const actualizado = await actualizarEstudiante(req.params.id, req.body);
    res.json(actualizado);
  } catch (err) {
    console.error("Error actualizando estudiante:", err);
    res.status(400).json({ error: err.message || String(err) });
  }
});

/*======== POSTULACIONES Y GUARDADOS =========*/

app.post("/estudiante/postular", async (req, res) => {
  try {
    const { id_oferta, id_estudiante } = req.body;
    const postulacion = await postularOferta(id_oferta, id_estudiante);
    res.json(postulacion);
    console.log("inscripción hecha correctamente");
  } catch (err) {
    res.status(400).json({ error: err.message || String(err) });
  }
});

app.put("/actualizar-estado/:idEstudiante", async (req, res) => {
  try {
    const { estado } = req.body;
    const id_estudiante = req.params.idEstudiante;


    if (!id_estudiante || !estado) {
      return res.status(400).json({ error: "Faltan datos en el body" });
    }

    const resultado = await updatedRequestRegistration(id_estudiante, estado);
    res.status(200).json({
      message: "Solicitud actualizada exitosamente",
      data: resultado,
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
      return res.status(400).json({
        error: "Falta id del estudiante o id de la oferta en el body",
      });
    }

    const resultado = await guardarOferta(id_estudiante, id_oferta);
    res.status(200).json({
      message: "Oferta guardada exitosamente",
      data: resultado,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/estudiante/ofertas-guardadas/:id", async (req, res) => {
  try {
    const estudianteId = req.params.id;

    if (!estudianteId) {
      return res
        .status(400)
        .json({ error: "Falta el id del estudiante en la URL" });
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

/*======== FOTOGRAFIA DE PERFIL =========*/

app.post("/upload-avatar", requireAuth, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    const studentId = req.body.studentId;

    if (!file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }
    if (!file.mimetype.startsWith("image/"))
      return res.status(400).json({ error: "Solo se permiten imágenes" });
    if (file.size > 2 * 1024 * 1024)
      return res.status(400).json({ error: "El tamaño máximo es 2MB" });

    const fileExt = file.originalname.split(".").pop();
    const fileName = `avatar_${studentId}_${Date.now()}.${fileExt}`;

    // 1. Subir a Supabase Storage
    const urlPublica = await subirAvatarStorage(
      fileName,
      file.buffer,
      file.mimetype,
    );

    // 2. GUARDAR EN LA BASE DE DATOS (AQUÍ, NO EN VUE)
    await guardarFotoPerfil(studentId, urlPublica);

    return res.json({
      message: "Subida exitosa",
      url: urlPublica,
      studentId,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Falló la subida", details: error.message });
  }
});

//================ ADMINISTRADOR ====================

// POST: Registrar un nuevo administrador
app.post("/admin/registro", async (req, res) => {
  try {

    const existingAdmin = await obtenerAdminPorEmail(req.body.email);
    if (existingAdmin) {
      return res.status(400).json({ error: "El email ya está en uso" });
    }

    const newPassword_hash = bcrypt.hashSync(req.body.password_hash, 12);
    req.body.password_hash = newPassword_hash;
    const nuevo = await crearAdmin(req.body);
    res.status(201).json({
      message: "Registro de administrador exitoso",
      data: nuevo[0],
    });
  } catch (err) {
    res.status(400).json({ error: 'Error en el servidor'|| String(err) });
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
    res
      .status(404)
      .json({ error: err.message || "Administrador no encontrado" });
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
      data: actualizado[0],
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
    const estudiante = await obtenerEstudiantePorEmail(email);

    if (!estudiante) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // 2. Comparar contraseñas
    const isSuccess = await bcrypt.compare(password, estudiante.password_hash);
    if (!isSuccess) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    //Comprobar estado de la cuentaRechazada
     if (estudiante.estado=="rechazado") {
      return res.status(403).json({ error: "Cuenta rechazada. Si es un error contacta con soporte" });
    }

    // 3. GENERAR EL TOKEN JWT
    // Guardamos el ID y el email dentro del token
    const token = jwt.sign(
      { id: estudiante.id, email: estudiante.email },
      SECRET_JWT_KEY,
      { expiresIn: "1h" },
    );

    /* Generamos el token de refresco */
    const refresh_token = jwt.sign(
      { id: estudiante.id, email: estudiante.email, role: estudiante.role },
      SECRET_JWT_KEY,
      { expiresIn: "24h" },
    );

    // 4. GUARDAR EN COOKIE
    res.cookie("access_token", token, {
      httpOnly: true, // Seguridad: No accesible desde JS del frontend
      secure: true, // Obligatorio para SameSite: 'none'
      sameSite: "none", // Necesario si tu Front y Back están en dominios/puertos distintos (como en Codespaces)
      maxAge: 1000 * 60 * 60, // 1 horas
    });

      res.cookie("refresh_token", refresh_token, {
      httpOnly: true, // Seguridad: No accesible desde JS del frontend
      secure: true, // Obligatorio para SameSite: 'none'
      sameSite: "none", // Necesario si tu Front y Back están en dominios/puertos distintos (como en Codespaces)
      maxAge: 1000 * 60 * 60 * 24, // 24 horas
    });



    // 5. Respuesta al Frontend
    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: estudiante.id,
        email: estudiante.email,
      },
      token,
      refresh_token
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Hubo un problema en el servidor. Inténtalo más tarde" });
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
    const isSuccess = await bcrypt.compare(password, admin.password_hash);
    if (!isSuccess) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    // Generar el token JWT igual que estudiante
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      SECRET_JWT_KEY,
      { expiresIn: "2h" },
    );

    // Guardar en cookie (nombre correcto)
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60, // 1 hora
    });

    // Respuesta consistente con login estudiante
    res.status(200).json({
      message: "Login de admin exitoso",
      user: {
        id: admin.id,
        nombre: admin.nombre,
        email: admin.email,
        role: "admin",
      },
      token,
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
    res.status(404).json({
      error: err.message || "Postulaciones para esta ofert no encontradas",
    });
  }
});

// PUT: Actualizar el estado de una candidatura (ahora acepta ofertaId y estudianteId por la URL)
app.put("/candidatura/estado/:ofertaId/:estudianteId", async (req, res) => {
  try {
    const { ofertaId, estudianteId } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res
        .status(400)
        .json({ error: "Falta el campo 'estado' en el body" });
    }

    const datos = await actualizarEstadoOferta(ofertaId, estudianteId, estado);
    res.json(datos);
  } catch (err) {
    console.error(err);
    res
      .status(404)
      .json({ error: err.message || "Oferta o estudiante no encontrado" });
  }
});

//================ SKILLS ====================

// GET: Obtener todas las skills para el menú desplegable del frontend
app.get("/skills", requireAuth, async (req, res) => {
  try {
    const skills = await obtenerSkills();
    res.json(skills);
  } catch (err) {
    console.error("Error obteniendo skills:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= SUPABASE + GROQ ================= */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// Inicializar Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ================= UPLOAD CV + GROQ ================= */

// GET: Obtener datos del estudiante + skills (hard/soft)
app.get("/api/cv/:studentId", requireAuth, async (req, res) => {
  try {
    const { studentId } = req.params;

    // 🔒 seguridad
    if (req.user.id !== studentId) {
      return res.status(403).json({ error: "No autorizado" });
    }

    // 1. Datos del estudiante
    const { data: student, error: studentError } = await supabase
      .from("usuario_estudiante")
      .select("*")
      .eq("id", studentId)
      .single();

    if (studentError) throw studentError;
    if (!student) {
      return res.status(404).json({ error: "Estudiante no encontrado" });
    }

    // 2. Skills del estudiante (JOIN manual)
    const { data: skillsData, error: skillsError } = await supabase
      .from("estudiante_skill")
      .select(`
        id_skill,
        skill:skill (
          id,
          nombre,
          tipo
        )
      `)
      .eq("id_estudiante", studentId);

    if (skillsError) throw skillsError;

    // 3. Separar hard / soft
    const hard = [];
    const soft = [];

    (skillsData || []).forEach((row) => {
      const skill = row.skill;
      if (!skill) return;

      if (skill.tipo === "hard skill") {
        hard.push(skill);
      } else if (skill.tipo === "soft skill") {
        soft.push(skill);
      }
    });

    // 4. Respuesta final
    res.json({
      message: "CV obtenido correctamente",
      data: {
        ...student,
        skills: {
          hard,
          soft,
        },
      },
    });
  } catch (err) {
    console.error("Error GET CV:", err);
    res.status(500).json({ error: err.message });
  }
});


// POST: subir CV y extraer datos
app.post("/api/upload-cv", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.body.studentId) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const studentId = req.body.studentId;
    const file = req.file;

    // Validar archivo
    if (!file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({ error: 'Solo se permiten archivos PDF' });
    }
    if (!file.buffer || file.buffer.length === 0) {
      return res.status(400).json({ error: 'El archivo PDF está vacío o corrupto' });
    }

    // 1. Subida a Storage
    const fileName = `cv_${studentId}_${Date.now()}.pdf`;

    const supabasePDF = await supabase.storage.from("cvs").upload(fileName, file.buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

    //console.log("FILE:", file);
    //console.log("BUFFER EXISTS:", !!file.buffer);
    //console.log("SIZE:", file.size);

    // 2. Extraer texto del PDF
    const pdfParse = (await import("pdf-parse")).default;
    const pdfResult = await pdfParse(file.buffer);

    const cleanText = pdfResult.text
      .replace(/\r/g, " ")
      .replace(/\n{2,}/g, "\n")
      .trim();

    // 3. GROQ
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
Eres un extractor de CV.

REGLAS:
- SÓLO extrae datos que estén explícitamente escritos en el CV.
- SI NO ES UN CV, NO EXTRAIGAS NADA.
- NO inventes datos.
- NO repitas información.
- NO mezcles formación y experiencia.
- SI NO ESTÁ CLARO, IGNÓRALO.
- Devuelve SOLO JSON válido.

FORMACIÓN:
- titulo = estudio
- centro = institución
- anio = año o rango

EXPERIENCIA:
- puesto = trabajo real
- centro = empresa
- anio = periodo laboral

FORMATO:
{
  "nombre": "",
  "apellido": "",
  "email": "",
  "telefono": "",
  "location": "",
  "about": "",
  "idiomas": { "idiomas": [{ "name": "", "level": "" }] },
  "formacion": { "formacion": [{ "centro": "", "anio": "", "titulo": "" }] },
  "experiencia": { "experiencia": [{ "centro": "", "anio": "", "puesto": "" }] },
  "habilidades_hard": "",
  "habilidades_soft": ""
}
`
        },
        { role: "user", content: `CV:\n\n${cleanText}` }
      ],
      response_format: { type: "json_object" }
    });

    const datosExtraidos = JSON.parse(
      completion.choices[0].message.content
    );

    // -------------------------
    // NORMALIZACIÓN SEGURA
    // -------------------------
    const telefonoLimpio = datosExtraidos.telefono
      ? Number(datosExtraidos.telefono.toString().replace(/\D/g, ""))
      : undefined; // 👈 IMPORTANTE: NO null

    const idiomas = datosExtraidos.idiomas?.idiomas || [];
    const formacion = datosExtraidos.formacion?.formacion || [];
    const experiencia = datosExtraidos.experiencia?.experiencia || [];
    /*   const habilidades = Array.isArray(datosExtraidos.habilidades)
        ? datosExtraidos.habilidades
        : []; */
    const hardSkills = datosExtraidos.habilidades_hard
      ? datosExtraidos.habilidades_hard
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      : [];

    const softSkills = datosExtraidos.habilidades_soft
      ? datosExtraidos.habilidades_soft
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
      : [];

    /* Unimos en una constante habilidades las softSkill y las hardSkill
    para no tener que modificar la logica de inserción de las relaciones del 
    estudiante con las skills */
    const habilidades = [...hardSkills, ...softSkills];

    // -------------------------
    // 4. UPDATE USUARIO (CORREGIDO)
    // -------------------------

    const updateData = {
      nombre: datosExtraidos.nombre || "",
      apellido: datosExtraidos.apellido || "",
      location: datosExtraidos.location || "",
      about: datosExtraidos.about || "",
      idiomas: { idiomas },
      estudios: { formacion },
      experiencia: { experiencia },
      documento_cv: supabasePDF.data.path
    };

    // 👇 SOLO AÑADIMOS TELÉFONO SI EXISTE
    if (telefonoLimpio !== undefined) {
      updateData.telefono = telefonoLimpio;
    }

    const { error: updateError } = await supabase
      .from("usuario_estudiante")
      .update(updateData)
      .eq("id", studentId);

    if (updateError) throw updateError;

    // -------------------------
    // 5. SKILLS
    // -------------------------
    await supabase
      .from("estudiante_skill")
      .delete()
      .eq("id_estudiante", studentId);

    const { data: skillsDB, error: skillsError } = await supabase
      .from("skill")
      .select("id, nombre");

    if (skillsError) throw skillsError;

    const listaSkills = habilidades.map(s =>
      s.toLowerCase().trim()
    );

    const nuevasRelaciones = (skillsDB || [])
      .filter(s =>
        listaSkills.includes(s.nombre.toLowerCase())
      )
      .map(s => ({
        id_estudiante: studentId,
        id_skill: s.id
      }));

    if (nuevasRelaciones.length > 0) {
      await supabase
        .from("estudiante_skill")
        .insert(nuevasRelaciones);
    }

    //Guardar ruta del stora en la tabla de documento
    await supabase
      .from("documento")
      .update({
        ruta_archivo: supabasePDF.data.path,
      })
      .eq("id_estudiante", studentId)
      .eq("tipo", "cv");


    // -------------------------
    // RESPONSE
    // -------------------------
    res.json({
      message: "Perfil actualizado correctamente",
      datosExtraidos,
      documento_cv: supabasePDF.data.path
    });

  } catch (err) {
    console.error("Error upload CV:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= UBICACIONES ================= */

//MOSTRAR CV (URL pública de Supabase Storage)
app.get('/get-cv/:idEstudiante', async (req, res) => {
  try {
    const { idEstudiante } = req.params;

    if (!idEstudiante) {
      return res.status(400).json({ error: "ID de estudiante requerido" });
    }
    const url = await getCVUrl(idEstudiante);

    if (!url) {
      return res.status(404).json({ error: "No se encontró el CV para este estudiante" });
    }

    res.json({ url });

  } catch (err) {
    console.error("Error obteniendo CV:", err);
    res.status(500).json({ error: err.message || "Error interno del servidor" });
  }
});

app.get("/ubicaciones", async (req, res) => {

  try {
    const ciudades = await cargarCiudades();
    res.json(ciudades);
  } catch (err) {
    console.error("Error obteniendo ubicaciones:", err);
    res.status(500).json({ error: err.message });
  }

})

/* ================= RESTAURAR CONTRASEÑAS ================= */

app.post("/restore-password", async (req, res) => {
  try {

    /* Recuperamos del body el email */
    const { email } = req.body;

    /* Comprobamos si el email existe */
      const estudiante = await obtenerEstudiantePorEmail(email);

    if (!estudiante) {
      return res.status(404).json({ error: "Email no encontrado" });
    }

    /* Generamos un token de restauración de contraseña */
    const token = await generarTokenRestauracion(email);

    /* Generamos la url del formulario para cambiar la contraseña */
    const urlRestauracion = `${process.env.URL_FRONT}/update-password/${token}`;

    /* Enviamos el email */
    const response = await sendEmail(email, "Recuperación de contraseña Internia", `Este e-mail ha sido enviado para restaurar tu contraseña de Internia. Puedes restaurar tu contraseña usando el siguiente enlace: ${urlRestauracion}`);
    
    if (response.code == 500) {
      console.error("Error enviando email:", response.error);
      return res.status(500).json({ error: "Error enviando email" });
    } 

    res.json({ message: "Email de restauración enviado correctamente" });
    
  } catch (err) {
    res.status(500).json({ error: err.message || "Error interno del servidor" });
  } 
});

// POST: Actualizar contraseña tras recuperación
app.post("/update-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: "El token y la contraseña son requeridos" });
    }

    // 1. Verificar el token
    // IMPORTANTE: Esto depende de cómo hiciste tu función "generarTokenRestauracion(email)"
    // Si generaste un JWT, puedes usar jwt.verify(). Si guardaste un string en la base de datos, 
    // tendrás que hacer una consulta como: const estudiante = await obtenerEstudiantePorToken(token);
    
    let decoded;
    try {
      // Asumiendo que el token enviado por email era un JWT que contenía el email
      decoded = jwt.verify(token, SECRET_JWT_KEY); 
    } catch (err) {
      return res.status(400).json({ error: "El enlace es inválido o ha caducado" });
    }

    // 2. Comprobar que el estudiante existe
    const estudiante = await obtenerEstudiantePorEmail(decoded.email);

    if (!estudiante) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // 3. Encriptar la nueva contraseña
    // Usamos bcrypt igual que asumo haces en tu registro
    const saltRounds = 10;
    const nuevoPasswordHash = await bcrypt.hash(password, saltRounds);

    // 4. Actualizar la base de datos
    // * NECESITARÁS CREAR ESTA FUNCIÓN en tu archivo de base de datos *
    await actualizarContrasenyaEstudiante(estudiante.id, nuevoPasswordHash);

    // 5. Responder al frontend (sin iniciar sesión automáticamente por seguridad,
    // que vayan al login como ya programamos en Vue)
    return res.status(200).json({ message: "Contraseña actualizada correctamente" });

  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Hubo un problema en el servidor. Inténtalo más tarde" });
  }
});


/*================Función para revisar si el token expiro o no ========================*/
app.get('/me', requireAuth, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const admin = await obtenerAdminPorId(req.user.id);
      if (!admin) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      return res.json({
        user: {
          ...admin,
          role: 'admin',
        },
      });
    }

    const usuario = await obtenerEstudiantePorId(req.user.id);

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      user: {
        ...usuario,
        role: 'estudiante',
      },
    });
  } catch (err) {
    console.error("Error en /me:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/*================ Endpoint para regenerar el token del usuario ========================*/
app.post('/refresh-token', async (req, res) => {
  try {
    // 1. Recogemos el token del body (en el frontend enviaste { token: refreshToken })
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(401).json({ error: "No se proporcionó un refresh token" });
    }

    // 2. Verificamos que el refresh token sea válido y no haya caducado.
    // OJO: Debes usar el mismo secreto con el que firmaste el refresh token (puede ser distinto al del access token).
    let decoded;
    try {
      decoded = jwt.verify(refresh_token, SECRET_JWT_KEY); 
      // Si usaste la misma clave para ambos, usa process.env.JWT_SECRET
    } catch (err) {
      // Si el token es inválido o caducó, devolvemos 403 (Forbidden).
      // Tu interceptor de Axios capturará esto y redirigirá al login.
      return res.status(403).json({ error: "Refresh token inválido o expirado" });
    }

    // 3. (Opcional pero MUY recomendado) Comprobar si el usuario aún existe en la base de datos
    // Usamos el ID que viene dentro del token decodificado (asumiendo que guardaste el id y el role).
    let usuario;
    if (decoded.role === 'admin') {
      usuario = await obtenerAdminPorId(decoded.id);
    } else {
      usuario = await obtenerEstudiantePorId(decoded.id);
    }

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no encontrado en la base de datos" });
    }

    // 4. Generamos el nuevo Access Token (corta duración, ej: 1h)
    const nuevoAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email }, // Payload
      SECRET_JWT_KEY,                 // Tu secreto para el token de acceso
      { expiresIn: '1h' }
    );

    // 5. (Opcional - Rotación de tokens) Generar un nuevo Refresh Token.
    // Si tu frontend espera "data.refreshToken" para actualizarlo, debemos mandarlo.
    const nuevoRefreshToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      SECRET_JWT_KEY,
      { expiresIn: '24h' }
    );

    // 6. Devolvemos la respuesta exactamente como la espera tu interceptor en Axios
    res.json({
      token: nuevoAccessToken,
      refreshToken: nuevoRefreshToken
    });

  } catch (err) {
    console.error("Error en /refresh-token:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

/* ================= KEEP ALIVE (Render + Supabase) ================= */

app.get("/ping", async (req, res) => {
  try {
    // Petición mínima a la base de datos para evitar que Supabase pause el proyecto
    const { data, error } = await supabase.from("skill").select("id").limit(1);
    if (error) throw error;
    res.json({ status: "ok", message: "Servidor activo y Supabase conectado" });
  } catch (err) {
    console.error("Error en el ping de mantenimiento:", err);
    res.status(500).json({ error: "Error en el ping", details: err.message });
  }
});

/* ================= SERVER, LÍNEA SIEMPRE AL FINAL ================= */

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
