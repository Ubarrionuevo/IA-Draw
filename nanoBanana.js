require('dotenv').config();

// API Key para BFL AI
const BFL_API_KEY = 'd8f7caa2-c774-44cc-a287-f429dba98456';

// Sistema de créditos (en memoria - en producción usar base de datos)
let userCredits = {
    default: parseInt(process.env.MAX_CREDITS_PER_USER) || 1000 // Créditos iniciales
};

/**
 * Valida si el usuario tiene suficientes créditos
 * @param {string} userId - ID del usuario
 * @param {number} requiredCredits - Créditos requeridos
 * @returns {boolean} - True si tiene suficientes créditos
 */
function validateCredits(userId = 'default', requiredCredits = 2) {
    return userCredits[userId] >= requiredCredits;
}

/**
 * Descuenta créditos del usuario
 * @param {string} userId - ID del usuario
 * @param {number} creditsToDeduct - Créditos a descontar
 * @returns {boolean} - True si se descontaron exitosamente
 */
function deductCredits(userId = 'default', creditsToDeduct = 2) {
    if (userCredits[userId] >= creditsToDeduct) {
        userCredits[userId] -= creditsToDeduct;
        return true;
    }
    return false;
}

/**
 * Obtiene los créditos actuales del usuario
 * @param {string} userId - ID del usuario
 * @returns {number} - Créditos disponibles
 */
function getCredits(userId = 'default') {
    return userCredits[userId];
}

/**
 * Procesa una imagen con BFL AI para colorización
 * @param {string} base64Image - Imagen en base64
 * @param {string} userId - ID del usuario
 * @param {string} customInstructions - Instrucciones personalizadas
 * @returns {Object} - Resultado del procesamiento
 */
async function processImageWithNanoBanana(base64Image, userId = 'default', customInstructions = '') {
    try {
        // Validar créditos
        if (!validateCredits(userId, 2)) {
            throw new Error('Insufficient credits. You need at least 2 credits to process an image.');
        }

        // Validar input
        if (!base64Image || typeof base64Image !== 'string') {
            throw new Error('Invalid image input. Base64 string is required.');
        }

        console.log('🚀 Procesando imagen con BFL AI...');
        console.log('🔑 BFL API Key:', BFL_API_KEY.substring(0, 8) + '...');
        
        // Prompt para colorización mejorado
        const basePrompt = customInstructions || "photorealistic colors, natural lighting, detailed textures, high contrast, cinematic quality";
        const prompt = `Take this exact line art image and colorize it with ${basePrompt}. Maintain the exact same composition, lines, and structure. Only add colors, do not change the drawing. Create a beautiful, professional colored version that looks exactly like the original but with realistic colors.`;

        // Paso 1: Enviar solicitud a BFL AI con imagen
        const requestBody = {
            prompt: prompt,
            image: base64Image, // ✅ Enviar la imagen original
            aspect_ratio: "1:1"
        };

        const response = await fetch('https://api.bfl.ai/v1/flux-pro-1.1', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-key': BFL_API_KEY
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`BFL AI Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('📋 Respuesta inicial de BFL AI:', result);

        if (!result.id || !result.polling_url) {
            throw new Error('No se recibió id o polling_url');
        }

        // Paso 2: Polling optimizado según documentación BFL
        let attempts = 0;
        const maxAttempts = 120; // Máximo 60 segundos (120 * 0.5 segundos)
        
        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 0.5 segundos (recomendado)
            
            const statusResponse = await fetch(result.polling_url, {
                headers: {
                    'accept': 'application/json',
                    'x-key': BFL_API_KEY
                }
            });

            if (!statusResponse.ok) {
                if (statusResponse.status === 429) {
                    throw new Error('Rate limit exceeded. Too many requests.');
                } else if (statusResponse.status === 402) {
                    throw new Error('Out of credits. Please add more credits.');
                } else {
                    throw new Error(`Status check failed: ${statusResponse.status} ${statusResponse.statusText}`);
                }
            }

            const statusResult = await statusResponse.json();
            console.log(`🔄 Intento ${attempts + 1}: Status = ${statusResult.status}`);

            if (statusResult.status === 'Ready') {
                // ¡Imagen lista!
                console.log('🎨 ¡Imagen lista! URL:', statusResult.result?.sample);
                
                if (deductCredits(userId, 2)) {
                    return {
                        success: true,
                        result: {
                            type: 'image',
                            data: statusResult.result.sample,
                            mimeType: 'image/jpeg'
                        },
                        creditsUsed: 2,
                        remainingCredits: getCredits(userId),
                        message: 'Imagen coloreada generada exitosamente con BFL AI'
                    };
                } else {
                    throw new Error('Failed to deduct credits');
                }
            } else if (statusResult.status === 'Failed' || statusResult.status === 'Error') {
                throw new Error(`La generación de imagen falló: ${statusResult.status}`);
            } else if (statusResult.status === 'Pending') {
                // Continuar polling
                console.log(`⏳ Procesando... (${attempts + 1}/${maxAttempts})`);
            }

            attempts++;
        }

        throw new Error('Tiempo de espera agotado. La imagen tardó demasiado en generarse.');

    } catch (error) {
        console.error('Error en el procesamiento con BFL AI:', error);
        
        return {
            success: false,
            error: error.message,
            remainingCredits: getCredits(userId),
            message: 'Failed to process image with BFL AI'
        };
    }
}

// Exportar funciones
module.exports = {
    processImageWithNanoBanana,
    validateCredits,
    deductCredits,
    getCredits
};

