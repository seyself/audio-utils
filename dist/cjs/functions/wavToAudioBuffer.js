"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wavToAudioBuffer = wavToAudioBuffer;
async function wavToAudioBuffer(wavBlob) {
    const audioContext = new AudioContext();
    const arrayBuffer = await wavBlob.arrayBuffer();
    return audioContext.decodeAudioData(arrayBuffer);
}
