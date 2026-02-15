// Gestik-Training Game
// Hand gesture recognition for seniors recovering from strokes

class GestikTrainingGame {
    constructor() {
        // Available gestures for hand mode
        this.handGestures = [
            { emoji: '👍', name: 'Daumen hoch', detect: (h) => this.detectThumbsUp(h) },
            { emoji: '👎', name: 'Daumen runter', detect: (h) => this.detectThumbsDown(h) },
            { emoji: '✌️', name: 'Victory/Peace', detect: (h) => this.detectPeace(h) },
            { emoji: '🤙', name: 'Hang Loose', detect: (h) => this.detectHangLoose(h) },
            { emoji: '👊', name: 'Faust', detect: (h) => this.detectFist(h) },
            { emoji: '✋', name: 'Offene Hand', detect: (h) => this.detectOpenHand(h) },
            { emoji: '☝️', name: 'Zeigefinger', detect: (h) => this.detectPointing(h) },
            { emoji: '🤞', name: 'Gekreuzte Finger', detect: (h) => this.detectCrossedFingers(h) },
            { emoji: '👌', name: 'OK-Zeichen', detect: (h) => this.detectOK(h) },
            { emoji: '🖐️', name: 'High Five', detect: (h) => this.detectOpenHand(h) }
        ];

        // Arm movement gestures
        this.armGestures = [
            { emoji: '🙌', name: 'Hände hoch', detect: (h) => this.detectHandsUp(h) },
            { emoji: '👐', name: 'Hände offen', detect: (h) => this.detectHandsOpen(h) },
            { emoji: '🙏', name: 'Hände zusammen', detect: (h) => this.detectHandsTogether(h) },
            { emoji: '👋', name: 'Winken', detect: (h) => this.detectWaving(h) },
            { emoji: '💪', name: 'Muskel zeigen', detect: (h) => this.detectMuscle(h) }
        ];

        // Difficulty settings - VERY FORGIVING for seniors!
        this.difficultySettings = {
            easy: { timePerGesture: 20, requiredHoldTime: 0.5, totalRounds: 6, fuzzyThreshold: 0.4 },
            medium: { timePerGesture: 15, requiredHoldTime: 0.6, totalRounds: 8, fuzzyThreshold: 0.5 },
            hard: { timePerGesture: 10, requiredHoldTime: 0.8, totalRounds: 10, fuzzyThreshold: 0.6 }
        };

        // Encouraging messages
        this.encouragements = ['👏 Super!', '🌟 Toll!', '💪 Weiter so!', '✨ Perfekt!', '🎯 Getroffen!'];
        
        this.resultMessages = {
            excellent: ['🏆 Hervorragend!', 'Fantastische Koordination!'],
            good: ['🌟 Sehr gut!', 'Deine Bewegungen werden immer besser!'],
            okay: ['👍 Gut gemacht!', 'Übung macht den Meister!'],
            tryAgain: ['💪 Kopf hoch!', 'Jeder Versuch zählt!']
        };

        // Game state
        this.score = 0;
        this.currentRound = 0;
        this.totalRounds = 10;
        this.timeLeft = 10;
        this.isRunning = false;
        this.isPaused = false;
        this.currentGesture = null;
        this.gestureHoldTime = 0;
        this.matchPercentage = 0;
        this.recognizedCount = 0;
        this.bestTime = null;
        this.mode = 'hands'; // 'hands' or 'arms'
        this.selectedHand = 'right'; // 'left', 'right', 'both'
        this.difficulty = 'easy';
        this.settings = null;

        // MediaPipe
        this.hands = null;
        this.camera = null;
        this.lastHandResults = null;
        this.handDetected = false;
        this.gestureStartTime = null;
        this.wavingHistory = [];

        // Timers
        this.countdownTimer = null;
        this.lastFrameTime = 0;

        // DOM elements
        this.screens = {
            start: document.getElementById('start-screen'),
            game: document.getElementById('game-screen'),
            pause: document.getElementById('pause-screen'),
            result: document.getElementById('result-screen'),
            loading: document.getElementById('loading-screen'),
            error: document.getElementById('error-screen')
        };

        this.elements = {
            score: document.getElementById('score'),
            timer: document.getElementById('timer'),
            round: document.getElementById('round'),
            targetEmoji: document.getElementById('target-emoji'),
            targetName: document.getElementById('target-name'),
            handInstruction: document.getElementById('hand-instruction'),
            camera: document.getElementById('camera'),
            overlay: document.getElementById('overlay'),
            detectionStatus: document.getElementById('detection-status'),
            progressCircle: document.getElementById('progress-circle'),
            matchPercent: document.getElementById('match-percent'),
            gestureSuccess: document.getElementById('gesture-success'),
            difficulty: document.getElementById('difficulty'),
            finalScore: document.getElementById('final-score'),
            finalRecognized: document.getElementById('final-recognized'),
            finalAccuracy: document.getElementById('final-accuracy'),
            finalBestTime: document.getElementById('final-best-time'),
            resultTitle: document.getElementById('result-title'),
            encouragement: document.getElementById('encouragement'),
            errorMessage: document.getElementById('error-message')
        };

        this.init();
    }

