export declare function speechRecognize(audioContent: string, options: {
    sampleRate: number;
    lang: string;
    minCount: number;
    maxCount: number;
    model: string;
}): Promise<{
    transcription: string;
    speakers: {
        word: string;
        speakerTag: number;
        startTime: number;
        endTime: number;
    }[];
}>;
export declare function speechRecognizeWithGCS(audioContent: string, options: {
    sampleRate: number;
    lang: string;
    minCount: number;
    maxCount: number;
    model: string;
}): Promise<{
    transcription: string;
    speakers: {
        word: string;
        speakerTag: number;
        startTime: number;
        endTime: number;
    }[];
}>;
//# sourceMappingURL=GoogleSpeechRecognize.d.ts.map