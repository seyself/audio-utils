"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audioBufferToWav = audioBufferToWav;
function audioBufferToWav(audioBuffer) {
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    console.log({ numberOfChannels, sampleRate, format, bitDepth });
    // インターリーブされたデータの作成
    const length = audioBuffer.length * numberOfChannels * 2; // 2 bytes per sample
    const buffer = new ArrayBuffer(44 + length); // 44 bytes for WAV header
    const view = new DataView(buffer);
    // WAVヘッダーの書き込み
    // "RIFF"チャンク
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + length, true);
    writeString(view, 8, 'WAVE');
    // "fmt "チャンク
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // fmt チャンクのサイズ
    view.setUint16(20, format, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true); // バイトレート
    view.setUint16(32, numberOfChannels * 2, true); // ブロックアライン
    view.setUint16(34, bitDepth, true);
    // "data"チャンク
    writeString(view, 36, 'data');
    view.setUint32(40, length, true);
    // オーディオデータの書き込み
    const offset = 44;
    const channels = [];
    for (let i = 0; i < numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
    }
    let index = 0;
    const volume = 0x7FFF; // 16-bit の最大値
    for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
            const sample = Math.max(-1, Math.min(1, channels[channel][i]));
            const value = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            view.setInt16(offset + index, value, true);
            index += 2;
        }
    }
    return new Blob([buffer], { type: 'audio/wav' });
}
// ヘルパー関数: 文字列をバッファに書き込む
function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}
