/**
 * @example <code>
 * const stt = useRef<AzureSpeechRecognizer>(new AzureSpeechRecognizer({
 *   enableAudioAnalysis: true,
 *   fft: false,
 *   initialSilenceTimeoutMs: 10000,
 *   endSilenceTimeoutMs: 200,
 *   segmentationSilenceTimeoutMs: 200,
 *   onAudioAnalysis: (dataArray: Float32Array) => {
 *     setDataArray(dataArray);
 *   }
 * }));
 *
 * stt.current.startRecognition(inputDeviceId);
 *
 * stt.current.onRecognitionTextUpdated = (text, speakerId) => {
 *   console.log({text, speakerId});
 * }
 *
 * stt.current.onRecognitionTextEnd = (text, speakerId) => {
 *   console.log({text, speakerId});
 * }
 *
 * stt.current.stopRecognition();
 * </code>
 */
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import axios from 'axios';
import Cookie from 'universal-cookie';
import { writeWavToPushStream, loadAndWriteWavToPushStream } from '../functions/loadAndWriteWavToPushStream.js';
import { downloadAudio } from '../functions/downloadAudio.js';
const INPUT_PCM_SAMPLE_RATE = 16000;
const INPUT_PCM_CHANNELS = 1;
const INPUT_PCM_BITS_PER_SAMPLE = 16;
export default class AzureSpeechRecognizer {
    get audioContext() {
        return this._audioContext;
    }
    get analyser() {
        return this._analyser;
    }
    constructor(options = { enableAudioAnalysis: false }) {
        this._workletNode = null;
        this._audioSource = null;
        this.options = {
            enableAudioAnalysis: false,
            fft: false,
            debugRecording: false,
            useInputStream: true,
            useInputMicStream: true,
            useInputFileStream: true,
            useBuffering: false,
            bufferTimeSec: 0.1,
            initialSilenceTimeoutMs: 10000,
            endSilenceTimeoutMs: 200,
            segmentationSilenceTimeoutMs: 200,
            speechLanguage: "ja-JP",
            recoMode: "CONVERSATION",
        };
        this._recognizer = null;
        this._textList = [];
        this._startTime = 0;
        this._audioInputDeviceId = null;
        this._systemText = '';
        this._isRecording = false;
        this._audioConfig = null;
        this._audioContext = null;
        this._analyser = null;
        this._mediaStream = null;
        this._pushStream = null;
        this.options.enableAudioAnalysis = options.enableAudioAnalysis ?? false;
        this.options.fft = options.fft ?? false;
        this.options.debugRecording = options.debugRecording ?? false;
        this.options.useInputStream = options.useInputStream ?? true;
        this.options.useInputMicStream = options.useInputMicStream ?? true;
        this.options.useInputFileStream = options.useInputFileStream ?? true;
        this.options.useBuffering = options.useBuffering ?? false;
        this.options.bufferTimeSec = options.bufferTimeSec ?? 0.1;
        this.options.initialSilenceTimeoutMs = options.initialSilenceTimeoutMs ?? 10000;
        this.options.endSilenceTimeoutMs = options.endSilenceTimeoutMs ?? 200;
        this.options.segmentationSilenceTimeoutMs = options.segmentationSilenceTimeoutMs ?? 200;
        this.options.speechLanguage = options.speechLanguage ?? "ja-JP";
        this.options.recoMode = options.recoMode ?? "CONVERSATION";
        this.onRecognitionStarted = options.onRecognitionStarted || (() => { });
        this.onRecognitionStopped = options.onRecognitionStopped || (() => { });
        this.onRecognitionCanceled = options.onRecognitionCanceled || (() => { });
        this.onRecognitionFailed = options.onRecognitionFailed || (() => { });
        this.onRecognitionTextUpdated = options.onRecognitionTextUpdated || (() => { });
        this.onRecognitionTextEnd = options.onRecognitionTextEnd || (() => { });
        this.onAudioAnalysis = options.onAudioAnalysis || (() => { });
        this._recordingFloat32Array = new Float32Array(0);
        this._recordingInt16Array = new Int16Array(0);
    }
    async stopRecognition() {
        if (this._isRecording && this._recognizer) {
            try {
                if (this.options.debugRecording) {
                    const audio48000 = convertFloat32ArrayToAudioBuffer(this._recordingFloat32Array, new AudioContext(), 48000, 2);
                    const audio16000 = convertInt16ArrayToAudioBuffer(this._recordingInt16Array, new AudioContext(), 16000, 1);
                    downloadAudio(audio48000, 'audio48000.wav');
                    downloadAudio(audio16000, 'audio16000.wav');
                }
                if (this._workletNode) {
                    this._workletNode.disconnect();
                    this._workletNode = null;
                }
                if (this._audioSource) {
                    this._audioSource.disconnect();
                    this._audioSource = null;
                }
                if (this._pushStream) {
                    this._pushStream.close();
                    this._pushStream = null;
                }
                await new Promise((resolve, reject) => {
                    this._recognizer.stopContinuousRecognitionAsync(() => {
                        this._systemText = 'Continuous Recognition stopped';
                        this._isRecording = false;
                        this.onRecognitionStopped();
                        resolve();
                    }, (error) => reject(error));
                });
                if (this._mediaStream) {
                    this._mediaStream.getTracks().forEach(track => track.stop());
                    this._mediaStream = null;
                }
                if (this._audioContext) {
                    await this._audioContext.close();
                    this._audioContext = null;
                }
                this._analyser = null;
                this._recognizer = null;
                this._audioConfig = null;
                this._recordingFloat32Array = new Float32Array(0);
                this._recordingInt16Array = new Int16Array(0);
            }
            catch (error) {
                console.error('Error stopping recognition:', error);
                throw error;
            }
        }
    }
    async startRecognition(audioInputDeviceId) {
        try {
            if (this._isRecording) {
                await this.stopRecognition();
            }
            this._audioInputDeviceId = audioInputDeviceId;
            this._textList = [];
            this._systemText = '';
            await this._setupAudioAnalyser(audioInputDeviceId);
            const audioFormat = speechsdk.AudioStreamFormat.getWaveFormatPCM(INPUT_PCM_SAMPLE_RATE, INPUT_PCM_BITS_PER_SAMPLE, INPUT_PCM_CHANNELS);
            this._pushStream = speechsdk.AudioInputStream.createPushStream(audioFormat);
            const tokenObj = await getTokenOrRefresh();
            if (!tokenObj.authToken) {
                throw new Error('Failed to obtain auth token');
            }
            const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken ?? '', tokenObj.region ?? '');
            speechConfig.speechRecognitionLanguage = this.options.speechLanguage || "ja-JP";
            if (this.options.useInputStream) {
                this._audioConfig = speechsdk.AudioConfig.fromStreamInput(this._pushStream);
            }
            else {
                this._audioConfig = speechsdk.AudioConfig.fromMicrophoneInput(audioInputDeviceId);
            }
            this._recognizer = new speechsdk.SpeechRecognizer(speechConfig, this._audioConfig);
            // 初期無音タイムアウト（ミリ秒単位）を設定
            // 音声認識が開始されてから最初の発話が検出されるまでの時間を制御
            this._recognizer.properties.setProperty(speechsdk.PropertyId.SpeechServiceConnection_InitialSilenceTimeoutMs, (this.options.initialSilenceTimeoutMs || 10000).toString());
            // サービスがエンドポイントとして無音を検出した後、認識を終了するまでの無音タイムアウト（ミリ秒単位）を設定
            this._recognizer.properties.setProperty(speechsdk.PropertyId.SpeechServiceConnection_EndSilenceTimeoutMs, (this.options.endSilenceTimeoutMs || 200).toString());
            // 検出された無音の持続時間（ミリ秒単位）を設定
            // この時間が経過すると、音声認識システムは発話が終了したと判断し、最終的な認識結果を生成
            this._recognizer.properties.setProperty(speechsdk.PropertyId.Speech_SegmentationSilenceTimeoutMs, (this.options.segmentationSilenceTimeoutMs || 200).toString());
            this._recognizer.properties.setProperty(speechsdk.PropertyId.SpeechServiceConnection_RecoMode, this.options.recoMode || "CONVERSATION");
            this._setupRecognizerCallbacks();
            await this._startContinuousRecognition();
            await this._startAudioProcessing();
            this.onRecognitionStarted();
            this._startAudioAnalysis();
            await this.loadAndWriteWavToPushStream('/audio/audio16000.wav');
        }
        catch (error) {
            console.error('Error starting recognition:', error);
            this._systemText = 'Failed to start recognition';
            this._isRecording = false;
            this.onRecognitionFailed(error);
            throw error;
        }
    }
    async loadAndWriteWavToPushStream(url) {
        if (!this.options.useInputFileStream)
            return;
        if (!this._pushStream)
            return;
        await loadAndWriteWavToPushStream(url, this._pushStream);
    }
    async writeWavToPushStream(arrayBuffer) {
        if (!this.options.useInputFileStream)
            return;
        if (!this._pushStream)
            return;
        writeWavToPushStream(arrayBuffer, this._pushStream);
    }
    _setupRecognizerCallbacks() {
        if (this._recognizer) {
            this._recognizer.canceled = this._handleCanceled.bind(this);
            this._recognizer.recognizing = this._handleRecognizing.bind(this);
            this._recognizer.recognized = this._handleRecognized.bind(this);
        }
    }
    async _startContinuousRecognition() {
        return new Promise((resolve, reject) => {
            this._recognizer.startContinuousRecognitionAsync(() => {
                this._systemText = 'Continuous Recognition started';
                this._isRecording = true;
                this._initializeRecording();
                resolve();
            }, (error) => reject(error));
        });
    }
    _initializeRecording() {
        this._startTime = Date.now();
        this.setDocDate();
    }
    _handleCanceled(sender, event) {
        console.log('Recognition canceled:', event);
        this._systemText = 'Restarting Continuous Recognition';
        this._isRecording = false;
        this.onRecognitionCanceled();
        if (this._audioInputDeviceId) {
            this.startRecognition(this._audioInputDeviceId);
        }
    }
    _handleRecognizing(sender, event) {
        if (event.result.text) {
            this.setDate();
            this.updateLatestText(event.result.text);
            this.onRecognitionTextUpdated(event.result.text, event.result.speakerId);
        }
    }
    _handleRecognized(sender, event) {
        if (event.result.text) {
            this.updateLatestText(event.result.text);
            this.addNewTextEntry();
            this.onRecognitionTextEnd(event.result.text, event.result.speakerId);
        }
    }
    updateLatestText(text) {
        const lastIndex = this._textList.length - 1;
        if (lastIndex >= 0) {
            this._textList[lastIndex].text = text;
        }
    }
    addNewTextEntry() {
        const speaker = this._textList.length > 0
            ? this._textList[this._textList.length - 1].speaker
            : 'UNKNOWN';
        this._textList.push({
            date: '',
            time: '',
            speaker: speaker,
            text: '',
        });
    }
    setDocDate() {
        const now = new Date();
        const date = now.toISOString().split('T')[0];
        if (this._textList.length > 0) {
            this._textList[0].date = date;
        }
    }
    setDate() {
        const now = new Date();
        const time = now.toTimeString().split('T')[0];
        const lastIndex = this._textList.length - 1;
        if (lastIndex >= 0) {
            this._textList[lastIndex].time = time;
        }
    }
    _calculateVolume(audioData) {
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        return Math.sqrt(sum / audioData.length);
    }
    _recFloat32(pcmFloat32) {
        const newArray = new Float32Array(this._recordingFloat32Array.length + pcmFloat32.length);
        newArray.set(this._recordingFloat32Array);
        newArray.set(pcmFloat32, this._recordingFloat32Array.length);
        this._recordingFloat32Array = newArray;
    }
    _recInt16(pcmInt16) {
        const newArray = new Int16Array(this._recordingInt16Array.length + pcmInt16.length);
        newArray.set(this._recordingInt16Array);
        newArray.set(pcmInt16, this._recordingInt16Array.length);
        this._recordingInt16Array = newArray;
    }
    async _startAudioProcessing() {
        const audioContext = new AudioContext();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const source = audioContext.createMediaStreamSource(stream);
        await audioContext.audioWorklet.addModule('/libs/audio-processor.js');
        const workletNode = new AudioWorkletNode(audioContext, 'mic-audio-to-pcm-processor');
        this._workletNode = workletNode;
        this._audioSource = source;
        let audioBuffer = [];
        let totalLength = 0;
        workletNode.port.onmessage = (event) => {
            if (!this.options.useInputMicStream)
                return;
            if (!this._pushStream)
                return;
            const pcmFloat32 = event.data.data;
            const numChannels = event.data.numChannels;
            const originalRate = audioContext.sampleRate || 48000;
            const targetRate = 16000;
            const monoData = toMono(pcmFloat32, numChannels);
            const resampledData = resampleLinear(monoData, originalRate, targetRate);
            const int16Array = float32ToInt16(resampledData);
            if (this.options.debugRecording)
                this._recFloat32(pcmFloat32);
            if (this.options.debugRecording)
                this._recInt16(int16Array);
            if (this.options.useBuffering) {
                audioBuffer.push(int16Array);
                totalLength += int16Array.length;
                if (totalLength > 16000 * (this.options.bufferTimeSec || 0.1)) {
                    // バッファを結合
                    console.log("Wrote buffered data:", totalLength);
                    const merged = new Int16Array(totalLength);
                    let offset = 0;
                    for (const buffer of audioBuffer) {
                        merged.set(buffer, offset);
                        offset += buffer.length;
                    }
                    audioBuffer = [];
                    totalLength = 0;
                    this._pushStream.write(merged.buffer);
                }
            }
            else {
                this._pushStream.write(int16Array.buffer);
            }
        };
        source.connect(workletNode);
        workletNode.connect(audioContext.destination);
    }
    async _setupAudioAnalyser(deviceId) {
        if (!this.options.enableAudioAnalysis)
            return;
        try {
            this._audioContext = new AudioContext();
            this._analyser = this._audioContext.createAnalyser();
            this._analyser.fftSize = 2048;
            this._mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: { deviceId: { exact: deviceId } }
            });
            const source = this._audioContext.createMediaStreamSource(this._mediaStream);
            source.connect(this._analyser);
        }
        catch (error) {
            console.error('Error setting up audio analyser:', error);
            throw error;
        }
    }
    _startAudioAnalysis() {
        if (!this._analyser)
            return;
        const timeDataArray = new Float32Array(this._analyser.frequencyBinCount);
        const frequencyDataArray = new Float32Array(this._analyser.frequencyBinCount);
        const analyze = () => {
            if (!this._isRecording || !this._analyser)
                return;
            if (this.options.fft) {
                this._analyser.getFloatFrequencyData(frequencyDataArray);
                this.onAudioAnalysis(frequencyDataArray);
            }
            else {
                this._analyser.getFloatTimeDomainData(timeDataArray);
                this.onAudioAnalysis(timeDataArray);
            }
            requestAnimationFrame(analyze);
        };
        analyze();
    }
}
/**
 * モノラル化（ステレオ→モノラル）の例
 * すでにモノラルならこの処理は不要。
 * leftとrightがある場合、(L+R)/2でモノラル化
 */
