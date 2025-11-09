class CameraManager {
    constructor() {
        this.stream = null;
        this.video = document.getElementById('video');
    }

    async requestCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;

            // iOS specific attributes
            this.video.setAttribute('playsinline', '');
            this.video.setAttribute('muted', '');

            return await this.video.play();
        } catch (error) {
            this.handleCameraError(error);
            throw error;
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.video) {
            this.video.srcObject = null;
        }
    }

    captureFrame() {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d', { alpha: false });

        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        ctx.drawImage(this.video, 0, 0);

        return canvas.toDataURL('image/jpeg', 0.92);
    }

    handleCameraError(error) {
        const errorScreen = document.getElementById('camera-error');
        const errorText = document.getElementById('error-text');

        const errorMessages = {
            'NotAllowedError': 'Camera permission denied. Please enable camera access in settings.',
            'NotFoundError': 'No camera found on this device.',
            'NotReadableError': 'Camera is being used by another app.',
            'OverconstrainedError': 'Camera does not support the required settings.',
            'TypeError': 'Camera API not supported on this browser.'
        };

        errorText.textContent = errorMessages[error.name] || 'Camera error occurred.';
        errorScreen.style.display = 'block';
    }
}

export default CameraManager;