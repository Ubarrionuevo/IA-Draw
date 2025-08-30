# 🚀 Guía de Configuración de Sketcha

## 📋 Requisitos Previos

- Node.js 16+ instalado
- Cuenta de Google Cloud con API key para Gemini
- Editor de código (VS Code recomendado)

## 🔧 Pasos de Configuración

### 1. Instalar Dependencias
```bash
npm install
```

### 2. Configurar Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Google AI API Key (Gemini 2.5 Flash)
GOOGLE_API_KEY=tu_api_key_aqui

# Configuración de la Aplicación
APP_NAME=Sketcha
APP_VERSION=1.0.0

# Límites de la Aplicación
MAX_FILE_SIZE=10485760
MAX_CREDITS_PER_USER=1000
CREDITS_PER_PROCESSING=2

# Configuración de Seguridad
CORS_ORIGIN=http://localhost:3000
SESSION_SECRET=tu_secreto_super_seguro_aqui

# Configuración de Google AI
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TEMPERATURE=0.7
GEMINI_TOP_K=40
GEMINI_TOP_P=0.95
GEMINI_MAX_TOKENS=2048
```

### 3. Obtener API Key de Google AI

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crea una nueva API key
3. Copia la key y pégala en tu archivo `.env`

### 4. Iniciar el Servidor

#### Modo Desarrollo (con auto-reload):
```bash
npm run dev
```

#### Modo Producción:
```bash
npm start
```

### 5. Verificar la Instalación

El servidor debería iniciar en `http://localhost:3000`

## 🧪 Testing

### Probar la Conexión del Servidor
```bash
curl http://localhost:3000/api/stats
```

### Probar la API de Créditos
```bash
curl http://localhost:3000/api/credits/default
```

### Probar el Procesamiento de Imágenes
```bash
# Usar Postman o similar para probar POST /api/process-image
```

## 📁 Estructura del Proyecto

```
sketcha-ai/
├── server.js          # Servidor principal Express
├── nanoBanana.js      # Integración con Google AI
├── index.html         # Landing page
├── workspace.html     # Interfaz de trabajo
├── script.js          # JavaScript del frontend
├── .env               # Variables de entorno (crear manualmente)
├── package.json       # Dependencias del proyecto
└── README.md          # Documentación principal
```

## 🔍 Solución de Problemas

### Error: "GOOGLE_API_KEY is not defined"
- Verifica que el archivo `.env` existe
- Verifica que la variable `GOOGLE_API_KEY` está definida
- Reinicia el servidor después de cambiar `.env`

### Error: "Cannot find module"
- Ejecuta `npm install` para instalar dependencias
- Verifica que `node_modules` existe

### Error: "Port already in use"
- Cambia el puerto en `.env` (ej: `PORT=3001`)
- O termina el proceso que usa el puerto 3000

### Error: "CORS error"
- Verifica que `CORS_ORIGIN` en `.env` coincida con tu frontend
- Para desarrollo local, usa `http://localhost:3000`

## 🚀 Comandos Útiles

```bash
# Ver logs del servidor
npm run dev

# Verificar estado del servidor
curl http://localhost:3000/api/stats

# Probar conexión con Google AI
node nanoBanana.js

# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json && npm install
```

## 📱 Acceso a la Aplicación

- **Landing Page**: http://localhost:3000
- **Workspace**: http://localhost:3000/workspace
- **API Stats**: http://localhost:3000/api/stats
- **API Créditos**: http://localhost:3000/api/credits/default

## 🔒 Seguridad

- **NUNCA** subas el archivo `.env` a Git
- Usa `.gitignore` para excluir archivos sensibles
- Cambia `SESSION_SECRET` por un valor único y seguro
- Limita `CORS_ORIGIN` en producción

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs del servidor
2. Verifica la configuración en `.env`
3. Asegúrate de que todas las dependencias están instaladas
4. Verifica que la API key de Google AI es válida

---

¡Tu aplicación Sketcha debería estar funcionando ahora! 🎉
