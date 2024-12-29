export interface TrimOptions {
    threshold?: number;
    marginBefore?: number;
    marginAfter?: number;
}
export declare class AudioTrimmer {
    private static DEFAULT_OPTIONS;
    static trimSilence(audioBuffer: AudioBuffer, options?: TrimOptions): AudioBuffer;
    static analyzeSilenceLevel(audioBuffer: AudioBuffer): {
        min: number;
        max: number;
        avg: number;
    };
}
//# sourceMappingURL=AudioTrimmer.d.ts.map