import jwt from 'jsonwebtoken';
import { SECRET_JWT_KEY } from '../../config.js';
import { obtenerEstudiantePorId, obtenerAdminPorId } from '../supabaseClient.js';

export default async function requireAuth(req, res, next) {
    const token =
        req.headers.authorization?.split(' ')[1]
        || req.cookies.access_token;

    if (!token) {
        return res.status(400).json({
            error: 'No hay token'
        });
    }

    try {
        const decoded = jwt.verify(token, SECRET_JWT_KEY);

        let usuario;

        if (decoded.role === 'admin') {
            usuario = await obtenerAdminPorId(decoded.id);
            if (usuario) {
                req.user = { ...usuario, role: 'admin' };
            }
        } else {
            usuario = await obtenerEstudiantePorId(decoded.id);
            if (usuario) {
                req.user = { ...usuario, role: 'estudiante' };
            }
        }

        if (!usuario) {
            return res.status(404).json({
                error: 'Usuario no existe'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            error: 'Token inválido o expirado'
        });
    }
}