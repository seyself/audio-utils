export async function loadAndWriteWavToPushStream(url, pushStream) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    writeWavToPushStream(arrayBuffer, pushStream);
}
export function writeWavToPushStream(arrayBuffer, pushStream) {
    const dataView = new DataView(arrayBuffer);
    console.log('input arrayBuffer', arrayBuffer.byteLength);
    // 2. WAVヘッダ解析
    // チャンクID (RIFF)
    const riff = getString(dataView, 0, 4);
    if (riff !== 'RIFF') {
        throw new Error('Invalid WAV file: Missing RIFF');
    }
    // WAVE識別子
    const wave = getString(dataView, 8, 4);
    if (wave !== 'WAVE') {
        throw new Error('Invalid WAV file: Missing WAVE');
    }
    // "fmt "チャンクの探索
    // RIFF(4) + size(4) + WAVE(4) = 12バイトまで確定済
    // その後にfmtチャンクが来るはず（多くの場合先頭付近）
    let offset = 12;
    let fmtFound = false;
    let numChannels = 1;
    let sampleRate = 16000;
    let bitsPerSample = 16;
    while (offset < arrayBuffer.byteLength) {
        const chunkId = getString(dataView, offset, 4);
        const chunkSize = dataView.getUint32(offset + 4, true);
        offset += 8;
        console.log('Found chunk:', chunkId, 'size:', chunkSize);
        if (chunkId === 'fmt ') {
            // fmtチャンク解析
            const audioFormat = dataView.getUint16(offset, true);
            numChannels = dataView.getUint16(offset + 2, true);
            sampleRate = dataView.getUint32(offset + 4, true);
            bitsPerSample = dataView.getUint16(offset + 14, true);
            console.log('Format details:', {
                audioFormat,
                numChannels,
                sampleRate,
                bitsPerSample
            });
            if (audioFormat !== 1) {
                throw new Error('Unsupported WAV format: not PCM');
            }
            fmtFound = true;
            offset += chunkSize; // チャンクサイズ分オフセットを進める
        }
        else if (chunkId === 'data') {
            // dataチャンク発見
            if (!fmtFound) {
                throw new Error('Invalid WAV: data chunk before fmt chunk');
            }
            console.log('Processing data chunk of size:', chunkSize);
            // サイズチェック
            if (offset + chunkSize > arrayBuffer.byteLength) {
                throw new Error('Invalid data chunk size: exceeds file bounds');
            }
            const pcmBytes = new Uint8Array(arrayBuffer, offset, chunkSize);
            if (bitsPerSample === 16) {
                const pcmData = new Int16Array(pcmBytes.buffer, pcmBytes.byteOffset, pcmBytes.byteLength / 2);
                console.log('Writing PCM data, samples:', pcmData.byteLength, new Uint8Array(pcmData));
                pushStream.write(pcmData.buffer);
            }
            else {
                throw new Error(`Unsupported bitsPerSample: ${bitsPerSample}`);
            }
            offset += chunkSize;
            break;
        }
        else {
            // 他のチャンクはスキップ
            console.log('Skipping chunk:', chunkId);
            offset += chunkSize;
        }
    }
    // 処理完了の確認
    if (!fmtFound) {
        throw new Error('Invalid WAV: no fmt chunk found');
    }
    console.log('WAV processing completed');
}
function getString(dataView, start, length) {
    let str = '';
    for (let i = 0; i < length; i++) {
        str += String.fromCharCode(dataView.getUint8(start + i));
    }
    return str;
}
