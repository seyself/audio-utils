"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAudio = downloadAudio;
const audioBufferToWav_js_1 = require("./audioBufferToWav.js");
function downloadAudio(audioData, filename, type = 'wav') {
    if (audioData instanceof ArrayBuffer) {
        audioData = new Blob([audioData], { type: `audio/${type}` });
    }
    if (audioData instanceof AudioBuffer) {
        audioData = (0, audioBufferToWav_js_1.audioBufferToWav)(audioData);
    }
    const url = URL.createObjectURL(audioData);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
}
