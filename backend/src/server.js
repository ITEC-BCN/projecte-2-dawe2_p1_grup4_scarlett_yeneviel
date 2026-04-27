/*const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});*/

import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import dotenv from "dotenv";

import { SECRET_JWT_KEY } from "../config.js";
import { URL_FRONT } from "../../config.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import Groq from "groq-sdk";

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
} from "./supabaseClient.js";
import requireAuth from "./middleware/requireAuth.js";

/* ================= INIT ================= */
dotenv.config();
console.log("GEMINI_API_KEY =", process.env.GEMINI_API_KEY);
const app = express();

/* ================= MIDDLEWARE ================= */

// Permitir cualquier origen (para desarrollo)
app.use(
  cors({
    //origin: 'http://localhost:5173', // Cambia esto por la URL de tu frontend
    origin: URL_FRONT, // Cambia esto por la URL de tu frontend
    credentials: true, // Permite enviar cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());

/* ================= MULTER ================= */
// Multer guarda archivos temporalmente en memoria (fotos, pdf...)
const upload = multer({ storage: multer.memoryStorage() });

/* ================= RUTAS ================= */

/* ================= ofertas ================= */

app.post("/ofertas", async (req, res) => {
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
    });
    console.log("BODY:", req.body); // prueba esto

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

/*========OFERTAS RECOMENDADAS Filtradas=========*/

app.get("/estudiantes/:id/ofertas-recomendadas", async (req, res) => {
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
app.put("/estudiantes/:id", async (req, res) => {
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
    const { id_estudiante, estado } = req.body;

    if (!id_estudiante || !estado) {
      return res.status(400).json({ error: "Faltan datos en el body" });
    }

    const resultado = await actualizarSolicitudPendiente(id_estudiante, estado);
    res.status(200).json({
      message: "Solicitud actualizada exitosamente",
      data: resultado,
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

app.post("/upload-avatar", upload.single("file"), async (req, res) => {
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
    const newPassword_hash = bcrypt.hashSync(req.body.password_hash, 12);
    req.body.password_hash = newPassword_hash;
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

    // 3. GENERAR EL TOKEN JWT
    // Guardamos el ID y el email dentro del token
    const token = jwt.sign(
      { id: estudiante.id, email: estudiante.email },
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

    // 5. Respuesta al Frontend
    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: estudiante.id,
        email: estudiante.email,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: err.message || "Error interno del servidor" });
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
      { id: admin.id, email: admin.email, tipo: "admin" },
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
        tipo: "admin",
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
app.get("/skills", async (req, res) => {
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
app.post("/api/upload-cv", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.body.studentId) {
      return res.status(400).json({ error: "Faltan datos" });
    }

    const studentId = req.body.studentId;
    const file = req.file;

    // 1. Storage
    const fileName = `cv_${studentId}_${Date.now()}.pdf`;

    await supabase.storage.from("cvs").upload(fileName, file.buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

    // 2. PDF → texto
    const pdfParse = (await import("pdf-parse")).default;
    const pdfResult = await pdfParse(file.buffer);

    const cleanText = pdfResult.text
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
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
- NO inventes datos
- SI NO EXISTE, DEJA VACÍO
- Devuelve SOLO JSON válido

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
        { role: "user", content: `CV: ${cleanText}` },
      ],
      response_format: { type: "json_object" },
    });

    const datosExtraidos = JSON.parse(completion.choices[0].message.content);

    // ----------------------------
    // NORMALIZADORES
    // ----------------------------

    const normalizeArray = (data, key) => {
      const arr = data?.[key];
      return Array.isArray(arr) ? arr : [];
    };

    const cleanDuplicates = (arr, key) => {
      const seen = new Set();
      return arr.filter((item) => {
        const val = item?.[key];
        if (!val || seen.has(val)) return false;
        seen.add(val);
        return true;
      });
    };

    // ----------------------------
    // SKILLS (del CV → strings)
    // ----------------------------

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

    const allSkills = [...hardSkills, ...softSkills];

    // ----------------------------
    // FORMACIÓN / EXPERIENCIA
    // ----------------------------

    const formacion = normalizeArray(datosExtraidos.formacion, "formacion");
    const experiencia = normalizeArray(datosExtraidos.experiencia, "experiencia");

    // ----------------------------
    // 1. UPDATE ESTUDIANTE
    // ----------------------------

    const { error: updateError } = await supabase
      .from("usuario_estudiante")
      .update({
        nombre: datosExtraidos.nombre || null,
        apellido: datosExtraidos.apellido || null,
        telefono: datosExtraidos.telefono
          ? Number(datosExtraidos.telefono.toString().replace(/\D/g, ""))
          : null,
        location: datosExtraidos.location || null,
        about: datosExtraidos.about || null,
        estudios: {
          formacion: cleanDuplicates(formacion, "titulo"),
        },
        experiencia: {
          experiencia: cleanDuplicates(experiencia, "puesto"),
        },
        idiomas: datosExtraidos.idiomas || { idiomas: [] },
      })
      .eq("id", studentId);

    if (updateError) throw updateError;

    // ----------------------------
    // 2. BORRAR SKILLS ANTIGUAS
    // ----------------------------

    await supabase
      .from("estudiante_skill")
      .delete()
      .eq("id_estudiante", studentId);

    // ----------------------------
    // 3. OBTENER SKILLS BD
    // ----------------------------

    const { data: skillsDB } = await supabase
      .from("skill")
      .select("id, nombre");

    // ----------------------------
    // 4. MAPEAR NOMBRES → IDS
    // ----------------------------

    const skillsToInsert = allSkills
      .map((name) => {
        const found = skillsDB.find(
          (s) => s.nombre.toLowerCase() === name.toLowerCase()
        );

        return found
          ? {
              id_estudiante: studentId,
              id_skill: found.id,
            }
          : null;
      })
      .filter(Boolean);

    // ----------------------------
    // 5. INSERT SKILLS
    // ----------------------------

    if (skillsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("estudiante_skill")
        .insert(skillsToInsert);

      if (insertError) throw insertError;
    }

    // ----------------------------
    // RESPONSE
    // ----------------------------

    res.json({
      message: "CV procesado correctamente",
      datosExtraidos,
    });

  } catch (err) {
    console.error("Error upload CV:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= SERVER, LÍNEA SIEMPRE AL FINAL ================= */

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
