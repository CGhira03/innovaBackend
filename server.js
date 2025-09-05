const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const app = express(); // ✅ declarar app primero
const PORT = process.env.PORT || 5000; 

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas y middleware
const { auth } = require('./middleware/auth');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

// Ruta protegida (perfil)
app.get('/api/profile', auth, (req, res) => {
    res.json({
        message: 'Perfil de usuario Autenticado',
        user: req.user
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.send('API Funcionando!');
});

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Conectado"))
  .catch(err => console.error("❌ Error de conexión:", err));

// Rutas
app.use('/api/users', userRoutes);              
app.use('/api/properties', propertyRoutes); 
app.use('/api/reviews', reviewRoutes);

// Iniciar Servidor
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
