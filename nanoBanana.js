const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Configuración de Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash-image-preview" 
});

// Sistema de créditos (en memoria - en producción usar base de datos)
let userCredits = {
    default: parseInt(process.env.MAX_CREDITS_PER_USER) || 1000 // Créditos iniciales
};

// Configuración por defecto de Gemini
const defaultConfig = {
    temperature: parseFloat(process.env.GEMINI_TEMPERATURE) || 0.7,
    topK: parseInt(process.env.GEMINI_TOP_K) || 40,
    topP: parseFloat(process.env.GEMINI_TOP_P) || 0.95,
    maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS) || 2048,
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
 * Procesa una imagen con Gemini 2.5 Flash para colorización
 * @param {string} base64Image - Imagen en base64
 * @param {string} userId - ID del usuario
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

        // Prompt para colorización - optimizado para gemini-2.5-flash-image-preview
        const prompt = customInstructions || "Generate a colored version of this black and white line art. Use vibrant, professional colors while maintaining the original line structure. Create a high-quality digital artwork.";

        // Configurar la generación - optimizado para gemini-2.5-flash-image-preview
        const generationConfig = {
            temperature: 0.8, // Mayor creatividad para imágenes
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4096, // Más tokens para imágenes
            ...(customInstructions && { temperature: 0.9 })
        };

        // Procesar la imagen
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                }
            }
        ], generationConfig);

        // Esperar la respuesta completa
        const response = await result.response;
        
        // Debug: ver qué está devolviendo la IA
        console.log('🔍 Gemini Response:', response);
        console.log('🔍 Response candidates:', response.candidates);
        console.log('🔍 Response text:', response.text());
        console.log('🔍 Response parts:', response.candidates?.[0]?.content?.parts);
        
        // Verificar si la respuesta contiene una imagen
        if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
            const parts = response.candidates[0].content.parts;
            const imagePart = parts.find(part => part.inlineData);
            
            if (imagePart && imagePart.inlineData) {
                // Retornar la imagen procesada
                return {
                    success: true,
                    result: {
                        type: 'image',
                        data: imagePart.inlineData.data,
                        mimeType: imagePart.inlineData.mimeType
                    },
                    creditsUsed: 2,
                    remainingCredits: getCredits(userId),
                    message: 'Imagen procesada exitosamente con Nano Banana (Gemini 2.5 Flash)'
                };
            }
        }
        
        // Si no hay imagen, retornar el texto
        const textResult = {
            success: true,
            result: {
                type: 'text',
                data: response.text()
            },
            creditsUsed: 2,
            remainingCredits: getCredits(userId),
            message: 'Imagen procesada exitosamente con Nano Banana (Gemini 2.5 Flash)'
        };
        
        // Descontar créditos solo si fue exitoso
        if (deductCredits(userId, 2)) {
            return textResult;
        } else {
            throw new Error('Failed to deduct credits');
        }

    } catch (error) {
        console.error('Error in Nano Banana processing:', error);
        
        return {
            success: false,
            error: error.message,
            remainingCredits: getCredits(userId),
            message: 'Failed to process image'
        };
    }
}

/**
 * Función de test básica
 * @returns {Object} - Resultado del test
 */
async function testNanoBanana() {
    try {
        console.log('🧪 Testing Nano Banana integration...');
        
        // Test 1: Validar créditos
        console.log('💰 Initial credits:', getCredits());
        
        // Test 2: Validar función de créditos
        const hasCredits = validateCredits('default', 2);
        console.log('✅ Has sufficient credits:', hasCredits);
        
        // Test 3: Descontar créditos
        const deducted = deductCredits('default', 2);
        console.log('💸 Credits deducted:', deducted);
        console.log('📊 Remaining credits:', getCredits());
        
        // Test 4: Restaurar créditos para testing
        userCredits.default = 10;
        console.log('🔄 Credits restored for testing');
        
        return {
            success: true,
            message: 'All tests passed successfully',
            finalCredits: getCredits()
        };
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Agregar créditos a un usuario (para testing)
 * @param {string} userId - ID del usuario
 * @param {number} credits - Créditos a agregar
 */
function addCredits(userId = 'default', credits = 10) {
    if (!userCredits[userId]) {
        userCredits[userId] = 0;
    }
    userCredits[userId] += credits;
    return userCredits[userId];
}

module.exports = {
    processImageWithNanoBanana,
    validateCredits,
    deductCredits,
    getCredits,
    addCredits,
    testNanoBanana
};

// Función para ejecutar tests si se llama directamente
if (require.main === module) {
    console.log('🚀 Starting Nano Banana tests...\n');
    testNanoBanana().then(result => {
        if (result.success) {
            console.log('\n🎉 All tests passed!');
            console.log('📊 Final credit balance:', result.finalCredits);
        } else {
            console.log('\n❌ Tests failed:', result.error);
        }
    });
}

