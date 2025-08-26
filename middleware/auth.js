const jwt = require('jsonwebtoken'); 
const User = require('../models/User'); 

const auth = async (req, res, next) => {
    let token = req.headers.authorization; 

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No autorizado!' });
    }

    try {
        token = token.split(' ')[1]; // Quita el Bearer
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ error: 'Usuario no encontrado' });
        }

        next();
    } catch (error) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

const authInmo = (req, res, next) => {
    if (req.user && req.user.role == 'inmobiliaria') {
        return next();
    }

    return res.status(403).json({ error: 'Acceso denegado.' });
}

module.exports = { auth, authInmo };