export interface TrimOptions {
  threshold?: number;      // 無音判定のしきい値 (0.0 - 1.0)
  marginBefore?: number;   // 無音除去後の先頭マージン（秒）
  marginAfter?: number;    // 無音除去後の末尾マージン（秒）
}

export class AudioTrimmer {
  // デフォルト設定
  private static DEFAULT_OPTIONS: Required<TrimOptions> = {
    threshold: 0.01,      // デフォルトのしきい値
    marginBefore: 0.1,    // デフォルトの先頭マージン（秒）
    marginAfter: 0.1      // デフォルトの末尾マージン（秒）
  };

  static trimSilence(audioBuffer: AudioBuffer, options?: TrimOptions): AudioBuffer {
    // デフォルト値とマージ
    const config = { ...this.DEFAULT_OPTIONS, ...options };
    
    const channelData = audioBuffer.getChannelData(0); // モノラル想定
    const sampleRate = audioBuffer.sampleRate;
    const marginSamplesBefore = Math.floor(config.marginBefore * sampleRate);
    const marginSamplesAfter = Math.floor(config.marginAfter * sampleRate);
    
    // 先頭の無音終了位置を検出
    let startIndex = 0;
    for (let i = 0; i < channelData.length; i++) {
      if (Math.abs(channelData[i]) > config.threshold) {
        startIndex = Math.max(0, i - marginSamplesBefore);
        break;
      }
    }

    // 末尾の無音開始位置を検出
    let endIndex = channelData.length - 1;
    for (let i = channelData.length - 1; i >= 0; i--) {
      if (Math.abs(channelData[i]) > config.threshold) {
        endIndex = Math.min(channelData.length - 1, i + marginSamplesAfter);
        break;
      }
    }

    // 新しいAudioBufferを作成
    const trimmedLength = endIndex - startIndex;
    const ctx = new AudioContext();
    const trimmedBuffer = ctx.createBuffer(
      audioBuffer.numberOfChannels,
      trimmedLength,
      sampleRate
    );

    // 全チャンネルのデータをコピー
    for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
      const trimmedData = trimmedBuffer.getChannelData(channel);
      const originalData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < trimmedLength; i++) {
        trimmedData[i] = originalData[startIndex + i];
      }
    }

    return trimmedBuffer;
  }

  // デバッグ用：無音レベルを解析するメソッド
  static analyzeSilenceLevel(audioBuffer: AudioBuffer): {
    min: number;
    max: number;
    avg: number;
  } {
    const channelData = audioBuffer.getChannelData(0);
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;

    for (let i = 0; i < channelData.length; i++) {
      const amplitude = Math.abs(channelData[i]);
      min = Math.min(min, amplitude);
      max = Math.max(max, amplitude);
      sum += amplitude;
    }

    return {
      min,
      max,
      avg: sum / channelData.length
    };
  }
}