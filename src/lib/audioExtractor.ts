import { detectSilences, SilenceInterval } from './silenceDetection';

export interface ExtractedAudioResult {
  wavBlob: Blob;
  silenceCuts: SilenceInterval[];
}

export async function extractAudioToWav(videoFile: File, onProgress?: (p: number) => void): Promise<ExtractedAudioResult> {
  // We use 16000Hz because it's ideal for speech recognition and keeps the payload small.
  const sampleRate = 16000; 
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
  
  if (onProgress) onProgress(10);
  
  const arrayBuffer = await videoFile.arrayBuffer();
  
  if (onProgress) onProgress(40);
  
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  
  if (onProgress) onProgress(70);

  const silenceCuts = detectSilences(audioBuffer);
  
  if (onProgress) onProgress(85);
  
  const wavBlob = audioBufferToWav(audioBuffer);
  
  if (onProgress) onProgress(100);
  
  return { wavBlob, silenceCuts };
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const outBuffer = new ArrayBuffer(length);
  const view = new DataView(outBuffer);
  const channels = [];
  let i;
  let sample;
  let offset = 0;
  let pos = 0;

  // write WAVE header
  writeString('RIFF'); // "RIFF"
  setUint32(length - 8); // file length - 8
  writeString('WAVE'); // "WAVE"

  writeString('fmt '); // "fmt " chunk
  setUint32(16); // length = 16
  setUint16(1); // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
  setUint16(numOfChan * 2); // block-align
  setUint16(16); // 16-bit (hardcoded in this exporter)

  writeString('data'); // "data" - chunk
  setUint32(length - 44); // chunk length (total length minus 44 bytes of header)

  // write interleaved data
  for (i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < buffer.length) {
    for (i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos])); // clamp
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
      view.setInt16(offset, sample, true); // write 16-bit sample
      offset += 2;
    }
    pos++;
  }

  return new Blob([outBuffer], { type: 'audio/wav' });

  function setUint16(data: number) {
    view.setUint16(offset, data, true);
    offset += 2;
  }

  function setUint32(data: number) {
    view.setUint32(offset, data, true);
    offset += 4;
  }

  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
    offset += str.length;
  }
}
