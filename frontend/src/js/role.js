import { ref } from 'vue';

export const isAuthenticated = ref(false);
export const userRole = ref('');

export const checkAuthStatus = async () => {
  const url = `${import.meta.env.VITE_URL_BACK}/me`;
  const token = localStorage.getItem('token');

  // 1. SI NO HAY TOKEN: Ni siquiera llamamos al servidor.
  // Esto evita el error 400 en la consola.
  if (!token) {
    isAuthenticated.value = false;
    userRole.value = '';
    return; // Salimos de la función temprano
  }

  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 2. SI EL TOKEN ES INVÁLIDO O EXPIRÓ (El servidor responde error)
    if (!response.ok) {
      // Si el servidor da error, limpiamos el token corrupto
      localStorage.removeItem('token'); 
      isAuthenticated.value = false;
      userRole.value = '';
      return;
    }

    const data = await response.json();

    // 3. TODO OK: Usuario identificado
    isAuthenticated.value = true;
    userRole.value = data.user?.role || 'estudiante';

  } catch (error) {
    // Error de red o servidor caído
    isAuthenticated.value = false;
    userRole.value = '';
  }
};