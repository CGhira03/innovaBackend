const express = require('express'); 
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express(); 
const PORT = process.env.PORT || 5000; 

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rutas y middleware
const { auth } = require('./middleware/auth');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');

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
app.use('/api/users', userRoutes);              // ahora /register y /login están directos
app.use('/api/properties', propertyRoutes); // propiedades siguen bajo /api/properties

// Iniciar Servidor
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
