import CameraManager from './camera.js';

class CalorieSnap {
    constructor() {
        this.camera = new CameraManager();
        this.initElements();
        this.bindEvents();
        this.init();
    }

    initElements() {
        // Screens
        this.screens = {
            camera: document.getElementById('camera-screen'),
            preview: document.getElementById('preview-screen'),
            loading: document.getElementById('loading-screen'),
            results: document.getElementById('results-screen')
        };

        // Elements
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.captureBtn = document.getElementById('capture-btn');
        this.retakeBtn = document.getElementById('retake-btn');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.previewImage = document.getElementById('preview-image');
        this.retryCamera = document.getElementById('retryCamera');
        this.newAnalysisBtn = document.getElementById('new-analysis');
    }

    bindEvents() {
        this.captureBtn.addEventListener('click', () => this.capturePhoto());
        this.retakeBtn.addEventListener('click', () => this.retakePhoto());
        this.analyzeBtn.addEventListener('click', () => this.analyzePhoto());
        this.retryCamera.addEventListener('click', () => this.init());
        this.newAnalysisBtn.addEventListener('click', () => this.newAnalysis());
    }

    async init() {
        try {
            await this.camera.requestCamera();
            this.captureBtn.disabled = false;
            this.showScreen('camera');
        } catch (error) {
            console.error('Camera initialization failed:', error);
        }
    }

    capturePhoto() {
        const imageData = this.camera.captureFrame();
        this.previewImage.src = imageData;
        this.previewImage.dataset.image = imageData;
        this.showScreen('preview');
    }

    retakePhoto() {
        this.showScreen('camera');
    }

    async analyzePhoto() {
        const imageData = this.previewImage.dataset.image;
        this.showScreen('loading');
        this.updateProgress('Preparing image...', 20);

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageData
                })
            });

            const result = await response.json();

            if (result.success) {
                this.updateProgress('Complete!', 100);
                setTimeout(() => {
                    this.showResults(result.data);
                }, 500);
            } else {
                throw new Error(result.error?.message || 'Analysis failed');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('Analysis failed. Please try again.');
        }
    }

    showResults(data) {
        document.getElementById('total-calories').textContent = `${data.total_calories} calories`;

        const foodList = document.getElementById('food-items');
        foodList.innerHTML = '';

        data.foods.forEach(food => {
            const foodItem = document.createElement('div');
            foodItem.className = 'food-item';
            foodItem.innerHTML = `
                <div class="food-info">
                    <h3>${food.name}</h3>
                    <p class="method">${this.formatCookingMethod(food.cooking_method)}</p>
                </div>
                <div class="food-details">
                    <div class="calories">${food.calories} cal</div>
                    <div class="confidence">${Math.round(food.confidence * 100)}% confidence</div>
                </div>
            `;
            foodList.appendChild(foodItem);
        });

        this.showScreen('results');
    }

    formatCookingMethod(method) {
        const methods = {
            'fried': '🍳 Fried',
            'baked': '🍞 Baked',
            'grilled': '🔥 Grilled',
            'steamed': '💨 Steamed',
            'raw': '🥗 Raw'
        };
        return methods[method] || method;
    }

    newAnalysis() {
        this.camera.stopCamera();
        this.init();
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
    }

    updateProgress(message, percentage) {
        document.getElementById('loading-details').textContent = message;
        document.getElementById('progress-fill').style.width = `${percentage}%`;
    }

    showError(message) {
        this.updateProgress(message, 0);
        setTimeout(() => {
            this.retakePhoto();
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CalorieSnap();
});