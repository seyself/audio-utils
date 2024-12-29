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
interface AzureSpeechRecognizerOptions {
    enableAudioAnalysis?: boolean;
    fft?: boolean;
    debugRecording?: boolean;
    useInputStream?: boolean;
    useInputMicStream?: boolean;
    useInputFileStream?: boolean;
    useBuffering?: boolean;
    bufferTimeSec?: number;
    initialSilenceTimeoutMs?: number;
    endSilenceTimeoutMs?: number;
    segmentationSilenceTimeoutMs?: number;
    speechLanguage?: string;
    recoMode?: string;
}
interface EventHandlers {
    onRecognitionStarted: () => void;
    onRecognitionStopped: () => void;
    onRecognitionCanceled: () => void;
    onRecognitionFailed: (error: any) => void;
    onRecognitionTextUpdated: (text: string, speakerId: string) => void;
    onRecognitionTextEnd: (text: string, speakerId: string) => void;
    onAudioAnalysis: (dataArray: Float32Array) => void;
}
export default class AzureSpeechRecognizer {
    private _recognizer;
    private _textList;
    private _startTime;
    private _audioInputDeviceId;
    private _systemText;
    private _isRecording;
    private _audioConfig;
    private _audioContext;
    private _analyser;
    private _mediaStream;
    private _pushStream;
    private _recordingFloat32Array;
    private _recordingInt16Array;
    private _workletNode;
    private _audioSource;
    options: AzureSpeechRecognizerOptions;
    get audioContext(): AudioContext | null;
    get analyser(): AnalyserNode | null;
    onRecognitionStarted: () => void;
    onRecognitionStopped: () => void;
    onRecognitionCanceled: () => void;
    onRecognitionFailed: (error: any) => void;
    onRecognitionTextUpdated: (text: string, speakerId: string) => void;
    onRecognitionTextEnd: (text: string, speakerId: string) => void;
    onAudioAnalysis: (dataArray: Float32Array) => void;
    constructor(options?: AzureSpeechRecognizerOptions & Partial<EventHandlers>);
    stopRecognition(): Promise<void>;
    startRecognition(audioInputDeviceId: string): Promise<void>;
    loadAndWriteWavToPushStream(url: string): Promise<void>;
    writeWavToPushStream(arrayBuffer: ArrayBuffer): Promise<void>;
    private _setupRecognizerCallbacks;
    private _startContinuousRecognition;
    private _initializeRecording;
    private _handleCanceled;
    private _handleRecognizing;
    private _handleRecognized;
    private updateLatestText;
    private addNewTextEntry;
    private setDocDate;
    private setDate;
    private _calculateVolume;
    private _recFloat32;
    private _recInt16;
    private _startAudioProcessing;
    private _setupAudioAnalyser;
    private _startAudioAnalysis;
}
export {};
//# sourceMappingURL=AzureSpeechRecognizer.d.ts.map