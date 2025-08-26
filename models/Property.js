const { trusted } = require("mongoose");
const mongoose = require ('mongoose');

const propertySchema = new mongoose.Schema({
    title: { type: String, required: true },

    direction: {
        country: { type: String, required: true },
        state: { type: String, required: true },
        city: { type: String, required: true },
        street: { type: String, required: true },
        number: { type: String, required: true },
        floor: { type: String },
        departament: { type: String }
    },

    imgProperty: { type: String, default: '' },

    operation: {
        type: String, 
        enum: ['alquiler', 'venta'],
        required: true 
    },

    pets: { type: Boolean, default: false },

    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },

    createdAt: { type: Date, default: Date.now}
}); 

module.exports = mongoose.model('Property', propertySchema);