import { WavPackerAudioType } from '../wavtools/lib/wav_packer.js';

export async function recorderDataToArrayBuffer(recorderData: WavPackerAudioType): Promise<ArrayBuffer> {
  const response = await fetch(recorderData.url);
  const arrayBuffer = await response.arrayBuffer();
  return arrayBuffer;
}


export async function arrayBufferToAudioBuffer(arrayBuffer: ArrayBuffer): Promise<AudioBuffer> {
  const audioContext = new AudioContext();
  const audioBuffer: AudioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}
