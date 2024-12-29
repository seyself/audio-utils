import { audioBufferToWav } from './audioBufferToWav.js';

export const playAudioBuffer = async (audioBuffer: AudioBuffer, useAudioElement = false) => {
  if (useAudioElement) {
    const audioBlob: Blob = await audioBufferToWav(audioBuffer);
    const audioUrl: string = URL.createObjectURL(audioBlob);
    const audioElement = new Audio();
    audioElement.src = audioUrl;
    audioElement.play();
  } else {
    const audioContext = new AudioContext();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  }
}

