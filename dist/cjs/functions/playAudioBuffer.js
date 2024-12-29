"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playAudioBuffer = void 0;
const audioBufferToWav_js_1 = require("./audioBufferToWav.js");
const playAudioBuffer = async (audioBuffer, useAudioElement = false) => {
    if (useAudioElement) {
        const audioBlob = await (0, audioBufferToWav_js_1.audioBufferToWav)(audioBuffer);
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
exports.playAudioBuffer = playAudioBuffer;
