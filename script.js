// LineArt Pro - Interactive JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeFileUploads();
    initializeColorizeButton();
    initializeDownloadButtons();
    initializePricingButton();
    initializeAttemptsSystem();
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



// Colorize Button Functionality
function initializeColorizeButton() {
    const colorizeBtn = document.querySelector('button:contains("Colorize Image")');
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

        // Simulate processing (replace with actual API call)
        setTimeout(() => {
            // Show result
            const resultArea = document.querySelector('.border-dashed:last-of-type');
            resultArea.innerHTML = `
                <div class="relative">
                    <img src="https://picsum.photos/400/300?random=123" alt="Colored Result" class="max-w-full max-h-48 object-contain rounded-lg">
                    <div class="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                        <i class="fas fa-check mr-1"></i>Complete
                    </div>
                </div>
            `;
            resultArea.classList.add('border-green-400', 'bg-green-50');

            // Reset button
            this.innerHTML = `
                <i class="fas fa-magic mr-2"></i>
                Colorize Image
            `;
            this.disabled = false;

            showNotification('Image colorized successfully!', 'success');
        }, 3000);
    });
}

// Download Buttons Functionality
function initializeDownloadButtons() {
    const downloadButtons = document.querySelectorAll('button:contains("PNG"), button:contains("SVG")');
    
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
    const pricingButtons = document.querySelectorAll('button:contains("Get Started")');
    
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
        const colorizeBtn = document.querySelector('button:contains("Colorize Image")');
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
            
            // Process the image (simulate)
            processImage();
            
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
    paymentModal.addEventListener('click', function(e) {
        if (e.target === paymentModal) {
            hidePaymentModal();
        }
    });

    function showPaymentModal() {
        paymentModal.classList.remove('hidden');
        setTimeout(() => {
            const modalContent = paymentModal.querySelector('div');
            modalContent.style.transform = 'scale(1)';
            modalContent.style.opacity = '1';
        }, 10);
    }

    function hidePaymentModal() {
        const modalContent = paymentModal.querySelector('div');
        modalContent.style.transform = 'scale(0.95)';
        modalContent.style.opacity = '0';
        setTimeout(() => {
            paymentModal.classList.add('hidden');
        }, 300);
    }
}

function processImage() {
    // Simulate image processing
    const colorizeBtn = document.getElementById('colorize-btn');
    const originalText = colorizeBtn.innerHTML;
    
    colorizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
    colorizeBtn.disabled = true;
    
    setTimeout(() => {
        // Show result
        const resultArea = document.querySelector('.border-dashed:last-of-type');
        if (resultArea) {
            resultArea.innerHTML = `
                <div class="relative">
                    <img src="https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}" alt="Colored Result" class="max-w-full max-h-48 object-contain rounded-lg">
                    <div class="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
                        <i class="fas fa-check mr-1"></i>Complete
                    </div>
                </div>
            `;
            resultArea.classList.add('border-green-400', 'bg-green-50');
        }
        
        // Reset button
        colorizeBtn.innerHTML = originalText;
        colorizeBtn.disabled = false;
        
        showNotification('Image colorized successfully!', 'success');
    }, 3000);
}

// Export functions for external use
window.LineArtPro = {
    showNotification,
    validateForm,
    addLoadingState,
    processImage
};
