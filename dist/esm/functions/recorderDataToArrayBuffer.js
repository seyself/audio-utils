export async function recorderDataToArrayBuffer(recorderData) {
    const response = await fetch(recorderData.url);
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
}
export async function arrayBufferToAudioBuffer(arrayBuffer) {
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    return audioBuffer;
}
