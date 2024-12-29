
export async function loadWavFile(filePath: string): Promise<AudioBuffer> {
  const response: Response = await fetch(filePath);
  const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
  const audioContext: AudioContext = new AudioContext();
  return audioContext.decodeAudioData(arrayBuffer);
}


