// Sketcha - Interactive JavaScript

// Configuración de la API
const API_BASE_URL = window.location.origin;
const API_ENDPOINTS = {
    processImage: '/api/process-image',
    validateFile: '/api/validate-file',
    getCredits: '/api/credits',
    getStats: '/api/stats'
};

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeFileUploads();
    initializeColorizeButton();
    initializeDownloadButtons();
    initializePricingButton();
    initializeAttemptsSystem();
    
    // Verificar conexión con el servidor
    checkServerConnection();
    
    // Cargar créditos del usuario
    loadUserCredits();
});

// File Upload Functionality
function initializeFileUploads() {
    const uploadAreas = document.querySelectorAll('.border-dashed');
    
    uploadAreas.forEach(area => {
        // Click to upload
        area.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => handleFileSelect(e, area);
            input.click();
        });

        // Drag and drop
        area.addEventListener('dragover', (e) => {
            e.preventDefault();
            area.classList.add('border-primary-400', 'bg-primary-50');
        });

        area.addEventListener('dragleave', (e) => {
            e.preventDefault();
            area.classList.remove('border-primary-400', 'bg-primary-50');
        });

        area.addEventListener('drop', (e) => {
            e.preventDefault();
            area.classList.remove('border-primary-400', 'bg-primary-50');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect({ target: { files } }, area);
            }
        });
    });
}

function handleFileSelect(event, uploadArea) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select a valid image file', 'error');
        return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
        return;
    }

    // Display preview
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadArea.innerHTML = `
            <div class="relative">
                <img src="${e.target.result}" alt="Preview" class="max-w-full max-h-48 object-contain rounded-lg">
                <button class="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors" onclick="removeFile(this)">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        uploadArea.classList.add('border-green-400', 'bg-green-50');
    };
    reader.readAsDataURL(file);
}

function removeFile(button) {
    const uploadArea = button.closest('.border-dashed');
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-4"></i>
        <p class="text-gray-600 mb-2">Click to upload or drag your image here</p>
        <p class="text-sm text-gray-500">Supports PNG, JPG, SVG up to 10MB</p>
    `;
    uploadArea.classList.remove('border-green-400', 'bg-green-50');
}

// Funciones de conexión con el servidor
async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.getStats}`);
        if (response.ok) {
            console.log('✅ Servidor conectado correctamente');
            return true;
        }
    } catch (error) {
        console.error('❌ Error conectando con el servidor:', error);
        showNotification('Error de conexión con el servidor', 'error');
        return false;
    }
}

async function loadUserCredits() {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.getCredits}/default`);
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                updateCreditsDisplay(data.credits);
            }
        }
    } catch (error) {
        console.error('Error cargando créditos:', error);
    }
}

function updateCreditsDisplay(credits) {
    const creditsElements = document.querySelectorAll('[data-credits]');
    creditsElements.forEach(element => {
        element.textContent = credits;
    });
}

// Función para mostrar modal de pago
function showPaymentModal() {
    // Crear modal de pago
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4 animate-fade-in">
            <div class="text-center">
                <div class="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-credit-card text-white text-2xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Créditos Agotados</h3>
                <p class="text-gray-600 mb-6">Has usado todos tus créditos gratuitos. Selecciona un plan para continuar:</p>
                
                <div class="space-y-3 mb-6">
                    <button class="w-full bg-primary-500 text-white py-3 px-4 rounded-lg hover:bg-primary-600 transition-colors" onclick="selectPlan('basic')">
                        <div class="font-semibold">$5 - 500 Créditos</div>
                        <div class="text-sm opacity-90">Plan Básico</div>
                    </button>
                    <button class="w-full bg-gray-800 text-white py-3 px-4 rounded-lg hover:bg-gray-900 transition-colors" onclick="selectPlan('pro')">
                        <div class="font-semibold">$10 - 1000 Créditos</div>
                        <div class="text-sm opacity-90">Plan Profesional</div>
                    </button>
                </div>
                
                <button class="text-gray-500 hover:text-gray-700" onclick="closePaymentModal()">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closePaymentModal();
        }
    });
}

function closePaymentModal() {
    const modal = document.querySelector('.fixed.inset-0.bg-black.bg-opacity-50');
    if (modal) {
        modal.remove();
    }
}

function selectPlan(plan) {
    const planInfo = plan === 'basic' ? 'Plan Básico ($5 - 500 créditos)' : 'Plan Profesional ($10 - 1000 créditos)';
    showNotification(`Redirigiendo a pago para ${planInfo}...`, 'info');
    
    // Simular proceso de pago (en producción, integrar con Stripe/PayPal)
    setTimeout(() => {
        showNotification('Sistema de pagos en desarrollo. Por favor, contacta al administrador.', 'warning');
        closePaymentModal();
    }, 2000);
}

