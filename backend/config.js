// Este es el archivo que ya tenías
export const {
    PORT = 3000,
    SALT_ROUNDS = 10,
    // Esta es tu clave secreta. Puedes cambiar el texto por lo que quieras.
    SECRET_JWT_KEY = "aixo-es-una-super-paraula-secreta" 
} = process.env;