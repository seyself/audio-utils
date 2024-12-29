// import { SpeechClient, protos, v1p1beta1 } from '@google-cloud/speech';
import { v1p1beta1, protos } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';

// https://cloud.google.com/speech-to-text/docs/transcription-model?utm_source=chatgpt.com&hl=ja
// https://cloud.google.com/speech-to-text/docs/multiple-voices?hl=ja#speech_transcribe_diarization_beta-protocol
// https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/RecognitionConfig#SpeakerDiarizationConfig

// 型定義を追加
const { SpeechClient } = v1p1beta1;
const { RecognitionConfig } = protos.google.cloud.speech.v1p1beta1;

// Google Cloud Speech-to-Textクライアントの初期化
const client = new SpeechClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    project_id: process.env.GOOGLE_CLOUD_PROJECT_ID
  }
});

const storage = new Storage({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
    project_id: process.env.GOOGLE_CLOUD_PROJECT_ID
  }
});

export async function speechRecognize(audioContent: string, options: { sampleRate: number, lang: string, minCount: number, maxCount: number, model: string }) {
  const request = {
    audio: {
      content: audioContent, // Base64形式の音声データ
    },
    config: createConfig(options),
  };

  // Google Speech-to-Text APIを呼び出し
  const [response] = await client.recognize(request);
  return parseResponse(response);
}

export async function speechRecognizeWithGCS(audioContent: string, options: { sampleRate: number, lang: string, minCount: number, maxCount: number, model: string }) {
  const gcsUri = await uploadGCS(audioContent);

  const request = {
    audio: {
      uri: gcsUri, // Base64形式の音声データ
    },
    config: createConfig(options),
  };

  // Google Speech-to-Text APIを呼び出し
  const [operation] = await client.longRunningRecognize(request);
  const [response] = await operation.promise();
  return parseResponse(response);
}

function createConfig(options: { sampleRate: number, lang: string, minCount: number, maxCount: number, model: string }): any
{
  const { sampleRate, lang, minCount, maxCount, model } = options;

  const config = {
    // encoding: RecognitionConfig.AudioEncoding.LINEAR16,
    encoding: 'LINEAR16',
    sampleRateHertz: sampleRate || 48000,
    languageCode: lang || 'ja-JP', // 'en-US'
    enableAutomaticPunctuation: true,
    enableSpeakerDiarization: true,
    diarizationSpeakerCount: maxCount,
    minSpeakerCount: minCount || 2,
    maxSpeakerCount: maxCount || 2,
    diarizationConfig: {
      enableSpeakerDiarization: true,
      minSpeakerCount: minCount || 2,
      maxSpeakerCount: maxCount || 2,
    },
    model: model || 'latest_short',
    useEnhanced: true,
  };
  console.log(JSON.stringify(config, null, 2));
  return config;
}

function parseResponse(response: protos.google.cloud.speech.v1.ILongRunningRecognizeResponse) {
  console.log(JSON.stringify(response, null, 2));

  // 話者識別情報を持つ結果を探す
  const diarizedResult = response.results?.find(result => 
    result.alternatives?.[0]?.words?.some(word => 
      word?.speakerTag && word.speakerTag > 0
    )
  );

  // 通常の文字起こし用の結果を探す
  const transcriptionResult = response.results?.find(result => 
    result.alternatives?.[0]?.transcript
  );

  // const diarizedResult = response.results?.[0];
  // const transcriptionResult = response.results?.[0];

  const transcription = transcriptionResult?.alternatives?.[0]?.transcript || '';

  // 話者識別情報を持つ結果から話者情報を抽出
  const speakers: Array<{
    word: string;
    speakerTag: number;
    startTime: number;
    endTime: number;
  }> = [];

  if (diarizedResult?.alternatives?.[0]?.words) {
    diarizedResult.alternatives[0].words.forEach(word => {
      if (word.speakerTag && word.word) {
        speakers.push({
          word: word.word,
          speakerTag: word.speakerTag,
          startTime: word.startTime ? 
            Number(word.startTime.seconds) + (word.startTime.nanos || 0) / 1e9 : 0,
          endTime: word.endTime ? 
            Number(word.endTime.seconds) + (word.endTime.nanos || 0) / 1e9 : 0
        });
      }
    });
  }

  return { transcription, speakers };
}


async function uploadGCS(audioContent: string): Promise<string>
{
  // GCSにアップロード
  const bucketName = process.env.GCS_BUCKET_NAME!;
  const bucket = storage.bucket(bucketName);
  const fileName = `audio-${Date.now()}.wav`;
  const file = bucket.file(fileName);
  
  await file.save(Buffer.from(audioContent, 'base64'));
  const gcsUri = `gs://${bucketName}/${fileName}`;

  return gcsUri;
}