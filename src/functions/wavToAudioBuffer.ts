
export async function wavToAudioBuffer(wavBlob: Blob): Promise<AudioBuffer> {
  const audioContext = new AudioContext();
  const arrayBuffer = await wavBlob.arrayBuffer();
  return audioContext.decodeAudioData(arrayBuffer);
}
