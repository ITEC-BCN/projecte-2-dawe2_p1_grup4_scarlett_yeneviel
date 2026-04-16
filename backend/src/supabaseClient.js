import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ================== OFERTAS ==========================

//Funciones del crud

// 1. CREAR una oferta (CREATE)
export const crearOferta = async (nuevaOferta) => {
  console.log("OFERTA RECIBIDA:", nuevaOferta); //  DEBUG
  const { data, error } = await supabase
    .from('oferta') //nombre de la tabla
    .insert([{
      nombre_empresa: nuevaOferta.nombre_empresa,
      tipo_puesto: nuevaOferta.tipo_puesto,
      fecha_expiracion: nuevaOferta.fecha_expiracion,
      descripcion: nuevaOferta.descripcion,
      funciones: nuevaOferta.funciones,
      requisitos: nuevaOferta.requisitos,
      beneficios: nuevaOferta.beneficios,
    }])
    .select(); // .select() devuelve el objeto creado

  if (error) throw error;
  return data;
};

// 2. LEER todas las ofertas (READ)
export const obtenerOfertas = async () => {
  const { data, error } = await supabase
    .from('oferta')
    .select(`
      *,
      ubicacion (
        ciudad,
        comunidad
      ),
      oferta_skill (
        skill (
          nombre
        )
      )
    `)
    .order('fecha_publicacion', { ascending: false });

  if (error) throw error;
  return data;
};

// LEER una oferta (READ ONE)
export const obtenerOfertaPorId = async (id) => {
  const { data, error } = await supabase
    .from('oferta')
    .select('*')
    .eq('id', id)
    .single(); // .single() asegura que devuelva un objeto {}, no un array []

  if (error) throw error;
  return data;
};

// 3. ACTUALIZAR una oferta (UPDATE)
export const actualizarOferta = async (id, nuevosDatos) => {
  const { data, error } = await supabase
    .from('oferta')
    .update(nuevosDatos)
    .eq('id', id) // Filtra por el ID de la oferta
    .select();

  if (error) throw error;
  return data;
};

// 4. ELIMINAR una oferta (DELETE)
export const eliminarOferta = async (id) => {
  const { error } = await supabase
    .from('oferta')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { message: 'Oferta eliminada correctamente' };
};

// 5. DESACTIVAR una oferta (DELETE)
export const desactivarOferta = async (id) => {
  const { error } = await supabase
    .from('oferta')
    .update({ estado: 'INACTIVA' })
    .eq('id', id);

  if (error) throw error;
  return { message: 'Oferta desactivada correctamente' };
};

// ================== OFERTAS PERSONALIZADAS ==========================

// Añade esta función a tu archivo de controladores de base de datos

export const obtenerOfertasRecomendadas = async (estudianteId) => {
  // 1. Buscamos las skills del estudiante
  const { data: skillsDelEstudiante, error: errEstudiante } = await supabase
    .from('estudiante_skill')
    .select('id_skill')
    .eq('id_estudiante', estudianteId);

  if (errEstudiante) throw errEstudiante;

  if (!skillsDelEstudiante || skillsDelEstudiante.length === 0) {
    return []; // Retorna array vacío si no hay skills
  }

  // Convertimos a array de números
  const idsDeSkills = skillsDelEstudiante.map(es => es.id_skill);

  // 2. Buscamos qué ofertas tienen esas skills
  const { data: ofertasConMatch, error: errOfertas } = await supabase
    .from('oferta_skill')
    .select('id_oferta')
    .in('id_skill', idsDeSkills);

  if (errOfertas) throw errOfertas;

  if (!ofertasConMatch || ofertasConMatch.length === 0) {
    return []; // Retorna array vacío si no hay coincidencias
  }

  // Limpiamos los IDs repetidos
  const idsDeOfertasUnicos = [...new Set(ofertasConMatch.map(o => o.id_oferta))];

  // 3. Traemos los datos completos de las ofertas
  const { data: ofertasFinales, error: errFinal } = await supabase
    .from('oferta')
    .select(`
      *,
      ubicacion:id_ubicacion (ciudad, comunidad),
      oferta_skill (skill:id_skill (nombre))
    `)
    .in('id', idsDeOfertasUnicos)
    .order('fecha_publicacion', { ascending: false });

  if (errFinal) throw errFinal;

  return ofertasFinales; // Devolvemos los datos limpios a la ruta
};
// ================== USUARIOS =======================

