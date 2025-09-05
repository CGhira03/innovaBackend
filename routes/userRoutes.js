const express = require('express'); 
const router = express.Router();
const User = require('../models/User');
const createToken = require ('../config/jwt');
const {auth} = require ('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/users');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage });

//Registro de Usuario ambos roles
router.post('/register', upload.single("imgProfile"), async (req, res) => {
    try{
        const {role, name, lastName, email, password, confirmPassword, phone, address, representant} = req.body;
        const imgProfile = req.file ? `http://localhost:5000/uploads/users/${req.file.filename}` : "";

        //Validar si el email ya existe
        const existEmail = await User.findOne({email});
        if (existEmail) {
            return res.status(400).json({error: 'Correo ya Registrado'});
        }

        //Validar confirmacion de contraseña
        if (password !== confirmPassword) {
            return res.status(400).json({ error: 'Las contraseñas no coinciden'});
        }

        const newUser = new User({
            role,
            name, 
            lastName,
            email: email.trim().toLowerCase(),
            password,
            imgProfile,
            phone,
            address,
            representant,
        });

        const keepUser = await newUser.save();
        const { password: _, ...userWithoutPassword } = keepUser.toObject();

        res.status(201).json({
            message: 'Usuario Creado correctamente', 
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
    const { email, password } = req.body;

    const user = await User
      .findOne({ email: email.trim().toLowerCase() })
      .select('+password'); // <- necesario si password tiene select:false

    if (!user) {
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(password, user.password); // compara con el hash guardado

    if (!isValid) {
      return res.status(400).json({ error: 'Contraseña Incorrecta' });
    }

    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({
      message: 'Login Correcto',
      token: createToken(user._id),
      user: userWithoutPassword, // aquí vendrá también el role
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



router.get('/profile', auth, async (req, res) => {
    try {
        res.json({ user: req.user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Actualizar Perfil
router.put('/profile', auth, upload.single('imgProfile'), async (req, res) => {
    try {
        const updates = { ...req.body };

        // Parsear socialMedia si viene como string
        if (updates.socialMedia && typeof updates.socialMedia === 'string') {
            updates.socialMedia = JSON.parse(updates.socialMedia);
        }

        // Guardar ruta de imagen
        if (req.file) {
            updates.imgProfile = `http://localhost:5000/${req.file.path}`;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true }
        ).select("-password");

        if (!updatedUser) return res.status(404).json({ error: "Usuario no encontrado" });

        res.json(updatedUser);
    } catch (error) {
        console.error(error); // Para debug
        res.status(500).json({ error: error.message });
    }
});


module.exports = router; 