// Helper functions to find buttons by text content
function findButtonByText(text) {
    const buttons = document.querySelectorAll('button');
    return Array.from(buttons).find(button => 
        button.textContent.trim().includes(text)
    );
}

function findButtonsByText(textArray) {
    const buttons = document.querySelectorAll('button');
    return Array.from(buttons).filter(button => 
        textArray.some(text => button.textContent.trim().includes(text))
    );
}

// Helper function to find the results area specifically
function findResultsArea() {
    // Buscar específicamente en el panel de Results
    const resultsPanel = document.querySelector('.bg-white.rounded-2xl.shadow-sm.border.border-gray-100.p-8');
    if (resultsPanel) {
        const resultArea = resultsPanel.querySelector('.border-2.border-dashed.border-gray-300.rounded-xl.p-8.text-center.bg-gray-50.min-h-\\[400px\\]');
        if (resultArea) {
            return resultArea;
        }
    }
    
    // Fallback: buscar por texto "Results"
    const allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const resultsHeading = Array.from(allHeadings).find(heading => 
        heading.textContent.trim().includes('Results')
    );
    if (resultsHeading) {
        const resultsSection = resultsHeading.closest('.bg-white.rounded-2xl');
        if (resultsSection) {
            const resultArea = resultsSection.querySelector('.border-2.border-dashed');
            if (resultArea) {
                return resultArea;
            }
        }
    }
    
    // Fallback final: último border-dashed
    const allBorderDashed = document.querySelectorAll('.border-2.border-dashed');
    if (allBorderDashed.length >= 2) {
        return allBorderDashed[allBorderDashed.length - 1];
    }
    
    return null;
}

