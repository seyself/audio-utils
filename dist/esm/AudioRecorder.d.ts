export declare class AudioRecorder {
    private mediaRecorder;
    private audioChunks;
    private isRecording;
    constructor();
    private init;
    startRecording(): Promise<void>;
    stopRecording(): Promise<Blob>;
    isCurrentlyRecording(): boolean;
}
//# sourceMappingURL=AudioRecorder.d.ts.map