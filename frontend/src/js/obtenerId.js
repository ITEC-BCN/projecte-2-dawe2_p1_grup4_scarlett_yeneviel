export const obtenerIdDesdeToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // 1. El token tiene 3 partes separadas por puntos: header.payload.signature
    // 2. Dividimos y tomamos la segunda parte [1]
    const base64Url = token.split('.')[1];
    
    // 3. Reemplazamos caracteres especiales de Base64Url a Base64 estándar
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // 4. Decodificamos y convertimos a objeto JSON
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    
    // 5. Retornamos el ID (dependiendo de cómo lo guardaste: 'id', 'sub', 'uid'...)
    return payload.id || payload.sub;
    
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return null;
  }
};