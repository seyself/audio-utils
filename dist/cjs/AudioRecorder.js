"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioRecorder = void 0;
class AudioRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.init();
    }
    async init() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
        }
        catch (error) {
            console.error('マイクへのアクセスに失敗しました:', error);
            throw error;
        }
    }
    async startRecording() {
        if (!this.mediaRecorder || this.isRecording)
            return;
        this.audioChunks = [];
        this.isRecording = true;
        this.mediaRecorder.start();
    }
    async stopRecording() {
        return new Promise((resolve) => {
            if (!this.mediaRecorder || !this.isRecording) {
                resolve(new Blob());
                return;
            }
            this.mediaRecorder.onstop = () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                this.isRecording = false;
                resolve(audioBlob);
            };
            this.mediaRecorder.stop();
        });
    }
    isCurrentlyRecording() {
        return this.isRecording;
    }
}
exports.AudioRecorder = AudioRecorder;