function toMono(float32Array, numChannels) {
    if (numChannels === 1) {
        return float32Array; // 既にモノラルならそのまま
    }
    else if (numChannels === 2) {
        const monoArray = new Float32Array(float32Array.length / 2);
        for (let i = 0, j = 0; i < float32Array.length; i += 2, j++) {
            const left = float32Array[i];
            const right = float32Array[i + 1];
            monoArray[j] = (left + right) / 2;
        }
        return monoArray;
    }
    else {
        // 多チャネルの場合はここでチャネルミックスの処理を実装
        // 今回は2chを前提
        throw new Error("Only mono or stereo is supported");
    }
}
/**
 * 線形補間によるサンプリングレート変換
 * @param inputFloat32 変換前PCMデータ(Float32, モノラル)
 * @param originalRate 元のサンプルレート(例:44100)
 * @param targetRate ターゲットのサンプルレート(例:16000)
 */
function resampleLinear(inputFloat32, originalRate, targetRate) {
    const ratio = originalRate / targetRate;
    const outputLength = Math.floor(inputFloat32.length / ratio);
    const output = new Float32Array(outputLength);
    // console.log({originalRate, targetRate, ratio, outputLength});
    for (let i = 0; i < outputLength; i++) {
        const pos = i * ratio;
        const iPos = Math.floor(pos);
        const frac = pos - iPos;
        const sample1 = inputFloat32[iPos];
        const sample2 = iPos + 1 < inputFloat32.length ? inputFloat32[iPos + 1] : sample1;
        output[i] = sample1 + (sample2 - sample1) * frac;
    }
    return output;
}
/**
 * Float32(-1.0~1.0)をInt16(-32768~32767)へ変換
 */