    init() {
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.mode = btn.dataset.mode;
            });
        });

        // Hand buttons
        document.querySelectorAll('.hand-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.hand-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedHand = btn.dataset.hand;
            });
        });

        // Other buttons
        document.getElementById('start-btn').addEventListener('click', () => this.initCamera());
        document.getElementById('pause-btn').addEventListener('click', () => this.pauseGame());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.quitGame());
        document.getElementById('replay-btn').addEventListener('click', () => this.initCamera());
        document.getElementById('home-btn').addEventListener('click', () => this.showScreen('start'));
        document.getElementById('retry-btn').addEventListener('click', () => this.initCamera());
        document.getElementById('back-btn').addEventListener('click', () => this.showScreen('start'));

        // Visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.isRunning && !this.isPaused) {
                this.pauseGame();
            }
        });
    }

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
    }

    async initCamera() {
        this.showScreen('loading');

        try {
            // Initialize MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            this.hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.5
            });

            this.hands.onResults((results) => this.onHandResults(results));

            // Get camera stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
            });

            this.elements.camera.srcObject = stream;
            await this.elements.camera.play();

            // Set canvas size
            this.elements.overlay.width = this.elements.camera.videoWidth;
            this.elements.overlay.height = this.elements.camera.videoHeight;

            // Start camera processing
            this.camera = new Camera(this.elements.camera, {
                onFrame: async () => {
                    if (this.isRunning && !this.isPaused) {
                        await this.hands.send({ image: this.elements.camera });
                    }
                },
                width: 640,
                height: 480
            });

            await this.camera.start();
            this.startGame();

        } catch (error) {
            console.error('Camera/MediaPipe error:', error);
            this.elements.errorMessage.textContent = 
                error.name === 'NotAllowedError' 
                    ? 'Kamerazugriff wurde verweigert. Bitte erlaube den Zugriff.'
                    : 'Kamera konnte nicht gestartet werden: ' + error.message;
            this.showScreen('error');
        }
    }

    startGame() {
        // Reset state
        this.score = 0;
        this.currentRound = 0;
        this.recognizedCount = 0;
        this.bestTime = null;
        this.isRunning = true;
        this.isPaused = false;
        this.gestureHoldTime = 0;
        this.matchPercentage = 0;
        this.wavingHistory = [];

        // Get settings
        this.difficulty = this.elements.difficulty.value;
        this.settings = { ...this.difficultySettings[this.difficulty] };
        this.totalRounds = this.settings.totalRounds;
        this.timeLeft = this.settings.timePerGesture;

        // Update UI
        this.updateUI();
        this.showScreen('game');
        this.screens.pause.classList.remove('active');

        // Start first round
        this.nextRound();
    }

    nextRound() {
        this.currentRound++;
        
        if (this.currentRound > this.totalRounds) {
            this.endGame();
            return;
        }

        // Reset round state
        this.timeLeft = this.settings.timePerGesture;
        this.gestureHoldTime = 0;
        this.matchPercentage = 0;
        this.gestureStartTime = null;
        this.updateProgress(0);

        // Select random gesture
        const gestures = this.mode === 'hands' ? this.handGestures : this.armGestures;
        this.currentGesture = gestures[Math.floor(Math.random() * gestures.length)];

        // Update instruction based on hand selection
        if (this.mode === 'hands') {
            const handText = this.selectedHand === 'both' ? 'Beide Hände:' : 
                            this.selectedHand === 'left' ? 'Linke Hand:' : 'Rechte Hand:';
            this.elements.handInstruction.textContent = handText;
        } else {
            this.elements.handInstruction.textContent = 'Mache nach:';
        }

        // Update display
        this.elements.targetEmoji.textContent = this.currentGesture.emoji;
        this.elements.targetName.textContent = this.currentGesture.name;
        this.updateUI();

        // Start countdown
        clearInterval(this.countdownTimer);
        this.countdownTimer = setInterval(() => {
            if (!this.isPaused && this.isRunning) {
                this.timeLeft--;
                this.elements.timer.textContent = this.timeLeft;

                if (this.timeLeft <= 0) {
                    // Time's up - move to next round
                    clearInterval(this.countdownTimer);
                    this.nextRound();
                }
            }
        }, 1000);
    }

    onHandResults(results) {
        if (!this.isRunning || this.isPaused) return;

        const ctx = this.elements.overlay.getContext('2d');
        ctx.clearRect(0, 0, this.elements.overlay.width, this.elements.overlay.height);

        // Draw hand landmarks
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            this.handDetected = true;
            this.elements.detectionStatus.textContent = 'Hand erkannt ✓';
            this.elements.detectionStatus.classList.add('detected');

            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];
                const handedness = results.multiHandedness[i].label; // 'Left' or 'Right'

                // Draw connections
                drawConnectors(ctx, landmarks, HAND_CONNECTIONS, 
                    { color: handedness === 'Left' ? '#FF6B6B' : '#4ECDC4', lineWidth: 3 });
                drawLandmarks(ctx, landmarks, 
                    { color: handedness === 'Left' ? '#FF6B6B' : '#4ECDC4', lineWidth: 1, radius: 5 });
            }

            // Check gesture
            this.checkGesture(results);
        } else {
            this.handDetected = false;
            this.elements.detectionStatus.textContent = 'Zeige deine Hand...';
            this.elements.detectionStatus.classList.remove('detected');
            this.gestureHoldTime = 0;
            this.gestureStartTime = null;
            this.updateProgress(0);
        }

        this.lastHandResults = results;
    }

    checkGesture(results) {
        if (!this.currentGesture) return;

        // Filter hands based on selection
        let relevantHands = [];
        for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const handedness = results.multiHandedness[i].label.toLowerCase();
            // MediaPipe mirrors - Left in results is actually right hand visually
            const actualHand = handedness === 'left' ? 'right' : 'left';
            
            if (this.selectedHand === 'both' || this.selectedHand === actualHand) {
                relevantHands.push({
                    landmarks: results.multiHandLandmarks[i],
                    handedness: actualHand
                });
            }
        }

        if (relevantHands.length === 0) {
            this.matchPercentage = 0;
            this.updateProgress(0);
            return;
        }

        // Check gesture detection
        let isMatch = false;
        try {
            if (this.mode === 'arms') {
                isMatch = this.currentGesture.detect(results);
            } else {
                // For hand gestures, check each relevant hand
                for (const hand of relevantHands) {
                    if (this.currentGesture.detect(hand.landmarks)) {
                        isMatch = true;
                        break;
                    }
                }
            }
        } catch (e) {
            console.error('Gesture detection error:', e);
        }

        // FUZZY MATCHING - be very forgiving!
        // Any hand movement counts as partial progress
        if (relevantHands.length > 0) {
            // Base progress just for showing hand
            this.matchPercentage = Math.min(100, this.matchPercentage + 8);
            
            if (isMatch) {
                // Fast progress on match
                this.matchPercentage = Math.min(100, this.matchPercentage + 25);
                
                // Track hold time
                if (!this.gestureStartTime) {
                    this.gestureStartTime = Date.now();
                }
                this.gestureHoldTime = (Date.now() - this.gestureStartTime) / 1000;
                
                // Check if held long enough - VERY SHORT hold time!
                if (this.gestureHoldTime >= this.settings.requiredHoldTime) {
                    this.gestureRecognized();
                }
            } else {
                // Partial match - still give some credit for trying!
                // Reset hold time but keep some progress
                this.gestureStartTime = null;
                this.gestureHoldTime = 0;
                // Slow decay - don't punish too hard
                this.matchPercentage = Math.max(30, this.matchPercentage - 2);
            }
            
            // AUTO-SUCCESS after showing hand for a while (motivation boost!)
            if (this.matchPercentage >= 95 && !isMatch) {
                // If they've been trying for a while, give them the point anyway
                this.gestureRecognized();
            }
        } else {
            // No hand visible - slow decay
            this.matchPercentage = Math.max(0, this.matchPercentage - 3);
            this.gestureStartTime = null;
            this.gestureHoldTime = 0;
        }

        this.updateProgress(this.matchPercentage);
    }

    gestureRecognized() {
        clearInterval(this.countdownTimer);
        
        // Calculate score based on remaining time
        const timeBonus = Math.round(this.timeLeft * 10);
        const roundScore = 50 + timeBonus;
        this.score += roundScore;
        this.recognizedCount++;

        // Track best time
        const timeTaken = this.settings.timePerGesture - this.timeLeft;
        if (!this.bestTime || timeTaken < this.bestTime) {
            this.bestTime = timeTaken;
        }

        // Show success animation
        this.showSuccess();

        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        // Next round after delay
        setTimeout(() => {
            this.elements.gestureSuccess.classList.add('hidden');
            this.nextRound();
        }, 1500);

        this.updateUI();
    }

    showSuccess() {
        this.elements.gestureSuccess.classList.remove('hidden');
        const encouragement = this.encouragements[Math.floor(Math.random() * this.encouragements.length)];
        this.elements.gestureSuccess.querySelector('.success-text').textContent = encouragement;
    }

    updateProgress(percent) {
        const circumference = 2 * Math.PI * 45;
        const offset = circumference - (percent / 100) * circumference;
        this.elements.progressCircle.style.strokeDashoffset = offset;
        this.elements.matchPercent.textContent = Math.round(percent) + '%';
    }

    updateUI() {
        this.elements.score.textContent = this.score;
        this.elements.timer.textContent = this.timeLeft;
        this.elements.round.textContent = `${this.currentRound}/${this.totalRounds}`;
    }

    pauseGame() {
        this.isPaused = true;
        this.screens.pause.classList.add('active');
    }

    resumeGame() {
        this.isPaused = false;
        this.screens.pause.classList.remove('active');
    }

    quitGame() {
        this.endGame();
    }

    endGame() {
        this.isRunning = false;
        clearInterval(this.countdownTimer);

        // Stop camera
        if (this.camera) {
            this.camera.stop();
        }

        // Calculate stats
        const accuracy = this.totalRounds > 0 ? Math.round((this.recognizedCount / this.totalRounds) * 100) : 0;

        // Update result screen
        this.elements.finalScore.textContent = this.score;
        this.elements.finalRecognized.textContent = `${this.recognizedCount}/${this.totalRounds}`;
        this.elements.finalAccuracy.textContent = `${accuracy}%`;
        this.elements.finalBestTime.textContent = this.bestTime ? `${this.bestTime.toFixed(1)}s` : '-';

        // Set message
        let messageCategory;
        if (accuracy >= 80) messageCategory = 'excellent';
        else if (accuracy >= 60) messageCategory = 'good';
        else if (accuracy >= 30) messageCategory = 'okay';
        else messageCategory = 'tryAgain';

        const messages = this.resultMessages[messageCategory];
        this.elements.resultTitle.textContent = messages[0];
        this.elements.encouragement.textContent = messages[1];

        // Show result
        this.screens.pause.classList.remove('active');
        this.showScreen('result');
    }

    // ========== FUZZY GESTURE DETECTION - VERY FORGIVING! ==========

    // Helper: Check if finger is extended (with tolerance)
    isFingerExtended(landmarks, fingerTip, fingerPip) {
        // FUZZY: Allow some tolerance - finger doesn't need to be perfectly straight
        const tipY = landmarks[fingerTip].y;
        const pipY = landmarks[fingerPip].y;
        // Tolerance: tip can be slightly below pip
        return tipY < pipY + 0.05;
    }

    // Helper: Check if finger is curled (with tolerance)
    isFingerCurled(landmarks, fingerTip, fingerPip) {
        const tipY = landmarks[fingerTip].y;
        const pipY = landmarks[fingerPip].y;
        // FUZZY: Doesn't need to be fully curled
        return tipY > pipY - 0.08;
    }

    // Helper: Check if thumb is extended (VERY tolerant)
    isThumbExtended(landmarks) {
        const thumbTip = landmarks[4];
        const thumbIp = landmarks[3];
        const thumbMcp = landmarks[2];
        
        // FUZZY: Just check if thumb is somewhat away from palm
        const tipDist = Math.abs(thumbTip.x - thumbMcp.x) + Math.abs(thumbTip.y - thumbMcp.y);
        return tipDist > 0.08; // Very low threshold
    }

    // Helper: Get finger states (FUZZY version)
    getFingerStates(landmarks) {
        return {
            thumb: this.isThumbExtended(landmarks),
            index: this.isFingerExtended(landmarks, 8, 6),
            middle: this.isFingerExtended(landmarks, 12, 10),
            ring: this.isFingerExtended(landmarks, 16, 14),
            pinky: this.isFingerExtended(landmarks, 20, 18)
        };
    }

    // Count extended fingers (helper for fuzzy matching)
    countExtendedFingers(landmarks) {
        const fingers = this.getFingerStates(landmarks);
        let count = 0;
        if (fingers.thumb) count++;
        if (fingers.index) count++;
        if (fingers.middle) count++;
        if (fingers.ring) count++;
        if (fingers.pinky) count++;
        return count;
    }

    // 👍 Thumbs Up - FUZZY
    detectThumbsUp(landmarks) {
        const thumbTip = landmarks[4];
        const wrist = landmarks[0];
        const indexTip = landmarks[8];
        
        // FUZZY: Thumb should be roughly above wrist, other fingers roughly down
        const thumbUp = thumbTip.y < wrist.y + 0.1;
        const otherFingersDown = indexTip.y > thumbTip.y - 0.05;
        
        return thumbUp && otherFingersDown;
    }

    // 👎 Thumbs Down - FUZZY
    detectThumbsDown(landmarks) {
        const thumbTip = landmarks[4];
        const wrist = landmarks[0];
        const indexTip = landmarks[8];
        
        // FUZZY: Thumb below wrist level
        const thumbDown = thumbTip.y > wrist.y - 0.1;
        const otherFingersUp = indexTip.y < thumbTip.y + 0.05;
        
        return thumbDown && otherFingersUp;
    }

    // ✌️ Peace/Victory - FUZZY
    detectPeace(landmarks) {
        const fingers = this.getFingerStates(landmarks);
        // FUZZY: Just need index and middle up, ignore others
        return fingers.index && fingers.middle;
    }

    // 🤙 Hang Loose (Shaka) - FUZZY
    detectHangLoose(landmarks) {
        const fingers = this.getFingerStates(landmarks);
        // FUZZY: Thumb and pinky extended - other fingers don't matter as much
        return fingers.thumb && fingers.pinky;
    }

    // 👊 Fist - FUZZY
    detectFist(landmarks) {
        // FUZZY: Most fingers should be curled (3+ fingers curled counts)
        const extended = this.countExtendedFingers(landmarks);
        return extended <= 2; // Allow 1-2 fingers slightly extended
    }

    // ✋ Open Hand / 🖐️ High Five - FUZZY
    detectOpenHand(landmarks) {
        // FUZZY: Most fingers extended (3+ is enough)
        const extended = this.countExtendedFingers(landmarks);
        return extended >= 3;
    }

    // ☝️ Pointing - FUZZY
    detectPointing(landmarks) {
        const fingers = this.getFingerStates(landmarks);
        // FUZZY: Index finger up is the main requirement
        return fingers.index;
    }

    // 🤞 Crossed Fingers - FUZZY (simplified to just peace sign)
    detectCrossedFingers(landmarks) {
        // FUZZY: Same as peace - too hard to detect actual crossing
        return this.detectPeace(landmarks);
    }

    // 👌 OK Sign - FUZZY
    detectOK(landmarks) {
        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        
        // FUZZY: Thumb and index finger somewhat close
        const distance = Math.sqrt(
            Math.pow(thumbTip.x - indexTip.x, 2) + 
            Math.pow(thumbTip.y - indexTip.y, 2)
        );
        
        // VERY tolerant distance threshold
        return distance < 0.15;
    }

    // ========== ARM GESTURE DETECTION - FUZZY ==========

    // 🙌 Hands Up - FUZZY (works with 1 hand too!)
    detectHandsUp(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return false;
        
        // FUZZY: Even ONE hand up counts!
        for (const landmarks of results.multiHandLandmarks) {
            if (landmarks[0].y < 0.5) return true; // Very tolerant threshold
        }
        return false;
    }

    // 👐 Hands Open - FUZZY (works with 1 hand too!)
    detectHandsOpen(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return false;
        
        // FUZZY: One open hand is enough
        for (const landmarks of results.multiHandLandmarks) {
            if (this.detectOpenHand(landmarks)) return true;
        }
        return false;
    }

    // 🙏 Hands Together - FUZZY
    detectHandsTogether(results) {
        // FUZZY: If two hands visible and somewhat close, count it
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length < 2) {
            // Fallback: even one hand in center of screen counts
            if (results.multiHandLandmarks && results.multiHandLandmarks.length === 1) {
                const wrist = results.multiHandLandmarks[0][0];
                return wrist.x > 0.3 && wrist.x < 0.7; // Hand in center
            }
            return false;
        }
        
        const hand1 = results.multiHandLandmarks[0];
        const hand2 = results.multiHandLandmarks[1];
        const palm1 = hand1[9];
        const palm2 = hand2[9];
        
        const distance = Math.sqrt(
            Math.pow(palm1.x - palm2.x, 2) + 
            Math.pow(palm1.y - palm2.y, 2)
        );
        
        return distance < 0.3; // VERY tolerant
    }

    // 👋 Waving - FUZZY
    detectWaving(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return false;
        
        const hand = results.multiHandLandmarks[0];
        const wrist = hand[0];
        
        this.wavingHistory.push(wrist.x);
        if (this.wavingHistory.length > 10) {
            this.wavingHistory.shift();
        }
        
        // FUZZY: Only need minimal movement
        if (this.wavingHistory.length < 5) return false;
        
        let directionChanges = 0;
        let lastDirection = 0;
        
        for (let i = 1; i < this.wavingHistory.length; i++) {
            const diff = this.wavingHistory[i] - this.wavingHistory[i-1];
            const direction = diff > 0.005 ? 1 : (diff < -0.005 ? -1 : 0); // Very sensitive
            
            if (direction !== 0 && direction !== lastDirection && lastDirection !== 0) {
                directionChanges++;
            }
            if (direction !== 0) lastDirection = direction;
        }
        
        return directionChanges >= 1; // Just ONE direction change is enough!
    }

    // 💪 Muscle/Flexing - FUZZY
    detectMuscle(results) {
        if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) return false;
        
        // FUZZY: Any hand visible in upper half of screen counts!
        for (const landmarks of results.multiHandLandmarks) {
            const isFist = this.detectFist(landmarks);
            const wristVisible = landmarks[0].y < 0.7; // Very tolerant
            
            if (isFist && wristHigh) return true;
        }
        
        return false;
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.game = new GestikTrainingGame();
});
