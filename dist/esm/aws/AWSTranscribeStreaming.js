import { TranscribeStreamingClient, StartStreamTranscriptionCommand, } from "@aws-sdk/client-transcribe-streaming";
import MicrophoneStream from "microphone-stream";
export async function AWSTranscribeStreaming() {
    // AWS Transcribe クライアントの作成
    const client = new TranscribeStreamingClient({
        region: "ap-northeast-1", // 東京リージョン
    });
    // マイクから音声データを取得
    const micStream = new MicrophoneStream();
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
    const command = new StartStreamTranscriptionCommand({
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
