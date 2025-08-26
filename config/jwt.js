const jwt = require('jsonwebtoken');

const createToken = (userId) => {
    return jwt.sign(
        {id: userId},
        process.env.JWT_SECRET, //Clave secreta en .env
        { expiresIn: '1h'} //Duracion de Token
    );
};

module.exports = createToken;