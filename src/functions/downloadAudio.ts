import { audioBufferToWav } from './audioBufferToWav.js';

export function downloadAudio(audioData: Blob | AudioBuffer | ArrayBuffer, filename: string, type: 'wav' | 'mp3' = 'wav') {
  if (audioData instanceof ArrayBuffer) {
    audioData = new Blob([audioData], { type: `audio/${type}` });
  }
  if (audioData instanceof AudioBuffer) {
    audioData = audioBufferToWav(audioData);
  }
  const url = URL.createObjectURL(audioData);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
}

