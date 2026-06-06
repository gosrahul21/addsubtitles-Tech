export interface SilenceInterval {
  start: number;
  end: number;
}

export function detectSilences(
  buffer: AudioBuffer,
  thresholdDb: number = -35, // default -35dB threshold
  minSilenceDuration: number = 0.4, // min 400ms to be considered a cut
  padding: number = 0.1 // 100ms padding so we don't cut off words abruptly
): SilenceInterval[] {
  const channelData = buffer.getChannelData(0); // Use first channel for mono detection
  const sampleRate = buffer.sampleRate;
  
  // 50ms window size
  const windowSize = Math.floor(sampleRate * 0.05);
  
  // Calculate amplitude threshold from dB
  // dB = 20 * log10(amplitude) -> amplitude = 10 ^ (dB / 20)
  const thresholdAmplitude = Math.pow(10, thresholdDb / 20);
  
  const cuts: SilenceInterval[] = [];
  let silenceStart: number | null = null;
  
  for (let i = 0; i < channelData.length; i += windowSize) {
    let sumSquares = 0;
    const endIdx = Math.min(i + windowSize, channelData.length);
    for (let j = i; j < endIdx; j++) {
      sumSquares += channelData[j] * channelData[j];
    }
    const rms = Math.sqrt(sumSquares / (endIdx - i));
    
    const timeInSeconds = i / sampleRate;
    
    if (rms < thresholdAmplitude) {
      if (silenceStart === null) {
         silenceStart = timeInSeconds;
      }
    } else {
      if (silenceStart !== null) {
         const duration = timeInSeconds - silenceStart;
         if (duration >= minSilenceDuration) {
           // We found a valid silent chunk. Add padding.
           let start = silenceStart + padding;
           let end = timeInSeconds - padding;
           if (end > start) {
             cuts.push({ start, end });
           }
         }
         silenceStart = null;
      }
    }
  }
  
  // Check if the file ends in silence
  if (silenceStart !== null) {
     const timeInSeconds = channelData.length / sampleRate;
     const duration = timeInSeconds - silenceStart;
     if (duration >= minSilenceDuration) {
       let start = silenceStart + padding;
       let end = timeInSeconds; // Don't subtract padding at the very end of file
       if (end > start) {
         cuts.push({ start, end });
       }
     }
  }
  
  return cuts;
}