// Colorize Button Functionality
function initializeColorizeButton() {
    const colorizeBtn = findButtonByText('Colorize Image');
    if (!colorizeBtn) return;

    colorizeBtn.addEventListener('click', function() {
        // Check if line art image is uploaded
        const lineArtArea = document.querySelector('.border-dashed');
        if (!lineArtArea.classList.contains('border-green-400')) {
            showNotification('Please upload a line art image first', 'error');
            return;
        }

        // Show loading state
        this.innerHTML = `
            <i class="fas fa-spinner fa-spin mr-2"></i>
            Processing...
        `;
        this.disabled = true;

        // Get the uploaded image data
        const uploadedImage = lineArtArea.querySelector('img');
        if (!uploadedImage) {
            showNotification('No image found to process', 'error');
            this.innerHTML = `
                <i class="fas fa-magic mr-2"></i>
                Colorize Image
            `;
            this.disabled = false;
            return;
        }

        // Convert image to base64 for API call
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = async () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            try {
                // Convert to base64
                const base64Image = canvas.toDataURL('image/jpeg').split(',')[1];
                
                // Preparar FormData para enviar la imagen
                const formData = new FormData();
                const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg'));
                formData.append('image', blob, 'line-art.jpg');
                formData.append('userId', 'default');
                
                // Obtener instrucciones personalizadas si existen
                const customInstructions = document.querySelector('#customInstructions')?.value || '';
                if (customInstructions) {
                    formData.append('customInstructions', customInstructions);
                }
                
                // Call Nano Banana API
                const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.processImage}`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();
                
                if (result.success) {
                    // Show the generated result
                    const resultArea = findResultsArea();
                    if (resultArea) {
                        let resultHTML = '';
                        
                        if (result.result.type === 'image') {
                            // Mostrar imagen procesada
                            resultHTML = `
                                <div class="relative">
                                    <img src="data:${result.result.mimeType};base64,${result.result.data}" alt="Colored Result" class="max-w-full max-h-48 object-contain rounded-lg">
                                    <div class="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                                        <i class="fas fa-check mr-1"></i>Complete
                                    </div>
                                </div>
                            `;
                        } else {
                            // Mostrar texto de resultado
                            resultHTML = `
                                <div class="bg-blue-50 p-4 rounded-lg">
                                    <h4 class="font-semibold text-blue-900 mb-2">Resultado del Procesamiento:</h4>
                                    <p class="text-blue-800">${result.result.data}</p>
                                </div>
                            `;
                        }
                        
                        resultArea.innerHTML = resultHTML;
                        resultArea.classList.add('border-green-400', 'bg-green-50');
                    }
                    
                    // Actualizar créditos mostrados
                    if (result.remainingCredits !== undefined) {
                        updateCreditsDisplay(result.remainingCredits);
                    }
                    
                    showNotification('Image colorized successfully with Nano Banana!', 'success');
                } else {
                    showNotification(`Error: ${result.error}`, 'error');
                    
                    // Si es error de créditos, mostrar modal de pago
                    if (result.error && result.error.includes('Créditos insuficientes')) {
                        showPaymentModal();
                    }
                }
            } catch (error) {
                console.error('API Error:', error);
                showNotification('Error processing image with Nano Banana', 'error');
            }
            
            // Reset button
            this.innerHTML = `
                <i class="fas fa-magic mr-2"></i>
                Colorize Image
            `;
            this.disabled = false;
        };
        
        img.onerror = () => {
            showNotification('Error loading image for processing', 'error');
            this.innerHTML = `
                <i class="fas fa-magic mr-2"></i>
                Colorize Image
            `;
            this.disabled = false;
        };
        
        img.src = uploadedImage.src;
    });
}

// Download Buttons Functionality
function initializeDownloadButtons() {
    const downloadButtons = findButtonsByText(['PNG', 'SVG']);
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function() {
            const format = this.textContent.trim();
            showNotification(`Downloading ${format} file...`, 'info');
            
            // Simulate download (replace with actual download logic)
            setTimeout(() => {
                showNotification(`${format} file downloaded successfully!`, 'success');
            }, 1000);
        });
    });
}

// Pricing Button Functionality
function initializePricingButton() {
    const pricingButtons = findButtonsByText(['Get Started']);
    
    pricingButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const plan = index === 0 ? '$5 (500 credits) - Most Popular' : '$10 (1000 credits)';
            showNotification(`Redirecting to payment for ${plan}...`, 'info');
            
            // Simulate payment redirect (replace with actual payment integration)
            setTimeout(() => {
                showNotification(`Payment system integration required for ${plan}`, 'info');
            }, 1000);
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    // Set colors based on type
    const colors = {
        success: 'bg-green-500 text-white',
        error: 'bg-red-500 text-white',
        info: 'bg-blue-500 text-white',
        warning: 'bg-yellow-500 text-white'
    };
    
    notification.classList.add(...colors[type].split(' '));
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 hover:opacity-75">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Add to page
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation-triangle'
    };
    return icons[type] || icons.info;
}

// Utility function to find elements by text content
Element.prototype.contains = function(text) {
    return this.textContent.includes(text);
};

// Add smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add hover effects for interactive elements
document.querySelectorAll('button, .border-dashed').forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.02)';
    });
    
    element.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to colorize
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        const colorizeBtn = findButtonByText('Colorize Image');
        if (colorizeBtn && !colorizeBtn.disabled) {
            colorizeBtn.click();
        }
    }
    
    // Escape to close notifications
    if (e.key === 'Escape') {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => notification.remove());
    }
});

// Add loading states for better UX
function addLoadingState(element, text = 'Loading...') {
    const originalContent = element.innerHTML;
    element.innerHTML = `
        <i class="fas fa-spinner fa-spin mr-2"></i>
        ${text}
    `;
    element.disabled = true;
    
    return () => {
        element.innerHTML = originalContent;
        element.disabled = false;
    };
}

// Form validation
function validateForm() {
    const lineArtUpload = document.querySelector('.border-dashed');
    const hasLineArt = lineArtUpload.classList.contains('border-green-400');
    
    if (!hasLineArt) {
        showNotification('Please upload a line art image', 'error');
        return false;
    }
    
    return true;
}

// Attempts System Functionality
function initializeAttemptsSystem() {
    let attempts = 2;
    const attemptsCount = document.getElementById('attempts-count');
    const colorizeBtn = document.getElementById('colorize-btn');
    const paymentModal = document.getElementById('payment-modal');
    const closeModal = document.getElementById('close-modal');

    if (!colorizeBtn || !paymentModal) return;

    colorizeBtn.addEventListener('click', function(e) {
        if (attempts > 0) {
            attempts--;
            attemptsCount.textContent = attempts;
            
            // Process the image using the existing colorize functionality
            // The actual processing is handled by initializeColorizeButton()
            // This is just for attempts tracking
            
            if (attempts === 0) {
                setTimeout(() => {
                    showPaymentModal();
                }, 1000);
            }
        } else {
            showPaymentModal();
        }
    });

    closeModal.addEventListener('click', function() {
        hidePaymentModal();
    });

    // Close modal when clicking outside
    // Código duplicado eliminado - ya existe una implementación mejorada arriba
}
