const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['usuario', 'inmobiliaria'],
        default: 'usuario'
    },

    //Datos Comunes
    name: {type: String, required: true, unique: true},
    lastName: {type: String}, 
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    
    //Imagen de perfil (puede ser una URL)
    imgProfile: {type: String, default: ''},
    
    phone: {type: Number,},
    address: {type: String},

    //Solo para inmobiliarias: 
    representant: { type: String },
    socialMedia: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        twitter: { type: String, default: "" },
        tiktok: { type: String, default: "" }
    },
    website: { type: String},

    createdAt: {type: Date, default: Date.now}
});

//Encriptar Contraseña antes de guardar
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

//Método para comparar contraseñas
userSchema.methods.comparePassword = function (passwordCreated) {
    return bcrypt.compare(passwordCreated, this.password);
}

module.exports = mongoose.model('User', userSchema);