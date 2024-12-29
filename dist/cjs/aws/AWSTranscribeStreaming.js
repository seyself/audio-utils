"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWSTranscribeStreaming = AWSTranscribeStreaming;
const client_transcribe_streaming_1 = require("@aws-sdk/client-transcribe-streaming");
const microphone_stream_1 = __importDefault(require("microphone-stream"));
async function AWSTranscribeStreaming() {
    // AWS Transcribe クライアントの作成
    const client = new client_transcribe_streaming_1.TranscribeStreamingClient({
        region: "ap-northeast-1", // 東京リージョン
    });
    // マイクから音声データを取得
    const micStream = new microphone_stream_1.default();
    micStream.setStream(await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
    }));
    // マイクの音声をTranscribeに送信
    const audioStream = async function* () {
        for await (const chunk of micStream) {
            yield { AudioEvent: { AudioChunk: chunk } };
        }
    };
    // Transcribeのコマンドを構成
    const command = new client_transcribe_streaming_1.StartStreamTranscriptionCommand({
        LanguageCode: "ja-JP", // 日本語
        MediaEncoding: "pcm",
        MediaSampleRateHertz: 44100,
        AudioStream: audioStream(),
    });
    // Transcriptionの結果を取得
    const result = await client.send(command);
    for await (const event of result.TranscriptResultStream) {
        if (event.TranscriptEvent) {
            const transcripts = event.TranscriptEvent.Transcript.Results;
            if (transcripts.length > 0) {
                console.log("Transcribed Text:", transcripts[0].Alternatives[0].Transcript);
            }
        }
    }
}
