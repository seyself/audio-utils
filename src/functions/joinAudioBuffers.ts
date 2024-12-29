
export function joinAudioBuffers(audioBuffers: AudioBuffer[]): AudioBuffer {
  const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
  const joinedBuffer = new AudioContext().createBuffer(1, totalLength, 44100);
  let offset = 0;
  for (const buffer of audioBuffers) {
    joinedBuffer.copyToChannel(buffer.getChannelData(0), 0, offset);
    offset += buffer.length;
  }
  return joinedBuffer;
}

