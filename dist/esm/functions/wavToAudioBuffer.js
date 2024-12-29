export async function wavToAudioBuffer(wavBlob) {
    const audioContext = new AudioContext();
    const arrayBuffer = await wavBlob.arrayBuffer();
    return audioContext.decodeAudioData(arrayBuffer);
}