export const crearEstudiante = async (nuevoEstudiante) => {
  const { data, error } = await supabase
    .from('usuario_estudiante')
    .insert([{
      nombre: nuevoEstudiante.nombre,
      apellido: nuevoEstudiante.apellido,
      telefono: nuevoEstudiante.telefono,
      email: nuevoEstudiante.email,
      eduacion: nuevoEstudiante.eduacion, // Respetando el nombre de tu tabla
      idiomas: nuevoEstudiante.idiomas,
      foto_perfil: nuevoEstudiante.foto_perfil,
      otra_informacion: nuevoEstudiante.otra_informacion,
      estado: nuevoEstudiante.estado || 'pendiente',
      password_hash: nuevoEstudiante.password_hash
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

//Obtener todos los usuarios 
export const obtenerEstudiantes = async () => {
  const { data, error } = await supabase
    .from('usuario_estudiante')
    .select('*');

  if (error) throw error;
  return data;
};

//Obtener 1 usuario 
export const obtenerEstudiantePorId = async (id) => {
  //console.log("1. Buscando estudiante con ID:", id);
  const { data, error } = await supabase
    .from('usuario_estudiante')
    .select(`
        *,
        enlaces(*),
        estudiante_skill(
          skill(*)
        ),
        postulaciones(
        *,
          oferta(
            id,
            nombre_empresa,
            tipo_puesto,
            fecha_expiracion
          )
        ),
        oferta_guardada(
          id_oferta,
          oferta(
            id,
            nombre_empresa,
            tipo_puesto
          )
        )
      `)
    .eq('id', id)
    .single();

  if (error) throw new Error("No encontrado");
  //console.log("3. Enlaces encontrados en la BD:", data.enlaces);
  return data;
};

//Modificar Usuario
// ==========================================
// 3. ACTUALIZAR ESTUDIANTE (Perfil, Skills y Enlaces)
// ==========================================
export const actualizarEstudiante = async (studentId, payload) => {
  const { about, telefono, location, estudios, idiomas, skills_ids, enlaces } = payload;

  // A. Actualizar datos básicos
  const { error: errorEstudiante } = await supabase
    .from('usuario_estudiante')
    .update({ about, telefono, location, estudios, idiomas })
    .eq('id', studentId);
  if (errorEstudiante) throw errorEstudiante;

  // B. Actualizar Skills (Borramos las viejas, insertamos las nuevas)
  const { error: errorDelSkills } = await supabase
    .from('estudiante_skill')
    .delete()
    .eq('id_estudiante', studentId);
  if (errorDelSkills) throw errorDelSkills;

  if (skills_ids && skills_ids.length > 0) {
    const skillsToInsert = skills_ids.map(id_skill => ({ id_estudiante: studentId, id_skill }));
    const { error: errorInsSkills } = await supabase
      .from('estudiante_skill')
      .insert(skillsToInsert);
    if (errorInsSkills) throw errorInsSkills;
  }

  // C. Actualizar Enlaces (Borramos los viejos, insertamos los nuevos)
  const { error: errorDelEnlaces } = await supabase
    .from('enlaces')
    .delete()
    .eq('id_estudiante', studentId);
  if (errorDelEnlaces) throw errorDelEnlaces;

  if (enlaces && enlaces.length > 0) {
    const enlacesToInsert = enlaces.map(link => ({
      id_estudiante: studentId,
      name: link.name || link.label,
      url: link.url,
      tipo: link.tipo
    }));
    const { error: errorInsEnlaces } = await supabase
      .from('enlaces')
      .insert(enlacesToInsert);
    if (errorInsEnlaces) throw errorInsEnlaces;
  }

  return { message: "Perfil actualizado correctamente" };
};

export const postularOferta = async (id_oferta, id_usuario_estudiante) => {
  const { data, error } = await supabase
    .from('postulaciones')
    .insert([{
      id_oferta: parseInt(id_oferta),
      id_usuario_estudiante: parseInt(id_usuario_estudiante),
      estado: 'En proceso'
    }]).select()
    .single()

  if (error) {
    console.error("Error al actualizar el estado de la candidatura:", error.message);
    throw error;
  }

  return data
}
export const guardarOferta = async (id_estudiante, id_oferta) => {
  const { data, error } = await supabase
    .from('oferta_guardada')
    .insert([{
      id_usuario_estudiante: id_estudiante,
      id_oferta: id_oferta
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const obtenerOfertasGuardadas = async (id_estudiante) => {
  const { data, error } = await supabase
    .from('oferta_guardada')
    .select(`
      *,
      oferta (
        id,
        nombre_empresa,
        tipo_puesto,
        fecha_expiracion
      )
    `)
    .eq('id_usuario_estudiante', id_estudiante);

  if (error) throw error;
  return data;
}

// ---------------------------------------------------------
// NUEVO: SUBIR FOTO DE PERFIL (STORAGE)
// ---------------------------------------------------------
export const subirAvatarStorage = async (fileName, fileBuffer, mimeType) => {
  // 1. Subimos el archivo al bucket 'avatars'
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, fileBuffer, {
      contentType: mimeType,
      upsert: true // ⚠️ mejor true para evitar errores si existe
    });

  if (error) {
  console.error("ERROR SUBIENDO:", error);
  throw error;
}

  // 2. Si se subió bien, pedimos la URL pública
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  console.log("Archivo recibido:", urlData);

  // Devolvemos solo el texto de la URL para usarlo donde queramos
  return urlData.publicUrl;
};

export const guardarFotoPerfil = async (studentId, urlPublica) => {
  const { data, error } = await supabase
    .from('usuario_estudiante')
    .update({ foto_perfil: urlPublica })
    .eq('id', studentId);
  if (error) throw error;
  return data;
};

// ====================== Adminsitrador ==========================
// --- FUNCIONES PARA USUARIO_ADMI ---

// 1. Crear Administrador
export const crearAdmin = async (nuevoAdmin) => {
  const { data, error } = await supabase
    .from('usuario_admi')
    .insert([{
      nombre_centro: nuevoAdmin.nombre_centro,
      nombre: nuevoAdmin.nombre,
      apellido: nuevoAdmin.apellido,
      telefono: nuevoAdmin.telefono,
      email: nuevoAdmin.email,
      password_hash: nuevoAdmin.password_hash // Ya debe venir hasheada desde el app.js
    }])
    .select();

  if (error) throw error;
  return data;
};

// 2. Obtener todos los Administradores
export const obtenerAdmins = async () => {
  const { data, error } = await supabase
    .from('usuario_admi')
    .select('*');

  if (error) throw error;
  return data;
};

// 3. Obtener un Administrador por ID
export const obtenerAdminPorId = async (id) => {
  const { data, error } = await supabase
    .from('usuario_admi')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

// 4. Actualizar Administrador
export const actualizarAdmin = async (id, datosActualizados) => {
  const { data, error } = await supabase
    .from('usuario_admi')
    .update(datosActualizados)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};

// ====================== LOGIN ==========================

// Obtener estudiante por EMAIL
export const obtenerEstudiantePorEmail = async (email) => {
  const { data, error } = await supabase
    .from('usuario_estudiante')
    .select('*')
    .eq('email', email)
    .single();

  if (error) throw error;
  return data;
};

// Obtener admin por EMAIL
export const obtenerAdminPorEmail = async (email) => {
  const { data, error } = await supabase
    .from('usuario_admi')
    .select('*')
    .eq('email', email)
    .single();

  if (error) throw error;
  return data;
};


// =============== FUNCIONALIDADES DEL COORDINADOR DE PRACTICAS ===============

export const VerPostulacionesAdmin = async (idOferta) => {
  const { data, error } = await supabase
    .from('postulaciones')
    .select(`
      *,
      usuario_estudiante (
        id, 
        nombre, 
        apellido, 
        email
      )
    `)
    .eq('id_oferta', Number(idOferta));

  if (error) {
    console.error("Error al obtener postulaciones:", error.message);
    throw error;
  }

  return data;
};


export const actualizarEstadoOferta = async (idOferta, id_estudiante, nuevoEstado) => {

  const { data, error } = await supabase
    .from('postulaciones')
    .update({ estado: nuevoEstado })
    .eq('id_oferta', idOferta)
    .eq('id_usuario_estudiante', id_estudiante)


  if (error) {
    console.error("Error al actualizar el estado de la candidatura:", error.message);
    throw error;
  }

  return data;
}

//Obtener todas las skills
export const obtenerSkills = async () => {
  const { data, error } = await supabase
    .from('skill')
    .select('*');

  if (error) throw error;
  return data;
}; 


export const updatedRequestRegistration= async(id_estudiante,estado) => {
  const { data, error } = await supabase
    .from('usuario_estudiante')
    .update({ estado: estado })
    .eq('id', id_estudiante)  

  if (error) {
    console.error("Error al actualizar el estado de la solicitud:", error.message);
    throw error;
  }

  return data;
}