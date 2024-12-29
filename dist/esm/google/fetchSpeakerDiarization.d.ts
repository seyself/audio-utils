export declare enum SpeakerDiarizationModel {
    DEFAULT = "default",
    VIDEO = "video",
    COMMAND_AND_SEARCH = "command_and_search",
    LATEST_LONG = "latest_long",
    LATEST_SHORT = "latest_short",
    PHONE_CALL = "phone_call",
    TELEPHONY = "telephony",
    TELEPHONY_SHORT = "telephony_short",
    MEDICAL_DICTIONARY = "medical_dictation",
    MEDICAL_CONVERSATION = "medical_conversation"
}
export interface SpeakerDiarizationOptions {
    sampleRate?: number;
    lang?: string;
    minCount?: number;
    maxCount?: number;
    model?: SpeakerDiarizationModel;
}
export interface SpeakerDiarizationResponse {
    transcription: string;
    speakers: {
        transcript: string;
        speakerTags: {
            word: string;
            speakerTag: number;
        }[];
    }[];
}
/**
 * 話者検知APIを呼び出す
 * @param audioData<ArrayBuffer | Blob> 音声データ
 * @param options<SpeakerDiarizationOptions> オプション
 * @returns <Promise<SpeakerDiarizationResponse>> 話者検知APIのレスポンス
 */
export declare function fetchSpeakerDiarization(audioData: AudioBuffer | ArrayBuffer | Blob, options?: SpeakerDiarizationOptions): Promise<SpeakerDiarizationResponse>;
//# sourceMappingURL=fetchSpeakerDiarization.d.ts.map