const { trusted } = require("mongoose");
const mongoose = require ('mongoose');

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },

    direction: {
        country: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        street: { type: String, required: true },
        number: { type: String, required: true },
        floor: { type: String },
        departament: { type: String }
    },

    images: {
    type: [String],
    validate: {
        validator: function (v) {
        return v.length >= 4 && v.length <= 20;
        },
        message: "Debes subir entre 4 y 20 imágenes"
    }
    },

    operation: {
        type: String, 
        enum: ['alquiler', 'venta'],
        required: true 
    },

    price: { type: String, default: "Consultar" },
    pets: { type: Boolean, default: false },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },

    createdAt: { type: Date, default: Date.now}
}); 

module.exports = mongoose.model('Property', propertySchema);