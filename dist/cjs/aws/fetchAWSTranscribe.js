"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchAWSTranscribe = void 0;
const fetchAWSTranscribe = async (audioData) => {
    // Step 1: POST audio data and start transcription
    const formData = new FormData();
    formData.append('audio', audioData);
    const uploadResponse = await fetch('/api/transcribe', {
        method: 'POST',
        body: audioData,
    });
    const { jobName } = await uploadResponse.json();
    // Step 2: Poll for transcription completion
    const maxAttempts = 60; // 5分間のポーリング（5秒間隔）
    let attempts = 0;
    while (attempts < maxAttempts) {
        const response = await fetch(`/api/transcribe?jobName=${jobName}`);
        const data = await response.json();
        if (data.status === 'COMPLETED') {
            return data.results;
        }
        else if (data.status === 'FAILED') {
            throw new Error('Transcription failed');
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5秒待機
    }
    throw new Error('Transcription timeout');
};
exports.fetchAWSTranscribe = fetchAWSTranscribe;
