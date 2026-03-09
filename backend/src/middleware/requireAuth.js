import jwt from 'jsonwebtoken';
// Importamos la clave que definimos en el config.js
import { SECRET_JWT_KEY } from '../../config.js'; 

export default function requireAuth(req, res, next) {
    // Intenta leer de la cookie O del header Authorization
    const token = req.cookies.access_token || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'No hay token, acceso denegado' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_JWT_KEY);
        req.user = decoded; 
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido o expirado' });
    }
}