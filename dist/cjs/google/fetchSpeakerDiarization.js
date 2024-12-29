"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpeakerDiarizationModel = void 0;
exports.fetchSpeakerDiarization = fetchSpeakerDiarization;
const audioBufferToWav_js_1 = require("../functions/audioBufferToWav.js");
// Google Speech-to-Text 
// latest_long:	このモデルは、メディアや自発的な会話など、あらゆる種類の長いコンテンツに対して使用します。特に動画モデルがターゲット言語で利用できない場合は、動画モデルの代わりにこのモデルを使用することを検討してください。これは、デフォルト モデルの代わりに使用することもできます。
// latest_short:	このモデルは、長さが数秒の短い発話に使用します。これは、コマンドやその他のシングル ショットの音声のユースケースをキャプチャする場合に便利です。コマンドと検索モデルの代わりに、このモデルを使用することを検討してください。
// phone_call:	電話の通話音声に最適です（通常は 8 kHz のサンプリング レートで録音されています）。
// telephony:	「phone_call」モデルの改良版。電話の通話音声に最適です（通常は 8 kHz のサンプリング レートで録音されています）。
// telephony_short:	電話の通話音声の短い発話または 1 単語の発話に対応した、最新の「テレフォニー」モデルの専用版（通常は 8 kHz のサンプリング レートで録音されています）。medical_dictation	このモデルは、医療専門家の指示を書き写すために使用します。これは、標準レートよりも費用の高いプレミアム モデルです。詳細については、料金ページをご覧ください。
// medical_conversation:	このモデルを使用して、医療従事者と患者の会話を文字変換します。これは、標準レートよりも費用の高いプレミアム モデルです。詳細については、料金ページをご覧ください。
// command_and_search:	音声コマンドや音声検索など、短い発話や 1 つの単語からなる発話に最適です。
// default:	長時間の録音や口述といった、他の音声モデルに適合しない音声に最適です。デフォルト モデルでは、特定のモデル用にカスタマイズされたモデルがある動画クリップなど、あらゆる種類の音声の音声文字変換結果が生成されます。ただし、デフォルトのモデルを使用して動画クリップの音声を認識すると、動画モデルを使用する場合よりも低品質の結果が生成されます。16 kHz 以上のサンプリング レートで録音されたハイファイ音声であることが理想的です。
// video:	複数の話者が存在する動画クリップやその他のソース（ポッドキャストなど）の音声に最適です。多くの場合、このモデルは、高音質のマイクで録音された音声や、周囲の雑音が多い音声に最適です。最良の結果を得るには、16,000 Hz 以上のサンプリング レートで録音された音声を使用してください。
var SpeakerDiarizationModel;
(function (SpeakerDiarizationModel) {
    SpeakerDiarizationModel["DEFAULT"] = "default";
    SpeakerDiarizationModel["VIDEO"] = "video";
    SpeakerDiarizationModel["COMMAND_AND_SEARCH"] = "command_and_search";
    SpeakerDiarizationModel["LATEST_LONG"] = "latest_long";
    SpeakerDiarizationModel["LATEST_SHORT"] = "latest_short";
    SpeakerDiarizationModel["PHONE_CALL"] = "phone_call";
    SpeakerDiarizationModel["TELEPHONY"] = "telephony";
    SpeakerDiarizationModel["TELEPHONY_SHORT"] = "telephony_short";
    SpeakerDiarizationModel["MEDICAL_DICTIONARY"] = "medical_dictation";
    SpeakerDiarizationModel["MEDICAL_CONVERSATION"] = "medical_conversation";
})(SpeakerDiarizationModel || (exports.SpeakerDiarizationModel = SpeakerDiarizationModel = {}));
/**
 * 話者検知APIを呼び出す
 * @param audioData<ArrayBuffer | Blob> 音声データ
 * @param options<SpeakerDiarizationOptions> オプション
 * @returns <Promise<SpeakerDiarizationResponse>> 話者検知APIのレスポンス
 */
async function fetchSpeakerDiarization(audioData, options) {
    try {
        let audioBase64;
        if (audioData instanceof AudioBuffer) {
            const audioBlob = await (0, audioBufferToWav_js_1.audioBufferToWav)(audioData);
            const arrayBuffer = await audioBlob.arrayBuffer();
            audioBase64 = Buffer.from(arrayBuffer).toString('base64');
        }
        else if (audioData instanceof ArrayBuffer) {
            audioBase64 = Buffer.from(audioData).toString('base64');
        }
        else {
            const tmpBuffer = await audioData.arrayBuffer();
            audioBase64 = Buffer.from(tmpBuffer).toString('base64');
        }
        const _options = options || {};
        const response = await fetch('/api/speaker-diarization', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioContent: audioBase64, ..._options }),
        });
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.error(error);
        throw error;
    }
}
