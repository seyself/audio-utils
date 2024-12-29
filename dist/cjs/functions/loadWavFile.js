"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadWavFile = loadWavFile;
async function loadWavFile(filePath) {
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new AudioContext();
    return audioContext.decodeAudioData(arrayBuffer);
}
