import { AudioTrimmer } from "../AudioTrimmer.js";
export async function trimSilenceFromWavPacker(wavPackerResult, options) {
    // AudioBufferに変換してトリミング
    const response = await fetch(wavPackerResult.url);
    const arrayBuffer = await response.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const trimmedBuffer = AudioTrimmer.trimSilence(audioBuffer, {
        threshold: options?.threshold ?? 0.05, // より高いしきい値
        marginBefore: options?.marginBefore ?? 0.0, // より長い先頭マージン
        marginAfter: options?.marginAfter ?? 0.0, // より長い末尾マージン
    });
    return trimmedBuffer;
}
export async function trimSilence(audioBuffer, options) {
    const trimmedBuffer = AudioTrimmer.trimSilence(audioBuffer, {
        threshold: options?.threshold ?? 0.05, // より高いしきい値
        marginBefore: options?.marginBefore ?? 0.0, // より長い先頭マージン
        marginAfter: options?.marginAfter ?? 0.0, // より長い末尾マージン
    });
    return trimmedBuffer;
}
