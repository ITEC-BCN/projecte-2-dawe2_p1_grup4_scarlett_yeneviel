/*const app = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});*/

import express from 'express';
import cors from 'cors'
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import multer from 'multer';  //esto es para subir archivos, lo usaremos para subir fotos de perfil y cvs
import { SECRET_JWT_KEY } from '../config.js';
import { URL_FRONT } from '../../config.js';
import * as pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

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
  guardarFotoPerfil


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
dotenv.config();

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
    const {  id_estudiante, estado } = req.body;

    if (!id_estudiante || !estado) {
      return res.status(400).json({ error: "Faltan datos en el body" });
    }

    const resultado = await actualizarSolicitudPendiente(id_estudiante, estado);
    res.status(200).json({
      message: "Solicitud actualizada exitosamente",
      data: resultado
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
        tipo: "admin"
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

// ================== Integración con Gemini para extracción de datos de CV ==================
// Asegúrate de requerir esto al principio de tu archivo si no lo tienes:
// const express = require('express');
// const multer = require('multer');
// const pdf = require('pdf-parse');
// const { GoogleGenerativeAI } = require('@google/genai');
// const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config();

// Inicializamos clientes (asegúrate de que estas variables estén en tu .env)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Multer para PDF (en memoria)
const uploadPDF = multer({ storage: multer.memoryStorage() });

// Endpoint para subir CV
app.post('/api/upload-cv', uploadPDF.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const studentId = req.body.studentId;

    if (!file) return res.status(400).json({ error: 'No se subió ningún archivo' });
    if (file.mimetype !== 'application/pdf') return res.status(400).json({ error: 'Solo se permite PDF' });
    if (!studentId) return res.status(400).json({ error: 'Falta studentId' });

    // ==========================================
    // 1. Subir a Supabase Storage (Bucket: 'cvs')
    // ==========================================
    const fileExt = 'pdf';
    const fileName = `cv_${studentId}_${Date.now()}.${fileExt}`;

    // Subimos el buffer directamente a Supabase
    const { data: storageData, error: storageError } = await supabase.storage
      .from('cvs') // Asegúrate de crear un bucket llamado 'cvs' en tu panel de Supabase
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: true // Cambiado a true para sobrescribir archivos con el mismo nombre
      });

    if (storageError) throw new Error(`Error subiendo a Storage: ${storageError.message}`);

    // Obtenemos la URL pública del CV
    const { data: { publicUrl } } = supabase.storage
      .from('cvs')
      .getPublicUrl(fileName);


    // ==========================================
    // 2. Insertar en la tabla 'documento'
    // ==========================================
    const { error: docError } = await supabase
      .from('documento')
      .insert([{
        tipo: 'cv',
        ruta_archivo: publicUrl,
        id_estudiante: studentId
      }]);

    if (docError) throw new Error(`Error al insertar documento en BD: ${docError.message}`);


    // ==========================================
    // 3 y 4. Extraer texto del PDF (Mejorado)
    // ==========================================
    // Pasamos el buffer directamente a pdf-parse. ¡No necesitamos fs ni archivos temporales!
    const pdfData = await pdfParse(file.buffer);
    const textoDelCV = pdfData.text;


    // ==========================================
    // 5. Procesar con Gemini (Modo JSON)
    // ==========================================
    // Configuramos el modelo para forzar una respuesta JSON estricta
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" } 
    });

    const prompt = `
      Eres un experto analista de recursos humanos. Lee el siguiente currículum y extrae los datos.
      Devuelve ÚNICAMENTE un objeto JSON válido.
      La estructura debe ser EXACTAMENTE esta:
      {
        "nombre": "Nombre de la persona (sin apellidos)",
        "apellido": "Apellidos de la persona",
        "telefono": "Solo números, ej: 666666666",
        "email": "Correo electrónico",
        "location": "Ciudad, País (ej: Barcelona, España)",
        "about": "Un breve resumen profesional extraído del perfil, máximo 3 líneas",
        "idiomas": {
          "idiomas": [
            {"name": "Nombre del idioma", "level": "Nativo, Medio, C1, B2, etc."}
          ]
        },
        "estudios": {
          "formacion": [
            {"centro": "Nombre del colegio/universidad", "anio": "Año de finalización", "titulo": "Nombre del título"}
          ]
        },
        "hard_skills": "Lista de habilidades técnicas separadas por comas (ej: JavaScript, PHP, CSS)",
        "soft_skills": "Lista de habilidades blandas separadas por comas (ej: Trabajo en equipo, Comunicación)"
      }
      \nTexto del currículum:\n${textoDelCV}
    `;

    const result = await model.generateContent(prompt);
    let textoRespuesta = result.response.text();
    
    let datosCV;
    try {
      datosCV = JSON.parse(textoRespuesta);
    } catch (e) {
      return res.status(500).json({ error: 'Error parseando respuesta de Gemini', raw: textoRespuesta });
    }


    // ==========================================
    // 6. Actualizar 'usuario_estudiante' en Supabase
    // ==========================================
    const { error: updateError } = await supabase
      .from('usuario_estudiante') // Asegúrate de que el nombre de la tabla sea correcto
      .update({
        nombre: datosCV.nombre,
        apellido: datosCV.apellido,
        telefono: datosCV.telefono,
        email: datosCV.email,
        location: datosCV.location,
        about: datosCV.about,
        // Si las columnas en Supabase son de tipo JSON/JSONB, pásalas así:
        idiomas: datosCV.idiomas, 
        estudios: datosCV.estudios,
        // (Si tus columnas son tipo texto, usa: JSON.stringify(datosCV.idiomas))
        hard_skills: datosCV.hard_skills,
        soft_skills: datosCV.soft_skills
      })
      .eq('id', studentId); // Filtramos para actualizar solo a este estudiante

    if (updateError) throw new Error(`Error al actualizar estudiante: ${updateError.message}`);


    // ==========================================
    // 7. Responder con éxito
    // ==========================================
    res.json({
      message: 'CV subido, guardado y analizado con éxito',
      url: publicUrl,
      datosExtraidos: datosCV
    });

  } catch (error) {
    console.error('Error en /api/upload-cv:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});