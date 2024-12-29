import { audioBufferToWav } from './audioBufferToWav.js';
export const playAudioBuffer = async (audioBuffer, useAudioElement = false) => {
    if (useAudioElement) {
        const audioBlob = await audioBufferToWav(audioBuffer);
        const audioUrl = URL.createObjectURL(audioBlob);
        const audioElement = new Audio();
        audioElement.src = audioUrl;
        audioElement.play();
    }
    else {
        const audioContext = new AudioContext();
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
    }
};
