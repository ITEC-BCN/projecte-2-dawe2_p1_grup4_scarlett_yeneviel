import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

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
    .select('*')
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
  console.log("1. Buscando estudiante con ID:", id); 

  const { data, error } = await supabase
    .from('usuario_estudiante')
    .select(`
        *,
        enlaces(*),
        estudiante_skill(
          skill(*)
        )
      `)
    .eq('id', id)
    .single();

  if (error) throw new Error("No encontrado");
  console.log("3. Enlaces encontrados en la BD:", data.enlaces);
  return data;
};

//Modificar Usuario
export const actualizarEstudiante = async (id, datosActualizados) => {
  const { data, error } = await supabase
    .from('usuario_estudiante')
    .update(datosActualizados)
    .eq('id', id)
    .select();

  if (error) throw error;
  return data;
};


export const postularOferta= async (id_oferta, id_usuario_estudiante) =>{
   const { data, error} = await supabase
   .from('postulaciones')
   .insert([{
      id_oferta:parseInt(id_oferta),
      id_usuario_estudiante:parseInt(id_usuario_estudiante),
      estado: 'En proceso'
   }]).select()

  if (error) {
    console.error("Error al actualizar el estado de la candidatura:", error.message);
    throw error;
  }

  return data
}

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


// =============== FUNCIONALIDADES DEL ADMINISTRADOR ===============

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


export const actulizarEstadoOferta = async(idOferta, id_estudiante, nuevoEstado) => {
  
  const {data, error} = await supabase
    .from('postulaciones')
    .update({estado: nuevoEstado})
    .eq('id_oferta', idOferta)
    .eq('id_usuario_estudiante', id_estudiante)


  if (error) {
    console.error("Error al actualizar el estado de la candidatura:", error.message);
    throw error;
  }
  
  return data;
}