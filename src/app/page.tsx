"use client";

import React, { useState, useEffect, useRef } from "react";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from "@/providers/AuthProvider";
import { extractAudioToWav } from '@/lib/audioExtractor';
import { SilenceInterval } from '@/lib/silenceDetection';
import { generateHooksFromText, translateSubtitles } from '@/lib/magicServices';
import UpgradeModal from '@/components/UpgradeModal';
import {
  Type,
  Sparkles,
  Download,
  ChevronDown,
  RotateCcw,
  RotateCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  FileVideo,
  Settings,
  MessageSquare,
  X,
  Bookmark,
  Crown,
  Palette,
  Wand2,
  LayoutTemplate,
  Square,
  Grid3X3,
  Settings2,
  Languages,
  Upload,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CaseSensitive,
  ZoomIn,
  MoveUp,
  MoveDown,
  ArrowDownToLine,
  FlipHorizontal,
  RefreshCw,
  Zap,
  Waves,
  Eye,
  Music,
  Highlighter,
  Maximize,
  Sun,
  ZoomOut,
  AlignJustify,
  SkipBack,
  SkipForward,
  Keyboard,
  Trash,
  Plus,
  Wand
} from "lucide-react";
import { exportVideo } from '../lib/exportVideo';
import { HexColorPicker } from "react-colorful";

const getSubtitleStyles = (template: string) => {
  let className = "";
  let style: React.CSSProperties = {};

  switch (template) {
    case 'Classic':
      className = "bg-black/70 px-4 py-2 rounded-lg text-white font-sans font-bold shadow-md border border-white/10";
      style = {};
      break;
    case 'BANGERS':
      className = "text-amber-400 font-black italic tracking-wider uppercase";
      style = { WebkitTextStroke: '2px black', textShadow: '2px 2px 0 #000, 4px 4px 0 #000' };
      break;
    case 'STREET':
      className = "text-white font-black uppercase tracking-widest drop-shadow-lg";
      style = { WebkitTextStroke: '1.5px rgba(255,255,255,0.4)' };
      break;
    case 'BEAST':
      className = "text-yellow-400 font-black italic uppercase tracking-tighter";
      style = { WebkitTextStroke: '3px black', textShadow: '0 4px 8px rgba(0,0,0,1)' };
      break;
    case 'Clean':
      className = "text-white font-semibold tracking-tight drop-shadow-md";
      style = {};
      break;
    case 'Highlight':
      className = "bg-amber-500 text-[#0d142d] px-3 py-1 font-bold inline-block transform -rotate-2 shadow-lg";
      style = {};
      break;
    case 'FIRE':
      className = "text-red-500 font-black uppercase tracking-widest";
      style = { WebkitTextStroke: '1.5px #450a0a', textShadow: '0 0 20px rgba(239,68,68,0.8)' };
      break;
    case 'Default':
    default:
      className = "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]";
      style = {};
      break;
  }
  return { className, style };
};

