import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_URL_BACK,
  // timeout: 10000,
});

// 1. Interceptor de Peticiones (Request)
api.interceptors.request.use(
  (config) => {
    // Recuperar el token (desde localStorage, Pinia, cookies, etc.)
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor de Respuestas (Response)
api.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, simplemente la devolvemos
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y la petición original NO ha sido reintentada aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Marcamos la petición para no caer en un bucle infinito
      originalRequest._retry = true; 

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
            throw new Error("No hay refresh token");
        }

        // IMPORTANTE: Usamos axios directamente, NO la instancia 'api' para evitar
        // que esta petición también pase por el interceptor y cause un bucle.
        const { data } = await axios.post(`${import.meta.env.VITE_URL_BACK}/refresh-token`, {
          refresh_token: refreshToken
        });

        // 1. Guardamos el nuevo access_token (y el nuevo refresh_token si tu API usa rotación)
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
        }

        // 2. Actualizamos la cabecera de la petición original con el nuevo token
        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

        // 3. Volvemos a lanzar la petición original que había fallado
        return api(originalRequest);

      } catch (refreshError) {
        // Si el refresh_token ha caducado o es inválido:
        // Borramos tokens y redirigimos al login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Redirigir al login (usando window.location o Vue Router)
        window.location.href = '/login'; 
        
        return Promise.reject(refreshError);
      }
    }

    // Si el error no es 401, lo dejamos pasar para manejarlo en el componente
    return Promise.reject(error);
  }
);

export default api;