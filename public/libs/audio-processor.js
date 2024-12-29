// AudioWorkletProcessorはメインスレッドとは別のスコープで動くため、
// ES2020 modulesで記述し、`audioWorklet.addModule('audio-processor.js')`で読み込む

class MicAudioToPcmProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0]; 
    // input は [channel0Data, channel1Data, ...] の配列になる
    if (input && input.length > 0) {
      const numChannels = input.length;
      
      let interleaved;
      if (numChannels === 1) {
        // モノラルの場合はそのまま
        interleaved = input[0];
      } else if (numChannels === 2) {
        // ステレオの場合はインターリーブ
        const ch0 = input[0];
        const ch1 = input[1];
        interleaved = new Float32Array(ch0.length * 2);
        for (let i = 0; i < ch0.length; i++) {
          interleaved[i*2] = ch0[i];
          interleaved[i*2 + 1] = ch1[i];
        }
      } else {
        // 多チャネル未対応ならエラーか、適宜対応
        throw new Error("Only mono or stereo is supported");
      }

      this.port.postMessage({ data: interleaved, numChannels: numChannels });
    }

    return true;
  }
}

registerProcessor('mic-audio-to-pcm-processor', MicAudioToPcmProcessor);