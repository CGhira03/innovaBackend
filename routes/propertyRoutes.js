const express = require('express');
const router = express.Router();
const { auth, authInmo } = require('../middleware/auth');
const Property = require('../models/Property');
const multer = require('multer'); 
const path = require('path');

//configuracion de imagenes: 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/properties');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage });

//Crear Inmueble (Solo Inmobiliarias)
router.post('/', auth, authInmo, upload.array('images', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length < 4) {
      return res.status(400).json({ error: "Debes subir al menos 4 imágenes" });
    }

    const images = req.files.map(file =>
      `${req.protocol}://${req.get("host")}/${file.path.replace(/\\/g, "/")}`
    );

    const newProperty = new Property({
      ...req.body,
      owner: req.user._id,
      images // 👈 guardamos array de imágenes
    });

    await newProperty.save();
    res.status(201).json(newProperty);
  } catch (error) {
    console.error("❌ Error al crear inmueble:", error);
    res.status(500).json({ error: error.message });
  }
});


//Listar todos los inmuebles con filtros (acceso publico)
router.get('/', async (req, res) => {
  try {
    const { country, state, city, operation, priceMin, priceMax, pets } = req.query; 
    let filter = {};

    if (country) filter["direction.country"] = { $regex: country, $options: "i" };
    if (state) filter["direction.state"] = { $regex: state, $options: "i" };
    if (city) filter["direction.city"] = { $regex: city, $options: "i" };

    if (operation) filter.operation = operation;

    if (priceMin || priceMax) {
      filter.price = {};
      if (priceMin) filter.price.$gte = Number(priceMin);
      if (priceMax) filter.price.$lte = Number(priceMax);
    }

    if (pets !== undefined && pets !== "") {
      filter.pets = pets === "true";
    }

    const properties = await Property.find(filter).populate('owner', 'name email');
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//Listar propiedades del usuario logueado (solo auth)
router.get('/my-properties', auth, async (req, res) => {
    try {
        const properties = await Property.find({ owner: req.user._id })
            .populate('owner', 'name, email');
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Obtener un inmueble por ID (acceso publico)
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('owner', 'name email phone address imgProfile representant socialMedia website role');
        if (!property) {
            return res.status(404).json({ error: 'Inmueble no encontrado' });
        }
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


//Editar inmueble (solo propietarios)
router.put('/:id', auth, authInmo, upload.array("images", 20), async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ error: 'Inmueble no encontrado' });
    }
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'No tienes permiso para editar' });
    }

    Object.assign(property, req.body);

    if (req.files && req.files.length > 0) {
      property.images = req.files.map(file =>
        `${req.protocol}://${req.get("host")}/${file.path.replace(/\\/g, "/")}`
      );
    }

    await property.save();
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//Eliminar Inmuebles (Solo propietarios)
router.delete('/:id', auth, authInmo, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ error: 'Inmueble no encontrado' });
        }
        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'No tienes permiso para eliminar este inmueble' });
        }

        await property.deleteOne();
        res.json({ message: 'Inmueble eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;