const express = require('express');
const router = express.Router();
const { auth, authInmo } = require('../middleware/auth');
const Property = require('../models/Property');

//Crear Inmueble (Solo Inmobiliarias)
router.post('/', auth, authInmo, async (req, res) => {
    try {
        const newProperty = new Property({
            ...req.body,
            owner: req.user._id
        });
        await newProperty.save();
        res.status(201).json(newProperty);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Listar todos los inmuebles (acceso publico)
router.get('/', async (req, res) => {
    try {
        const properties = await Property.find().populate('owner', 'name email');
        res.json(properties);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Obtener un inmueble por ID (acceso publico)
router.get('/:id', async (req, res) => {
    try {
        const property = await Property.findById(req.params.id).populate('owner', 'name email');
        if (!property) {
            return res.status(404).json({ error: 'Inmueble no encontrado' });
        }
        res.json(property);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//Editar inmueble (solo propietarios)
router.put('/:id', auth, authInmo, async (req, res) => {
    try {
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ error: 'Inmueble no encontrado' });
        }
        if (property.owner.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'No tienes permiso para editar' });
        }

        Object.assign(property, req.body);
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