export const stereoToMono = (audioBuffer) => {
    const channels = audioBuffer.numberOfChannels;
    const length = audioBuffer.length;
    const ctx = new AudioContext();
    const monoBuffer = ctx.createBuffer(1, length, audioBuffer.sampleRate);
    const monoData = monoBuffer.getChannelData(0);
    // ステレオチャンネルの平均を取ってモノラルに変換
    for (let i = 0; i < length; i++) {
        let sum = 0;
        for (let channel = 0; channel < channels; channel++) {
            sum += audioBuffer.getChannelData(channel)[i];
        }
        monoData[i] = sum / channels;
    }
    return monoBuffer;
};
// trimmedBuffer をモノラルに変換してから使用
// const monoBuffer = stereoToMono(trimmedBuffer);
// const trimmedBlob = await audioBufferToWav(monoBuffer);
