/**
 * Output of AudioAnalysis for the frequency domain of the audio
 * @typedef {Object} AudioAnalysisOutputType
 * @property {Float32Array} values Amplitude of this frequency between {0, 1} inclusive
 * @property {number[]} frequencies Raw frequency bucket values
 * @property {string[]} labels Labels for the frequency bucket values
 */
/**
 * Analyzes audio for visual output
 * @class
 */
export declare class AudioAnalysis {
    fftResults: any[];
    audio: HTMLAudioElement;
    context: any;
    analyser: any;
    sampleRate: any;
    audioBuffer: any;
    /**
     * Retrieves frequency domain data from an AnalyserNode adjusted to a decibel range
     * returns human-readable formatting and labels
     * @param {AnalyserNode} analyser
     * @param {number} sampleRate
     * @param {Float32Array} [fftResult]
     * @param {"frequency"|"music"|"voice"} [analysisType]
     * @param {number} [minDecibels] default -100
     * @param {number} [maxDecibels] default -30
     * @returns {AudioAnalysisOutputType}
     */
    static getFrequencies(analyser: AnalyserNode, sampleRate: number, fftResult: Float32Array | null, analysisType?: 'frequency' | 'music' | 'voice', minDecibels?: number, maxDecibels?: number): {
        values: Float32Array;
        frequencies: number[];
        labels: string[];
    };
    /**
     * Creates a new AudioAnalysis instance for an HTMLAudioElement
     * @param {HTMLAudioElement} audioElement
     * @param {AudioBuffer|null} [audioBuffer] If provided, will cache all frequency domain data from the buffer
     * @returns {AudioAnalysis}
     */
    constructor(audioElement: HTMLAudioElement, audioBuffer?: AudioBuffer | null);
    /**
     * Gets the current frequency domain data from the playing audio track
     * @param {"frequency"|"music"|"voice"} [analysisType]
     * @param {number} [minDecibels] default -100
     * @param {number} [maxDecibels] default -30
     * @returns {AudioAnalysisOutputType}
     */
    getFrequencies(analysisType?: 'frequency' | 'music' | 'voice', minDecibels?: number, maxDecibels?: number): {
        values: Float32Array;
        frequencies: number[];
        labels: string[];
    };
    /**
     * Resume the internal AudioContext if it was suspended due to the lack of
     * user interaction when the AudioAnalysis was instantiated.
     * @returns {Promise<true>}
     */
    resumeIfSuspended(): Promise<boolean>;
}
//# sourceMappingURL=audio_analysis.d.ts.map