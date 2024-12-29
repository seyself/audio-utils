import { WavPackerAudioType } from "../wavtools/lib/wav_packer.js";
import { AudioTrimmer, TrimOptions } from "../AudioTrimmer.js";

export async function trimSilenceFromWavPacker(wavPackerResult: WavPackerAudioType, options?: TrimOptions): Promise<AudioBuffer> {
  // AudioBufferに変換してトリミング
  const response = await fetch(wavPackerResult.url);
  const arrayBuffer = await response.arrayBuffer();
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  const trimmedBuffer: AudioBuffer = AudioTrimmer.trimSilence(audioBuffer, {
    threshold: options?.threshold ?? 0.05,  // より高いしきい値
    marginBefore: options?.marginBefore ?? 0.0, // より長い先頭マージン
    marginAfter: options?.marginAfter ?? 0.0,  // より長い末尾マージン
  });
  return trimmedBuffer;
}


export async function trimSilence(audioBuffer: AudioBuffer, options?: TrimOptions): Promise<AudioBuffer> {
  const trimmedBuffer: AudioBuffer = AudioTrimmer.trimSilence(audioBuffer, {
    threshold: options?.threshold ?? 0.05,  // より高いしきい値
    marginBefore: options?.marginBefore ?? 0.0, // より長い先頭マージン
    marginAfter: options?.marginAfter ?? 0.0,  // より長い末尾マージン
  });
  return trimmedBuffer;
}
