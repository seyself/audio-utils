import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
export declare function loadAndWriteWavToPushStream(url: string, pushStream: speechsdk.PushAudioInputStream): Promise<void>;
export declare function writeWavToPushStream(arrayBuffer: ArrayBuffer, pushStream: speechsdk.PushAudioInputStream): void;
//# sourceMappingURL=loadAndWriteWavToPushStream.d.ts.map