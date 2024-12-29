import { WavPackerAudioType } from "../wavtools/lib/wav_packer.js";
import { TrimOptions } from "../AudioTrimmer.js";
export declare function trimSilenceFromWavPacker(wavPackerResult: WavPackerAudioType, options?: TrimOptions): Promise<AudioBuffer>;
export declare function trimSilence(audioBuffer: AudioBuffer, options?: TrimOptions): Promise<AudioBuffer>;
//# sourceMappingURL=trimSilenceFromWavPacker.d.ts.map