const getSubtitleAnimClass = (animName: string) => {
  switch (animName) {
    case 'Fade': return 'animate-in fade-in duration-300';
    case 'Pop': return 'animate-anim-pop';
    case 'Slide': return 'animate-anim-slide';
    case 'Float Up': return 'animate-anim-float-up';
    case 'Float Down': return 'animate-anim-float-down';
    case 'Drop In': return 'animate-anim-drop-in';
    case 'Flip': return 'animate-anim-flip';
    case 'Rotate & Flip': return 'animate-anim-rotate-flip';
    case 'Stomp': return 'animate-anim-stomp';
    case 'Wave': return 'animate-anim-wave';
    default: return '';
  }
};
export default function Home() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(14.7);
  const [totalDuration, setTotalDuration] = useState(52.1);
  const [activeTab, setActiveTab] = useState("subtitles");
  const [activeStyleFilter, setActiveStyleFilter] = useState("All");
  const [bgColor, setBgColor] = useState("#ec4899");
  const [fontColor, setFontColor] = useState("#ffffff");
  const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

  // Layout State
  const [maxLines, setMaxLines] = useState(2);
  const [maxWordsPerLine, setMaxWordsPerLine] = useState("Auto");
  const [randomRotate, setRandomRotate] = useState(false);

  // Background State
  const [bgStyle, setBgStyle] = useState("Fit");
  const [bgRadius, setBgRadius] = useState(16);
  const [bgOpacity, setBgOpacity] = useState(100);
  const [bgPaddingX, setBgPaddingX] = useState(40);
  const [bgPaddingY, setBgPaddingY] = useState(20);
  const [isBgTransparent, setIsBgTransparent] = useState(true);

  // Font State
  const [fontFamily, setFontFamily] = useState("Montserrat");
  const [fontAlign, setFontAlign] = useState("center");
  const [lineSpacing, setLineSpacing] = useState(1.2);
  const [showPunctuation, setShowPunctuation] = useState(true);
  const [outline, setOutline] = useState("None");
  const [shadow, setShadow] = useState("None");

  // Player State
  const [volume, setVolume] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [timelineZoom, setTimelineZoom] = useState(30); // pixels per second

  // Canvas State
  const [aspectRatio, setAspectRatio] = useState("Original");
  const [lockBackground, setLockBackground] = useState(false);

  // Animate State
  const [subtitleAnim, setSubtitleAnim] = useState("Pop");
  const [wordAnim, setWordAnim] = useState("Karaoke");

  // Styles State
  const [activeTemplate, setActiveTemplate] = useState("Classic");

  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [resizeState, setResizeState] = useState<{ index: number, edge: 'start' | 'end' | 'move', offsetX?: number } | null>(null);
  const [editingSubtitleIndex, setEditingSubtitleIndex] = useState<number | null>(null);
  const [isEditingOverlaySubtitle, setIsEditingOverlaySubtitle] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOpenProjectModal, setShowOpenProjectModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [uploadLanguage, setUploadLanguage] = useState("English (US)");
  const [subtitleFontSize, setSubtitleFontSize] = useState(75);
  const [showSubtitleMoreOptions, setShowSubtitleMoreOptions] = useState(false);
  const [subtitleStyle, setSubtitleStyle] = useState({ bold: false, italic: false, allCaps: false });

  const handleTemplateSelect = (templateName: string) => {
    setActiveTemplate(templateName);

    // Default "base" properties that apply to ALL templates unless overridden
    const baseStyle = {
      fontColor: '#ffffff',
      fontFamily: 'Montserrat',
      subtitleStyle: { bold: false, italic: false, allCaps: false },
      bgStyle: 'None',
      bgColor: '#000000',
      outline: 'None',
      shadow: 'None',
      subtitleAnim: 'Pop',
      wordAnim: 'Karaoke',
      subtitleFontSize: 75,
      maxLines: 2,
    };

    let overrides = {};

    switch (templateName) {
      case 'Classic':
        overrides = { bgStyle: 'Fill', bgColor: '#000000', outline: 'None', shadow: 'Hard', subtitleStyle: { bold: true, italic: false, allCaps: false }, fontFamily: 'Inter' };
        break;
      case 'BANGERS':
        overrides = { fontColor: '#FBBF24', fontFamily: 'Montserrat', outline: 'Hard', shadow: 'Hard', subtitleStyle: { bold: true, italic: true, allCaps: true } };
        break;
      case 'STREET':
        overrides = { fontFamily: 'Montserrat', outline: 'Soft', shadow: 'Soft', subtitleStyle: { bold: true, italic: false, allCaps: true } };
        break;
      case 'BEAST':
        overrides = { fontColor: '#EAB308', fontFamily: 'Montserrat', outline: 'Hard', shadow: 'Hard', subtitleStyle: { bold: true, italic: true, allCaps: true } };
        break;
      case 'Clean':
        overrides = { fontFamily: 'Montserrat', shadow: 'None' };
        break;
      case 'Highlight':
        overrides = { fontColor: '#0d142d', fontFamily: 'Inter', bgStyle: 'Fill', bgColor: '#F59E0B', shadow: 'None', subtitleStyle: { bold: true, italic: false, allCaps: false } };
        break;
      case 'FIRE':
        overrides = { fontColor: '#EF4444', fontFamily: 'Montserrat', outline: 'Soft', shadow: 'Hard', subtitleStyle: { bold: true, italic: false, allCaps: true } };
        break;
      case 'Default':
      default:
        overrides = { shadow: 'Soft', fontFamily: 'Montserrat' };
        break;
    }

    const finalStyle = { ...baseStyle, ...overrides } as typeof baseStyle;

    setFontColor(finalStyle.fontColor);
    setFontFamily(finalStyle.fontFamily);
    setSubtitleStyle(finalStyle.subtitleStyle);
    setBgStyle(finalStyle.bgStyle);
    setBgColor(finalStyle.bgColor);
    setOutline(finalStyle.outline);
    setShadow(finalStyle.shadow);
    setSubtitleAnim(finalStyle.subtitleAnim);
    setWordAnim(finalStyle.wordAnim);
    setSubtitleFontSize(finalStyle.subtitleFontSize);
    setMaxLines(finalStyle.maxLines);
  };

  // Interactive Canvas State
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isExtractingAudio, setIsExtractingAudio] = useState(false);
  const [audioExtractProgress, setAudioExtractProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [exportProgress, setExportProgress] = useState(0);
  const [silenceCuts, setSilenceCuts] = useState<SilenceInterval[]>([]);
  const [removeSilences, setRemoveSilences] = useState(false);
  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [generatedHooks, setGeneratedHooks] = useState<string[]>([]);
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [isTranslating, setIsTranslating] = useState(false);
  const [filterFillerWords, setFilterFillerWords] = useState(false);
  const [autoEmoji, setAutoEmoji] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState("Top");
  const [emojiSize, setEmojiSize] = useState("Large");
  const [canvasAspectRatio, setCanvasAspectRatio] = useState("16/9");
  const [activeCanvasElement, setActiveCanvasElement] = useState<'video' | 'subtitle' | null>(null);
  const [videoBounds, setVideoBounds] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [subtitleBounds, setSubtitleBounds] = useState({ x: 10, y: 70, width: 80, height: 20 });
  const [canvasInteraction, setCanvasInteraction] = useState<{
    element: 'video' | 'subtitle';
    action: 'move' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br';
    startX: number;
    startY: number;
    initialBounds: { x: number, y: number, width: number, height: number };
  } | null>(null);

  const [timelineSegments, setTimelineSegments] = useState([
    { start: 6, end: 8.5, label: "um o use, no sign, uh no payment required." },
    { start: 9, end: 11.5, label: "Here's how it works..." },
    { start: 12, end: 14.5, label: "Upload your video." },
    { start: 15, end: 17.5, label: "Edit your subtitles um word by word." },
    { start: 18, end: 20.5, label: "Customize fonts, colors, and positioning." },
    { start: 21, end: 25, label: "Adjust uh timing and styli" },
  ]);

  // Audio & media tracks references and states
  const audioInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [audioSegments, setAudioSegments] = useState<Array<{ id: string; name: string; start: number; end: number; label: string; src: string }>>([
    { id: "mock-audio-1", name: "Voiceover.mp3", start: 2, end: 5.5, label: "Hi there! Welcome to the editor.", src: "" }
  ]);
  const [videoSegments, setVideoSegments] = useState<Array<{ id: string; name: string; type: 'video' | 'image'; start: number; end: number; src: string }>>([]);
  const [selectedItem, setSelectedItem] = useState<{ type: 'subtitle' | 'audio' | 'video'; id: string | number } | null>(null);
  const [addSubtitleTime, setAddSubtitleTime] = useState<number | null>(null);

  // Global Keydown handler for Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (!selectedItem) return;
        if (selectedItem.type === 'subtitle') {
          const next = timelineSegmentsRef.current.filter((_, idx) => idx !== selectedItem.id);
          setTimelineSegments(next);
          setHistory(prevHistory => {
            const index = historyIndexRef.current;
            const nextHistory = [...prevHistory.slice(0, index + 1), JSON.parse(JSON.stringify(next))];
            setHistoryIndex(nextHistory.length - 1);
            return nextHistory;
          });
        } else if (selectedItem.type === 'audio') {
          setAudioSegments(prev => prev.filter(item => item.id !== selectedItem.id));
        } else if (selectedItem.type === 'video') {
          setVideoSegments(prev => prev.filter(item => item.id !== selectedItem.id));
        }
        setSelectedItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItem]);

  // Scroll selected subtitle card in sidebar into view
  useEffect(() => {
    if (selectedItem?.type === 'subtitle') {
      // Small timeout to ensure the tab panel has expanded/rendered first
      const timer = setTimeout(() => {
        const el = document.getElementById(`sidebar-sub-${selectedItem.id}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedItem]);

  // Sync canvas aspect ratio when aspect ratio setting changes
  useEffect(() => {
    let canvasW = 1920; let canvasH = 1080;
    if (aspectRatio === "9:16 (TikTok)") {
      setCanvasAspectRatio("9/16");
      canvasW = 1080; canvasH = 1920;
    } else if (aspectRatio === "16:9 (YouTube)") {
      setCanvasAspectRatio("16/9");
      canvasW = 1920; canvasH = 1080;
    } else if (aspectRatio === "1:1 (Instagram)") {
      setCanvasAspectRatio("1/1");
      canvasW = 1080; canvasH = 1080;
    } else if (aspectRatio === "4:5 (Facebook)") {
      setCanvasAspectRatio("4/5");
      canvasW = 1080; canvasH = 1350;
    } else {
      if (videoRef.current && videoRef.current.videoWidth) {
        setCanvasAspectRatio(`${videoRef.current.videoWidth}/${videoRef.current.videoHeight}`);
        canvasW = videoRef.current.videoWidth; canvasH = videoRef.current.videoHeight;
      }
    }

    if (videoRef.current && videoRef.current.videoWidth) {
      const scale = Math.min(canvasW / videoRef.current.videoWidth, canvasH / videoRef.current.videoHeight);
      const fitW = videoRef.current.videoWidth * scale;
      const fitH = videoRef.current.videoHeight * scale;
      setVideoBounds({
        x: ((canvasW - fitW) / 2 / canvasW) * 100,
        y: ((canvasH - fitH) / 2 / canvasH) * 100,
        width: (fitW / canvasW) * 100,
        height: (fitH / canvasH) * 100
      });
    }
  }, [aspectRatio, videoSrc]);

  const handleTimelineDrag = (e: React.MouseEvent<HTMLDivElement> | MouseEvent) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const trackWidth = Math.max(rect.width, totalDuration * timelineZoom);
    const x = Math.max(0, Math.min(e.clientX - rect.left + timelineRef.current.scrollLeft, trackWidth));
    const percentage = x / trackWidth;
    const newTime = percentage * totalDuration;

    if (resizeState !== null) {
      setTimelineSegments(prev => {
        const newSegs = [...prev];
        if (resizeState.edge === 'start') {
          newSegs[resizeState.index].start = Math.min(newTime, newSegs[resizeState.index].end - 0.5);
        } else if (resizeState.edge === 'end') {
          newSegs[resizeState.index].end = Math.max(newTime, newSegs[resizeState.index].start + 0.5);
        } else if (resizeState.edge === 'move' && resizeState.offsetX !== undefined) {
          const duration = newSegs[resizeState.index].end - newSegs[resizeState.index].start;
          const newStart = Math.max(0, Math.min(newTime - resizeState.offsetX, totalDuration - duration));
          newSegs[resizeState.index].start = newStart;
          newSegs[resizeState.index].end = newStart + duration;
        }
        return newSegs;
      });
    } else if (isDraggingTimeline) {
      setCurrentTime(newTime);
      setAddSubtitleTime(null);
      if (videoRef.current) {
        videoRef.current.currentTime = newTime;
      }
    }
  };

  const handleAddSubtitleAtTime = (time: number) => {
    const newStart = Math.max(0, Math.min(totalDuration - 2, time));
    const newEnd = Math.min(totalDuration, newStart + 2);
    const newSeg = { start: newStart, end: newEnd, label: "New Subtitle" };
    const updated = [...timelineSegments, newSeg].sort((a, b) => a.start - b.start);
    setTimelineSegments(updated);
    const newIdx = updated.findIndex(s => s.start === newStart && s.end === newEnd);
    if (newIdx !== -1) {
      setSelectedItem({ type: 'subtitle', id: newIdx });
    }
    setHistory(prevHistory => {
      const index = historyIndexRef.current;
      const nextHistory = [...prevHistory.slice(0, index + 1), JSON.parse(JSON.stringify(updated))];
      setHistoryIndex(nextHistory.length - 1);
      return nextHistory;
    });
  };

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDraggingTimeline || resizeState !== null || canvasInteraction !== null) {
        setHistory(prevHistory => {
          const latest = timelineSegmentsRef.current;
          const index = historyIndexRef.current;
          const updated = prevHistory.slice(0, index + 1);
          if (updated.length > 0 && JSON.stringify(updated[updated.length - 1]) === JSON.stringify(latest)) {
            return prevHistory;
          }
          const nextHistory = [...updated, JSON.parse(JSON.stringify(latest))];
          setHistoryIndex(nextHistory.length - 1);
          return nextHistory;
        });
      }
      setIsDraggingTimeline(false);
      setResizeState(null);
      setCanvasInteraction(null);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingTimeline || resizeState !== null) {
        handleTimelineDrag(e);
      }

      if (canvasInteraction && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const deltaX = ((e.clientX - canvasInteraction.startX) / rect.width) * 100;
        const deltaY = ((e.clientY - canvasInteraction.startY) / rect.height) * 100;

        const setBounds = canvasInteraction.element === 'video' ? setVideoBounds : setSubtitleBounds;
        const initial = canvasInteraction.initialBounds;

        setBounds(prev => {
          let newBounds = { ...initial };

          if (canvasInteraction.element === 'video') {
            const vidRatio = videoRef.current ? (videoRef.current.videoWidth / videoRef.current.videoHeight) : (16 / 9);
            let cw = 1920, ch = 1080;
            if (aspectRatio === "9:16 (TikTok)") { cw = 1080; ch = 1920; }
            else if (aspectRatio === "1:1 (Instagram)") { cw = 1080; ch = 1080; }
            else if (aspectRatio === "4:5 (Facebook)") { cw = 1080; ch = 1350; }
            else if (videoRef.current) { cw = videoRef.current.videoWidth; ch = videoRef.current.videoHeight; }

            const canvasRatio = cw / ch;
            const updateHeightFromWidth = (wPct: number) => wPct * canvasRatio / vidRatio;

            if (canvasInteraction.action === 'move') {
              newBounds.x = initial.x + deltaX;
              newBounds.y = initial.y + deltaY;
            } else if (canvasInteraction.action === 'resize-br') {
              newBounds.width = Math.max(10, initial.width + deltaX);
              newBounds.height = updateHeightFromWidth(newBounds.width);
            } else if (canvasInteraction.action === 'resize-bl') {
              newBounds.width = Math.max(10, initial.width - deltaX);
              newBounds.height = updateHeightFromWidth(newBounds.width);
              newBounds.x = initial.x + initial.width - newBounds.width;
            } else if (canvasInteraction.action === 'resize-tr') {
              newBounds.width = Math.max(10, initial.width + deltaX);
              newBounds.height = updateHeightFromWidth(newBounds.width);
              newBounds.y = initial.y + initial.height - newBounds.height;
            } else if (canvasInteraction.action === 'resize-tl') {
              newBounds.width = Math.max(10, initial.width - deltaX);
              newBounds.height = updateHeightFromWidth(newBounds.width);
              newBounds.x = initial.x + initial.width - newBounds.width;
              newBounds.y = initial.y + initial.height - newBounds.height;
            }
          } else {
            if (canvasInteraction.action === 'move') {
              newBounds.x = initial.x + deltaX;
              newBounds.y = initial.y + deltaY;
            } else if (canvasInteraction.action === 'resize-br') {
              newBounds.width = Math.max(10, initial.width + deltaX);
              newBounds.height = Math.max(10, initial.height + deltaY);
            } else if (canvasInteraction.action === 'resize-bl') {
              newBounds.x = initial.x + deltaX;
              newBounds.width = Math.max(10, initial.width - deltaX);
              newBounds.height = Math.max(10, initial.height + deltaY);
            } else if (canvasInteraction.action === 'resize-tr') {
              newBounds.y = initial.y + deltaY;
              newBounds.width = Math.max(10, initial.width + deltaX);
              newBounds.height = Math.max(10, initial.height - deltaY);
            } else if (canvasInteraction.action === 'resize-tl') {
              newBounds.x = initial.x + deltaX;
              newBounds.y = initial.y + deltaY;
              newBounds.width = Math.max(10, initial.width - deltaX);
              newBounds.height = Math.max(10, initial.height - deltaY);
            }
          }
          return newBounds;
        });
      }
    };

    if (isDraggingTimeline || resizeState !== null || canvasInteraction !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingTimeline, resizeState, canvasInteraction, totalDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      setAddSubtitleTime(null);
      if (videoRef.current) {
        videoRef.current.play().catch(e => console.error("Video play error:", e));
      } else {
        interval = setInterval(() => {
          setCurrentTime((prev) => {
            if (prev >= totalDuration) {
              setIsPlaying(false);
              return 0;
            }
            return prev + 0.1;
          });
        }, 100);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalDuration, videoSrc]);

  const { user, setUser, loading } = useAuth();

  const [customPresets, setCustomPresets] = useState<Array<{ id: string; name: string; styleJson: any }>>([]);
  const [isProcessingSubtitles, setIsProcessingSubtitles] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const [history, setHistory] = useState<Array<typeof timelineSegments>>([
    [
      { start: 6, end: 8.5, label: "um o use, no sign, uh no payment required." },
      { start: 9, end: 11.5, label: "Here's how it works..." },
      { start: 12, end: 14.5, label: "Upload your video." },
      { start: 15, end: 17.5, label: "Edit your subtitles um word by word." },
      { start: 18, end: 20.5, label: "Customize fonts, colors, and positioning." },
      { start: 21, end: 25, label: "Adjust uh timing and styli" },
    ]
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const timelineSegmentsRef = useRef(timelineSegments);
  useEffect(() => {
    timelineSegmentsRef.current = timelineSegments;
  }, [timelineSegments]);

  const historyIndexRef = useRef(historyIndex);
  useEffect(() => {
    historyIndexRef.current = historyIndex;
  }, [historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setTimelineSegments(JSON.parse(JSON.stringify(history[prevIndex])));
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setTimelineSegments(JSON.parse(JSON.stringify(history[nextIndex])));
    }
  };

  const loadCustomPresets = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/presets`, {
        credentials: 'include',
      });
      if (response.ok) {
        const presets = await response.json();
        setCustomPresets(presets);
      }
    } catch (err) {
      console.error("Failed to load custom presets:", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadCustomPresets();
    } else {
      setCustomPresets([]);
    }
  }, [user]);

  const applyPresetStyle = (style: any) => {
    if (style.fontColor) setFontColor(style.fontColor);
    if (style.fontFamily) setFontFamily(style.fontFamily);
    if (style.subtitleStyle) setSubtitleStyle(style.subtitleStyle);
    if (style.bgStyle) setBgStyle(style.bgStyle);
    if (style.bgColor) setBgColor(style.bgColor);
    if (style.outline) setOutline(style.outline);
    if (style.shadow) setShadow(style.shadow);
    if (style.subtitleAnim) setSubtitleAnim(style.subtitleAnim);
    if (style.wordAnim) setWordAnim(style.wordAnim);
    if (style.subtitleFontSize) setSubtitleFontSize(style.subtitleFontSize);
    if (style.maxLines) setMaxLines(style.maxLines);
    if (style.lineSpacing) setLineSpacing(style.lineSpacing);
    if (style.fontAlign) setFontAlign(style.fontAlign);
    if (style.subtitleBounds) setSubtitleBounds(style.subtitleBounds);
  };

  const handleSavePreset = () => {
    handleProFeature(async () => {
      const name = prompt("Enter a name for your custom style preset:");
      if (!name) return;

      const styleJson = {
        fontColor,
        fontFamily,
        subtitleStyle,
        bgStyle,
        bgColor,
        outline,
        shadow,
        subtitleAnim,
        wordAnim,
        subtitleFontSize,
        maxLines,
        lineSpacing,
        fontAlign,
        subtitleBounds,
      };

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await axios.post(`${apiUrl}/presets`, {
          name,
          styleJson,
        }, {
          withCredentials: true,
        });

        if (response.status === 201 || response.status === 200) {
          alert(`Style preset "${name}" saved successfully!`);
          loadCustomPresets();
        }
      } catch (err) {
        console.error("Failed to save style preset:", err);
        alert("Failed to save style preset. Ensure you are logged in.");
      }
    });
  };

  const pollProjectStatus = (projectId: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/projects/${projectId}`);
        if (!res.ok) throw new Error("Failed to fetch project");
        const project = await res.json();

        if (project.status === 'COMPLETED') {
          clearInterval(interval);
          setIsProcessingSubtitles(false);
          if (project.subtitles && project.subtitles.length > 0) {
            const segments = project.subtitles.map((sub: any) => ({
              start: sub.timestampStart,
              end: sub.timestampEnd,
              label: sub.text,
              speaker: sub.speaker || 'A',
            }));
            setTimelineSegments(segments);
            setHistory([JSON.parse(JSON.stringify(segments))]);
            setHistoryIndex(0);
            alert("Subtitles generated successfully! 🎉");
          }
        } else if (project.status === 'FAILED') {
          clearInterval(interval);
          setIsProcessingSubtitles(false);
          alert("Failed to transcribe audio. Please try again.");
        }
      } catch (err) {
        console.error("Error polling project status:", err);
      }
    }, 2000);
  };

  const isPro = user?.subscriptionTier === 'PRO' || user?.subscriptionTier === 'ENTERPRISE';

  const handleProFeature = (action: () => void) => {
    if (!isPro) {
      setShowUpgradeModal(true);
    } else {
      action();
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (credentialResponse.credential) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const res = await axios.post(`${apiUrl}/auth/google`, {
          token: credentialResponse.credential
        }, { withCredentials: true });
        setUser(res.data.user);
      } catch (err) {
        console.error("Login failed", err);
      }
    }
  };
  const handleLogout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      await axios.post(`${apiUrl}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      setShowUserMenu(false);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };



  const customAnimationsCSS = `
  @keyframes anim-pop {
    0% { transform: scale(0.5); opacity: 0; }
    70% { transform: scale(1.1); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes anim-slide {
    0% { transform: translateX(-50px); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  @keyframes anim-float-up {
    0% { transform: translateY(30px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes anim-float-down {
    0% { transform: translateY(-30px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes anim-drop-in {
    0% { transform: translateY(-50px) scale(1.2); opacity: 0; }
    100% { transform: translateY(0) scale(1); opacity: 1; }
  }
  @keyframes anim-flip {
    0% { transform: perspective(400px) rotateX(90deg); opacity: 0; }
    100% { transform: perspective(400px) rotateX(0deg); opacity: 1; }
  }
  @keyframes anim-rotate-flip {
    0% { transform: perspective(400px) rotateZ(-15deg) rotateX(90deg) scale(0.8); opacity: 0; }
    100% { transform: perspective(400px) rotateZ(0deg) rotateX(0deg) scale(1); opacity: 1; }
  }
  @keyframes anim-stomp {
    0% { transform: scale(2); opacity: 0; }
    50% { transform: scale(0.9); opacity: 1; }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes anim-wave {
    0% { transform: rotate(-5deg); opacity: 0; }
    50% { transform: rotate(5deg); opacity: 1; }
    100% { transform: rotate(0deg); opacity: 1; }
  }
  .animate-anim-pop { animation: anim-pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  .animate-anim-slide { animation: anim-slide 0.3s ease-out forwards; }
  .animate-anim-float-up { animation: anim-float-up 0.4s ease-out forwards; }
  .animate-anim-float-down { animation: anim-float-down 0.4s ease-out forwards; }
  .animate-anim-drop-in { animation: anim-drop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  .animate-anim-flip { animation: anim-flip 0.4s ease-out forwards; }
  .animate-anim-rotate-flip { animation: anim-rotate-flip 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  .animate-anim-stomp { animation: anim-stomp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
  .animate-anim-wave { animation: anim-wave 0.4s ease-in-out forwards; }
`;

  const currentActiveSubIdx = timelineSegments.findIndex(seg => currentTime >= seg.start && currentTime < seg.end);

  return (
    <div className="h-[100dvh] w-full bg-[#070b19] text-white font-sans overflow-hidden grid grid-rows-[auto_1fr_auto_auto] md:grid-rows-[auto_1fr_auto] grid-cols-1 md:grid-cols-[84px_1fr]">
      <style dangerouslySetInnerHTML={{ __html: customAnimationsCSS }} />
      {/* 1. Header Section */}
      <header className="col-span-1 md:col-span-2 row-start-1 flex items-center justify-between px-4 md:px-6 py-3 bg-[#0d142d] border-b border-[#1e2a4a]/40 shadow-lg z-20">

        {/* Mobile: Logo left */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="bg-gradient-to-tr from-amber-400 to-amber-600 p-1.5 rounded-md shadow-md shadow-amber-500/10">
            <svg className="w-4 h-4 text-[#0d142d]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 22h20L12 2zm0 4.8L18.4 19H5.6L12 6.8z" />
            </svg>
          </div>
          <span className="text-md font-bold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent font-heading">
            Add<span className="text-amber-400 font-semibold">Subtitles</span>
          </span>
        </div>

        {/* Desktop: Undo/Redo & Utility Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="subplus-button py-1 px-2 rounded-md shadow-md flex items-center gap-1.5"
          >
            New Video
          </button>

          <div className="relative">
            <button
              onClick={() => setShowProjectMenu(!showProjectMenu)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-[#16223f] border border-[#253966] text-sm text-[#ccd6e8] hover:bg-[#1f2f54] transition-all font-medium"
            >
              Project
            </button>
            {showProjectMenu && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-[#0d142d] border border-[#1e2a4a] rounded-lg shadow-xl shadow-black/50 z-50 overflow-hidden flex flex-col">
                <button
                  onClick={() => { setShowProjectMenu(false); setShowUploadModal(true); }}
                  className="px-4 py-2.5 text-left text-sm text-zinc-300 hover:text-white hover:bg-[#16223f] transition-colors border-b border-[#1e2a4a]/50"
                >
                  New Project
                </button>
                <button
                  onClick={() => { setShowProjectMenu(false); setShowOpenProjectModal(true); }}
                  className="px-4 py-2.5 text-left text-sm text-zinc-300 hover:text-white hover:bg-[#16223f] transition-colors border-b border-[#1e2a4a]/50"
                >
                  Open Project...
                </button>
                <button onClick={() => setShowProjectMenu(false)} className="px-4 py-2.5 text-left text-sm text-zinc-300 hover:text-white hover:bg-[#16223f] transition-colors border-b border-[#1e2a4a]/50">
                  Save Project
                </button>
                <button onClick={() => setShowProjectMenu(false)} className="px-4 py-2.5 text-left text-sm text-zinc-300 hover:text-white hover:bg-[#16223f] transition-colors">
                  Project Settings
                </button>
              </div>
            )}
          </div>
          <button
            disabled={!videoFile || isExporting}
            onClick={async () => {
              if (!videoFile || !videoRef.current) return;
              setIsExporting(true);
              try {
                const { className: templateClassName, style: templateStyle } = getSubtitleStyles(activeTemplate);
                const blob = await exportVideo({
                  videoBlob: videoFile,
                  subtitles: timelineSegments.map((s, idx) => ({ start: s.start, end: s.end, text: s.label, id: idx.toString() })),
                  templateClassName,
                  templateStyle,
                  subtitleFontSize,
                  subtitleStyle,
                  fontFamily,
                  fontColor,
                  lineSpacing,
                  fontAlign,
                  outline,
                  shadow,
                  showPunctuation,
                  maxLines,
                  maxWordsPerLine,
                  bgColor,
                  bgOpacity,
                  bgStyle,
                  bgRadius,
                  bgPaddingX,
                  bgPaddingY,
                  isBgTransparent,
                  randomRotate,
                  subtitleAnim,
                  wordAnim,
                  subtitleBounds,
                  videoWidth: videoRef.current.videoWidth || 1080,
                  videoHeight: videoRef.current.videoHeight || 1920,
                  aspectRatio,
                  videoBounds,
                  removeSilences,
                  silenceCuts,
                  filterFillerWords
                }, (status, progress) => {
                  setExportStatus(status);
                  setExportProgress(progress);
                });

                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'exported_video.mp4';
                a.click();
              } catch (e) {
                console.error(e);
                alert("Export failed. See console for details.");
              }
              setIsExporting(false);
              setExportStatus("");
              setExportProgress(0);
            }}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-md ${isExporting ? 'bg-amber-500 text-[#0d142d]' : 'bg-[#16223f] text-[#ccd6e8] hover:bg-[#1f2f54] hover:text-white'} border border-[#253966] text-sm transition-all font-medium whitespace-nowrap overflow-hidden`}
          >
            {isExporting ? `${exportStatus} ${Math.round(exportProgress)}%` : 'Export'}
          </button>
          <div className="flex items-center gap-1 ml-4 border-l border-[#253966] pl-4">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className={`p-1.5 rounded transition-all ${
                historyIndex <= 0 ? 'text-zinc-600 cursor-not-allowed opacity-55' : 'text-zinc-400 hover:text-white hover:bg-[#16223f]'
              }`}
              title="Undo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className={`p-1.5 rounded transition-all ${
                historyIndex >= history.length - 1 ? 'text-zinc-600 cursor-not-allowed opacity-55' : 'text-zinc-400 hover:text-white hover:bg-[#16223f]'
              }`}
              title="Redo"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Central Logo - Desktop Only */}
        <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <div className="bg-gradient-to-tr from-amber-400 to-amber-600 p-1.5 rounded-md shadow-md shadow-amber-500/10">
            <svg className="w-5 h-5 text-[#0d142d]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 22h20L12 2zm0 4.8L18.4 19H5.6L12 6.8z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-300 bg-clip-text text-transparent font-heading">
            Add<span className="text-amber-400 font-semibold">Subtitles</span>
          </span>
        </div>

        {/* User Account / SubPlus CTA */}
        <div className="flex items-center gap-3">
          {!loading && !user && (
            <div className="relative hidden sm:block">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => console.error('Login Failed')}
                theme="filled_black"
                shape="rectangular"
                text="signin_with"
                size="medium"
              />
            </div>
          )}
          {!loading && user && (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#16223f] border border-[#253966] hover:bg-[#1f2f54] text-xs font-semibold tracking-wide text-zinc-200 transition-all"
              >
                <div className="w-5 h-5 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-[#0d142d] font-bold shadow-md">
                  {user.email[0].toUpperCase()}
                </div>
                {user.email.split('@')[0]}
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </button>
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-[#0d142d] border border-[#1e2a4a] rounded-lg shadow-xl shadow-black/50 z-50 overflow-hidden flex flex-col">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2.5 text-left text-sm text-zinc-300 hover:text-white hover:bg-[#16223f] transition-colors"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          )}
          {loading && (
            <div className="relative hidden sm:block w-24 h-8 bg-[#16223f] animate-pulse rounded-md border border-[#253966]"></div>
          )}
          <button onClick={() => setShowUpgradeModal(true)} className="subplus-button rounded-md py-1 px-2 shadow-md text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">
            Upgrade <span className="hidden md:inline">Subscription</span>
          </button>
        </div>
      </header>

      {/* 2. Left Side Navigation Panel (Bottom on Mobile) */}
      <aside className="col-start-1 row-start-4 md:row-start-2 md:col-start-1 bg-[#090d1f] border-t md:border-t-0 md:border-r border-[#1e2a4a]/30 flex flex-row md:flex-col items-center justify-around md:justify-start py-2 px-1 md:px-0 md:py-3 gap-1 md:gap-2.5 z-10 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto scrollbar-hide shrink-0 pb-safe w-full">

        <button
          onClick={() => setActiveTab("subtitles")}
          className={`flex flex-col items-center justify-center flex-1 md:flex-none md:w-16 h-12 md:h-16 rounded-xl transition-all ${activeTab === "subtitles" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <Type className="w-4 h-4 md:w-5 md:h-5 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Subtitles</span>
        </button>

        <button
          onClick={() => setActiveTab("styles")}
          className={`flex flex-col items-center justify-center flex-1 md:flex-none md:w-16 h-12 md:h-16 rounded-xl transition-all ${activeTab === "styles" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <Palette className="w-4 h-4 md:w-5 md:h-5 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Styles</span>
        </button>

        <button
          onClick={() => setActiveTab("magic")}
          className={`flex flex-col items-center justify-center flex-1 md:flex-none md:w-16 h-12 md:h-16 rounded-xl transition-all ${activeTab === "magic" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <Wand className="w-4 h-4 md:w-5 md:h-5 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Magic</span>
        </button>

        <button
          onClick={() => setActiveTab("animate")}
          className={`flex flex-col items-center justify-center flex-1 md:flex-none md:w-16 h-12 md:h-16 rounded-xl transition-all ${activeTab === "animate" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <Wand2 className="w-4 h-4 md:w-5 md:h-5 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Animate</span>
        </button>

        <button
          onClick={() => setActiveTab("font")}
          className={`flex flex-col items-center justify-center flex-1 md:flex-none md:w-16 h-12 md:h-16 rounded-xl transition-all ${activeTab === "font" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <CaseSensitive className="w-4 h-4 md:w-5 md:h-5 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Font</span>
        </button>

        <button
          onClick={() => setActiveTab("layout")}
          className={`flex flex-col items-center justify-center flex-1 md:flex-none md:w-16 h-12 md:h-16 rounded-xl transition-all ${activeTab === "layout" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <LayoutTemplate className="w-4 h-4 md:w-5 md:h-5 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Layout</span>
        </button>

        <button
          onClick={() => setActiveTab("background")}
          className={`flex flex-col items-center justify-center flex-1 md:flex-none md:w-16 h-12 md:h-16 rounded-xl transition-all ${activeTab === "background" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <Square className="w-4 h-4 md:w-5 md:h-5 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Background</span>
        </button>

        <button
          onClick={() => setActiveTab("canvas")}
          className={`flex flex-col items-center justify-center flex-1 md:flex-none md:w-16 h-12 md:h-16 rounded-xl transition-all ${activeTab === "canvas" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <Grid3X3 className="w-4 h-4 md:w-5 md:h-5 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Canvas</span>
        </button>

      </aside>

      {/* 3. Main Video Canvas Container */}
      <main className="col-start-1 md:col-start-2 row-start-2 bg-[#060a16] flex items-center justify-center p-4 md:p-8 relative overflow-hidden z-0 min-h-[250px]">

        {/* Subtitles Overlay Panel */}
        {activeTab === "subtitles" && (
          <div className="absolute left-0 top-0 bottom-0 w-[85%] sm:w-80 md:w-96 bg-[#090d1f]/95 backdrop-blur-xl border-r border-[#1e2a4a]/50 shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#1e2a4a]/50 shrink-0">
              <h3 className="text-sm font-bold text-white tracking-wide">Subtitles</h3>
              <div className="flex items-center gap-2">
                <button className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-md hover:bg-[#16223f]">
                  <Settings2 className="w-4 h-4" />
                </button>
                <button onClick={() => setActiveTab("")} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-[#16223f]">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-[#1e2a4a]"
              onClick={() => {
                setSelectedItem(null);
                setEditingSubtitleIndex(null);
              }}
            >
              <button onClick={() => handleProFeature(() => alert('Translation started...'))} className="w-full flex items-center justify-center gap-2 py-2.5 md:py-3 mb-6 bg-[#16223f] hover:bg-[#1a294d] border border-[#253966] rounded-xl text-[13px] md:text-sm font-semibold text-zinc-300 transition-all shadow-md group active:scale-95">
                <Languages className="w-4 h-4 group-hover:text-amber-400 transition-all" />
                Translate / Auto-sync <Crown className="w-3 h-3 ml-1 text-amber-500" />
              </button>

              {isProcessingSubtitles && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6 flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <div className="text-center">
                    <p className="text-xs font-semibold text-white">Transcribing Audio...</p>
                    <p className="text-[10px] text-zinc-400 mt-1">Analyzing voice & clustering speakers. Please wait.</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 pb-6">
                {timelineSegments.map((seg, i) => {
                  const isActive = currentTime >= seg.start && currentTime < seg.end;
                  const formatTime = (time: number) => `0:${Math.floor(time).toString().padStart(2, '0')}.${Math.floor((time % 1) * 10)}`;

                  return (
                    <div
                      key={i}
                      id={`sidebar-sub-${i}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentTime(seg.start);
                        setSelectedItem({ type: 'subtitle', id: i });
                        setAddSubtitleTime(null); // Hide tooltip when selecting segment
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer relative group/card ${selectedItem?.type === 'subtitle' && selectedItem.id === i
                          ? 'bg-[#182747] border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
                          : isActive
                            ? 'bg-[#182747]/60 border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.05)]'
                            : 'bg-[#0c1122] border-[#1e2a4a]/60 hover:border-[#253966]'
                        }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="text-[10px] md:text-xs font-mono text-zinc-500">
                            {formatTime(seg.start)} - {formatTime(seg.end)}
                          </div>
                          {(seg as any).speaker && (
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              (seg as any).speaker === 'A' 
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                                : 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            }`}>
                              Voice {(seg as any).speaker}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const next = timelineSegments.filter((_, idx) => idx !== i);
                            setTimelineSegments(next);
                            setHistory(prevHistory => {
                              const index = historyIndexRef.current;
                              const nextHistory = [...prevHistory.slice(0, index + 1), JSON.parse(JSON.stringify(next))];
                              setHistoryIndex(nextHistory.length - 1);
                              return nextHistory;
                            });
                            if (selectedItem?.type === 'subtitle' && selectedItem.id === i) {
                              setSelectedItem(null);
                            }
                          }}
                          className="opacity-0 group-hover/card:opacity-100 p-1 text-zinc-400 hover:text-red-500 rounded transition-opacity"
                          title="Delete Subtitle"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {editingSubtitleIndex === i ? (
                        <textarea
                          autoFocus
                          value={seg.label}
                          onFocus={(e) => {
                            // Place cursor at the end of the text
                            const val = e.target.value;
                            e.target.value = "";
                            e.target.value = val;
                          }}
                          onChange={(e) => {
                            const newText = e.target.value;
                            setTimelineSegments(prev => {
                              const newSegs = [...prev];
                              newSegs[i].label = newText;
                              return newSegs;
                            });
                          }}
                          onBlur={() => {
                            setEditingSubtitleIndex(null);
                            setHistory(prevHistory => {
                              const index = historyIndexRef.current;
                              const latest = timelineSegmentsRef.current;
                              const updated = prevHistory.slice(0, index + 1);
                              if (updated.length > 0 && JSON.stringify(updated[updated.length - 1]) === JSON.stringify(latest)) {
                                return prevHistory;
                              }
                              const nextHistory = [...updated, JSON.parse(JSON.stringify(latest))];
                              setHistoryIndex(nextHistory.length - 1);
                              return nextHistory;
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              setEditingSubtitleIndex(null);
                            }
                          }}
                          className={`w-full bg-transparent outline-none text-sm md:text-base leading-relaxed min-h-[80px] resize-y p-0 ${isActive ? 'text-white font-medium' : 'text-zinc-300'}`}
                        />
                      ) : (
                        <p
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingSubtitleIndex(i);
                          }}
                          className={`text-sm md:text-base leading-relaxed hover:bg-white/5 rounded px-1 -mx-1 transition-colors ${isActive ? 'text-white font-medium' : 'text-zinc-300'}`}
                        >
                          {seg.label}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Font Overlay Panel */}
        {activeTab === "font" && (
          <div className="absolute left-0 top-0 bottom-0 w-[85%] sm:w-80 md:w-96 bg-[#090d1f]/95 backdrop-blur-xl border-r border-[#1e2a4a]/50 shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-20 flex flex-col transform transition-transform animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#1e2a4a]/50 shrink-0">
              <h3 className="text-sm font-bold text-white tracking-wide">Font</h3>
              <button onClick={() => setActiveTab("")} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-[#16223f]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-[#1e2a4a] flex flex-col gap-5">

              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center justify-between px-3 py-2.5 bg-[#0c1122] border border-[#1e2a4a] rounded-lg hover:border-[#253966] transition-all relative">
                  <span className="text-sm text-zinc-200 pointer-events-none">{fontFamily}</span>
                  <ChevronDown className="w-4 h-4 text-zinc-500 pointer-events-none" />
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="Montserrat">Montserrat</option>
                    <option value="Inter">Inter</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Bebas Neue">Bebas Neue</option>
                  </select>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2.5 bg-[#16223f] hover:bg-[#1a294d] border border-[#253966] rounded-lg text-xs font-semibold text-zinc-300 transition-all shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={subtitleFontSize}
                  onChange={(e) => setSubtitleFontSize(Number(e.target.value))}
                  className="w-16 bg-[#0c1122] border border-[#1e2a4a] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                />
                <div className="flex items-center bg-[#0c1122] border border-[#1e2a4a] rounded-lg p-0.5 shrink-0">
                  <button onClick={() => setSubtitleStyle(p => ({ ...p, bold: !p.bold }))} className={`p-1.5 rounded transition-all ${subtitleStyle.bold ? 'bg-[#1e2a4a] text-white shadow-sm' : 'text-zinc-400 hover:bg-[#1e2a4a] hover:text-white'}`}><Bold className="w-4 h-4" /></button>
                  <button onClick={() => setSubtitleStyle(p => ({ ...p, italic: !p.italic }))} className={`p-1.5 rounded transition-all ${subtitleStyle.italic ? 'bg-[#1e2a4a] text-white shadow-sm' : 'text-zinc-400 hover:bg-[#1e2a4a] hover:text-white'}`}><Italic className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center bg-[#0c1122] border border-[#1e2a4a] rounded-lg p-0.5 shrink-0">
                  <button onClick={() => setFontAlign('left')} className={`p-1.5 rounded transition-all ${fontAlign === 'left' ? 'bg-[#1e2a4a] text-white shadow-sm' : 'text-zinc-400 hover:bg-[#1e2a4a] hover:text-white'}`}><AlignLeft className="w-4 h-4" /></button>
                  <button onClick={() => setFontAlign('center')} className={`p-1.5 rounded transition-all ${fontAlign === 'center' ? 'bg-[#1e2a4a] text-white shadow-sm' : 'text-zinc-400 hover:bg-[#1e2a4a] hover:text-white'}`}><AlignCenter className="w-4 h-4" /></button>
                  <button onClick={() => setFontAlign('right')} className={`p-1.5 rounded transition-all ${fontAlign === 'right' ? 'bg-[#1e2a4a] text-white shadow-sm' : 'text-zinc-400 hover:bg-[#1e2a4a] hover:text-white'}`}><AlignRight className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="flex items-center gap-3 relative">
                <button
                  onClick={() => setActiveColorPicker(activeColorPicker === 'font' ? null : 'font')}
                  className="flex items-center gap-2 w-32 px-3 py-2 bg-[#0c1122] border border-[#1e2a4a] rounded-lg hover:border-[#253966] transition-all focus:border-amber-400">
                  <div className="w-4 h-4 rounded border border-zinc-600 shadow-inner" style={{ backgroundColor: fontColor }}></div>
                  <span className="text-xs font-mono text-zinc-300 uppercase">{fontColor}</span>
                </button>

                {activeColorPicker === 'font' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setActiveColorPicker(null)} />
                    <div className="absolute top-12 left-0 z-50 p-4 bg-[#18181b] border border-[#27272a] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-[240px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                      <div className="custom-color-picker w-full flex justify-center">
                        <HexColorPicker color={fontColor} onChange={setFontColor} style={{ width: '100%', height: '160px' }} />
                      </div>

                      {/* Hex Input */}
                      <div className="bg-[#27272a] rounded-lg px-3 py-2 border border-[#3f3f46] flex items-center gap-2">
                        <span className="text-zinc-500 font-mono text-sm">#</span>
                        <input
                          type="text"
                          value={fontColor.replace('#', '')}
                          onChange={(e) => setFontColor('#' + e.target.value)}
                          className="bg-transparent text-sm text-zinc-200 font-mono tracking-wider w-full focus:outline-none uppercase"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 bg-[#0c1122] border border-[#1e2a4a] rounded-xl flex flex-col gap-3 mt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 tracking-wide">Line Spacing</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm bg-[#16223f] px-2 py-1 rounded text-zinc-300">{lineSpacing}</span>
                  <div className="relative flex-1 h-4 flex items-center group">
                    <div className="absolute left-0 right-0 h-1 bg-[#1e2a4a] rounded-full pointer-events-none">
                      <div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full" style={{ width: `${(lineSpacing - 0.5) / 1.5 * 100}%` }} />
                    </div>
                    <div
                      className="absolute w-3 h-3 bg-white rounded-full shadow-md pointer-events-none group-active:scale-110 transition-transform"
                      style={{ left: `calc(${(lineSpacing - 0.5) / 1.5 * 100}% - 6px)` }}
                    />
                    <input
                      type="range" min="0.5" max="2" step="0.1"
                      value={lineSpacing}
                      onChange={(e) => setLineSpacing(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div
                onClick={() => setShowPunctuation(!showPunctuation)}
                className="flex items-center justify-between p-4 bg-[#0c1122] border border-[#1e2a4a] rounded-xl cursor-pointer hover:border-[#253966] transition-all"
              >
                <span className="text-sm font-semibold text-zinc-200">Show Punctuation</span>
                <div className={`w-10 h-5 rounded-full relative shadow-inner transition-colors ${showPunctuation ? 'bg-blue-500' : 'bg-[#16223f] border border-[#253966]'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all bg-white ${showPunctuation ? 'right-0.5' : 'left-0.5 bg-zinc-400'}`} />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between p-3.5 bg-[#0c1122] border border-[#1e2a4a] rounded-xl hover:border-[#253966] transition-all relative">
                  <span className="text-sm font-semibold text-zinc-200 w-20">Outline</span>
                  <div className="flex items-center gap-2 bg-[#16223f] px-3 py-1.5 rounded-lg border border-[#253966] flex-1">
                    <span className="text-xs text-zinc-300 pointer-events-none flex-1">{outline}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                    <select
                      value={outline}
                      onChange={(e) => setOutline(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                      <option value="None">None</option>
                      <option value="Thin">Thin</option>
                      <option value="Thick">Thick</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#0c1122] border border-[#1e2a4a] rounded-xl hover:border-[#253966] transition-all relative">
                  <span className="text-sm font-semibold text-zinc-200 w-20">Shadow</span>
                  <div className="flex items-center gap-2 bg-[#16223f] px-3 py-1.5 rounded-lg border border-[#253966] flex-1">
                    <span className="text-xs text-zinc-300 pointer-events-none flex-1">{shadow}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                    <select
                      value={shadow}
                      onChange={(e) => setShadow(e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    >
                      <option value="None">None</option>
                      <option value="Soft">Soft</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Styles Overlay Panel */}
        {activeTab === "styles" && (
          <div className="absolute left-0 top-0 bottom-0 w-[85%] sm:w-80 md:w-96 bg-[#090d1f]/95 backdrop-blur-xl border-r border-[#1e2a4a]/50 shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#1e2a4a]/50 shrink-0">
              <h3 className="text-sm font-bold text-white tracking-wide">Styles</h3>
              <button onClick={() => setActiveTab("")} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-[#16223f]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-[#1e2a4a]">
              <button onClick={handleSavePreset} className="w-full flex items-center justify-center gap-2 py-2.5 md:py-3 mb-5 md:mb-6 bg-[#16223f] hover:bg-[#1a294d] border border-[#253966] rounded-xl text-[13px] md:text-sm font-semibold text-amber-400 transition-all shadow-md group active:scale-95">
                <Bookmark className="w-4 h-4 group-hover:fill-amber-400/20 transition-all" />
                Save Style <Crown className="w-3.5 h-3.5 ml-0.5 text-amber-500" />
              </button>

              <div className="flex items-center justify-between bg-[#060a16] p-1 rounded-lg mb-5 md:mb-6 border border-[#1e2a4a]/40 shrink-0">
                {['All', 'Business', 'Emoji', 'Custom'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveStyleFilter(tab)}
                    className={`flex-1 py-1.5 text-[10px] sm:text-xs font-semibold rounded-md transition-all ${activeStyleFilter === tab ? 'bg-[#1e2a4a] text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}>
                    {tab}
                  </button>
                ))}
              </div>

              {activeStyleFilter === 'All' && (
                <div className="grid grid-cols-2 gap-3 md:gap-4 pb-4">
                  {[
                    { name: 'Default', type: 'blank', element: <span className="text-xs text-zinc-500 font-medium group-hover:text-amber-400/70 transition-colors pointer-events-none">Default</span> },
                    { name: 'Classic', type: 'classic', element: <span className="px-3 py-1 bg-black/80 rounded-md text-white font-sans font-bold text-sm shadow-md border border-white/10 z-10 transition-transform group-hover:scale-105 pointer-events-none">Classic</span> },
                    { name: 'BANGERS', type: 'bangers', element: <span className="text-amber-400 font-black text-xl italic tracking-wider drop-shadow-[0_2px_0_rgba(0,0,0,1)] z-10 transition-transform group-hover:scale-105 pointer-events-none" style={{ WebkitTextStroke: '1px black' }}>BANGERS</span> },
                    { name: 'STREET', type: 'street', element: <span className="text-white font-black text-lg uppercase tracking-widest z-10 drop-shadow-md transition-transform group-hover:scale-105 pointer-events-none" style={{ WebkitTextStroke: '0.5px rgba(255,255,255,0.5)' }}>STREET</span> },
                    { name: 'BEAST', type: 'beast', element: <span className="text-yellow-500 font-black text-xl italic uppercase tracking-tighter drop-shadow-[0_3px_5px_rgba(0,0,0,1)] z-10 transition-transform group-hover:scale-105 pointer-events-none">BEAST</span> },
                    { name: 'Clean', type: 'clean', element: <span className="text-white font-medium text-lg tracking-tight z-10 transition-transform group-hover:scale-105 pointer-events-none">Clean</span> },
                    { name: 'Highlight', type: 'highlight', element: <span className="bg-amber-500 text-[#0d142d] px-2.5 py-0.5 font-bold text-sm transform -rotate-2 z-10 shadow-lg transition-transform group-hover:scale-110 group-hover:-rotate-3 pointer-events-none">Highlight</span> },
                    { name: 'FIRE', type: 'fire', element: <span className="text-red-500 font-black text-xl uppercase tracking-widest z-10 transition-transform group-hover:scale-105 pointer-events-none" style={{ WebkitTextStroke: '1px #450a0a' }}>FIRE</span> }
                  ].map((tpl, i) => {
                    const isActive = activeTemplate === tpl.name;
                    return (
                      <div
                        key={i}
                        onClick={() => handleTemplateSelect(tpl.name)}
                        className={`aspect-[4/3] rounded-xl transition-all cursor-pointer flex items-center justify-center overflow-hidden relative group ${isActive ? 'bg-[#182747] border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.15)]' : 'bg-[#0c1122] border border-[#1e2a4a] hover:border-amber-400'}`}
                      >
                        {tpl.type === 'blank' && <div className="absolute inset-0 bg-[#060a16]/50 border-2 border-dashed border-[#1e2a4a] rounded-xl pointer-events-none" />}
                        {tpl.type === 'classic' && <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />}
                        {tpl.type === 'bangers' && <div className="absolute inset-0 bg-gradient-to-br from-[#16223f]/50 to-[#0c1122] opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />}
                        {tpl.type === 'street' && <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black pointer-events-none" />}
                        {tpl.type === 'beast' && <div className="absolute inset-0 shadow-inner pointer-events-none" />}
                        {tpl.type === 'clean' && <div className="absolute inset-0 bg-[#16223f]/40 pointer-events-none" />}
                        {tpl.type === 'highlight' && <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />}
                        {tpl.type === 'fire' && <div className="absolute inset-0 bg-gradient-to-t from-red-950/40 to-[#0c1122] pointer-events-none" />}
                        {tpl.element}
                      </div>
                    )
                  })}
                </div>
              )}

              {activeStyleFilter === 'Business' && (
                <div className="grid grid-cols-2 gap-3 md:gap-4 pb-4">
                  {/* Simple */}
                  <div className="aspect-[4/3] rounded-xl border border-[#1e2a4a] hover:border-amber-400 bg-[#16223f]/20 transition-all cursor-pointer flex items-center justify-center group relative">
                    <span className="text-white font-bold text-lg tracking-tight z-10 transition-transform group-hover:scale-105">Simple</span>
                  </div>
                  {/* Classic */}
                  <div className="aspect-[4/3] rounded-xl border border-[#1e2a4a] hover:border-amber-400 bg-[#0c1122] transition-all cursor-pointer flex items-center justify-center overflow-hidden shadow-inner relative group">
                    <span className="px-3 py-1 bg-black/80 rounded-md text-white font-sans font-bold text-sm shadow-md border border-white/10 z-10 transition-transform group-hover:scale-105">Classic</span>
                  </div>
                  {/* Clean */}
                  <div className="aspect-[4/3] rounded-xl border border-[#1e2a4a] hover:border-amber-400 bg-[#0c1122]/50 transition-all cursor-pointer flex items-center justify-center group relative">
                    <span className="text-white font-black text-lg tracking-wide z-10 transition-transform group-hover:scale-105">Clean</span>
                  </div>
                  {/* Corporate */}
                  <div className="aspect-[4/3] rounded-xl border border-[#1e2a4a] hover:border-amber-400 bg-[#09112a] transition-all cursor-pointer flex items-center justify-center group relative overflow-hidden">
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-bold text-sm shadow-lg z-10 transition-transform group-hover:scale-105">Corporate</span>
                  </div>
                  {/* Branded */}
                  <div className="aspect-[4/3] rounded-xl border border-[#1e2a4a] hover:border-amber-400 bg-[#16223f]/20 transition-all cursor-pointer flex items-center justify-center group relative">
                    <span className="text-blue-500 bg-white px-2 py-0.5 rounded font-bold text-sm shadow-md z-10 transition-transform group-hover:scale-105 border border-blue-500/20">Branded</span>
                  </div>
                  {/* Editorial */}
                  <div className="aspect-[4/3] rounded-xl border border-[#1e2a4a] hover:border-amber-400 bg-[#16223f]/20 transition-all cursor-pointer flex items-center justify-center group relative overflow-hidden">
                    <span className="bg-[#c2f05a] text-black px-2 py-0.5 font-serif font-bold text-sm shadow-md z-10 transition-transform group-hover:scale-105 border border-black/10">Editorial</span>
                  </div>
                </div>
              )}

              {activeStyleFilter === 'Custom' && (
                <div className="flex flex-col gap-3 pb-4">
                  {customPresets.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-xs">
                      No custom presets saved yet.<br />Click "Save Style" above to save one.
                    </div>
                  ) : (
                    customPresets.map((preset) => (
                      <div
                        key={preset.id}
                        onClick={() => applyPresetStyle(preset.styleJson)}
                        className="flex items-center justify-between p-3 rounded-xl border border-[#1e2a4a] hover:border-amber-400/50 bg-[#0c1122]/50 hover:bg-[#16223f]/30 transition-all cursor-pointer group/item"
                      >
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-semibold text-zinc-200">{preset.name}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {preset.styleJson.fontFamily || 'Montserrat'} • {preset.styleJson.subtitleFontSize || 75}px
                          </span>
                        </div>
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete the preset "${preset.name}"?`)) {
                              try {
                                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
                                await axios.delete(`${apiUrl}/presets/${preset.id}`, {
                                  withCredentials: true,
                                });
                                loadCustomPresets();
                              } catch (err) {
                                console.error("Failed to delete preset:", err);
                              }
                            }
                          }}
                          className="opacity-0 group-hover/item:opacity-100 p-1.5 text-zinc-500 hover:text-red-500 rounded transition-opacity hover:bg-red-500/10"
                          title="Delete Preset"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Layout Overlay Panel */}
        {activeTab === "layout" && (
          <div className="absolute left-0 top-0 bottom-0 w-[85%] sm:w-80 md:w-96 bg-[#090d1f]/95 backdrop-blur-xl border-r border-[#1e2a4a]/50 shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#1e2a4a]/50 shrink-0">
              <h3 className="text-sm font-bold text-white tracking-wide">Layout</h3>
              <button onClick={() => setActiveTab("")} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-[#16223f]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-[#1e2a4a] flex flex-col gap-5">

              <div className="flex items-center justify-between p-3.5 bg-[#0c1122] border border-[#1e2a4a] rounded-xl hover:border-[#253966] transition-all relative">
                <span className="text-sm font-semibold text-zinc-200">Max Lines</span>
                <div className="flex items-center gap-2 bg-[#16223f] px-3 py-1.5 rounded-lg border border-[#253966]">
                  <span className="text-xs text-zinc-300 pointer-events-none">{maxLines}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  <select
                    value={maxLines}
                    onChange={(e) => setMaxLines(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-[#0c1122] border border-[#1e2a4a] rounded-xl hover:border-[#253966] transition-all relative">
                <span className="text-sm font-semibold text-zinc-200">Max Words Per Line</span>
                <div className="flex items-center gap-2 bg-[#16223f] px-3 py-1.5 rounded-lg border border-[#253966]">
                  <span className="text-xs text-zinc-300 pointer-events-none">{maxWordsPerLine}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                  <select
                    value={maxWordsPerLine}
                    onChange={(e) => setMaxWordsPerLine(e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="Auto">Auto</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div
                onClick={() => setRandomRotate(!randomRotate)}
                className="flex items-center justify-between p-4 bg-[#0c1122] border border-[#1e2a4a] rounded-xl cursor-pointer hover:border-[#253966] transition-all"
              >
                <span className="text-sm font-semibold text-zinc-200">Random Rotate Lines</span>
                <div className={`w-10 h-5 rounded-full relative shadow-inner transition-colors ${randomRotate ? 'bg-amber-400' : 'bg-[#16223f] border border-[#253966]'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all ${randomRotate ? 'bg-[#0d142d] left-5' : 'bg-zinc-400 left-0.5'}`} />
                </div>
              </div>

              <div className="p-4 bg-[#0c1122] border border-[#1e2a4a] rounded-xl flex flex-col gap-6">

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300 tracking-wide">Position X</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#16223f] border border-[#253966] px-3 py-1.5 rounded-lg w-20 text-center">
                      <span className="text-sm text-zinc-300">{Math.round(subtitleBounds.x)}%</span>
                    </div>
                    <div className="relative flex-1 h-4 flex items-center group">
                      <div className="absolute left-0 right-0 h-1 bg-[#1e2a4a] rounded-full pointer-events-none">
                        <div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full" style={{ width: `${subtitleBounds.x}%` }} />
                      </div>
                      <div
                        className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md pointer-events-none group-active:scale-110 transition-transform"
                        style={{ left: `calc(${subtitleBounds.x}% - 7px)` }}
                      />
                      <input
                        type="range" min="0" max="100" step="0.01"
                        value={subtitleBounds.x}
                        onChange={(e) => setSubtitleBounds(prev => ({ ...prev, x: Number(e.target.value) }))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300 tracking-wide">Position Y</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#16223f] border border-[#253966] px-3 py-1.5 rounded-lg w-20 text-center">
                      <span className="text-sm text-zinc-300">{Math.round(subtitleBounds.y)}%</span>
                    </div>
                    <div className="relative flex-1 h-4 flex items-center group">
                      <div className="absolute left-0 right-0 h-1 bg-[#1e2a4a] rounded-full pointer-events-none">
                        <div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full" style={{ width: `${subtitleBounds.y}%` }} />
                      </div>
                      <div
                        className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md pointer-events-none group-active:scale-110 transition-transform"
                        style={{ left: `calc(${subtitleBounds.y}% - 7px)` }}
                      />
                      <input
                        type="range" min="0" max="100" step="0.01"
                        value={subtitleBounds.y}
                        onChange={(e) => setSubtitleBounds(prev => ({ ...prev, y: Number(e.target.value) }))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Background Overlay Panel */}
        {activeTab === "background" && (
          <div className="absolute left-0 top-0 bottom-0 w-[85%] sm:w-80 md:w-96 bg-[#090d1f]/95 backdrop-blur-xl border-r border-[#1e2a4a]/50 shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#1e2a4a]/50 shrink-0">
              <h3 className="text-sm font-bold text-white tracking-wide">Background</h3>
              <button onClick={() => setActiveTab("")} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-[#16223f]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-[#1e2a4a] flex flex-col gap-5">

              <div className="p-4 bg-[#0c1122] border border-[#1e2a4a] rounded-xl flex flex-col gap-5">

                <div className="flex items-center justify-between relative">
                  <span className="text-sm font-semibold text-zinc-200">Fill</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setActiveColorPicker(activeColorPicker === 'background' ? null : 'background'); setIsBgTransparent(false); }}
                      className={`flex items-center gap-2 bg-[#16223f] px-3 py-1.5 rounded-lg border transition-all ${!isBgTransparent ? 'border-amber-400' : 'border-[#253966] hover:border-amber-400/50'}`}>
                      <div className="w-3.5 h-3.5 rounded-sm shadow-inner" style={{ backgroundColor: bgColor }}></div>
                      <span className="text-xs text-zinc-300 font-mono tracking-wide">{bgColor}</span>
                    </button>
                    <button
                      onClick={() => { setIsBgTransparent(true); setActiveColorPicker(null); }}
                      className={`w-7 h-7 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${isBgTransparent ? 'border-amber-400 opacity-100' : 'border-zinc-500 opacity-50 hover:opacity-100'}`}>
                    </button>
                  </div>

                  {activeColorPicker === 'background' && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveColorPicker(null)} />
                      <div className="absolute top-10 right-0 z-50 p-4 bg-[#18181b] border border-[#27272a] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] w-[240px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="custom-color-picker w-full flex justify-center">
                          <HexColorPicker color={bgColor} onChange={setBgColor} style={{ width: '100%', height: '160px' }} />
                        </div>

                        {/* Hex Input */}
                        <div className="bg-[#27272a] rounded-lg px-3 py-2 border border-[#3f3f46] flex items-center gap-2">
                          <span className="text-zinc-500 font-mono text-sm">#</span>
                          <input
                            type="text"
                            value={bgColor.replace('#', '')}
                            onChange={(e) => setBgColor('#' + e.target.value)}
                            className="bg-transparent text-sm text-zinc-200 font-mono tracking-wider w-full focus:outline-none uppercase"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex flex-col gap-2 relative">
                  <span className="text-xs font-semibold text-zinc-300 tracking-wide">Style</span>
                  <div className="flex items-center justify-between w-full bg-[#16223f] border border-[#253966] px-3 py-2.5 rounded-lg hover:border-amber-400/50 transition-all">
                    <div className="flex items-center gap-2 text-sm text-zinc-200 pointer-events-none">
                      <div className="w-4 h-2 bg-zinc-400 rounded-sm"></div>
                      {bgStyle}
                    </div>
                    <ChevronDown className="w-4 h-4 text-zinc-500 pointer-events-none" />
                    <select
                      value={bgStyle}
                      onChange={(e) => setBgStyle(e.target.value)}
                      className="absolute inset-0 top-6 w-full h-10 opacity-0 cursor-pointer"
                    >
                      <option value="Fit">Fit</option>
                      <option value="Fill">Fill</option>
                      <option value="Wrap">Wrap</option>
                    </select>
                  </div>
                </div>

                {/* Radius Slider */}
                <div className="flex flex-col gap-3 pt-2">
                  <span className="text-xs font-semibold text-zinc-300 tracking-wide">Radius</span>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#16223f] border border-[#253966] px-2 py-1.5 rounded-lg w-16 text-center">
                      <span className="text-xs text-zinc-300">{bgRadius}%</span>
                    </div>
                    <div className="relative flex-1 h-4 flex items-center group">
                      <div className="absolute left-0 right-0 h-1 bg-[#1e2a4a] rounded-full pointer-events-none">
                        <div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full" style={{ width: `${bgRadius}%` }} />
                      </div>
                      <div
                        className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md pointer-events-none group-active:scale-110 transition-transform"
                        style={{ left: `calc(${bgRadius}% - 7px)` }}
                      />
                      <input
                        type="range" min="0" max="100" step="1"
                        value={bgRadius}
                        onChange={(e) => setBgRadius(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Opacity Slider */}
                <div className="flex flex-col gap-3 pt-2">
                  <span className="text-xs font-semibold text-zinc-300 tracking-wide">Opacity</span>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#16223f] border border-[#253966] px-2 py-1.5 rounded-lg w-16 text-center">
                      <span className="text-xs text-zinc-300">{bgOpacity}%</span>
                    </div>
                    <div className="relative flex-1 h-4 flex items-center group">
                      <div className="absolute left-0 right-0 h-1 bg-[#1e2a4a] rounded-full pointer-events-none">
                        <div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full" style={{ width: `${bgOpacity}%` }} />
                      </div>
                      <div
                        className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md pointer-events-none group-active:scale-110 transition-transform"
                        style={{ left: `calc(${bgOpacity}% - 7px)` }}
                      />
                      <input
                        type="range" min="0" max="100" step="1"
                        value={bgOpacity}
                        onChange={(e) => setBgOpacity(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Padding X Slider */}
                <div className="flex flex-col gap-3 pt-2">
                  <span className="text-xs font-semibold text-zinc-300 tracking-wide">Padding X</span>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#16223f] border border-[#253966] px-2 py-1.5 rounded-lg w-16 text-center">
                      <span className="text-xs text-zinc-300">{bgPaddingX}%</span>
                    </div>
                    <div className="relative flex-1 h-4 flex items-center group">
                      <div className="absolute left-0 right-0 h-1 bg-[#1e2a4a] rounded-full pointer-events-none">
                        <div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full" style={{ width: `${bgPaddingX}%` }} />
                      </div>
                      <div
                        className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md pointer-events-none group-active:scale-110 transition-transform"
                        style={{ left: `calc(${bgPaddingX}% - 7px)` }}
                      />
                      <input
                        type="range" min="0" max="100" step="1"
                        value={bgPaddingX}
                        onChange={(e) => setBgPaddingX(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Padding Y Slider */}
                <div className="flex flex-col gap-3 pt-2">
                  <span className="text-xs font-semibold text-zinc-300 tracking-wide">Padding Y</span>
                  <div className="flex items-center gap-3">
                    <div className="bg-[#16223f] border border-[#253966] px-2 py-1.5 rounded-lg w-16 text-center">
                      <span className="text-xs text-zinc-300">{bgPaddingY}%</span>
                    </div>
                    <div className="relative flex-1 h-4 flex items-center group">
                      <div className="absolute left-0 right-0 h-1 bg-[#1e2a4a] rounded-full pointer-events-none">
                        <div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full" style={{ width: `${bgPaddingY}%` }} />
                      </div>
                      <div
                        className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md pointer-events-none group-active:scale-110 transition-transform"
                        style={{ left: `calc(${bgPaddingY}% - 7px)` }}
                      />
                      <input
                        type="range" min="0" max="100" step="1"
                        value={bgPaddingY}
                        onChange={(e) => setBgPaddingY(Number(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Canvas Overlay Panel */}
        {activeTab === "canvas" && (
          <div className="absolute left-0 top-0 bottom-0 w-[85%] sm:w-80 md:w-96 bg-[#090d1f]/95 backdrop-blur-xl border-r border-[#1e2a4a]/50 shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#1e2a4a]/50 shrink-0">
              <h3 className="text-sm font-bold text-white tracking-wide">Canvas</h3>
              <button onClick={() => setActiveTab("")} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-[#16223f]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-[#1e2a4a] flex flex-col gap-4">

              <div className="p-4 bg-[#0c1122] border border-[#1e2a4a] rounded-xl flex flex-col gap-3 relative">
                <span className="text-sm font-semibold text-zinc-200">Aspect Ratio</span>
                <div className="flex items-center justify-between w-full bg-[#16223f] border border-[#253966] px-3 py-2.5 rounded-lg hover:border-amber-400/50 transition-all">
                  <div className="flex items-center gap-2 text-sm text-zinc-200 pointer-events-none">
                    <Maximize className="w-4 h-4 text-zinc-400" />
                    {aspectRatio}
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-500 pointer-events-none" />
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="absolute inset-0 top-6 w-full h-10 opacity-0 cursor-pointer"
                  >
                    <option value="Original">Original</option>
                    <option value="9:16 (TikTok)">9:16 (TikTok)</option>
                    <option value="1:1 (Instagram)">1:1 (Instagram)</option>
                    <option value="16:9 (YouTube)">16:9 (YouTube)</option>
                    <option value="4:5 (Facebook)">4:5 (Facebook)</option>
                  </select>
                </div>
              </div>

              <div
                onClick={() => setLockBackground(!lockBackground)}
                className="p-4 bg-[#0c1122] border border-[#1e2a4a] rounded-xl flex items-center justify-between cursor-pointer hover:border-[#253966] transition-all"
              >
                <div className="flex flex-col gap-1 pr-4">
                  <span className="text-sm font-semibold text-zinc-200">Lock Background</span>
                  <span className="text-[10px] md:text-xs text-zinc-500 leading-tight">Stops the video from being repositioned on the canvas.</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative shadow-inner transition-colors shrink-0 ${lockBackground ? 'bg-amber-400' : 'bg-[#16223f] border border-[#253966]'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all ${lockBackground ? 'bg-[#0d142d] right-0.5' : 'bg-zinc-400 left-0.5'}`} />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Magic Overlay Panel */}
        {activeTab === "magic" && (
          <div className="absolute left-0 top-0 bottom-0 w-[85%] sm:w-80 md:w-96 bg-[#090d1f]/95 backdrop-blur-xl border-r border-[#1e2a4a]/50 shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#1e2a4a]/50 shrink-0">
              <h3 className="text-sm font-bold text-white tracking-wide">Magic AI Features</h3>
              <button onClick={() => setActiveTab("")} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-[#16223f]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-[#1e2a4a] flex flex-col gap-6">

              {/* Hook Generator */}
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-zinc-200">Magic Hooks</span>
                <p className="text-xs text-zinc-400 leading-relaxed">Generate engaging hooks for the first 3 seconds of your video based on the transcript.</p>
                <button
                  onClick={() => handleProFeature(async () => {
                    setIsGeneratingHooks(true);
                    const text = timelineSegments.slice(0, 5).map(s => s.label).join(" ");
                    const hooks = await generateHooksFromText(text);
                    setGeneratedHooks(hooks);
                    setIsGeneratingHooks(false);
                  })}
                  disabled={isGeneratingHooks}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(251,191,36,0.2)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  <Wand className="w-4 h-4" />
                  {isGeneratingHooks ? "Generating..." : "Generate Hooks"}
                  <Crown className="w-3.5 h-3.5 ml-1 text-white opacity-80" />
                </button>
                {generatedHooks.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    {generatedHooks.map((hook, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          const next = [
                            { start: 0, end: 3, label: hook },
                            ...timelineSegments
                          ];
                          setTimelineSegments(next);
                          setHistory(prevHistory => {
                            const index = historyIndexRef.current;
                            const nextHistory = [...prevHistory.slice(0, index + 1), JSON.parse(JSON.stringify(next))];
                            setHistoryIndex(nextHistory.length - 1);
                            return nextHistory;
                          });
                          setWordAnim("Karaoke");
                          setSubtitleStyle(p => ({ ...p, bold: true }));
                          setFontColor("#FBBF24");
                        }}
                        className="text-left p-3 bg-[#0c1122] border border-[#1e2a4a] hover:border-amber-400/50 rounded-lg text-sm text-zinc-300 hover:text-white transition-all shadow-sm"
                      >
                        {hook}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px w-full bg-[#1e2a4a]/50"></div>
              {/* Auto Emoji */}
              <div className="flex flex-col bg-[#0c1122] border border-[#1e2a4a] rounded-xl transition-all">
                <div
                  onClick={() => setAutoEmoji(!autoEmoji)}
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-all"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      ✨ Auto Emoji <Crown className="w-3.5 h-3.5 ml-1 text-amber-500" />
                    </span>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative shadow-inner transition-colors ${autoEmoji ? 'bg-blue-600' : 'bg-[#16223f] border border-[#253966]'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all bg-white ${autoEmoji ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </div>

                <div className={`px-4 pb-4 flex flex-col gap-4 transition-opacity ${autoEmoji ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">Position</span>
                    <div className="relative">
                      <select
                        value={emojiPosition}
                        onChange={(e) => setEmojiPosition(e.target.value)}
                        className="bg-[#16223f] border border-[#253966] text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none appearance-none pr-8 cursor-pointer"
                        disabled={!autoEmoji}
                      >
                        <option value="Top">↑ Top</option>
                        <option value="Left">← Left</option>
                        <option value="Right">→ Right</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-300">Size</span>
                    <div className="relative">
                      <select
                        value={emojiSize}
                        onChange={(e) => setEmojiSize(e.target.value)}
                        className="bg-[#16223f] border border-[#253966] text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none appearance-none pr-8 cursor-pointer"
                        disabled={!autoEmoji}
                      >
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Coming Soon Placeholders */}
              <div className="flex items-center justify-between p-4 bg-[#0c1122]/50 border border-[#1e2a4a]/50 rounded-xl">
                <span className="text-sm font-bold text-zinc-400">AI Keyword Highlighter</span>
                <span className="text-[10px] font-semibold tracking-wider text-zinc-500 border border-zinc-700/50 px-2 py-0.5 rounded-full uppercase">Coming Soon</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0c1122]/50 border border-[#1e2a4a]/50 rounded-xl">
                <span className="text-sm font-bold text-zinc-400">Speaker Colors</span>
                <span className="text-[10px] font-semibold tracking-wider text-zinc-500 border border-zinc-700/50 px-2 py-0.5 rounded-full uppercase">Coming Soon</span>
              </div>

              <div className="h-px w-full bg-[#1e2a4a]/50"></div>

              {/* Toggles */}
              <div
                onClick={() => setFilterFillerWords(!filterFillerWords)}
                className="flex items-center justify-between p-4 bg-[#0c1122] border border-[#1e2a4a] rounded-xl cursor-pointer hover:border-fuchsia-500/50 transition-all"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-fuchsia-400 flex items-center gap-2">
                    Strike Out "Ums" and "Uhs"
                  </span>
                  <span className="text-xs text-zinc-400 font-medium leading-tight">Visually cross out filler words</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative shadow-inner transition-colors ${filterFillerWords ? 'bg-fuchsia-500' : 'bg-[#16223f] border border-[#253966]'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all ${filterFillerWords ? 'bg-[#0d142d] left-5' : 'bg-zinc-400 left-0.5'}`} />
                </div>
              </div>

              <div
                onClick={() => handleProFeature(() => setRemoveSilences(!removeSilences))}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-[#0c1122] border border-amber-500/30 rounded-xl cursor-pointer hover:border-amber-400/60 transition-all"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Remove Silences <Crown className="w-3.5 h-3.5 ml-1 text-amber-500" />
                  </span>
                  <span className="text-xs text-zinc-400 font-medium leading-tight">Auto jump-cut dead air</span>
                </div>
                <div className={`w-10 h-5 rounded-full relative shadow-inner transition-colors ${removeSilences ? 'bg-amber-400' : 'bg-[#16223f] border border-[#253966]'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-sm transition-all ${removeSilences ? 'bg-[#0d142d] left-5' : 'bg-zinc-400 left-0.5'}`} />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Animation Overlay Panel */}
        {activeTab === "animate" && (
          <div className="absolute left-0 top-0 bottom-0 w-[85%] sm:w-80 md:w-96 bg-[#090d1f]/95 backdrop-blur-xl border-r border-[#1e2a4a]/50 shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#1e2a4a]/50 shrink-0">
              <h3 className="text-sm font-bold text-white tracking-wide">Animation</h3>
              <button onClick={() => setActiveTab("")} className="text-zinc-500 hover:text-white transition-colors p-1 rounded-md hover:bg-[#16223f]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-[#1e2a4a]">

              <div className="flex flex-col gap-4 mb-8">
                <h4 className="text-sm font-semibold text-white tracking-wide">Subtitle</h4>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {[
                    { name: 'Fade', icon: Sun },
                    { name: 'Pop', icon: ZoomIn },
                    { name: 'Slide', icon: MoveUp },
                    { name: 'Float Up', icon: MoveUp },
                    { name: 'Float Down', icon: MoveDown },
                    { name: 'Drop In', icon: ArrowDownToLine },
                    { name: 'Flip', icon: FlipHorizontal },
                    { name: 'Rotate & Flip', icon: RefreshCw },
                    { name: 'Stomp', icon: Zap },
                    { name: 'Wave', icon: Waves },
                  ].map((anim, i) => {
                    const Icon = anim.icon;
                    const isActive = subtitleAnim === anim.name;
                    return (
                      <button
                        key={i}
                        onClick={() => setSubtitleAnim(anim.name)}
                        className={`flex flex-col items-center justify-center gap-2 aspect-[4/3] rounded-xl transition-all group ${isActive ? 'bg-[#182747] border-2 border-amber-400 shadow-inner' : 'bg-[#0c1122] border border-[#1e2a4a] hover:border-amber-400 hover:bg-[#16223f]/50'}`}
                      >
                        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-amber-400'}`} />
                        <span className={`text-[10px] md:text-xs font-medium text-center leading-tight ${isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>{anim.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-4 mb-4">
                <h4 className="text-sm font-semibold text-white tracking-wide">Word</h4>
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                  {[
                    { name: 'Reveal', icon: Eye },
                    { name: 'Karaoke', icon: Music },
                    { name: 'Highlight', icon: Highlighter },
                    { name: 'Scale', icon: CaseSensitive },
                  ].map((anim, i) => {
                    const Icon = anim.icon;
                    const isActive = wordAnim === anim.name;
                    return (
                      <button
                        key={i}
                        onClick={() => setWordAnim(anim.name)}
                        className={`flex flex-col items-center justify-center gap-2 aspect-[4/3] rounded-xl transition-all group ${isActive ? 'bg-[#182747] border-2 border-amber-400 shadow-inner' : 'bg-[#0c1122] border border-[#1e2a4a] hover:border-amber-400 hover:bg-[#16223f]/50'}`}
                      >
                        <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-amber-400' : 'text-zinc-400 group-hover:text-amber-400'}`} />
                        <span className={`text-[10px] md:text-xs font-medium text-center leading-tight ${isActive ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>{anim.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        )}


        {/* Main Video View Box with Subtitles */}
        <div
          ref={canvasRef}
          onMouseDown={() => setActiveCanvasElement(null)}
          style={{ aspectRatio: canvasAspectRatio, maxWidth: '100%', maxHeight: '65vh' }}
          className="relative h-full w-auto max-h-[50vh] md:max-h-[65vh] bg-[#0c1122] rounded-xl md:rounded-2xl border border-amber-400/50 md:border-2 md:border-amber-400/70 shadow-[0_0_20px_rgba(255,184,0,0.15)] flex items-center justify-center overflow-hidden transition-all duration-300"
        >
          {/* Interactive Video Layer */}
          <div
            onMouseDown={(e) => { e.stopPropagation(); setActiveCanvasElement('video'); setCanvasInteraction({ element: 'video', action: 'move', startX: e.clientX, startY: e.clientY, initialBounds: videoBounds }); }}
            style={{
              left: `${videoBounds.x}%`, top: `${videoBounds.y}%`,
              width: `${videoBounds.width}%`, height: `${videoBounds.height}%`
            }}
            className={`absolute ${activeCanvasElement === 'video' ? 'ring-2 ring-fuchsia-500 z-20 cursor-move' : 'z-0'}`}
          >
            {videoSrc ? (
              <video
                ref={videoRef}
                src={videoSrc}
                className="w-full h-full object-cover brightness-[0.7] contrast-[1.1]"
                onTimeUpdate={() => {
                  if (videoRef.current && isPlaying) {
                    let curTime = videoRef.current.currentTime;

                    if (removeSilences && silenceCuts && silenceCuts.length > 0) {
                      const activeCut = silenceCuts.find(cut => curTime >= cut.start && curTime < cut.end);
                      if (activeCut) {
                        videoRef.current.currentTime = activeCut.end;
                        curTime = activeCut.end;
                      }
                    }

                    setCurrentTime(curTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setTotalDuration(videoRef.current.duration);
                    // Adapt the canvas to perfectly fit the uploaded video's aspect ratio
                    if (videoRef.current.videoWidth && videoRef.current.videoHeight) {
                      setCanvasAspectRatio(`${videoRef.current.videoWidth}/${videoRef.current.videoHeight}`);
                    }
                  }
                }}
              />
            ) : (
              <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560')] bg-cover bg-center brightness-[0.7] contrast-[1.1]" />
            )}

            {activeCanvasElement === 'video' && (
              <>
                <div onMouseDown={(e) => { e.stopPropagation(); setCanvasInteraction({ element: 'video', action: 'resize-tl', startX: e.clientX, startY: e.clientY, initialBounds: videoBounds }); }} className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white cursor-nwse-resize shadow-md" />
                <div onMouseDown={(e) => { e.stopPropagation(); setCanvasInteraction({ element: 'video', action: 'resize-tr', startX: e.clientX, startY: e.clientY, initialBounds: videoBounds }); }} className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white cursor-nesw-resize shadow-md" />
                <div onMouseDown={(e) => { e.stopPropagation(); setCanvasInteraction({ element: 'video', action: 'resize-bl', startX: e.clientX, startY: e.clientY, initialBounds: videoBounds }); }} className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white cursor-nesw-resize shadow-md" />
                <div onMouseDown={(e) => { e.stopPropagation(); setCanvasInteraction({ element: 'video', action: 'resize-br', startX: e.clientX, startY: e.clientY, initialBounds: videoBounds }); }} className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white cursor-nwse-resize shadow-md" />
              </>
            )}
          </div>

          {/* Soft Ambient Inner Shadows */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none z-10" />

          {/* Interactive Subtitle Layer */}
          <div
            onMouseDown={(e) => {
              if (currentActiveSubIdx === -1) return;
              if (isEditingOverlaySubtitle) return;
              e.stopPropagation();
              setActiveCanvasElement('subtitle');
              setCanvasInteraction({ element: 'subtitle', action: 'move', startX: e.clientX, startY: e.clientY, initialBounds: subtitleBounds });

              setSelectedItem({ type: 'subtitle', id: currentActiveSubIdx });
            }}
            onDoubleClick={(e) => {
              if (currentActiveSubIdx === -1) return;
              e.stopPropagation();
              setIsPlaying(false); // Pause video player
              setIsEditingOverlaySubtitle(true);
              setSelectedItem({ type: 'subtitle', id: currentActiveSubIdx });
            }}
            style={{
              left: `${subtitleBounds.x}%`, top: `${subtitleBounds.y}%`,
              width: `${subtitleBounds.width}%`, height: `${subtitleBounds.height}%`
            }}
            className={`absolute flex items-center justify-center ${isEditingOverlaySubtitle ? 'select-text' : 'select-none'} ${currentActiveSubIdx === -1 ? 'pointer-events-none' : 'pointer-events-auto'} ${(activeCanvasElement === 'subtitle' && currentActiveSubIdx !== -1) ? 'ring-1 ring-fuchsia-500 z-30 cursor-move bg-black/10' : 'z-20 hover:ring-1 hover:ring-white/20'}`}
          >
            {activeCanvasElement === 'subtitle' && currentActiveSubIdx !== -1 && !isEditingOverlaySubtitle && (
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#16223f] border border-[#253966] rounded-xl shadow-2xl flex items-center gap-1.5 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200 whitespace-nowrap cursor-default" onMouseDown={e => e.stopPropagation()}>
                <div className="flex items-center bg-[#0d142d] rounded-lg px-2 py-1 border border-[#1e2a4a]">
                  <button onClick={() => setSubtitleFontSize(prev => Math.max(10, prev - 5))} className="text-zinc-400 hover:text-white px-1.5 py-0.5 text-xs font-mono">-</button>
                  <span className="text-white text-[11px] font-mono px-2">{subtitleFontSize}</span>
                  <button onClick={() => setSubtitleFontSize(prev => Math.min(200, prev + 5))} className="text-zinc-400 hover:text-white px-1.5 py-0.5 text-xs font-mono">+</button>
                </div>
                <div onClick={() => setActiveTab('font')} className="flex items-center gap-1 bg-[#0d142d] border border-[#1e2a4a] rounded-lg px-3 py-1.5 cursor-pointer hover:bg-[#1f2f54] transition-colors">
                  <span className="text-[11px] text-zinc-300 font-medium tracking-wide">Oswald</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </div>
                <div onClick={() => setActiveTab('styles')} className="w-6 h-6 rounded-md bg-white border border-zinc-300 cursor-pointer shadow-inner ml-1" />
                <button onClick={() => setActiveTab('styles')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#1f2f54] transition-colors text-[11px] font-medium text-zinc-300 hover:text-white ml-1">
                  <Palette className="w-3 h-3" /> Styles
                </button>
                <button onClick={() => setActiveTab('animate')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-[#1f2f54] transition-colors text-[11px] font-medium text-zinc-300 hover:text-white">
                  <Wand2 className="w-3 h-3" /> Animate
                </button>
                <div className="relative">
                  <button onClick={() => setShowSubtitleMoreOptions(!showSubtitleMoreOptions)} className="px-3 py-1.5 rounded-lg hover:bg-[#1f2f54] transition-colors text-zinc-400 hover:text-white tracking-widest font-bold">
                    ...
                  </button>
                  {showSubtitleMoreOptions && (
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-[#16223f] border border-[#253966] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-3 z-50 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-3 min-w-[200px]" onMouseDown={e => e.stopPropagation()}>
                      <div className="flex items-center justify-between gap-2">
                        <button onClick={() => setSubtitleStyle(s => ({ ...s, bold: !s.bold }))} className={`flex-1 flex items-center justify-center py-2 rounded-lg border transition-colors font-serif font-bold text-lg ${subtitleStyle.bold ? 'bg-[#3b558f] border-[#5a7bc2] text-white' : 'bg-[#253966]/50 hover:bg-[#253966] border-[#3b558f]/30 text-white'}`}>B</button>
                        <button onClick={() => setSubtitleStyle(s => ({ ...s, italic: !s.italic }))} className={`flex-1 flex items-center justify-center py-2 rounded-lg border transition-colors font-serif italic text-lg ${subtitleStyle.italic ? 'bg-[#3b558f] border-[#5a7bc2] text-white' : 'bg-[#253966]/50 hover:bg-[#253966] border-[#3b558f]/30 text-white'}`}>I</button>
                        <button onClick={() => setSubtitleStyle(s => ({ ...s, allCaps: !s.allCaps }))} className={`flex-1 flex items-center justify-center py-2 rounded-lg border transition-colors font-bold text-sm tracking-widest ${subtitleStyle.allCaps ? 'bg-[#3b558f] border-[#5a7bc2] text-white' : 'bg-[#253966]/50 hover:bg-[#253966] border-[#3b558f]/30 text-white'}`}>AB</button>
                        <button className="flex-1 flex items-center justify-center py-2 rounded-lg bg-[#253966]/50 hover:bg-[#253966] border border-[#3b558f]/30 transition-colors text-white">
                          <AlignJustify className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2 bg-[#0d142d] rounded-lg border border-[#1e2a4a] cursor-pointer hover:bg-[#1f2f54] transition-colors">
                        <div className="flex items-center gap-2 text-zinc-300 text-sm">
                          <Settings2 className="w-4 h-4" />
                          <span>Line spacing</span>
                        </div>
                        <ChevronDown className="w-4 h-4 text-zinc-500" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {(() => {
              const activeSubIdx = timelineSegments.findIndex(seg => currentTime >= seg.start && currentTime < seg.end);
              const activeSub = activeSubIdx !== -1 ? timelineSegments[activeSubIdx] : null;
              const text = activeSub ? activeSub.label : "";

              const { className: templateClassName, style: templateStyle } = getSubtitleStyles(activeTemplate);

              if (isEditingOverlaySubtitle && activeSub) {
                return (
                  <textarea
                    autoFocus
                    value={text}
                    onFocus={(e) => e.currentTarget.select()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const newText = e.target.value;
                      setTimelineSegments(prev => {
                        const newSegs = [...prev];
                        newSegs[activeSubIdx].label = newText;
                        return newSegs;
                      });
                    }}
                    onBlur={() => {
                      setIsEditingOverlaySubtitle(false);
                      setHistory(prevHistory => {
                        const index = historyIndexRef.current;
                        const latest = timelineSegmentsRef.current;
                        const updated = prevHistory.slice(0, index + 1);
                        if (updated.length > 0 && JSON.stringify(updated[updated.length - 1]) === JSON.stringify(latest)) {
                          return prevHistory;
                        }
                        const nextHistory = [...updated, JSON.parse(JSON.stringify(latest))];
                        setHistoryIndex(nextHistory.length - 1);
                        return nextHistory;
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        setIsEditingOverlaySubtitle(false);
                      }
                    }}
                    className={`w-full h-full bg-transparent text-center outline-none resize-none overflow-hidden cursor-text leading-tight ${templateClassName}`}
                    style={{
                      ...templateStyle,
                      fontSize: `${subtitleFontSize}px`,
                      fontWeight: subtitleStyle.bold ? 900 : (templateStyle.fontWeight || 700),
                      fontFamily: fontFamily || 'inherit',
                      color: fontColor !== '#ffffff' ? fontColor : (templateStyle.color || '#ffffff'),
                      lineHeight: lineSpacing,
                      fontStyle: subtitleStyle.italic ? 'italic' : (templateStyle.fontStyle || 'normal'),
                      textTransform: subtitleStyle.allCaps ? 'uppercase' : (templateStyle.textTransform || 'none'),
                      textAlign: fontAlign as any,
                      ...(outline !== 'None' ? { WebkitTextStroke: outline === 'Thin' ? '2px black' : '4px black' } : {}),
                      ...(shadow !== 'None' ? { textShadow: shadow === 'Soft' ? '0px 4px 8px rgba(0,0,0,0.75)' : '2px 2px 0px black, 3px 3px 0px black' } : {}),
                    }}
                  />
                );
              }

              if (!activeSub) return null;

              const animClass = getSubtitleAnimClass(subtitleAnim);

              let processedText = text;
              if (!showPunctuation) {
                processedText = processedText.replace(/[.,!?;:"']/g, '');
              }
              const words = processedText.split(/\s+/).filter(Boolean);

              const hexToRgba = (hex: string, opacity: number) => {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                return result ? `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${opacity / 100})` : hex;
              };
              const backgroundColor = hexToRgba(bgColor, bgOpacity);

              let chunkedWords = [];
              if (maxWordsPerLine !== 'Auto') {
                const limit = parseInt(maxWordsPerLine, 10);
                for (let i = 0; i < words.length; i += limit) {
                  chunkedWords.push(words.slice(i, i + limit));
                }
              } else {
                chunkedWords = [words];
              }

              const wordDuration = (activeSub.end - activeSub.start) / Math.max(1, words.length);
              const activeWordIndex = Math.floor((currentTime - activeSub.start) / wordDuration);

              return (
                <h2
                  key={`${activeSub.start}-${subtitleAnim}`}
                  className={`leading-tight ${templateClassName} ${animClass} ${subtitleStyle.italic ? 'italic' : ''} ${subtitleStyle.allCaps ? 'uppercase' : ''}`}
                  style={{
                    ...templateStyle,
                    fontSize: `${subtitleFontSize}px`,
                    fontWeight: subtitleStyle.bold ? 900 : (templateStyle.fontWeight || 700),
                    fontFamily: fontFamily || 'inherit',
                    color: fontColor !== '#ffffff' ? fontColor : (templateStyle.color || '#ffffff'),
                    lineHeight: lineSpacing,
                    fontStyle: subtitleStyle.italic ? 'italic' : (templateStyle.fontStyle || 'normal'),
                    textTransform: subtitleStyle.allCaps ? 'uppercase' : (templateStyle.textTransform || 'none'),
                    textAlign: fontAlign as any,
                    ...(outline !== 'None' ? { WebkitTextStroke: outline === 'Thin' ? '2px black' : '4px black' } : {}),
                    ...(shadow !== 'None' ? { textShadow: shadow === 'Soft' ? '0px 4px 8px rgba(0,0,0,0.75)' : '2px 2px 0px black, 3px 3px 0px black' } : {}),
                    WebkitLineClamp: maxLines > 0 ? maxLines : undefined,
                    display: maxLines > 0 ? '-webkit-box' : 'block',
                    WebkitBoxOrient: maxLines > 0 ? 'vertical' : undefined,
                    overflow: maxLines > 0 ? 'hidden' : 'visible',
                    backgroundColor: bgStyle === 'Fill' && !isBgTransparent ? backgroundColor : (templateStyle.backgroundColor || 'transparent'),
                    borderRadius: `${bgRadius}px`,
                    padding: bgStyle === 'Fill' && !isBgTransparent ? `${bgPaddingY}px ${bgPaddingX}px` : (templateStyle.padding || '0'),
                    width: bgStyle === 'Fill' ? '100%' : 'auto',
                    transform: randomRotate ? `rotate(${(Math.round(activeSub.start * 13) % 5) - 2}deg)` : (templateStyle.transform || 'none'),
                  }}
                >
                  {chunkedWords.map((chunk, chunkIdx) => (
                    <span key={chunkIdx} className={bgStyle === 'Fit' || bgStyle === 'Wrap' ? 'block' : 'inline'}>
                      <span
                        className={bgStyle === 'Fit' || bgStyle === 'Wrap' ? 'inline-block' : 'inline'}
                        style={(bgStyle === 'Fit' || bgStyle === 'Wrap') && !isBgTransparent ? { backgroundColor, borderRadius: `${bgRadius}px`, padding: `${bgPaddingY}px ${bgPaddingX}px`, marginBottom: '4px' } : {}}
                      >
                        {chunk.map((w, idx) => {
                          const globalIdx = chunkIdx * (maxWordsPerLine === 'Auto' ? words.length : parseInt(maxWordsPerLine, 10)) + idx;
                          let wordClasses = "inline-block mx-[0.12em] transition-all duration-75 ";

                          if (wordAnim === 'Reveal') {
                            wordClasses += globalIdx <= activeWordIndex ? "opacity-100" : "opacity-0";
                          } else if (wordAnim === 'Karaoke') {
                            wordClasses += globalIdx === activeWordIndex ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "";
                          } else if (wordAnim === 'Highlight') {
                            wordClasses += globalIdx === activeWordIndex ? "bg-amber-500 text-[#0d142d] px-1 rounded-sm" : "";
                          } else if (wordAnim === 'Scale') {
                            wordClasses += globalIdx === activeWordIndex ? "scale-[1.2] text-amber-400" : "";
                          }

                          const isFiller = filterFillerWords && w.match(/\b(um|uh|ums|uhs)\b/i);
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
              );
            })()}

            {activeCanvasElement === 'subtitle' && currentActiveSubIdx !== -1 && (
              <>
                <div onMouseDown={(e) => { e.stopPropagation(); setCanvasInteraction({ element: 'subtitle', action: 'resize-tl', startX: e.clientX, startY: e.clientY, initialBounds: subtitleBounds }); }} className="absolute -top-1.5 -left-1.5 w-2 h-2 bg-white cursor-nwse-resize shadow-sm" />
                <div onMouseDown={(e) => { e.stopPropagation(); setCanvasInteraction({ element: 'subtitle', action: 'resize-tr', startX: e.clientX, startY: e.clientY, initialBounds: subtitleBounds }); }} className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-white cursor-nesw-resize shadow-sm" />
                <div onMouseDown={(e) => { e.stopPropagation(); setCanvasInteraction({ element: 'subtitle', action: 'resize-bl', startX: e.clientX, startY: e.clientY, initialBounds: subtitleBounds }); }} className="absolute -bottom-1.5 -left-1.5 w-2 h-2 bg-white cursor-nesw-resize shadow-sm" />
                <div onMouseDown={(e) => { e.stopPropagation(); setCanvasInteraction({ element: 'subtitle', action: 'resize-br', startX: e.clientX, startY: e.clientY, initialBounds: subtitleBounds }); }} className="absolute -bottom-1.5 -right-1.5 w-2 h-2 bg-white cursor-nwse-resize shadow-sm" />

                {/* Floating delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const activeSubIdx = timelineSegments.findIndex(seg => currentTime >= seg.start && currentTime < seg.end);
                    if (activeSubIdx !== -1) {
                      const next = timelineSegments.filter((_, idx) => idx !== activeSubIdx);
                      setTimelineSegments(next);
                      setHistory(prevHistory => {
                        const index = historyIndexRef.current;
                        const nextHistory = [...prevHistory.slice(0, index + 1), JSON.parse(JSON.stringify(next))];
                        setHistoryIndex(nextHistory.length - 1);
                        return nextHistory;
                      });
                    }
                  }}
                  className="absolute -top-7 right-0 p-1 bg-red-600 hover:bg-red-700 text-white rounded-md shadow-md z-30 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                  title="Delete Subtitle"
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

        </div>
      </main>

      {/* 4. Lower Timeline & Controls Bar */}
      <footer className="col-start-1 md:col-span-2 row-start-3 bg-[#0b1022] border-t border-[#1e2a4a]/40 p-3 md:p-4 flex flex-col gap-3.5 z-10">

        {/* Timeline Toolbar: Selected status on left, Zoom scaler on right */}
        <div className="flex items-center justify-between px-1 shrink-0">
          <div className="flex items-center gap-3">
            {selectedItem && (
              <span className="text-[10px] text-amber-400/80 italic animate-pulse">
                Selected: {selectedItem.type === 'subtitle' ? 'Subtitle' : 'Video'}. Press Delete or Backspace key to remove.
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 bg-[#0d142d] px-3 py-1.5 rounded-lg border border-[#1e2a4a]/40 text-xs">
            <button
              onClick={() => setTimelineZoom(prev => Math.max(5, prev - 10))}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="5"
                max="150"
                step="1"
                value={timelineZoom}
                onChange={(e) => setTimelineZoom(Number(e.target.value))}
                className="w-24 accent-amber-500 h-1 bg-zinc-750 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-zinc-400 font-mono w-12 text-right">{timelineZoom} px/s</span>
            </div>
            <button
              onClick={() => setTimelineZoom(prev => Math.min(150, prev + 10))}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <div className="w-[1px] h-3 bg-zinc-700" />
            <button
              onClick={() => {
                if (timelineRef.current) {
                  const visibleWidth = timelineRef.current.clientWidth;
                  const fitZoom = Math.max(5, Math.min(150, (visibleWidth - 20) / Math.max(1, totalDuration)));
                  setTimelineZoom(Math.round(fitZoom));
                }
              }}
              className="text-zinc-400 hover:text-white transition-colors text-[10px] font-medium cursor-pointer"
              title="Fit to Screen"
            >
              Fit
            </button>
          </div>
        </div>

        {/* Professional Video Editing Timeline */}
        <div
          className="relative min-h-[170px] bg-[#090d1f] rounded-xl border border-[#1e2a4a]/40 flex overflow-hidden select-none shadow-2xl"
        >
          {/* Left-side Track Header Panel */}
          <div className="w-12 md:w-14 bg-[#0d142d] border-r border-[#1e2a4a]/40 flex flex-col pt-8 text-[#ccd6e8]/80 shrink-0">
            {/* Video Track Header */}
            <div className="h-14 flex flex-col items-center justify-center gap-1 border-b border-[#1e2a4a]/20">
              <FileVideo className="w-4 h-4 text-zinc-400" />
              <span className="text-[8px] font-bold text-zinc-500 tracking-wider">V1</span>
            </div>

            {/* Subtitles Track Header */}
            <div className="h-14 flex flex-col items-center justify-center gap-1 border-b border-[#1e2a4a]/20">
              <Type className="w-4 h-4 text-zinc-400" />
              <span className="text-[8px] font-bold text-zinc-500 tracking-wider">T1</span>
            </div>
          </div>

          {/* Right-side Timeline Workspace */}
          <div
            ref={timelineRef}
            onMouseDown={(e) => {
              setIsDraggingTimeline(true);
              handleTimelineDrag(e);
            }}
            className="flex-1 relative flex flex-col bg-[#070b19] overflow-x-auto overflow-y-hidden cursor-ew-resize animate-in fade-in duration-300"
          >
            {/* Scalable Track Wrapper */}
            <div
              style={{ width: `${totalDuration * timelineZoom}px`, minWidth: '100%' }}
              className="relative flex-1 flex flex-col h-full"
            >
              {/* Time Ticks Header (Ruler) */}
              <div className="h-8 bg-[#0a0f24] border-b border-[#1e2a4a]/50 relative w-full shrink-0 flex items-end">
                {Array.from({ length: Math.ceil(totalDuration) }).map((_, i) => {
                  const interval = timelineZoom < 15 ? 10 : timelineZoom < 35 ? 5 : 2;
                  const showLabel = i % interval === 0;
                  if (!showLabel && i > 0 && i < Math.ceil(totalDuration) - 1) return null;

                  return (
                    <div key={i} className="absolute text-[8px] text-[#ccd6e8]/60 font-mono tracking-wider bottom-0.5 pl-1" style={{ left: `${(i / totalDuration) * 100}%` }}>
                      <div className="absolute -left-[1px] bottom-0 h-2 border-l border-[#253966]" />
                      {showLabel && `0:${i.toString().padStart(2, '0')}`}
                    </div>
                  );
                })}
              </div>

              {/* Bright Yellow Playhead */}
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-yellow-400 z-30 pointer-events-none transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                style={{ left: `${(currentTime / totalDuration) * 100}%` }}
              >
                {/* Triangular playhead marker */}
                <div className="absolute top-0 -left-[5px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-yellow-400" />
              </div>

              {/* Track Contents */}
              <div className="flex-1 flex flex-col gap-2 p-3">

                {/* Video Track (Green Horizontal Bar with Thumbnails) */}
                <div
                  onClick={() => setAddSubtitleTime(null)}
                  className="h-14 relative w-full bg-[#052e16]/30 border border-[#14532d]/40 rounded-lg flex items-center overflow-hidden"
                >
                  {videoSrc && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem({ type: 'video', id: 'main-video' });
                        setAddSubtitleTime(null);
                      }}
                      style={{ left: '0%', width: '100%' }}
                      className={`absolute inset-y-0.5 rounded-md flex items-center justify-between border transition-all select-none cursor-pointer overflow-hidden px-3 ${selectedItem?.type === 'video' && selectedItem.id === 'main-video'
                          ? "bg-[#10b981]/25 border-emerald-400 text-white z-10"
                          : "bg-[#064e3b]/50 border-[#10b981]/30 text-emerald-300"
                        }`}
                    >
                      {/* Simulated thumbnail background */}
                      <div className="absolute inset-0 opacity-10 flex gap-1 pointer-events-none">
                        {Array.from({ length: 12 }).map((_, idx) => (
                          <div key={idx} className="h-full w-14 bg-zinc-400 shrink-0 border-r border-zinc-500" />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider relative z-10">Background Video (Main)</span>
                    </div>
                  )}
                </div>

                {/* Subtitles Track (Blue blocks with Side Grips) */}
                <div
                  onClick={(e) => {
                    if (!timelineRef.current) return;
                    const rect = timelineRef.current.getBoundingClientRect();
                    const trackWidth = Math.max(rect.width, totalDuration * timelineZoom);
                    const clickX = e.clientX - rect.left + timelineRef.current.scrollLeft;
                    const percentage = Math.max(0, Math.min(clickX, trackWidth)) / trackWidth;
                    const clickedTime = percentage * totalDuration;

                    // Position playhead at click location
                    setCurrentTime(clickedTime);
                    if (videoRef.current) {
                      videoRef.current.currentTime = clickedTime;
                    }

                    // Set add button time and deselect any active subtitle segment
                    setAddSubtitleTime(clickedTime);
                    setSelectedItem(null);
                  }}
                  className="h-14 relative w-full bg-[#1e293b]/20 border border-[#334155]/20 rounded-lg flex items-center cursor-pointer overflow-visible"
                >
                  {timelineSegments.map((seg, i) => {
                    const segTime = seg.start;
                    const nextSegTime = seg.end;
                    const isActive = currentTime >= segTime && currentTime < nextSegTime;
                    const isSelected = selectedItem?.type === 'subtitle' && selectedItem.id === i;
                    const leftPos = (segTime / totalDuration) * 100;
                    const width = ((nextSegTime - segTime) / totalDuration) * 100;

                    return (
                      <div
                        key={`sub-${i}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentTime(segTime);
                          setSelectedItem({ type: 'subtitle', id: i });
                          setAddSubtitleTime(null); // Hide tooltip when selecting segment
                          setActiveTab("subtitles");
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          if (!timelineRef.current) return;
                          const rect = timelineRef.current.getBoundingClientRect();
                          const trackWidth = Math.max(rect.width, totalDuration * timelineZoom);
                          const clickX = e.clientX - rect.left + timelineRef.current.scrollLeft;
                          const percentage = Math.max(0, Math.min(clickX, trackWidth)) / trackWidth;
                          const clickTime = percentage * totalDuration;
                          setResizeState({ index: i, edge: 'move', offsetX: clickTime - segTime });
                        }}
                        style={{ left: `${leftPos}%`, width: `calc(${width}% - 2px)` }}
                        className={`absolute inset-y-1.5 rounded-md flex justify-between items-center border transition-all select-none cursor-move shrink-0 overflow-hidden group ${isSelected
                            ? "bg-[#1d4ed8] border-blue-400 text-white z-25 shadow-[0_0_12px_rgba(29,78,216,0.4)]"
                            : isActive
                              ? "bg-[#1e3a8a] border-blue-500/80 text-white z-20"
                              : "bg-[#0f172a] border-[#1e293b] text-[#ccd6e8] opacity-85 hover:opacity-100 hover:border-blue-500/40"
                          }`}
                      >
                        {/* Left Grip Handle */}
                        <div
                          onMouseDown={(e) => { e.stopPropagation(); setResizeState({ index: i, edge: 'start' }); }}
                          className="h-full w-2.5 cursor-col-resize flex flex-col justify-center gap-0.5 px-0.5 opacity-50 group-hover:opacity-100 transition-opacity border-r border-white/5"
                        >
                          <div className="w-[1.5px] h-3 bg-white/50 rounded-full mx-auto" />
                        </div>

                        <span className="text-[10px] font-semibold truncate px-2 w-full text-center">{seg.label}</span>

                        {/* Right Grip Handle */}
                        <div
                          onMouseDown={(e) => { e.stopPropagation(); setResizeState({ index: i, edge: 'end' }); }}
                          className="h-full w-2.5 cursor-col-resize flex flex-col justify-center gap-0.5 px-0.5 opacity-50 group-hover:opacity-100 transition-opacity border-l border-white/5"
                        >
                          <div className="w-[1.5px] h-3 bg-white/50 rounded-full mx-auto" />
                        </div>
                      </div>
                    );
                  })}

                  {/* Floating Add Subtitle Button Tooltip */}
                  {addSubtitleTime !== null && (
                    <div
                      onClick={(e) => e.stopPropagation()} // Prevent resetting addSubtitleTime when clicking tooltip wrapper
                      className="absolute z-40 -top-11 -translate-x-1/2 flex flex-col items-center select-none"
                      style={{ left: `${(addSubtitleTime / totalDuration) * 100}%` }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddSubtitleAtTime(addSubtitleTime);
                          setAddSubtitleTime(null);
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] md:text-[11px] font-bold py-1 px-2.5 rounded-full shadow-lg border border-blue-400/30 flex items-center gap-1 active:scale-95 transition-all whitespace-nowrap"
                      >
                        <Plus className="w-3 h-3" /> Add Subtitle
                      </button>
                      <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-blue-600 mt-[1px]" />
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Sleek Video Player Timeline & Controls */}
        <div className="flex flex-col gap-2.5 px-4 py-3 mt-1 bg-[#1a1a1a] rounded-xl border border-[#333] shadow-lg">

          {/* Timeline Dragger */}
          <div className="relative w-full h-4 flex items-center group cursor-pointer"
            onMouseDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percentage = Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width;
              setCurrentTime(percentage * totalDuration);
              if (videoRef.current) videoRef.current.currentTime = percentage * totalDuration;
            }}
          >
            <div className="absolute left-0 right-0 h-[3px] bg-[#404040] rounded-full pointer-events-none overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 bg-[#3b82f6] rounded-full" style={{ width: `${(currentTime / Math.max(0.1, totalDuration)) * 100}%` }} />
            </div>
            <div
              className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md pointer-events-none scale-0 group-hover:scale-100 transition-transform"
              style={{ left: `calc(${(currentTime / Math.max(0.1, totalDuration)) * 100}% - 7px)` }}
            />
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between">
            {/* Left: Volume */}
            <div className="flex items-center gap-3 w-32">
              <button onClick={() => setIsMuted(!isMuted)} className="text-[#a0a0a0] hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 shrink-0" /> : <Volume2 className="w-4 h-4 shrink-0" />}
              </button>
              <div className="relative w-full h-4 flex items-center group cursor-pointer">
                <div className="absolute left-0 right-0 h-1 bg-[#404040] rounded-full pointer-events-none">
                  <div className="absolute left-0 top-0 bottom-0 bg-white rounded-full transition-colors" style={{ width: `${isMuted ? 0 : volume}%` }} />
                </div>
                <div
                  className="absolute w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform pointer-events-none"
                  style={{ left: `calc(${isMuted ? 0 : volume}% - 6px)` }}
                />
                <input
                  type="range" min="0" max="100" step="1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    if (Number(e.target.value) > 0) setIsMuted(false);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Center: Playback */}
            <div className="flex items-center gap-5">
              <button className="text-[#a0a0a0] hover:text-white transition-colors"><SkipBack className="w-4.5 h-4.5" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md shrink-0">
                {isPlaying ? <Pause className="w-4 h-4 fill-black text-black" /> : <Play className="w-4 h-4 fill-black text-black translate-x-0.5" />}
              </button>
              <button className="text-[#a0a0a0] hover:text-white transition-colors"><SkipForward className="w-4.5 h-4.5" /></button>

              <span className="text-[11px] font-mono text-[#a0a0a0] font-medium tracking-wide ml-2 shrink-0">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}.{Math.floor((currentTime % 1) * 10)} / {Math.floor(totalDuration / 60)}:{(Math.floor(totalDuration) % 60).toString().padStart(2, '0')}.{Math.floor((totalDuration % 1) * 10)}
              </span>
            </div>

            {/* Right: Tools */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <select
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1.0}>1.0x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={2.0}>2.0x</option>
                </select>
                <button className="px-2 py-1 bg-[#2a2a2a] border border-[#404040] text-[#a0a0a0] rounded hover:text-white hover:bg-[#3a3a3a] transition-colors text-[10px] font-medium pointer-events-none">
                  {playbackSpeed.toFixed(1)}x
                </button>
              </div>
              <button className="p-1.5 bg-[#2a2a2a] border border-[#404040] text-[#a0a0a0] rounded hover:text-white hover:bg-[#3a3a3a] transition-colors">
                <Keyboard className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1022] border border-[#1e2a4a] rounded-xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[#1e2a4a]/50">
              <h3 className="text-lg font-bold text-white">New Project</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-[#16223f] rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Upload Video</label>
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-[#253966] hover:border-amber-400/50 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-[#0d132d] group relative overflow-hidden">
                  <input
                    type="file"
                    accept="video/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setVideoSrc(URL.createObjectURL(file));
                        setVideoFile(file);
                        setShowUploadModal(false);
                      }
                    }}
                  />
                  {videoSrc ? (
                    <span className="text-amber-400 text-sm font-bold truncate px-4">Video Selected. Click to replace.</span>
                  ) : (
                    <>
                      <div className="p-3 bg-[#16223f] rounded-full group-hover:bg-[#1a294d] transition-colors">
                        <Upload className="w-6 h-6 text-zinc-400 group-hover:text-amber-400" />
                      </div>
                      <span className="text-sm text-zinc-400 font-medium">Drag & drop or <span className="text-amber-400">browse</span></span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-zinc-300">Spoken Language</label>
                <div className="relative">
                  <select
                    value={uploadLanguage}
                    onChange={(e) => setUploadLanguage(e.target.value)}
                    className="w-full appearance-none bg-[#0d132d] border border-[#253966] rounded-lg px-4 py-3 text-sm text-zinc-200 outline-none focus:border-amber-400/50 transition-colors cursor-pointer font-medium"
                  >
                    <option value="English (US)">English (US)</option>
                    <option value="English (UK)">English (UK)</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Auto-Detect">Auto-Detect</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-[#1e2a4a]/50 bg-[#070b19]">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!videoFile || isExtractingAudio}
                onClick={async () => {
                  if (!videoFile) return;

                  try {
                    setIsExtractingAudio(true);
                    setAudioExtractProgress(0);

                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

                    // 1. Create Project on Backend
                    const createRes = await fetch(`${apiUrl}/projects`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: videoFile.name, language: uploadLanguage, sessionId: 'guest-session' }),
                      credentials: 'include' // Always use include, it'll pass cookies if they exist.
                    });
                    if (!createRes.ok) throw new Error("Failed to create project");
                    const project = await createRes.json();

                    // 2. Extract Audio Locally
                    const { extractAudioToWav } = await import('@/lib/audioExtractor');
                    const { wavBlob: audioBlob, silenceCuts: cuts } = await extractAudioToWav(videoFile, (p) => setAudioExtractProgress(p));
                    setSilenceCuts(cuts);

                    // 3. Upload Audio Blob to Backend
                    const formData = new FormData();
                    formData.append('audioFile', audioBlob, 'extracted_audio.wav');
                    const uploadRes = await fetch(`${apiUrl}/projects/${project.id}/upload`, {
                      method: 'POST',
                      body: formData,
                    });
                    if (!uploadRes.ok) throw new Error("Upload failed");

                    // 4. Trigger Processing (Transcription)
                    setIsProcessingSubtitles(true);
                    setActiveProjectId(project.id);
                    await fetch(`${apiUrl}/projects/${project.id}/process`, {
                      method: 'POST'
                    });

                    setShowUploadModal(false);
                    pollProjectStatus(project.id);
                  } catch (err) {
                    console.error("Failed to create project", err);
                    alert("Failed to process video");
                  } finally {
                    setIsExtractingAudio(false);
                  }
                }}
                className="subplus-button disabled:opacity-50"
              >
                {isExtractingAudio ? `Extracting Audio... ${Math.round(audioExtractProgress)}%` : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open Project Modal */}
      {showOpenProjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0b1022] border border-[#1e2a4a] rounded-xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-[60vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#1e2a4a]/50 bg-[#070b19]">
              <h3 className="text-xl font-bold text-white tracking-tight">Open Project</h3>
              <button onClick={() => setShowOpenProjectModal(false)} className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-[#16223f] rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#1e2a4a]">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { title: "Podcast Highlights", date: "2 days ago", duration: "0:52" },
                  { title: "TikTok Edit #1", date: "Last week", duration: "1:15" },
                  { title: "Product Demo Video", date: "2 weeks ago", duration: "3:45" },
                  { title: "YouTube Intro", date: "Last month", duration: "0:20" },
                  { title: "Client Presentation", date: "Last month", duration: "5:30" }
                ].map((proj, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col bg-[#0d132d] border border-[#1e2a4a] rounded-lg overflow-hidden hover:border-amber-400/50 hover:shadow-[0_0_15px_rgba(251,191,36,0.1)] transition-all cursor-pointer group"
                    onClick={() => setShowOpenProjectModal(false)}
                  >
                    <div className="h-32 bg-[#16223f] flex items-center justify-center group-hover:bg-[#1a294d] transition-colors relative">
                      <FileVideo className="w-10 h-10 text-zinc-600 group-hover:text-amber-400/80 transition-colors" />
                      <span className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-zinc-300 font-mono font-bold">
                        {proj.duration}
                      </span>
                    </div>
                    <div className="p-3 flex flex-col">
                      <span className="text-sm font-semibold text-white truncate">{proj.title}</span>
                      <span className="text-xs text-zinc-500 mt-1">{proj.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end p-4 border-t border-[#1e2a4a]/50 bg-[#070b19]">
              <button
                onClick={() => setShowOpenProjectModal(false)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}
