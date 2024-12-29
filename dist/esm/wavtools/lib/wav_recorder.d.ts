/**
 * Decodes audio into a wav file
 * @typedef {Object} DecodedAudioType
 * @property {Blob} blob
 * @property {string} url
 * @property {Float32Array} values
 * @property {AudioBuffer} audioBuffer
 */
/**
 * Records live stream of user audio as PCM16 "audio/wav" data
 * @class
 */
export declare class WavRecorder {
    scriptSrc: any;
    sampleRate: number;
    outputToSpeakers: boolean;
    debug: boolean;
    _deviceChangeCallback: (() => Promise<void>) | null;
    _devices: any[];
    stream: any;
    processor: any;
    source: any;
    node: any;
    recording: boolean;
    analyser: any;
    _lastEventId: number;
    eventReceipts: any;
    eventTimeout: number;
    _chunkProcessorSize: number | undefined;
    _chunkProcessor: any;
    _chunkProcessorBuffer: {
        raw: ArrayBuffer;
        mono: ArrayBuffer;
    };
    /**
     * Create a new WavRecorder instance
     * @param {{sampleRate?: number, outputToSpeakers?: boolean, debug?: boolean}} [options]
     * @returns {WavRecorder}
     */
    constructor({ sampleRate, outputToSpeakers, debug, }?: {
        sampleRate?: number;
        outputToSpeakers?: boolean;
        debug?: boolean;
    });
    /**
     * Decodes audio data from multiple formats to a Blob, url, Float32Array and AudioBuffer
     * @param {Blob|Float32Array|Int16Array|ArrayBuffer|number[]} audioData
     * @param {number} sampleRate
     * @param {number} fromSampleRate
     * @returns {Promise<DecodedAudioType>}
     */
    static decode(audioData: Blob | Float32Array | Int16Array | ArrayBuffer | number[], sampleRate?: number, fromSampleRate?: number): Promise<DecodedAudioType>;
    /**
     * Logs data in debug mode
     * @param {...any} arguments
     * @returns {true}
     */
    log(...args: any[]): boolean;
    /**
     * Retrieves the current sampleRate for the recorder
     * @returns {number}
     */
    getSampleRate(): number;
    /**
     * Retrieves the current status of the recording
     * @returns {"ended"|"paused"|"recording"}
     */
    getStatus(): "ended" | "paused" | "recording";
    /**
     * Sends an event to the AudioWorklet
     * @private
     * @param {string} name
     * @param {{[key: string]: any}} data
     * @param {AudioWorkletNode} [_processor]
     * @returns {Promise<{[key: string]: any}>}
     */
    _event(name: string, data?: {
        [key: string]: any;
    }, _processor?: AudioWorkletNode | null): Promise<any>;
    /**
     * Sets device change callback, remove if callback provided is `null`
     * @param {(Array<MediaDeviceInfo & {default: boolean}>): void|null} callback
     * @returns {true}
     */
    listenForDeviceChange(callback: any): boolean;
    /**
     * Manually request permission to use the microphone
     * @returns {Promise<true>}
     */
    requestPermission(): Promise<boolean>;
    /**
     * List all eligible devices for recording, will request permission to use microphone
     * @returns {Promise<Array<MediaDeviceInfo & {default: boolean}>>}
     */
    listDevices(): Promise<any[]>;
    /**
     * Begins a recording session and requests microphone permissions if not already granted
     * Microphone recording indicator will appear on browser tab but status will be "paused"
     * @param {string} [deviceId] if no device provided, default device will be used
     * @returns {Promise<true>}
     */
    begin(deviceId?: string | undefined): Promise<boolean>;
    /**
     * Gets the current frequency domain data from the recording track
     * @param {"frequency"|"music"|"voice"} [analysisType]
     * @param {number} [minDecibels] default -100
     * @param {number} [maxDecibels] default -30
     * @returns {import('./analysis/audio_analysis.js').AudioAnalysisOutputType}
     */
    getFrequencies(analysisType?: 'frequency' | 'music' | 'voice', minDecibels?: number, maxDecibels?: number): {
        values: Float32Array;
        frequencies: number[];
        labels: string[];
    };
    /**
     * Pauses the recording
     * Keeps microphone stream open but halts storage of audio
     * @returns {Promise<true>}
     */
    pause(): Promise<boolean>;
    /**
     * Start recording stream and storing to memory from the connected audio source
     * @param {(data: { mono: Int16Array; raw: Int16Array }) => any} [chunkProcessor]
     * @param {number} [chunkSize] chunkProcessor will not be triggered until this size threshold met in mono audio
     * @returns {Promise<true>}
     */
    record(chunkProcessor?: any, chunkSize?: number): Promise<boolean>;
    /**
     * Clears the audio buffer, empties stored recording
     * @returns {Promise<true>}
     */
    clear(): Promise<boolean>;
    /**
     * Reads the current audio stream data
     * @returns {Promise<{meanValues: Float32Array, channels: Array<Float32Array>}>}
     */
    read(): Promise<any>;
    /**
     * Saves the current audio stream to a file
     * @param {boolean} [force] Force saving while still recording
     * @returns {Promise<import('./wav_packer.js').WavPackerAudioType>}
     */
    save(force?: boolean): Promise<import("./wav_packer.js").WavPackerAudioType>;
    /**
     * Ends the current recording session and saves the result
     * @returns {Promise<import('./wav_packer.js').WavPackerAudioType>}
     */
    end(): Promise<import("./wav_packer.js").WavPackerAudioType>;
    /**
     * Performs a full cleanup of WavRecorder instance
     * Stops actively listening via microphone and removes existing listeners
     * @returns {Promise<true>}
     */
    quit(): Promise<boolean>;
}
/**
 * Decodes audio into a wav file
 */
export type DecodedAudioType = {
    blob: Blob;
    url: string;
    values: Float32Array;
    audioBuffer: AudioBuffer;
};
//# sourceMappingURL=wav_recorder.d.ts.map