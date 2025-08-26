const express = require('express'); 
const router = express.Router();
const User = require('../models/User');
const createToken = require ('../config/jwt');
const {auth} = require ('../middleware/auth');

//Registro de Usuario
router.post('/register', async (req, res) => {
    try{
        const {role, name, lastName, email, password, imgProfile, phone, address, representant, socialMedia, website} = req.body;

        //Validar si el email ya existe
        const existEmail = await User.findOne({email});
        if (existEmail) {
            return res.status(400).json({error: 'Correo ya Registrado'});
        }

        const newUser = new User({
            role,
            name, 
            lastName,
            email,
            password,
            imgProfile,
            phone,
            address,
            representant,
            socialMedia,
            website
        });

        const keepUser = await newUser.save();
        const { password: _, ...userWithoutPassword } = keepUser.toObject();

        res.status(201).json({
            message: 'Usuario Creado', 
            token: createToken(keepUser._id),
            user: userWithoutPassword
        });
    } catch (error) {
        res.status(500).json({ error: error.message});
    }
});

//Login del Usuario
router.post('/login', async (req, res) => {
    try {
        const {role, email, password} = req.body; 

        const user = await User.findOne({ email});
        if (!user) {
            return res.status(400).json({ error: 'Usuario no encontrado'});
        }

        if (role && user.role !== role) {
            return res.status(403).json({ error: 'No tienes permiso'})
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(400).json({ error: 'Contraseña Incorrecta'});
        }

        const { password: _, ...userWithoutPassword } = user.toObject();

        res.json({ 
            message: 'Login Correcto', 
            token: createToken(user._id),
            user: userWithoutPassword
        });

    } catch (error) {
        res.status(500).json({ error: error.message});
    }
});

router.get('/profile', auth, async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 