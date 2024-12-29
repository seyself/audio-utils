# WavTools APIリファレンス

## WavRecorder
録音機能を提供するクラス

### コンストラクタ
```javascript
new WavRecorder({
  sampleRate?: number,    // サンプルレート (デフォルト: 44100)
  outputToSpeakers?: boolean,  // スピーカー出力の有効化 (デフォルト: false)
  debug?: boolean        // デバッグモード (デフォルト: false)
})
```

### メソッド
| メソッド | 説明 | 戻り値 |
|---------|------|--------|
| `begin(deviceId?: string)` | 録音セッションを開始 | Promise\<true> |
| `record(chunkProcessor?: Function, chunkSize?: number)` | 録音を開始 | Promise\<true> |
| `pause()` | 録音を一時停止 | Promise\<true> |
| `clear()` | 録音バッファをクリア | Promise\<true> |
| `save(force?: boolean)` | 現在の録音をWAVファイルとして保存 | Promise\<WavPackerAudioType> |
| `end()` | 録音セッションを終了し結果を保存 | Promise\<WavPackerAudioType> |
| `getFrequencies(analysisType?, minDecibels?, maxDecibels?)` | 周波数データを取得 | AudioAnalysisOutputType |
| `listDevices()` | 利用可能な録音デバイスを一覧表示 | Promise\<Array\<MediaDeviceInfo>> |
| `quit()` | インスタンスの完全なクリーンアップ | Promise\<true> |


### チャンクプロセッサーパラメータ
| パラメータ | 説明 | デフォルト値 |
|-----------|------|-------------|
| `chunkSize` | 処理するチャンクのサイズ（バイト） | 8192 |

### デバイス情報
| プロパティ | 説明 |
|-----------|------|
| `deviceId` | デバイスの一意識別子 |
| `groupId` | デバイスのグループID |
| `label` | デバイスの表示名 |
| `kind` | デバイスの種類（"audioinput"） |
| `default` | デフォルトデバイスかどうか |


--------------------------------


## AudioAnalysis
音声分析機能を提供するクラス

### コンストラクタ
```javascript
new AudioAnalysis(audioElement: HTMLAudioElement, audioBuffer?: AudioBuffer)
```

### 静的メソッド
| メソッド | 説明 | 戻り値 |
|---------|------|--------|
| `getFrequencies(analyser, sampleRate, fftResult?, analysisType?, minDecibels?, maxDecibels?)` | 周波数領域データを取得 | AudioAnalysisOutputType |

### メソッド
| メソッド | 説明 | 戻り値 |
|---------|------|--------|
| `getFrequencies(analysisType?, minDecibels?, maxDecibels?)` | 現在の周波数データを取得 | AudioAnalysisOutputType |
| `resumeIfSuspended()` | 一時停止状態のAudioContextを再開 | Promise\<true> |


### 分析タイプ
| タイプ | 説明 |
|--------|------|
| `frequency` | 生の周波数データ (Hz単位) |
| `music` | 音楽ノート（音階）に基づく分析 |
| `voice` | 人間の声域（32Hz-2000Hz）に最適化された分析 |

### パラメータ
| パラメータ | 説明 | デフォルト値 |
|-----------|------|-------------|
| `minDecibels` | 分析する最小デシベル値 | -100 |
| `maxDecibels` | 分析する最大デシベル値 | -30 |
| `fftSize` | FFTサイズ | 8192 |
| `smoothingTimeConstant` | 周波数データの平滑化係数 | 0.1 |

--------------------------------



## WavStreamPlayer
音声ストリーミング再生を提供するクラス

### コンストラクタ
```javascript
new WavStreamPlayer({
  sampleRate?: number    // サンプルレート (デフォルト: 44100)
})
```

### メソッド
| メソッド | 説明 | 戻り値 |
|---------|------|--------|
| `connect()` | オーディオコンテキストを接続 | Promise\<true> |
| `disconnect()` | オーディオコンテキストを切断 | void |
| `add16BitPCM(arrayBuffer, trackId?)` | PCMデータをストリームに追加 | Int16Array |
| `getFrequencies(analysisType?, minDecibels?, maxDecibels?)` | 周波数データを取得 | AudioAnalysisOutputType |
| `interrupt()` | 再生を中断 | Promise\<{trackId, offset, currentTime}> |
| `resume()` | 中断した再生を再開 | void |
| `addEventListener(event, callback)` | イベントリスナーを追加 | void |
| `removeEventListener(event, callback)` | イベントリスナーを削除 | void |


### イベントタイプ
| イベント名 | 説明 | データ |
|---------|------|--------|
| `start` | 再生開始時 | - |
| `stop` | 再生停止時 | - |
| `connect` | 接続時 | - |
| `disconnect` | 切断時 | - |
| `interrupt` | 中断時 | {trackId, offset, currentTime} |
| `resume` | 再開時 | - |
| `error` | エラー発生時 | Error object |

--------------------------------


## WavPacker
WAVファイル生成を提供するクラス

### メソッド
| メソッド | 説明 | 戻り値 |
|---------|------|--------|
| `pack(sampleRate, audio)` | WAVファイルを生成 | WavPackerAudioType |
| `static floatTo16BitPCM(float32Array)` | Float32をPCM16に変換 | ArrayBuffer |
| `static mergeBuffers(leftBuffer, rightBuffer)` | バッファを結合 | ArrayBuffer |

--------------------------------

## AudioProcessor
録音用のAudioWorkletProcessor

### イベント
| イベント | 説明 | データ |
|---------|------|--------|
| `start` | 録音開始 | - |
| `stop` | 録音停止 | - |
| `clear` | バッファクリア | - |
| `export` | データエクスポート | audio data |
| `chunk` | チャンクデータ受信 | {mono, raw} |

--------------------------------

## StreamProcessor
再生用のAudioWorkletProcessor

### イベント
| イベント | 説明 | データ |
|---------|------|--------|
| `write` | データ書き込み | {buffer, trackId} |
| `offset` | オフセット取得 | {requestId} |
| `interrupt` | 再生中断 | {requestId} |
| `stop` | 再生停止 | - |

### 型定義

```typescript
type AudioAnalysisOutputType = {
  values: Float32Array;      // 振幅値 (0-1)
  frequencies: number[];     // 周波数バケット値
  labels: string[];         // 周波数ラベル
}

type WavPackerAudioType = {
  blob: Blob;              // WAVファイルBlob
  url: string;            // BlobのURL
  channelCount: number;   // チャンネル数
  sampleRate: number;     // サンプルレート
  duration: number;       // 長さ（秒）
}
```



