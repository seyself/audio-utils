"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WavStreamPlayer = void 0;
const stream_processor_js_1 = require("./worklets/stream_processor.js");
const audio_analysis_js_1 = require("./analysis/audio_analysis.js");
/**
 * Plays audio streams received in raw PCM16 chunks from the browser
 * @class
 */
class WavStreamPlayer {
    /**
     * Creates a new WavStreamPlayer instance
     * @param {{sampleRate?: number}} options
     * @returns {WavStreamPlayer}
     */
    constructor({ sampleRate = 44100 } = {}) {
        this.scriptSrc = stream_processor_js_1.StreamProcessorSrc;
        this.sampleRate = sampleRate;
        this.context = null;
        this.stream = null;
        this.analyser = null;
        this.trackSampleOffsets = {};
        this.interruptedTrackIds = {};
        this.listeners = {
            start: [],
            stop: [],
            connect: [],
            disconnect: [],
            interrupt: [],
            resume: [],
            error: []
        };
    }
    /**
     * Connects the audio context and enables output to speakers
     * @returns {Promise<true>}
     */
    async connect() {
        this.context = new AudioContext({ sampleRate: this.sampleRate });
        if (this.context.state === 'suspended') {
            await this.context.resume();
        }
        try {
            await this.context.audioWorklet.addModule(this.scriptSrc);
            const analyser = this.context.createAnalyser();
            analyser.fftSize = 8192;
            analyser.smoothingTimeConstant = 0.1;
            this.analyser = analyser;
            this._emit('connect');
            return true;
        }
        catch (e) {
            console.error(e);
            this._emit('error', new Error(`Could not add audioWorklet module: ${this.scriptSrc}`));
            throw e;
        }
    }
    /**
     * Disconnects the audio context
     */
    disconnect() {
        if (this.context) {
            this.context.close();
            this.context = null;
            this.analyser = null;
            this._emit('disconnect');
        }
    }
    /**
     * Gets the current frequency domain data from the playing track
     * @param {"frequency"|"music"|"voice"} [analysisType]
     * @param {number} [minDecibels] default -100
     * @param {number} [maxDecibels] default -30
     * @returns {import('./analysis/audio_analysis.js').AudioAnalysisOutputType}
     */
    getFrequencies(analysisType = 'frequency', minDecibels = -100, maxDecibels = -30) {
        if (!this.analyser) {
            throw new Error('Not connected, please call .connect() first');
        }
        return audio_analysis_js_1.AudioAnalysis.getFrequencies(this.analyser, this.sampleRate, null, analysisType, minDecibels, maxDecibels);
    }
    /**
     * Starts audio streaming
     * @private
     * @returns {Promise<true>}
     */
    _start() {
        if (!this.context || !this.analyser) {
            throw new Error('Audio context is not initialized');
        }
        const streamNode = new AudioWorkletNode(this.context, 'stream_processor');
        streamNode.connect(this.context.destination);
        streamNode.port.onmessage = (e) => {
            const { event } = e.data;
            if (event === 'stop') {
                streamNode.disconnect();
                this.stream = null;
                this._emit('stop'); // 停止イベントを発火
            }
            else if (event === 'offset') {
                const { requestId, trackId, offset } = e.data;
                const currentTime = offset / this.sampleRate;
                this.trackSampleOffsets[requestId] = { trackId, offset, currentTime };
            }
        };
        this.analyser.disconnect();
        streamNode.connect(this.analyser);
        this.stream = streamNode;
        this._emit('start'); // 開始イベントを発火
        return true;
    }
    /**
     * Adds 16BitPCM data to the currently playing audio stream
     * You can add chunks beyond the current play point and they will be queued for play
     * @param {ArrayBuffer|Int16Array} arrayBuffer
     * @param {string} [trackId]
     * @returns {Int16Array}
     */
    add16BitPCM(arrayBuffer, trackId = 'default') {
        if (typeof trackId !== 'string') {
            throw new Error(`trackId must be a string`);
        }
        else if (this.interruptedTrackIds[trackId]) {
            return;
        }
        if (!this.stream) {
            this._start();
        }
        let buffer;
        if (arrayBuffer instanceof Int16Array) {
            buffer = arrayBuffer;
        }
        else if (arrayBuffer instanceof ArrayBuffer) {
            buffer = new Int16Array(arrayBuffer);
        }
        else {
            throw new Error(`argument must be Int16Array or ArrayBuffer`);
        }
        this.stream?.port.postMessage({ event: 'write', buffer, trackId });
        return buffer;
    }
    /**
     * Gets the offset (sample count) of the currently playing stream
     * @param {boolean} [interrupt]
     * @returns {{trackId: string|null, offset: number, currentTime: number}}
     */
    async getTrackSampleOffset(interrupt = false) {
        if (!this.stream) {
            return null;
        }
        const requestId = crypto.randomUUID();
        this.stream.port.postMessage({
            event: interrupt ? 'interrupt' : 'offset',
            requestId,
        });
        let trackSampleOffset;
        while (!trackSampleOffset) {
            trackSampleOffset = this.trackSampleOffsets[requestId];
            await new Promise((r) => setTimeout(() => r(), 1));
        }
        const { trackId } = trackSampleOffset;
        if (interrupt && trackId) {
            this.interruptedTrackIds[trackId] = true;
        }
        return trackSampleOffset;
    }
    /**
     * Strips the current stream and returns the sample offset of the audio
     * @param {boolean} [interrupt]
     * @returns {{trackId: string|null, offset: number, currentTime: number}}
     */
    async interrupt() {
        const result = await this.getTrackSampleOffset(true);
        this._emit('interrupt', result);
        return result;
    }
    /**
     * Resumes playback after an interrupt
     */
    resume() {
        if (this.interruptedTrackIds) {
            this.interruptedTrackIds = {};
            this._emit('resume');
        }
    }
    /**
     * Adds an event listener
     * @param {'start'|'stop'|'connect'|'disconnect'|'interrupt'|'resume'|'error'} event
     * @param {Function} callback
     */
    addEventListener(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }
    /**
     * Removes an event listener
     * @param {'start'|'stop'|'connect'|'disconnect'|'interrupt'|'resume'|'error'} event
     * @param {Function} callback
     */
    removeEventListener(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
    /**
     * Emits an event
     * @private
     * @param {'start'|'stop'|'connect'|'disconnect'|'interrupt'|'resume'|'error'} event
     * @param {any} [data] - Optional data to pass to the event listeners
     */
    _emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}
exports.WavStreamPlayer = WavStreamPlayer;
