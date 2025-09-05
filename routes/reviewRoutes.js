const express = require("express");
const Review = require("../models/Review");
const { auth } = require("../middleware/auth");

const router = express.Router();

//Crear reseña; 
router.post("/", auth, async (req, res) => {
    try {
        const { property, starts, comments } = req.body

        const newReview = new Review({
            user: req.user._id,
            property,
            starts,
            comments,
        });

        await newReview.save();

        res.status(201).json(newReview);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//Obtener reseñas de una propiedad
router.get("/property/:id", async (req, res) => {
    try {
        const reviews = await Review.find({ property: req.params.id })
            .populate("user", "name imgProfile")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;