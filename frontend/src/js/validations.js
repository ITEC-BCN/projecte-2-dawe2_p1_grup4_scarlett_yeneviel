/**
 * Validaciones para formularios
 */

// Validar que el nombre solo contenga letras y espacios
export const validarNombre = (nombre) => {
  if (!nombre || nombre.trim().length === 0) {
    return { valido: false, mensaje: 'El nombre es requerido' };
  }
  
  if (nombre.trim().length < 2) {
    return { valido: false, mensaje: 'El nombre debe tener al menos 2 caracteres' };
  }
  
  if (!/^[a-záéíóúñ\s]+$/i.test(nombre)) {
    return { valido: false, mensaje: 'El nombre solo puede contener letras' };
  }
  
  return { valido: true, mensaje: '' };
};

// Validar que el apellido solo contenga letras y espacios
export const validarApellido = (apellido) => {
  if (!apellido || apellido.trim().length === 0) {
    return { valido: false, mensaje: 'El apellido es requerido' };
  }
  
  if (apellido.trim().length < 2) {
    return { valido: false, mensaje: 'El apellido debe tener al menos 2 caracteres' };
  }
  
  if (!/^[a-záéíóúñ\s]+$/i.test(apellido)) {
    return { valido: false, mensaje: 'El apellido solo puede contener letras' };
  }
  
  return { valido: true, mensaje: '' };
};

// Validar teléfono: solo números y exactamente 9 dígitos
export const validarTelefono = (telefono) => {
  if (!telefono || telefono.trim().length === 0) {
    return { valido: false, mensaje: 'El teléfono es requerido' };
  }
  
  // Remover espacios
  const telefonoLimpio = telefono.replace(/\s/g, '');
  
  if (!/^\d+$/.test(telefonoLimpio)) {
    return { valido: false, mensaje: 'El teléfono solo puede contener números' };
  }
  
  if (telefonoLimpio.length !== 9) {
    return { valido: false, mensaje: 'El teléfono debe tener exactamente 9 dígitos' };
  }
  
  return { valido: true, mensaje: '' };
};

// Validar email
export const validarEmail = (email) => {
  if (!email || email.trim().length === 0) {
    return { valido: false, mensaje: 'El correo es requerido' };
  }
  
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!regexEmail.test(email)) {
    return { valido: false, mensaje: 'Ingresa un correo electrónico válido' };
  }
  
  return { valido: true, mensaje: '' };
};

// Validar contraseña segura
export const validarContraseña = (contraseña) => {
  if (!contraseña || contraseña.length === 0) {
    return { valido: false, mensaje: 'La contraseña es requerida' };
  }
  
  if (contraseña.length < 8) {
    return { valido: false, mensaje: 'La contraseña debe tener mínimo 8 caracteres' };
  }
  
  if (!/[A-Z]/.test(contraseña)) {
    return { valido: false, mensaje: 'La contraseña debe contener al menos una mayúscula' };
  }
  
  if (!/[a-z]/.test(contraseña)) {
    return { valido: false, mensaje: 'La contraseña debe contener al menos una minúscula' };
  }
  
  if (!/\d/.test(contraseña)) {
    return { valido: false, mensaje: 'La contraseña debe contener al menos un número' };
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contraseña)) {
    return { valido: false, mensaje: 'La contraseña debe contener un carácter especial (!@#$%^&*)' };
  }
  
  return { valido: true, mensaje: '' };
};

// Validar que las contraseñas coinciden
export const validarContraseñasCoinciden = (contraseña, contraseña2) => {
  if (contraseña !== contraseña2) {
    return { valido: false, mensaje: 'Las contraseñas no coinciden' };
  }
  
  return { valido: true, mensaje: '' };
};

// Validar todo el formulario
export const validarFormulario = (form, contraseña2) => {
  const errores = {};
  
  const validarNombreResult = validarNombre(form.nombre);
  if (!validarNombreResult.valido) errores.nombre = validarNombreResult.mensaje;
  
  const validarApellidoResult = validarApellido(form.apellido);
  if (!validarApellidoResult.valido) errores.apellido = validarApellidoResult.mensaje;
  
  const validarTelefonoResult = validarTelefono(form.telefono);
  if (!validarTelefonoResult.valido) errores.telefono = validarTelefonoResult.mensaje;
  
  const validarEmailResult = validarEmail(form.email);
  if (!validarEmailResult.valido) errores.email = validarEmailResult.mensaje;
  
  const validarContraseñaResult = validarContraseña(form.password_hash);
  if (!validarContraseñaResult.valido) errores.password_hash = validarContraseñaResult.mensaje;
  
  const validarCoincidenciaResult = validarContraseñasCoinciden(form.password_hash, contraseña2);
  if (!validarCoincidenciaResult.valido) errores.password2 = validarCoincidenciaResult.mensaje;
  
  return {
    esValido: Object.keys(errores).length === 0,
    errores
  };
};

export const validarFormularioPassword = (form, contraseña2) => {
  const errores = {};

  const validarContraseñaResult = validarContraseña(form.password_hash);
  if (!validarContraseñaResult.valido) errores.password_hash = validarContraseñaResult.mensaje;

  const validarCoincidenciaResult = validarContraseñasCoinciden(form.password_hash, contraseña2);
  if (!validarCoincidenciaResult.valido) errores.password2 = validarCoincidenciaResult.mensaje;

  return {
    esValido: Object.keys(errores).length === 0,
    errores
  };
};
