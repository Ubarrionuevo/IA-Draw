const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Importar nanoBanana
const { processImageWithNanoBanana, getCredits, validateCredits } = require('./nanoBanana');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.')); // Servir archivos estáticos

// Configuración de Multer para uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, cb) => {
        // Validar tipos de archivo
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    }
});

// Rutas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/workspace', (req, res) => {
    res.sendFile(path.join(__dirname, 'workspace.html'));
});

// API para obtener créditos del usuario
app.get('/api/credits/:userId', (req, res) => {
    try {
        const { userId } = req.params;
        const credits = getCredits(userId);
        res.json({ success: true, credits });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// API para procesar imagen con IA
app.post('/api/process-image', upload.single('image'), async (req, res) => {
    try {
        const { userId = 'default', customInstructions = '' } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No se proporcionó ninguna imagen' 
            });
        }

        // Convertir imagen a base64
        const base64Image = req.file.buffer.toString('base64');
        
        // Validar créditos
        if (!validateCredits(userId, 2)) {
            return res.status(402).json({ 
                success: false, 
                error: 'Créditos insuficientes. Necesitas al menos 2 créditos.',
                requiredCredits: 2,
                currentCredits: getCredits(userId)
            });
        }

        // Procesar imagen con IA
        const result = await processImageWithNanoBanana(base64Image, userId);
        
        res.json(result);
        
    } catch (error) {
        console.error('Error procesando imagen:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API para validar archivo antes de procesar
app.post('/api/validate-file', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No se proporcionó ningún archivo' 
            });
        }

        const fileInfo = {
            filename: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            sizeInMB: (req.file.size / (1024 * 1024)).toFixed(2)
        };

        // Validaciones
        const validations = {
            isImage: req.file.mimetype.startsWith('image/'),
            sizeOK: req.file.size <= 10 * 1024 * 1024, // 10MB
            formatSupported: ['image/jpeg', 'image/png', 'image/svg+xml'].includes(req.file.mimetype)
        };

        if (!validations.isImage) {
            return res.status(400).json({
                success: false,
                error: 'El archivo debe ser una imagen',
                fileInfo,
                validations
            });
        }

        if (!validations.sizeOK) {
            return res.status(400).json({
                success: false,
                error: 'El archivo es demasiado grande (máximo 10MB)',
                fileInfo,
                validations
            });
        }

        if (!validations.formatSupported) {
            return res.status(400).json({
                success: false,
                error: 'Formato de imagen no soportado. Use JPEG, PNG o SVG',
                fileInfo,
                validations
            });
        }

        res.json({
            success: true,
            message: 'Archivo válido',
            fileInfo,
            validations
        });

    } catch (error) {
        console.error('Error validando archivo:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// API para obtener estadísticas del sistema
app.get('/api/stats', (req, res) => {
    try {
        const stats = {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform,
            timestamp: new Date().toISOString()
        };
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
    console.error('Error no manejado:', error);
    
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'El archivo es demasiado grande (máximo 10MB)'
            });
        }
    }
    
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error.message
    });
});

// Ruta 404 para páginas no encontradas
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Ruta no encontrada'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Sketcha ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Archivos estáticos servidos desde: ${__dirname}`);
    console.log(`🔑 API disponible en: http://localhost:${PORT}/api`);
    console.log(`⏰ Iniciado: ${new Date().toLocaleString()}`);
});

module.exports = app;
