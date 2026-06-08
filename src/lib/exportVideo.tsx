import { Conversion, Input, Output, BlobSource, BufferTarget, Mp4OutputFormat, VideoSample, AudioSample, ALL_FORMATS } from 'mediabunny';
import { toCanvas } from 'html-to-image';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import React from 'react';

export interface Subtitle {
  id: string;
  start: number;
  end: number;
  text: string;
}

export interface ExportOptions {
  videoBlob: Blob;
  subtitles: Subtitle[];
  templateClassName: string;
  templateStyle: any;
  subtitleFontSize: number;
  subtitleStyle: { bold: boolean, italic: boolean, allCaps: boolean };
  fontFamily: string;
  fontColor: string;
  lineSpacing: number;
  fontAlign: string;
  outline: string;
  shadow: string;
  showPunctuation: boolean;
  maxLines: number;
  maxWordsPerLine: string;
  bgColor: string;
  bgOpacity: number;
  bgStyle: string;
  bgRadius: number;
  bgPaddingX: number;
  bgPaddingY: number;
  isBgTransparent: boolean;
  randomRotate: boolean;
  subtitleAnim: string;
  wordAnim: string;
  subtitleBounds: { x: number, y: number, width: number, height: number };
  videoWidth: number;
  videoHeight: number;
  aspectRatio?: string;
  videoBounds?: { x: number; y: number; width: number; height: number };
  removeSilences?: boolean;
  silenceCuts?: any[];
  filterFillerWords?: boolean;
  addWatermark?: boolean;
}

const getSubtitleAnimStyle = (anim: string, timeElapsed: number): { transform?: string, opacity?: number } => {
  if (!anim || anim === 'None') return {};
  const duration = anim === 'Rotate & Flip' ? 0.5 : (['Pop', 'Slide', 'Stomp'].includes(anim) ? 0.3 : 0.4);
  if (timeElapsed >= duration) return { opacity: 1, transform: 'none' };
  
  const progress = Math.min(1, Math.max(0, timeElapsed / duration));
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const backEaseOut = (t: number) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);
  
  let p = 0;
  
  switch(anim) {
    case 'Pop':
      p = backEaseOut(progress);
      return { transform: `scale(${0.5 + p * 0.5})`, opacity: progress > 0 ? 1 : 0 };
    case 'Slide':
      p = easeOut(progress);
      return { transform: `translateX(${-50 * (1 - p)}px)`, opacity: p };
    case 'Float Up':
      p = easeOut(progress);
      return { transform: `translateY(${30 * (1 - p)}px)`, opacity: p };
    case 'Float Down':
      p = easeOut(progress);
      return { transform: `translateY(${-30 * (1 - p)}px)`, opacity: p };
    case 'Drop In':
      p = backEaseOut(progress);
      return { transform: `translateY(${-50 * (1 - p)}px) scale(${1.2 - p * 0.2})`, opacity: progress > 0 ? 1 : 0 };
    case 'Flip':
      p = easeOut(progress);
      return { transform: `perspective(400px) rotateX(${90 * (1 - p)}deg)`, opacity: p };
    case 'Rotate & Flip':
      p = backEaseOut(progress);
      return { transform: `perspective(400px) rotateZ(${-15 * (1 - p)}deg) rotateX(${90 * (1 - p)}deg) scale(${0.8 + p * 0.2})`, opacity: progress > 0 ? 1 : 0 };
    case 'Stomp':
      p = backEaseOut(progress);
      return { transform: `scale(${2 - p})`, opacity: progress > 0 ? 1 : 0 };
    case 'Wave':
      p = easeInOut(progress);
      return { transform: `rotate(${Math.sin(p * Math.PI) * 5}deg)`, opacity: p };
    default:
      return { opacity: 1, transform: 'none' };
  }
};

