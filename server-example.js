// Ejemplo de servidor para verificar ID Tokens de Google
// Instala las dependencias: npm install express google-auth-library cors

const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;

// Tu Client ID de Google (del archivo client_secret.json)
const CLIENT_ID = '454547559124-snfjl9r14att0fic1bvc9dkcif45o3dl.apps.googleusercontent.com';

const client = new OAuth2Client(CLIENT_ID);

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint para verificar el ID Token de Google
app.post('/api/auth/verify-google-token', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({
                success: false,
                error: 'Token no proporcionado'
            });
        }

        // Verificar el token usando la biblioteca oficial de Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID, // Especifica el CLIENT_ID para verificar
        });

        const payload = ticket.getPayload();

        // Extraer la información del usuario verificada
        const userData = {
            sub: payload.sub, // ID único de Google
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            email_verified: payload.email_verified,
            // Agrega otros campos que necesites
        };

        console.log('Token verificado exitosamente para:', userData.name);

        res.json({
            success: true,
            user: userData
        });

    } catch (error) {
        console.error('Error al verificar token:', error);

        res.status(401).json({
            success: false,
            error: 'Token inválido o expirado'
        });
    }
});

// Endpoint opcional para verificar sesión
app.get('/api/auth/session', (req, res) => {
    // Aquí podrías verificar si hay una sesión activa
    // usando cookies, JWT, o base de datos
    res.json({ message: 'Endpoint de sesión - implementar según necesites' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    console.log(`Endpoint de verificación: http://localhost:${PORT}/api/auth/verify-google-token`);
});

module.exports = app;
