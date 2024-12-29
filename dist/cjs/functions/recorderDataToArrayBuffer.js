"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recorderDataToArrayBuffer = recorderDataToArrayBuffer;
exports.arrayBufferToAudioBuffer = arrayBufferToAudioBuffer;
async function recorderDataToArrayBuffer(recorderData) {
    const response = await fetch(recorderData.url);
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
}
async function arrayBufferToAudioBuffer(arrayBuffer) {
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
}