const hexToRgba = (hex: string, opacity: number) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity / 100})` : hex;
};

// We create a pure React component for the snapshotting
const SubtitleSnapshot = ({ options, sub, currentTime }: { options: ExportOptions, sub: Subtitle, currentTime: number }) => {
  const {
    templateClassName, templateStyle, subtitleFontSize, subtitleStyle, fontFamily, fontColor, lineSpacing, fontAlign,
    outline, shadow, showPunctuation, maxLines, maxWordsPerLine, bgColor, bgOpacity, bgStyle, bgRadius, bgPaddingX, bgPaddingY,
    isBgTransparent, randomRotate, subtitleAnim, wordAnim, subtitleBounds, videoWidth, videoHeight
  } = options;

  const animStyles = getSubtitleAnimStyle(subtitleAnim, currentTime - sub.start);
  
  let processedText = sub.text;
  if (!showPunctuation) {
    processedText = processedText.replace(/[.,!?;:"']/g, '');
  }
  const words = processedText.split(/\s+/).filter(Boolean);
  
  const backgroundColor = hexToRgba(bgColor, bgOpacity);

  let chunkedWords: string[][] = [];
  if (maxWordsPerLine !== 'Auto') {
    const limit = parseInt(maxWordsPerLine, 10);
    for (let i = 0; i < words.length; i += limit) {
      chunkedWords.push(words.slice(i, i + limit));
    }
  } else {
    chunkedWords = [words];
  }

  const wordDuration = (sub.end - sub.start) / Math.max(1, words.length);
  const activeWordIndex = Math.floor((currentTime - sub.start) / wordDuration);

  // We render the container at the absolute pixel dimensions to match the video exactly
  const left = (subtitleBounds.x / 100) * videoWidth;
  const top = (subtitleBounds.y / 100) * videoHeight;
  const width = (subtitleBounds.width / 100) * videoWidth;
  const height = (subtitleBounds.height / 100) * videoHeight;

  // We scale the font size up relative to the original video height
  // Assuming the preview window is around 600px tall in the editor, we scale proportionally
  const scaleRatio = videoHeight / 600;
  const scaledFontSize = subtitleFontSize * scaleRatio;
  const scaledRadius = bgRadius * scaleRatio;
  const scaledPaddingX = bgPaddingX * scaleRatio;
  const scaledPaddingY = bgPaddingY * scaleRatio;

  return (
    <div style={{ width: videoWidth, height: videoHeight, position: 'relative', overflow: 'hidden', backgroundColor: 'transparent' }}>
      <div style={{ position: 'absolute', left, top, width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2
          className={`leading-tight ${templateClassName} ${subtitleStyle.italic ? 'italic' : ''} ${subtitleStyle.allCaps ? 'uppercase' : ''}`}
          style={{
            ...templateStyle,
            fontSize: `${scaledFontSize}px`,
            fontWeight: subtitleStyle.bold ? 900 : (templateStyle.fontWeight || 700),
            fontFamily: fontFamily || 'inherit',
            color: fontColor !== '#ffffff' ? fontColor : (templateStyle.color || '#ffffff'),
            lineHeight: lineSpacing,
            fontStyle: subtitleStyle.italic ? 'italic' : (templateStyle.fontStyle || 'normal'),
            textTransform: subtitleStyle.allCaps ? 'uppercase' : (templateStyle.textTransform || 'none'),
            textAlign: fontAlign as any,
            ...(outline !== 'None' ? { WebkitTextStroke: outline === 'Thin' ? `${2 * scaleRatio}px black` : `${4 * scaleRatio}px black` } : {}),
            ...(shadow !== 'None' ? { textShadow: shadow === 'Soft' ? `0px ${4 * scaleRatio}px ${8 * scaleRatio}px rgba(0,0,0,0.75)` : `${2 * scaleRatio}px ${2 * scaleRatio}px 0px black, ${3 * scaleRatio}px ${3 * scaleRatio}px 0px black` } : {}),
            WebkitLineClamp: maxLines > 0 ? maxLines : undefined,
            display: maxLines > 0 ? '-webkit-box' : 'block',
            WebkitBoxOrient: maxLines > 0 ? 'vertical' : undefined,
            overflow: maxLines > 0 ? 'hidden' : 'visible',
            backgroundColor: bgStyle === 'Fill' && !isBgTransparent ? backgroundColor : (templateStyle.backgroundColor || 'transparent'),
            borderRadius: `${scaledRadius}px`,
            padding: bgStyle === 'Fill' && !isBgTransparent ? `${scaledPaddingY}px ${scaledPaddingX}px` : (templateStyle.padding || '0'),
            width: bgStyle === 'Fill' ? '100%' : 'auto',
            transform: animStyles.transform || (randomRotate ? `rotate(${(Math.round(sub.start * 13) % 5) - 2}deg)` : (templateStyle.transform || 'none')),
            opacity: animStyles.opacity !== undefined ? animStyles.opacity : 1,
          }}
        >
          {chunkedWords.map((chunk, chunkIdx) => (
            <span key={chunkIdx} className={bgStyle === 'Fit' || bgStyle === 'Wrap' ? 'block' : 'inline'}>
              <span
                className={bgStyle === 'Fit' || bgStyle === 'Wrap' ? 'inline-block' : 'inline'}
                style={(bgStyle === 'Fit' || bgStyle === 'Wrap') && !isBgTransparent ? { backgroundColor, borderRadius: `${scaledRadius}px`, padding: `${scaledPaddingY}px ${scaledPaddingX}px`, marginBottom: '4px' } : {}}
              >
                {chunk.map((w, idx) => {
                  const globalIdx = chunkIdx * (maxWordsPerLine === 'Auto' ? words.length : parseInt(maxWordsPerLine, 10)) + idx;
                  let wordClasses = "inline-block mx-[0.12em] transition-none "; // Removed transition for instant snapshot
                  
                  if (wordAnim === 'Reveal') {
                    wordClasses += globalIdx <= activeWordIndex ? "opacity-100" : "opacity-0";
                  } else if (wordAnim === 'Karaoke') {
                    wordClasses += globalIdx === activeWordIndex ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "";
                  } else if (wordAnim === 'Highlight') {
                    wordClasses += globalIdx === activeWordIndex ? "bg-amber-500 text-[#0d142d] px-1 rounded-sm" : "";
                  } else if (wordAnim === 'Scale') {
                    wordClasses += globalIdx === activeWordIndex ? "scale-[1.2] text-amber-400" : "";
                  }

                  const isFiller = options.filterFillerWords && w.match(/\b(um|uh|ums|uhs)\b/i);
                  if (isFiller) {
                    wordClasses += " line-through opacity-50 decoration-red-500 decoration-2";
                  }

                  return (
                    <span key={globalIdx} className={wordClasses}>
                      {w}
                    </span>
                  );
                })}
              </span>
              {chunkIdx < chunkedWords.length - 1 && <br />}
            </span>
          ))}
        </h2>
      </div>
    </div>
  );
};

const safeToCanvas = async (container: HTMLElement, baseOptions: any): Promise<HTMLCanvasElement> => {
  // Temporarily remove cross-origin stylesheets to prevent html-to-image SecurityError
  const styleNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
  const problematicNodes: { node: Element, parent: Node, nextSibling: Node | null }[] = [];

  styleNodes.forEach((node) => {
    try {
      const sheet = (node as any).sheet;
      if (sheet) {
        // This will throw a SecurityError if the stylesheet is cross-origin and lacks CORS headers
        const rules = sheet.cssRules;
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'SecurityError') {
        if (node.parentNode) {
          problematicNodes.push({ node, parent: node.parentNode, nextSibling: node.nextSibling });
          node.remove();
        }
      }
    }
  });

  let lastError = null;
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await toCanvas(container, { 
          ...baseOptions,
          skipFonts: attempt > 0,
          cacheBust: true,
        });
      } catch (err) {
        console.warn(`toCanvas attempt ${attempt + 1} failed:`, err);
        lastError = err;
        await new Promise(r => setTimeout(r, 200));
      }
    }
  } finally {
    // Restore the problematic stylesheets
    problematicNodes.forEach(({ node, parent, nextSibling }) => {
      parent.insertBefore(node, nextSibling);
    });
  }
  
  throw lastError;
};

export async function exportVideo(
  options: ExportOptions,
  onProgress: (status: string, progress: number) => void
): Promise<Blob> {
  const { videoBlob, wordAnim, subtitleAnim, aspectRatio, videoBounds, removeSilences, silenceCuts } = options;
  const originalVideoWidth = options.videoWidth;
  const originalVideoHeight = options.videoHeight;

  let subtitles = [...options.subtitles];
  if (removeSilences && silenceCuts && silenceCuts.length > 0) {
     subtitles = subtitles.map(sub => {
       let newStart = sub.start;
       let newEnd = sub.end;
       
       for (const cut of silenceCuts) {
         if (sub.start >= cut.end) {
           newStart -= (cut.end - cut.start);
         } else if (sub.start > cut.start && sub.start < cut.end) {
           newStart -= (sub.start - cut.start);
         }
         if (sub.end >= cut.end) {
           newEnd -= (cut.end - cut.start);
         } else if (sub.end > cut.start && sub.end < cut.end) {
           newEnd -= (sub.end - cut.start);
         }
       }
       return { ...sub, start: newStart, end: newEnd };
     });
  }
  let { videoWidth, videoHeight } = options;

  if (aspectRatio === "9:16 (TikTok)") {
     videoWidth = 1080; videoHeight = 1920;
  } else if (aspectRatio === "16:9 (YouTube)") {
     videoWidth = 1920; videoHeight = 1080;
  } else if (aspectRatio === "1:1 (Instagram)") {
     videoWidth = 1080; videoHeight = 1080;
  } else if (aspectRatio === "4:5 (Facebook)") {
     videoWidth = 1080; videoHeight = 1350;
  }

  // Update options so SubtitleSnapshot uses the new canvas bounds
  options.videoWidth = videoWidth;
  options.videoHeight = videoHeight;

  onProgress("Initializing Export...", 0);

  // 1. Setup off-screen container for snapshotting
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = `${videoWidth}px`;
  container.style.height = `${videoHeight}px`;
  container.style.zIndex = '-9999';
  document.body.appendChild(container);
  
  const root = createRoot(container);

  // 2. Pre-render frames
  // A map of { start, end, canvas }
  const preRenderedFrames: { start: number; end: number; canvas: HTMLCanvasElement }[] = [];

  const requiresWordLevelSnapshots = ['Reveal', 'Karaoke', 'Highlight', 'Scale'].includes(wordAnim);

  onProgress("Rendering Overlay Graphics...", 5);
  
  for (let i = 0; i < subtitles.length; i++) {
    const sub = subtitles[i];
    let wordsCount = sub.text.split(/\s+/).filter(Boolean).length;
    if (wordsCount === 0) wordsCount = 1;
    
    const wordDuration = (sub.end - sub.start) / wordsCount;

    const hasSubtitleAnim = subtitleAnim && subtitleAnim !== 'None';
    const subtitleAnimDuration = hasSubtitleAnim ? (subtitleAnim === 'Rotate & Flip' ? 0.5 : 0.4) : 0;
    
    let snapshotTimes: number[] = [];
    
    // Add 30fps frames for entrance animation
    if (hasSubtitleAnim) {
      for (let t = 0; t <= subtitleAnimDuration + 0.033; t += 0.033) {
         snapshotTimes.push(sub.start + t);
      }
    }

    // Add word animation frames
    if (requiresWordLevelSnapshots) {
      for (let j = 0; j < wordsCount; j++) {
        snapshotTimes.push(sub.start + (j * wordDuration) + 0.01);
      }
    }

    if (snapshotTimes.length === 0) {
       snapshotTimes.push(sub.start + 0.1);
    }

    snapshotTimes.sort((a, b) => a - b);
    const uniqueTimes: number[] = [];
    snapshotTimes.forEach(t => {
       if (uniqueTimes.length === 0 || t - uniqueTimes[uniqueTimes.length - 1] > 0.01) {
           uniqueTimes.push(t);
       }
    });

    for (let j = 0; j < uniqueTimes.length; j++) {
      const frameTime = uniqueTimes[j];
      const chunkEnd = j < uniqueTimes.length - 1 ? uniqueTimes[j+1] : sub.end;
      
      flushSync(() => {
        root.render(<SubtitleSnapshot options={options} sub={sub} currentTime={frameTime} />);
      });

      const canvas = await safeToCanvas(container, { width: videoWidth, height: videoHeight, pixelRatio: 1, backgroundColor: 'rgba(0,0,0,0)' });
      preRenderedFrames.push({ start: frameTime, end: chunkEnd, canvas });
    }
    
    onProgress("Rendering Overlay Graphics...", 5 + Math.floor((i / subtitles.length) * 15));
  }

  // Cleanup React root
  setTimeout(() => {
    root.unmount();
    container.remove();
  }, 1000);

  // 3. Setup Mediabunny Conversion
  onProgress("Encoding MP4...", 20);

  const input = new Input({ source: new BlobSource(videoBlob), formats: ALL_FORMATS });
  const target = new BufferTarget();
  const output = new Output({ format: new Mp4OutputFormat(), target });

  const offscreenCanvas = document.createElement('canvas');
  let ctx: CanvasRenderingContext2D | null = null;

  const conversion = await Conversion.init({
    input,
    output,
    video: {
      process: async (sample: VideoSample) => {
        if (!ctx) {
          offscreenCanvas.width = videoWidth;
          offscreenCanvas.height = videoHeight;
          ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
        }
        if (!ctx) return sample;

        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
        
        let destX = 0, destY = 0, destW = offscreenCanvas.width, destH = offscreenCanvas.height;
        if (videoBounds) {
           destX = (videoBounds.x / 100) * offscreenCanvas.width;
           destY = (videoBounds.y / 100) * offscreenCanvas.height;
           destW = (videoBounds.width / 100) * offscreenCanvas.width;
           destH = (videoBounds.height / 100) * offscreenCanvas.height;
        }

        // Apply object-cover logic to perfectly match the tight bounding box
        const imageWidth = (sample as any).displayWidth || (sample as any).squarePixelWidth || originalVideoWidth;
        const imageHeight = (sample as any).displayHeight || (sample as any).squarePixelHeight || originalVideoHeight;
        
        const scale = Math.max(destW / imageWidth, destH / imageHeight);
        const scaledW = imageWidth * scale;
        const scaledH = imageHeight * scale;
        const offsetX = (destW - scaledW) / 2;
        const offsetY = (destH - scaledH) / 2;

        const finalX = destX + offsetX;
        const finalY = destY + offsetY;
        const finalW = scaledW;
        const finalH = scaledH;
        
        let drewSuccessfully = false;
        try {
          const imageSource = (sample as any).toCanvasImageSource ? (sample as any).toCanvasImageSource() : ((sample as any).frame || sample);
          ctx.drawImage(imageSource, finalX, finalY, finalW, finalH);
          drewSuccessfully = true;
        } catch (e) {
          console.warn("Failed first draw attempt, trying fallback", e);
          try {
            const imageSource = (sample as any).toCanvasImageSource ? (sample as any).toCanvasImageSource() : ((sample as any).frame || sample);
            const bitmap = await createImageBitmap(imageSource);
            ctx.drawImage(bitmap, finalX, finalY, finalW, finalH);
            bitmap.close();
            drewSuccessfully = true;
          } catch (e2) {
            console.error("Failed fallback draw", e2);
          }
        }

        if (!drewSuccessfully) {
           // If we couldn't draw the original frame, just return the sample as-is to avoid a completely blank video!
           return sample;
        }

        let seconds = sample.timestamp;
        if (typeof seconds === 'number' && seconds > 10000) {
           seconds = seconds / 1000000;
        }

        if (removeSilences && silenceCuts && silenceCuts.length > 0) {
           const inCut = silenceCuts.some(cut => seconds >= cut.start && seconds < cut.end);
           if (inCut) return null;
           
           let shiftedTime = seconds;
           for (const cut of silenceCuts) {
             if (seconds >= cut.end) {
               shiftedTime -= (cut.end - cut.start);
             }
           }
           seconds = shiftedTime;
        }

        const activeFrame = preRenderedFrames.find(f => seconds >= f.start && seconds < f.end);
        
        if (activeFrame) {
          ctx.drawImage(activeFrame.canvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
        }

        if (removeSilences) {
           const shiftedSample: any = (sample as any).clone();
           shiftedSample.setTimestamp(typeof sample.timestamp === 'number' && sample.timestamp > 10000 ? seconds * 1000000 : seconds);
           
           // Wrap the drawn canvas into a new video sample that mediabunny understands
           // For video, we just return the offscreen canvas as image source, but since we modified 
           // the timestamp above, we can return a new VideoSample constructed properly
           return new VideoSample(offscreenCanvas as any, { 
             timestamp: typeof sample.timestamp === 'number' && sample.timestamp > 10000 ? seconds * 1000000 : seconds,
             duration: sample.duration 
           });
        }

        if (options.addWatermark) {
          // Add watermark logo and text at the bottom right
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          const padding = 20;
          ctx.fillText('addsubtitles.tech', offscreenCanvas.width - padding, offscreenCanvas.height - padding);
          
          // Optionally, if we had an Image object for the logo we could draw it here too.
        }

        return offscreenCanvas;
      }
    },
    audio: {
      process: async (audioSample: AudioSample) => {
        let seconds = typeof audioSample.timestamp === 'number' && audioSample.timestamp > 10000 ? audioSample.timestamp / 1000000 : audioSample.timestamp;

        if (removeSilences && silenceCuts && silenceCuts.length > 0) {
           const inCut = silenceCuts.some(cut => seconds >= cut.start && seconds < cut.end);
           if (inCut) return null;
           
           let shiftedTime = seconds;
           for (const cut of silenceCuts) {
             if (seconds >= cut.end) {
               shiftedTime -= (cut.end - cut.start);
             }
           }
           
           const shiftedSample: any = (audioSample as any).clone();
           shiftedSample.setTimestamp(typeof audioSample.timestamp === 'number' && audioSample.timestamp > 10000 ? shiftedTime * 1000000 : shiftedTime);
           return shiftedSample as AudioSample;
        }
        return audioSample;
      }
    }
  });

  conversion.onProgress = (progress) => {
    onProgress("Encoding MP4...", 20 + (progress * 80));
  };

  await conversion.execute();

  if (!target.buffer) {
    throw new Error("Export failed to produce a buffer.");
  }

  return new Blob([target.buffer], { type: 'video/mp4' });
}
