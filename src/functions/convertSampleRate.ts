
export async function convertSampleRate(audioBuffer: AudioBuffer, sampleRate: number): Promise<AudioBuffer> {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const offlineContext = new OfflineAudioContext(numberOfChannels, audioBuffer.duration * sampleRate, sampleRate);

  const bufferSource = offlineContext.createBufferSource();
  bufferSource.buffer = audioBuffer;
  bufferSource.connect(offlineContext.destination);
  bufferSource.start(0);

  return await offlineContext.startRendering().then(renderedBuffer => {
    return renderedBuffer;
  });
}
