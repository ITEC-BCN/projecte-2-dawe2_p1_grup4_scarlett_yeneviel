import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

//Funciones del crud

// 1. CREAR una oferta (CREATE)
export const crearOferta = async (nuevaOferta) => {
   console.log("OFERTA RECIBIDA:", nuevaOferta); // 👈 DEBUG
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