function float32ToInt16(float32Array) {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
        const s = Math.max(-1, Math.min(1, float32Array[i]));
        int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
}
function convertFloat32ArrayToAudioBuffer(float32Array, audioContext, sampleRate, numChannels) {
    // numChannelsが2の場合、float32Arrayは (L,R,L,R,...) の順で並んでいると想定。
    const frameCount = float32Array.length / numChannels;
    const audioBuffer = audioContext.createBuffer(numChannels, frameCount, sampleRate);
    for (let c = 0; c < numChannels; c++) {
        const channelData = audioBuffer.getChannelData(c);
        for (let i = 0; i < frameCount; i++) {
            channelData[i] = float32Array[i * numChannels + c];
        }
    }
    return audioBuffer;
}
function convertInt16ArrayToAudioBuffer(int16Array, audioContext, sampleRate, numChannels) {
    const audioBuffer = audioContext.createBuffer(numChannels, int16Array.length, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const bufferData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < int16Array.length; i++) {
            bufferData[i] = int16Array[i] / 32768.0; // Int16→Float32へスケール
        }
    }
    return audioBuffer;
}
async function getTokenOrRefresh() {
    const CookieClass = Cookie;
    const cookie = new CookieClass();
    const speechToken = cookie.get('speech-token');
    if (speechToken === undefined) {
        try {
            const res = await axios.get('/api/get-speech-token');
            const { token, region } = res.data;
            cookie.set('speech-token', `${region}:${token}`, { maxAge: 540, path: '/' });
            console.log('Token fetched from back-end: ' + token);
            return { authToken: token, region };
        }
        catch (err) {
            const error = err;
            console.log(error.response?.data);
            return { authToken: null, error: error.response?.data };
        }
    }
    else {
        console.log('Token fetched from cookie: ' + speechToken);
        const [region, authToken] = speechToken.split(':');
        return { authToken, region };
    }
}
