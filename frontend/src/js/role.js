// Variables reactivas
import { ref } from 'vue';
export const isAuthenticated = ref(false);
export const userRole = ref('');

export const checkAuthStatus = async () => {
  const url = `${import.meta.env.VITE_URL_BACK}/me`;
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(url, {
      credentials: 'include',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });

    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();

    isAuthenticated.value = true;
    userRole.value = data.user?.role || 'estudiante';
  } catch {
    isAuthenticated.value = false;
    userRole.value = '';
  }
};