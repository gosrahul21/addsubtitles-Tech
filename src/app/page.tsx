"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useAuth } from "@/providers/AuthProvider";
import { extractAudioToWav } from '@/lib/audioExtractor';
import { SilenceInterval } from '@/lib/silenceDetection';
import { generateHooksFromText, translateSubtitles } from '@/lib/magicServices';
import UpgradeModal from '@/components/UpgradeModal';
import ProfileModal from '@/components/ProfileModal';
import Logo from '@/components/Logo';
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
import { exportVideo } from '@/lib/exportVideo';
import { HexColorPicker } from "react-colorful";

const getSubtitleStyles = (template: string) => {
  let className = "";
  let style: React.CSSProperties = {};

  switch (template) {
    case 'Classic':
      className = "font-sans shadow-md";
      break;
    case 'BANGERS':
      className = "tracking-wide";
      break;
    case 'STREET':
      className = "tracking-widest drop-shadow-lg";
      break;
    case 'BEAST':
      className = "tracking-tighter";
      break;
    case 'Clean':
      className = "tracking-tight drop-shadow-md";
      break;
    case 'Highlight':
      className = "transform -rotate-2 shadow-lg";
      break;
    case 'FIRE':
      className = "tracking-widest";
      break;
    case 'BEN':
      className = "tracking-tight";
      break;
    case 'Default':
    default:
      className = "drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]";
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

export interface TimelineSegment {
  start: number;
  end: number;
  label: string;
  words?: { start: number; end: number; word: string }[];
}

function EditorPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(52.1);
  const [activeTab, setActiveTab] = useState("");
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
  const [outlineColor, setOutlineColor] = useState("#000000");
  const [isOutlineTransparent, setIsOutlineTransparent] = useState(true);
  const [outlineWidth, setOutlineWidth] = useState(23);

  const [shadowColor, setShadowColor] = useState("#000000");
  const [isShadowTransparent, setIsShadowTransparent] = useState(true);
  const [shadowDistance, setShadowDistance] = useState(3);
  const [shadowBlur, setShadowBlur] = useState(6);
  const [shadowAngle, setShadowAngle] = useState(135);

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
  const [wordColor, setWordColor] = useState("#FBBF24");
  const [isWordColorTransparent, setIsWordColorTransparent] = useState(false);
  const [highlightBgColor, setHighlightBgColor] = useState("#F59E0B");
  const [isHighlightBgTransparent, setIsHighlightBgTransparent] = useState(false);
  const [highlightTextColor, setHighlightTextColor] = useState("#0D142D");
  const [isHighlightTextTransparent, setIsHighlightTextTransparent] = useState(false);

  // Styles State
  const [activeTemplate, setActiveTemplate] = useState("Classic");

  const timelineRef = useRef<HTMLDivElement>(null);
  const playerProgressRef = useRef<HTMLDivElement>(null);
  const [isDraggingTimeline, setIsDraggingTimeline] = useState(false);
  const [isDraggingPlayerProgress, setIsDraggingPlayerProgress] = useState(false);
  const [resizeState, setResizeState] = useState<{ index: number, edge: 'start' | 'end' | 'move', offsetX?: number } | null>(null);
  const [editingSubtitleIndex, setEditingSubtitleIndex] = useState<number | null>(null);
  const [isEditingOverlaySubtitle, setIsEditingOverlaySubtitle] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOpenProjectModal, setShowOpenProjectModal] = useState(false);
  const [userProjects, setUserProjects] = useState<any[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null);
  const [uploadLanguage, setUploadLanguage] = useState("en-US");
  const [subtitleFontSize, setSubtitleFontSize] = useState(25);
  const [showSubtitleMoreOptions, setShowSubtitleMoreOptions] = useState(false);
  const [subtitleStyle, setSubtitleStyle] = useState({ bold: false, italic: false, allCaps: false });

  const handleTemplateSelect = (templateName: string) => {
    setActiveTemplate(templateName);

    // Default "base" properties that apply to ALL templates unless overridden
    const baseStyle = {
      fontColor: '#ffffff',
      fontFamily: 'Montserrat',
      subtitleStyle: { bold: false, italic: false, allCaps: false },
      fontAlign: 'center',
      bgStyle: 'None',
      bgColor: '#000000',
      outline: 'None',
      shadow: 'None',
      subtitleAnim: 'Pop',
      wordAnim: 'Karaoke',
      subtitleFontSize: 25,
      maxLines: 2,
      maxWordsPerLine: "Auto",
      highlightBgColor: '#F59E0B',
      highlightTextColor: '#0D142D',
      wordColor: '#FBBF24',
    };

    let overrides = {};

    switch (templateName) {
      case 'Classic':
        overrides = { bgStyle: 'Fill', bgColor: '#000000', outline: 'None', shadow: 'None', subtitleStyle: { bold: true, italic: false, allCaps: false }, fontFamily: 'Inter' };
        break;
      case 'BANGERS':
        overrides = { fontColor: '#FFFFFF', fontFamily: 'Impact', outline: 'Hard', shadow: 'Hard', subtitleStyle: { bold: true, italic: true, allCaps: true }, subtitleFontSize: 25, maxLines: 1, maxWordsPerLine: "3", wordAnim: 'Karaoke', wordColor: '#EAB308' };
        break;
      case 'STREET':
        overrides = { fontFamily: 'Impact', outline: 'Hard', shadow: 'Soft', subtitleStyle: { bold: true, italic: false, allCaps: true }, wordAnim: 'None' };
        break;
      case 'BEAST':
        overrides = { fontColor: '#FFFFFF', fontFamily: 'Montserrat', outline: 'Hard', shadow: 'Hard', subtitleStyle: { bold: true, italic: true, allCaps: true }, subtitleFontSize: 25, wordAnim: 'Karaoke', wordColor: '#EAB308' };
        break;
      case 'Clean':
        overrides = { fontFamily: 'Montserrat', shadow: 'None' };
        break;
      case 'Highlight':
        overrides = { fontColor: '#FFFFFF', fontFamily: 'Montserrat', bgStyle: 'Wrap', bgColor: '#1A1C29', shadow: 'None', outline: 'None', subtitleStyle: { bold: true, italic: false, allCaps: false }, wordAnim: 'Highlight', highlightBgColor: '#FF6333', highlightTextColor: '#FFFFFF', wordColor: '#FFFFFF' };
        break;
      case 'FIRE':
        overrides = { fontColor: '#EF4444', fontFamily: 'Montserrat', outline: 'Soft', shadow: 'Hard', subtitleStyle: { bold: true, italic: false, allCaps: true } };
        break;
      case 'BEN':
        overrides = { fontColor: '#FFFFFF', fontFamily: 'Impact', outline: 'Hard', shadow: 'Hard', subtitleStyle: { bold: true, italic: false, allCaps: true }, subtitleFontSize: 25, wordAnim: 'Alternating' };
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
    if (finalStyle.outline === 'Hard' || finalStyle.outline === 'Thick') {
      setIsOutlineTransparent(false); setOutlineWidth(23); setOutlineColor('#000000');
    } else if (finalStyle.outline === 'Thin' || finalStyle.outline === 'Soft') {
      setIsOutlineTransparent(false); setOutlineWidth(10); setOutlineColor('#000000');
    } else {
      setIsOutlineTransparent(true);
    }

    setIsBgTransparent(finalStyle.bgStyle === 'None');

    if (finalStyle.shadow === 'Hard') {
      setIsShadowTransparent(false); setShadowDistance(6); setShadowBlur(0); setShadowAngle(135); setShadowColor('#000000');
    } else if (finalStyle.shadow === 'Soft') {
      setIsShadowTransparent(false); setShadowDistance(3); setShadowBlur(6); setShadowAngle(135); setShadowColor('#000000');
    } else {
      setIsShadowTransparent(true);
    }
    setSubtitleAnim(finalStyle.subtitleAnim);
    setWordAnim(finalStyle.wordAnim);
    setSubtitleFontSize(finalStyle.subtitleFontSize);
    setMaxLines(finalStyle.maxLines);
    setMaxWordsPerLine(finalStyle.maxWordsPerLine);
    if ((finalStyle as any).highlightBgColor) setHighlightBgColor((finalStyle as any).highlightBgColor);
    if ((finalStyle as any).highlightTextColor) setHighlightTextColor((finalStyle as any).highlightTextColor);
    if ((finalStyle as any).wordColor) setWordColor((finalStyle as any).wordColor);
  };

  // Interactive Canvas State
  const canvasRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isExtractingAudio, setIsExtractingAudio] = useState(false);
  const searchParams = useSearchParams();
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(() => {
    // Will be corrected in useEffect once client-side params are available
    return true;
  });

  const [audioExtractProgress, setAudioExtractProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [exportProgress, setExportProgress] = useState(0);
  const [silenceCuts, setSilenceCuts] = useState<SilenceInterval[]>([]);
  const [removeSilences, setRemoveSilences] = useState(false);
  const { user, setUser, loading, logout } = useAuth();
  useEffect(() => {
    const paramSub = searchParams.get('subtitles');
    if (paramSub === 'false') setSubtitlesEnabled(false);

    const paramSilences = searchParams.get('removeSilences');
    if (paramSilences === 'true') {
      setRemoveSilences(true);
      setShowUploadModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (showOpenProjectModal && user) {
      setIsLoadingProjects(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      fetch(`${apiUrl}/projects`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setUserProjects(data);
        })
        .catch(err => console.error("Failed to load projects", err))
        .finally(() => setIsLoadingProjects(false));
    }
  }, [showOpenProjectModal, user]);

  const [isGeneratingHooks, setIsGeneratingHooks] = useState(false);
  const [generatedHooks, setGeneratedHooks] = useState<string[]>([]);
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  const [isTranslating, setIsTranslating] = useState(false);
  const [filterFillerWords, setFilterFillerWords] = useState(false);
  const [autoEmoji, setAutoEmoji] = useState(false);
  const [pendingSubtitleEnable, setPendingSubtitleEnable] = useState(false);

  // Reusable upload and transcribe function
  const handleUploadAndTranscribe = async () => {
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
        credentials: 'include'
      });
      if (!createRes.ok) throw new Error("Failed to create project");
      const project = await createRes.json();

      // If they opted to enable subtitles from the sidebar, officially enable them now
      if (pendingSubtitleEnable) {
        setSubtitlesEnabled(true);
        setPendingSubtitleEnable(false);
      }

      // 2. Try to Extract Audio Locally
      let uploadBlob: Blob = videoFile;
      let uploadName = videoFile.name;
      try {
        const { extractAudioToWav } = await import('@/lib/audioExtractor');
        const { wavBlob: audioBlob, silenceCuts: cuts } = await extractAudioToWav(videoFile, (p) => setAudioExtractProgress(p));
        setSilenceCuts(cuts);
        uploadBlob = audioBlob;
        uploadName = 'extracted_audio.wav';
      } catch (decodeErr) {
        console.warn("Local audio extraction failed, falling back to full video upload.", decodeErr);
        setAudioExtractProgress(100);
      }

      // 3. Upload Audio to Cloudinary
      const sigRes = await fetch(`${apiUrl}/projects/cloudinary-signature`);
      if (!sigRes.ok) throw new Error("Failed to get upload signature");
      const { signature, timestamp, apiKey, cloudName } = await sigRes.json();

      const formData = new FormData();
      formData.append('file', uploadBlob, uploadName);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!cloudinaryRes.ok) throw new Error("Cloudinary upload failed");
      const cloudinaryData = await cloudinaryRes.json();
      const audioUrl = cloudinaryData.secure_url;

      // 4. Save temp audio URL
      await fetch(`${apiUrl}/projects/${project.id}/audio`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl }),
      });

      // 5. Upload Original Video if user is logged in
      let finalVideoUrl = audioUrl;
      if (user) {
        const videoFormData = new FormData();
        videoFormData.append('file', videoFile, videoFile.name);
        videoFormData.append('api_key', apiKey);
        videoFormData.append('timestamp', timestamp);
        videoFormData.append('signature', signature);

        const vidCloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
          method: 'POST',
          body: videoFormData,
        });
        if (vidCloudinaryRes.ok) {
          const vidData = await vidCloudinaryRes.json();
          finalVideoUrl = vidData.secure_url;
        }
      }

      // 6. Update Backend with videoUrl and trigger processing
      const uploadRes = await fetch(`${apiUrl}/projects/${project.id}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: finalVideoUrl }),
      });
      if (!uploadRes.ok) throw new Error("Failed to save URL to backend");

      // 4. Update UI State
      setIsProcessingSubtitles(true);
      setActiveProjectId(project.id);
      setShowUploadModal(false);
      pollProjectStatus(project.id);
    } catch (err) {
      console.error("Failed to create project", err);
      alert("Failed to process video");
    } finally {
      setIsExtractingAudio(false);
    }
  };

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

  const [timelineSegments, setTimelineSegments] = useState<TimelineSegment[]>([
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

  const handleTimelineDrag = (e: React.MouseEvent<HTMLDivElement> | MouseEvent | TouchEvent | React.TouchEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const trackWidth = Math.max(rect.width, totalDuration * timelineZoom);

    let clientX = 0;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
    } else if ('clientX' in e) {
      clientX = (e as MouseEvent).clientX;
    }

    // Auto-scroll timeline when dragging near edges
    const edgeThreshold = 40;
    const scrollSpeed = 6;
    const scrollMax = timelineRef.current.scrollWidth - rect.width;
    let newScrollLeft = timelineRef.current.scrollLeft;

    if (clientX - rect.left < edgeThreshold && newScrollLeft > 0) {
      timelineRef.current.scrollLeft = Math.max(0, newScrollLeft - scrollSpeed);
      newScrollLeft = timelineRef.current.scrollLeft;
    } else if (rect.right - clientX < edgeThreshold && newScrollLeft < scrollMax) {
      timelineRef.current.scrollLeft = Math.min(scrollMax, newScrollLeft + scrollSpeed);
      newScrollLeft = timelineRef.current.scrollLeft;
    }

    const x = Math.max(0, Math.min(clientX - rect.left + newScrollLeft, trackWidth));
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
      setIsDraggingPlayerProgress(false);
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingTimeline || resizeState !== null) {
        handleTimelineDrag(e);
      }

      if (isDraggingPlayerProgress && playerProgressRef.current) {
        const rect = playerProgressRef.current.getBoundingClientRect();
        const percentage = Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width;
        const newTime = percentage * totalDuration;
        setCurrentTime(newTime);
        if (videoRef.current) videoRef.current.currentTime = newTime;
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
    const handleTouchMove = (e: TouchEvent) => {
      if (isDraggingTimeline || resizeState !== null) {
        if (e.cancelable) e.preventDefault();
        handleTimelineDrag(e);
      }

      if (isDraggingPlayerProgress && playerProgressRef.current && e.touches.length > 0) {
        if (e.cancelable) e.preventDefault();
        const rect = playerProgressRef.current.getBoundingClientRect();
        const clientX = e.touches[0].clientX;
        const percentage = Math.max(0, Math.min(clientX - rect.left, rect.width)) / rect.width;
        const newTime = percentage * totalDuration;
        setCurrentTime(newTime);
        if (videoRef.current) videoRef.current.currentTime = newTime;
      }

      if (canvasInteraction && canvasRef.current && e.touches.length > 0) {
        if (e.cancelable) e.preventDefault();
        const rect = canvasRef.current.getBoundingClientRect();
        const clientX = e.touches[0].clientX;
        const clientY = e.touches[0].clientY;
        const deltaX = ((clientX - canvasInteraction.startX) / rect.width) * 100;
        const deltaY = ((clientY - canvasInteraction.startY) / rect.height) * 100;

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

    if (isDraggingTimeline || resizeState !== null || canvasInteraction !== null || isDraggingPlayerProgress) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingTimeline, resizeState, canvasInteraction, totalDuration, timelineZoom, isDraggingPlayerProgress]);

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

  // Ref to track which silence cut we already seeked past
  const lastHandledCutRef = useRef<{ start: number; end: number } | null>(null);

  // RAF loop — ONLY for smooth UI/karaoke time tracking. No seeking here.
  useEffect(() => {
    let animationFrameId: number;

    const updateTime = () => {
      if (videoRef.current && isPlaying) {
        setCurrentTime(videoRef.current.currentTime);
        animationFrameId = requestAnimationFrame(updateTime);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  // Silence skipping — driven by the video's own timeupdate event.
  // timeupdate only fires after the browser has settled at a real position,
  // never mid-seek, so seeks never queue up and slow down over time.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (!removeSilences || !silenceCuts || silenceCuts.length === 0) return;
      const curTime = video.currentTime;
      const activeCut = silenceCuts.find(cut => curTime >= cut.start && curTime < cut.end);
      if (activeCut) {
        if (lastHandledCutRef.current?.start !== activeCut.start) {
          lastHandledCutRef.current = activeCut;
          video.currentTime = activeCut.end;
        }
      } else {
        lastHandledCutRef.current = null;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [removeSilences, silenceCuts]);

  const applyPresetStyle = (style: any) => {
    if (style.fontColor) setFontColor(style.fontColor);
    if (style.fontFamily) setFontFamily(style.fontFamily);
    if (style.subtitleStyle) setSubtitleStyle(style.subtitleStyle);
    if (style.bgStyle) setBgStyle(style.bgStyle);
    if (style.bgColor) setBgColor(style.bgColor);
    if (style.bgOpacity !== undefined) setBgOpacity(style.bgOpacity);
    if (style.isBgTransparent !== undefined) setIsBgTransparent(style.isBgTransparent);
    if (style.bgRadius !== undefined) setBgRadius(style.bgRadius);
    if (style.bgPaddingX !== undefined) setBgPaddingX(style.bgPaddingX);
    if (style.bgPaddingY !== undefined) setBgPaddingY(style.bgPaddingY);

    if (style.outlineColor) setOutlineColor(style.outlineColor);
    if (style.outlineWidth !== undefined) setOutlineWidth(style.outlineWidth);
    if (style.isOutlineTransparent !== undefined) setIsOutlineTransparent(style.isOutlineTransparent);

    if (style.shadowColor) setShadowColor(style.shadowColor);
    if (style.shadowDistance !== undefined) setShadowDistance(style.shadowDistance);
    if (style.shadowBlur !== undefined) setShadowBlur(style.shadowBlur);
    if (style.shadowAngle !== undefined) setShadowAngle(style.shadowAngle);
    if (style.isShadowTransparent !== undefined) setIsShadowTransparent(style.isShadowTransparent);

    if (style.subtitleAnim) setSubtitleAnim(style.subtitleAnim);
    if (style.wordAnim) setWordAnim(style.wordAnim);
    if (style.wordColor) setWordColor(style.wordColor);
    if (style.isWordColorTransparent !== undefined) setIsWordColorTransparent(style.isWordColorTransparent);
    if (style.highlightBgColor) setHighlightBgColor(style.highlightBgColor);
    if (style.highlightTextColor) setHighlightTextColor(style.highlightTextColor);
    if (style.isHighlightBgTransparent !== undefined) setIsHighlightBgTransparent(style.isHighlightBgTransparent);
    if (style.isHighlightTextTransparent !== undefined) setIsHighlightTextTransparent(style.isHighlightTextTransparent);

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
        bgOpacity,
        isBgTransparent,
        bgRadius,
        bgPaddingX,
        bgPaddingY,
        outlineColor,
        outlineWidth,
        isOutlineTransparent,
        shadowColor,
        shadowDistance,
        shadowBlur,
        shadowAngle,
        isShadowTransparent,
        subtitleAnim,
        wordAnim,
        wordColor,
        isWordColorTransparent,
        highlightBgColor,
        highlightTextColor,
        isHighlightBgTransparent,
        isHighlightTextTransparent,
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
          if (project.subtitle?.subtitlesJson && project.subtitle.subtitlesJson.length > 0) {
            const segments = project.subtitle.subtitlesJson.map((sub: any) => ({
              start: sub.timestampStart,
              end: sub.timestampEnd,
              label: sub.text,
              speaker: sub.speaker || 'A',
              words: sub.wordsJson || [],
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
      await logout();
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
        <Logo size="sm" className="md:hidden" />

        {/* Desktop & Mobile: Utility Actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="subplus-button py-1.5 px-2 md:px-3 rounded-md shadow-md flex items-center gap-1.5"
          >
            <span className="hidden md:inline">New Video</span>
            <Plus className="w-4 h-4 md:hidden" />
          </button>

          {user && (
            <div className="relative">
              <button
                onClick={() => setShowProjectMenu(!showProjectMenu)}
                className="flex items-center gap-1.5 px-2 md:px-4 py-1.5 rounded-md bg-[#16223f] border border-[#253966] text-sm text-[#ccd6e8] hover:bg-[#1f2f54] transition-all font-medium"
              >
                <span className="hidden md:inline">Project</span>
                <FileVideo className="w-4 h-4 md:hidden" />
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
          )}
          <button
            disabled={!videoFile || isExporting}
            onClick={async () => {
              if (!videoFile || !videoRef.current) return;
              setIsExporting(true);
              try {
                const { className: templateClassName, style: templateStyle } = getSubtitleStyles(activeTemplate);
                const blob = await exportVideo({
                  videoBlob: videoFile,
                  subtitles: timelineSegments.map((s: any, idx) => ({ start: s.start, end: s.end, text: s.label, id: idx.toString(), words: s.words })),
                  templateClassName,
                  templateStyle,
                  subtitleFontSize,
                  subtitleStyle,
                  fontFamily,
                  fontColor,
                  lineSpacing,
                  fontAlign,
                  outlineWidth,
                  outlineColor,
                  isOutlineTransparent,
                  shadowDistance,
                  shadowBlur,
                  shadowAngle,
                  shadowColor,
                  isShadowTransparent,
                  highlightBgColor,
                  highlightTextColor,
                  isHighlightBgTransparent,
                  isHighlightTextTransparent,
                  wordColor,
                  isWordColorTransparent,
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
                  filterFillerWords,
                  addWatermark: true,
                }, (status, progress) => {
                  setExportStatus(status);
                  setExportProgress(progress);
                });

                if (exportedVideoUrl) {
                  URL.revokeObjectURL(exportedVideoUrl);
                }

                const url = URL.createObjectURL(blob);
                setExportedVideoUrl(url);
                setShowDownloadModal(true);
              } catch (e) {
                console.error(e);
                alert("Export failed. See console for details.");
              }
              setIsExporting(false);
              setExportStatus("");
              setExportProgress(0);
            }}
            className={`flex items-center gap-1.5 px-2.5 md:px-4 py-1.5 rounded-md ${isExporting ? 'bg-amber-500 text-[#0d142d]' : 'bg-[#16223f] text-[#ccd6e8] hover:bg-[#1f2f54] hover:text-white'} border border-[#253966] text-sm transition-all font-medium whitespace-nowrap overflow-hidden`}
          >
            <span className="hidden md:inline">{isExporting ? `${exportStatus} ${Math.round(exportProgress)}%` : 'Export'}</span>
            <Download className="w-4 h-4 md:hidden" />
          </button>
        </div>

        {/* Central Logo - Desktop Only */}
        <Logo size="md" className="hidden md:flex absolute left-1/2 -translate-x-1/2" />

        {/* User Account / SubPlus CTA */}
        <div className="flex items-center gap-2 md:gap-3">
          {!loading && !user && (
            <div className="relative">
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
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 rounded-md bg-[#16223f] border border-[#253966] hover:bg-[#1f2f54] text-xs font-semibold tracking-wide text-zinc-200 transition-all"
              >
                <div className="w-4 h-4 md:w-5 md:h-5 bg-gradient-to-tr from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-[#0d142d] font-bold shadow-md text-[10px] md:text-xs">
                  {user.email[0].toUpperCase()}
                </div>
                <span className="hidden md:inline">{user.email.split('@')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-[#0d142d] border border-[#1e2a4a] rounded-lg shadow-xl shadow-black/50 z-50 overflow-hidden flex flex-col">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="px-4 py-2.5 text-left text-sm text-zinc-300 hover:text-white hover:bg-[#16223f] transition-colors border-b border-[#1e2a4a]"
                  >
                    Profile Settings
                  </button>
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
            <div className="relative w-20 md:w-24 h-8 bg-[#16223f] animate-pulse rounded-md border border-[#253966]"></div>
          )}
          {user?.subscriptionTier === 'FREE' ? (
            <button onClick={() => setShowUpgradeModal(true)} className="subplus-button rounded-md py-1 px-2 shadow-md text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">
              Upgrade <span className="hidden md:inline">Subscription</span>
            </button>
          ) : (
            <button onClick={() => setShowUpgradeModal(true)} className="flex items-center gap-1.5 bg-[#16223f] border border-amber-500/50 hover:bg-[#1f2f54] text-amber-400 rounded-md py-1 px-2.5 shadow-md text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap transition-colors">
              <Crown className="w-3.5 h-3.5" />
              {user?.subscriptionTier} <span className="hidden md:inline">PLAN</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Left Side Navigation Panel (Bottom on Mobile) */}
      <aside className="col-start-1 row-start-4 md:row-start-2 md:col-start-1 bg-[#090d1f] border-t md:border-t-0 md:border-r border-[#1e2a4a]/30 flex flex-row md:flex-col items-center justify-start py-2 px-3 md:px-0 md:py-2 gap-1 z-10 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto scrollbar-hide shrink-0 pb-safe w-full">

        <button
          onClick={() => setActiveTab("subtitles")}
          className={`flex flex-col items-center justify-center shrink-0 min-w-[60px] md:min-w-0 md:w-16 h-12 md:h-14 rounded-xl transition-all ${activeTab === "subtitles" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <Type className="w-4 h-4 md:w-4 md:h-4 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Subtitles</span>
        </button>

        <button
          onClick={() => setActiveTab("styles")}
          className={`flex flex-col items-center justify-center shrink-0 min-w-[60px] md:min-w-0 md:w-16 h-12 md:h-14 rounded-xl transition-all ${activeTab === "styles" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <Palette className="w-4 h-4 md:w-4 md:h-4 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Styles</span>
        </button>

        <button
          onClick={() => setActiveTab("magic")}
          className={`flex flex-col items-center justify-center shrink-0 min-w-[60px] md:min-w-0 md:w-16 h-12 md:h-14 rounded-xl transition-all ${activeTab === "magic" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <Wand className="w-4 h-4 md:w-4 md:h-4 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Magic</span>
        </button>

        <button
          onClick={() => setActiveTab("animate")}
          className={`flex flex-col items-center justify-center shrink-0 min-w-[60px] md:min-w-0 md:w-16 h-12 md:h-14 rounded-xl transition-all ${activeTab === "animate" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <Wand2 className="w-4 h-4 md:w-4 md:h-4 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Animate</span>
        </button>

        <button
          onClick={() => setActiveTab("font")}
          className={`flex flex-col items-center justify-center shrink-0 min-w-[60px] md:min-w-0 md:w-16 h-12 md:h-14 rounded-xl transition-all ${activeTab === "font" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <CaseSensitive className="w-4 h-4 md:w-4 md:h-4 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Font</span>
        </button>

        <button
          onClick={() => setActiveTab("layout")}
          className={`flex flex-col items-center justify-center shrink-0 min-w-[60px] md:min-w-0 md:w-16 h-12 md:h-14 rounded-xl transition-all ${activeTab === "layout" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <LayoutTemplate className="w-4 h-4 md:w-4 md:h-4 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Layout</span>
        </button>

        <button
          onClick={() => setActiveTab("background")}
          className={`flex flex-col items-center justify-center shrink-0 min-w-[60px] md:min-w-0 md:w-16 h-12 md:h-14 rounded-xl transition-all ${activeTab === "background" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <Square className="w-4 h-4 md:w-4 md:h-4 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Background</span>
        </button>

        <button
          onClick={() => setActiveTab("canvas")}
          className={`flex flex-col items-center justify-center shrink-0 min-w-[60px] md:min-w-0 md:w-16 h-12 md:h-14 rounded-xl transition-all ${activeTab === "canvas" ? "bg-[#182747] text-amber-400 border border-[#2d4370] shadow-md" : "text-zinc-400 hover:bg-[#101933] hover:text-white"
            }`}
        >
          <Grid3X3 className="w-4 h-4 md:w-4 md:h-4 mb-1" />
          <span className="text-[9px] md:text-[10px] font-semibold tracking-wider whitespace-nowrap">Canvas</span>
        </button>

        {/* Spacer to prevent Crisp chat widget from hiding the last tab on mobile */}
        <div className="shrink-0 w-[80px] md:hidden h-1" aria-hidden="true" />
      </aside>

      {/* 3. Main Video Canvas Container */}
      <main className="col-start-1 md:col-start-2 row-start-2 bg-[#060a16] flex items-center justify-center p-4 md:p-8 relative overflow-hidden z-0 min-h-[250px]">

        {/* Subtitles Overlay Panel */}
        {activeTab === "subtitles" && (
          <div className="absolute left-0 right-0 bottom-0 top-auto h-[60%] w-full rounded-t-2xl md:rounded-none md:left-0 md:top-0 md:bottom-0 md:w-96 md:h-auto md:right-auto bg-[#090d1f]/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-[#1e2a4a]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-bottom md:slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-5 md:px-6 py-4 border-b border-[#1e2a4a]/50 shrink-0">
              <h3 className="text-sm font-bold text-white tracking-wide">Subtitles</h3>
              <div className="flex items-center gap-2">
                {/* Enable / Disable Subtitles Toggle */}
                <button
                  onClick={() => {
                    if (!subtitlesEnabled && !activeProjectId && videoFile) {
                      // They skipped upload initially, now they want subtitles. Show the upload modal to let them select language and create project.
                      setPendingSubtitleEnable(true);
                      setShowUploadModal(true);
                    } else {
                      setSubtitlesEnabled(v => !v);
                    }
                  }}
                  title={subtitlesEnabled || pendingSubtitleEnable ? 'Disable Subtitles' : 'Enable Subtitles'}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${(subtitlesEnabled || pendingSubtitleEnable) ? 'bg-amber-400' : 'bg-[#253966]'
                    }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200 ${(subtitlesEnabled || pendingSubtitleEnable) ? 'translate-x-4' : 'translate-x-1'
                      }`}
                  />
                </button>
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
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${(seg as any).speaker === 'A'
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
                          className="opacity-100 md:opacity-0 md:group-hover/card:opacity-100 p-1 text-zinc-400 hover:text-red-500 rounded transition-opacity"
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
          <div className="absolute left-0 right-0 bottom-0 top-auto h-[60%] w-full rounded-t-2xl md:rounded-none md:left-0 md:top-0 md:bottom-0 md:w-96 md:h-auto md:right-auto bg-[#090d1f]/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-[#1e2a4a]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-20 flex flex-col transform transition-transform animate-in slide-in-from-bottom md:slide-in-from-left duration-300">
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
                {/* Outline Panel */}
                <div className="flex flex-col p-4 bg-[#0c1122] border border-[#1e2a4a] rounded-xl gap-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-200">Outline</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setActiveColorPicker(activeColorPicker === 'outline' ? null : 'outline'); setIsOutlineTransparent(false); }}
                        className={`flex items-center gap-2 bg-[#16223f] px-3 py-1.5 rounded-lg border transition-all ${(!isOutlineTransparent && activeColorPicker === 'outline') ? 'border-amber-400' : 'border-[#253966] hover:border-amber-400/50'}`}>
                        <div className="w-3.5 h-3.5 rounded-sm shadow-inner" style={{ backgroundColor: isOutlineTransparent ? 'transparent' : outlineColor }}></div>
                        <span className="text-xs text-zinc-300 font-mono tracking-wide">{isOutlineTransparent ? 'None' : outlineColor}</span>
                      </button>
                      <button
                        onClick={() => { setIsOutlineTransparent(true); setActiveColorPicker(null); }}
                        className={`w-7 h-7 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${isOutlineTransparent ? 'border-amber-400 opacity-100' : 'border-zinc-500 opacity-50 hover:opacity-100'}`}>
                      </button>
                    </div>
                  </div>
                  {activeColorPicker === 'outline' && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveColorPicker(null)} />
                      <div className="absolute top-14 right-4 z-50 p-4 bg-[#18181b] border border-[#27272a] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] w-[240px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="custom-color-picker w-full flex justify-center">
                          <HexColorPicker color={outlineColor} onChange={setOutlineColor} style={{ width: '100%', height: '160px' }} />
                        </div>
                        <div className="bg-[#27272a] rounded-lg px-3 py-2 border border-[#3f3f46] flex items-center gap-2">
                          <span className="text-zinc-500 font-mono text-sm">#</span>
                          <input
                            type="text" value={outlineColor.replace('#', '')} onChange={(e) => setOutlineColor(`#${e.target.value}`)}
                            className="bg-transparent border-none outline-none text-sm text-white w-full uppercase font-mono" maxLength={6}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-zinc-400 font-medium">Stroke Width</span>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#16223f] px-2 py-1 rounded text-zinc-300 text-xs w-12 text-center">{outlineWidth} %</div>
                      <div className="relative flex-1 h-4 flex items-center group">
                        <div className="absolute left-0 right-0 h-1 bg-[#1e2a4a] rounded-full pointer-events-none">
                          <div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full" style={{ width: `${outlineWidth}%` }} />
                        </div>
                        <div className="absolute w-3 h-3 bg-white rounded-full shadow-md pointer-events-none group-active:scale-110 transition-transform" style={{ left: `calc(${outlineWidth}% - 6px)` }} />
                        <input type="range" min="0" max="100" value={outlineWidth} onChange={(e) => setOutlineWidth(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shadow Panel */}
                <div className="flex flex-col p-4 bg-[#0c1122] border border-[#1e2a4a] rounded-xl gap-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-200">Shadow</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setActiveColorPicker(activeColorPicker === 'shadow' ? null : 'shadow'); setIsShadowTransparent(false); }}
                        className={`flex items-center gap-2 bg-[#16223f] px-3 py-1.5 rounded-lg border transition-all ${(!isShadowTransparent && activeColorPicker === 'shadow') ? 'border-amber-400' : 'border-[#253966] hover:border-amber-400/50'}`}>
                        <div className="w-3.5 h-3.5 rounded-sm shadow-inner" style={{ backgroundColor: isShadowTransparent ? 'transparent' : shadowColor }}></div>
                        <span className="text-xs text-zinc-300 font-mono tracking-wide">{isShadowTransparent ? 'None' : shadowColor}</span>
                      </button>
                      <button
                        onClick={() => { setIsShadowTransparent(true); setActiveColorPicker(null); }}
                        className={`w-7 h-7 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${isShadowTransparent ? 'border-amber-400 opacity-100' : 'border-zinc-500 opacity-50 hover:opacity-100'}`}>
                      </button>
                    </div>
                  </div>
                  {activeColorPicker === 'shadow' && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setActiveColorPicker(null)} />
                      <div className="absolute top-14 right-4 z-50 p-4 bg-[#18181b] border border-[#27272a] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] w-[240px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <div className="custom-color-picker w-full flex justify-center">
                          <HexColorPicker color={shadowColor} onChange={setShadowColor} style={{ width: '100%', height: '160px' }} />
                        </div>
                        <div className="bg-[#27272a] rounded-lg px-3 py-2 border border-[#3f3f46] flex items-center gap-2">
                          <span className="text-zinc-500 font-mono text-sm">#</span>
                          <input
                            type="text" value={shadowColor.replace('#', '')} onChange={(e) => setShadowColor(`#${e.target.value}`)}
                            className="bg-transparent border-none outline-none text-sm text-white w-full uppercase font-mono" maxLength={6}
                          />
                        </div>
                      </div>
                    </>
                  )}
                  {/* Shadow Distance */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-zinc-400 font-medium">Distance</span>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#16223f] px-2 py-1 rounded text-zinc-300 text-xs w-12 text-center">{shadowDistance} %</div>
                      <div className="relative flex-1 h-4 flex items-center group">
                        <div className="absolute left-0 right-0 h-1 bg-[#1e2a4a] rounded-full pointer-events-none">
                          <div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full" style={{ width: `${shadowDistance}%` }} />
                        </div>
                        <div className="absolute w-3 h-3 bg-white rounded-full shadow-md pointer-events-none group-active:scale-110 transition-transform" style={{ left: `calc(${shadowDistance}% - 6px)` }} />
                        <input type="range" min="0" max="100" value={shadowDistance} onChange={(e) => setShadowDistance(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                  {/* Shadow Blur */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-zinc-400 font-medium">Blur</span>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#16223f] px-2 py-1 rounded text-zinc-300 text-xs w-12 text-center">{shadowBlur} %</div>
                      <div className="relative flex-1 h-4 flex items-center group">
                        <div className="absolute left-0 right-0 h-1 bg-[#1e2a4a] rounded-full pointer-events-none">
                          <div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full" style={{ width: `${shadowBlur}%` }} />
                        </div>
                        <div className="absolute w-3 h-3 bg-white rounded-full shadow-md pointer-events-none group-active:scale-110 transition-transform" style={{ left: `calc(${shadowBlur}% - 6px)` }} />
                        <input type="range" min="0" max="100" value={shadowBlur} onChange={(e) => setShadowBlur(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                  {/* Shadow Angle */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-zinc-400 font-medium">Angle</span>
                    <div className="flex items-center gap-3">
                      <div className="bg-[#16223f] px-2 py-1 rounded text-zinc-300 text-xs w-12 text-center">{shadowAngle}°</div>
                      <div className="relative flex-1 h-4 flex items-center group">
                        <div className="absolute left-0 right-0 h-1 bg-[#1e2a4a] rounded-full pointer-events-none">
                          <div className="absolute left-0 top-0 bottom-0 bg-amber-400 rounded-full" style={{ width: `${(shadowAngle / 360) * 100}%` }} />
                        </div>
                        <div className="absolute w-3 h-3 bg-white rounded-full shadow-md pointer-events-none group-active:scale-110 transition-transform" style={{ left: `calc(${(shadowAngle / 360) * 100}% - 6px)` }} />
                        <input type="range" min="0" max="360" value={shadowAngle} onChange={(e) => setShadowAngle(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Styles Overlay Panel */}
        {activeTab === "styles" && (
          <div className="absolute left-0 right-0 bottom-0 top-auto h-[60%] w-full rounded-t-2xl md:rounded-none md:left-0 md:top-0 md:bottom-0 md:w-96 md:h-auto md:right-auto bg-[#090d1f]/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-[#1e2a4a]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-bottom md:slide-in-from-left duration-300">
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
                    { name: 'Classic', type: 'classic', element: <span className="px-3 py-1 bg-black/80 rounded-md text-white font-sans font-bold text-sm shadow-md z-10 transition-transform group-hover:scale-105 pointer-events-none">Classic</span> },
                    { name: 'BANGERS', type: 'bangers', element: <span className="text-amber-400 font-black text-xl italic tracking-wider drop-shadow-[0_2px_0_rgba(0,0,0,1)] z-10 transition-transform group-hover:scale-105 pointer-events-none" style={{ WebkitTextStroke: '1px black' }}>BANGERS</span> },
                    { name: 'STREET', type: 'street', element: <span className="text-white font-black text-lg uppercase tracking-widest z-10 drop-shadow-md transition-transform group-hover:scale-105 pointer-events-none" style={{ WebkitTextStroke: '0.5px rgba(255,255,255,0.5)' }}>STREET</span> },
                    { name: 'BEAST', type: 'beast', element: <span className="text-yellow-500 font-black text-xl italic uppercase tracking-tighter drop-shadow-[0_3px_5px_rgba(0,0,0,1)] z-10 transition-transform group-hover:scale-105 pointer-events-none">BEAST</span> },
                    { name: 'Clean', type: 'clean', element: <span className="text-white font-medium text-lg tracking-tight z-10 transition-transform group-hover:scale-105 pointer-events-none">Clean</span> },
                    { name: 'Highlight', type: 'highlight', element: <span className="bg-amber-500 text-[#0d142d] px-2.5 py-0.5 font-bold text-sm transform -rotate-2 z-10 shadow-lg transition-transform group-hover:scale-110 group-hover:-rotate-3 pointer-events-none">Highlight</span> },
                    { name: 'FIRE', type: 'fire', element: <span className="text-red-500 font-black text-xl uppercase tracking-widest z-10 transition-transform group-hover:scale-105 pointer-events-none" style={{ WebkitTextStroke: '1px #450a0a' }}>FIRE</span> },
                    { name: 'BEN', type: 'ben', element: <span className="text-white font-black text-2xl uppercase tracking-tight z-10 transition-transform group-hover:scale-105 pointer-events-none" style={{ WebkitTextStroke: '2px black', textShadow: '3px 3px 0px black' }}>BEN</span> }
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
                        {tpl.type === 'ben' && <div className="absolute inset-0 bg-gradient-to-br from-[#0c1122] to-[#1e2a4a]/40 shadow-inner pointer-events-none" />}
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
                    <span className="px-3 py-1 bg-black/80 rounded-md text-white font-sans font-bold text-sm shadow-md z-10 transition-transform group-hover:scale-105">Classic</span>
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
          <div className="absolute left-0 right-0 bottom-0 top-auto h-[60%] w-full rounded-t-2xl md:rounded-none md:left-0 md:top-0 md:bottom-0 md:w-96 md:h-auto md:right-auto bg-[#090d1f]/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-[#1e2a4a]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-bottom md:slide-in-from-left duration-300">
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
          <div className="absolute left-0 right-0 bottom-0 top-auto h-[60%] w-full rounded-t-2xl md:rounded-none md:left-0 md:top-0 md:bottom-0 md:w-96 md:h-auto md:right-auto bg-[#090d1f]/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-[#1e2a4a]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-bottom md:slide-in-from-left duration-300">
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
          <div className="absolute left-0 right-0 bottom-0 top-auto h-[60%] w-full rounded-t-2xl md:rounded-none md:left-0 md:top-0 md:bottom-0 md:w-96 md:h-auto md:right-auto bg-[#090d1f]/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-[#1e2a4a]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-bottom md:slide-in-from-left duration-300">
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
          <div className="absolute left-0 right-0 bottom-0 top-auto h-[60%] w-full rounded-t-2xl md:rounded-none md:left-0 md:top-0 md:bottom-0 md:w-96 md:h-auto md:right-auto bg-[#090d1f]/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-[#1e2a4a]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-bottom md:slide-in-from-left duration-300">
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
                onClick={() => setRemoveSilences(!removeSilences)}
                className="flex items-center justify-between p-4 bg-gradient-to-r from-zinc-700/20 to-[#0c1122] border border-zinc-600/30 rounded-xl cursor-pointer hover:border-zinc-400/50 transition-all"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-zinc-200 flex items-center gap-2">
                    <Waves className="w-4 h-4 text-zinc-400" /> Remove Silences
                  </span>
                  <span className="text-xs text-zinc-500 font-medium leading-tight">Auto jump-cut dead air</span>
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
          <div className="absolute left-0 right-0 bottom-0 top-auto h-[60%] w-full rounded-t-2xl md:rounded-none md:left-0 md:top-0 md:bottom-0 md:w-96 md:h-auto md:right-auto bg-[#090d1f]/95 backdrop-blur-xl border-t md:border-t-0 md:border-r border-[#1e2a4a]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-[20px_0_40px_rgba(0,0,0,0.5)] z-50 flex flex-col transform transition-transform animate-in slide-in-from-bottom md:slide-in-from-left duration-300">
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
                    { name: 'None', icon: Square },
                    { name: 'Reveal', icon: Eye },
                    { name: 'Karaoke', icon: Music },
                    { name: 'Alternating', icon: Zap },
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
                {wordAnim === 'Karaoke' && (
                  <div className="flex items-center justify-between bg-[#16223f] p-3 rounded-xl border border-[#1e2a4a] mt-2 relative">
                    <span className="text-sm font-semibold text-white">Word Color</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setActiveColorPicker(activeColorPicker === 'wordColor' ? null : 'wordColor'); setIsWordColorTransparent(false); }}
                        className={`flex items-center gap-2 bg-[#0c1122] px-3 py-1.5 rounded-lg border transition-all ${(!isWordColorTransparent && activeColorPicker === 'wordColor') ? 'border-amber-400' : 'border-[#253966] hover:border-amber-400/50'}`}>
                        <div className="w-3.5 h-3.5 rounded-sm shadow-inner" style={{ backgroundColor: isWordColorTransparent ? 'transparent' : wordColor }}></div>
                        <span className="text-xs text-zinc-300 font-mono tracking-wide">{isWordColorTransparent ? 'None' : wordColor}</span>
                      </button>
                      <button
                        onClick={() => { setIsWordColorTransparent(true); setActiveColorPicker(null); }}
                        className={`w-7 h-7 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${isWordColorTransparent ? 'border-amber-400 opacity-100' : 'border-zinc-500 opacity-50 hover:opacity-100'}`}>
                      </button>
                    </div>
                    {activeColorPicker === 'wordColor' && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setActiveColorPicker(null)} />
                        <div className="absolute top-14 right-0 z-50 p-4 bg-[#18181b] border border-[#27272a] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] w-[240px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                          <div className="custom-color-picker w-full flex justify-center">
                            <HexColorPicker color={wordColor} onChange={setWordColor} style={{ width: '100%', height: '160px' }} />
                          </div>
                          <div className="bg-[#27272a] rounded-lg px-3 py-2 border border-[#3f3f46] flex items-center gap-2">
                            <span className="text-zinc-500 font-mono text-sm">#</span>
                            <input
                              type="text"
                              value={wordColor.replace('#', '')}
                              onChange={(e) => setWordColor(`#${e.target.value}`)}
                              className="bg-transparent border-none outline-none text-sm text-white w-full uppercase font-mono"
                              maxLength={6}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {wordAnim === 'Highlight' && (
                  <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center justify-between bg-[#16223f] p-3 rounded-xl border border-[#1e2a4a] relative">
                      <span className="text-sm font-semibold text-white">Background</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setActiveColorPicker(activeColorPicker === 'highlightBg' ? null : 'highlightBg'); setIsHighlightBgTransparent(false); }}
                          className={`flex items-center gap-2 bg-[#0c1122] px-3 py-1.5 rounded-lg border transition-all ${(!isHighlightBgTransparent && activeColorPicker === 'highlightBg') ? 'border-amber-400' : 'border-[#253966] hover:border-amber-400/50'}`}>
                          <div className="w-3.5 h-3.5 rounded-sm shadow-inner" style={{ backgroundColor: isHighlightBgTransparent ? 'transparent' : highlightBgColor }}></div>
                          <span className="text-xs text-zinc-300 font-mono tracking-wide">{isHighlightBgTransparent ? 'None' : highlightBgColor}</span>
                        </button>
                        <button
                          onClick={() => { setIsHighlightBgTransparent(true); setActiveColorPicker(null); }}
                          className={`w-7 h-7 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${isHighlightBgTransparent ? 'border-amber-400 opacity-100' : 'border-zinc-500 opacity-50 hover:opacity-100'}`}>
                        </button>
                      </div>
                      {activeColorPicker === 'highlightBg' && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveColorPicker(null)} />
                          <div className="absolute top-14 right-0 z-50 p-4 bg-[#18181b] border border-[#27272a] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] w-[240px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                            <div className="custom-color-picker w-full flex justify-center">
                              <HexColorPicker color={highlightBgColor} onChange={setHighlightBgColor} style={{ width: '100%', height: '160px' }} />
                            </div>
                            <div className="bg-[#27272a] rounded-lg px-3 py-2 border border-[#3f3f46] flex items-center gap-2">
                              <span className="text-zinc-500 font-mono text-sm">#</span>
                              <input
                                type="text"
                                value={highlightBgColor.replace('#', '')}
                                onChange={(e) => setHighlightBgColor(`#${e.target.value}`)}
                                className="bg-transparent border-none outline-none text-sm text-white w-full uppercase font-mono"
                                maxLength={6}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center justify-between bg-[#16223f] p-3 rounded-xl border border-[#1e2a4a] relative">
                      <span className="text-sm font-semibold text-white">Text Color</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setActiveColorPicker(activeColorPicker === 'highlightText' ? null : 'highlightText'); setIsHighlightTextTransparent(false); }}
                          className={`flex items-center gap-2 bg-[#0c1122] px-3 py-1.5 rounded-lg border transition-all ${(!isHighlightTextTransparent && activeColorPicker === 'highlightText') ? 'border-amber-400' : 'border-[#253966] hover:border-amber-400/50'}`}>
                          <div className="w-3.5 h-3.5 rounded-sm shadow-inner" style={{ backgroundColor: isHighlightTextTransparent ? 'transparent' : highlightTextColor }}></div>
                          <span className="text-xs text-zinc-300 font-mono tracking-wide">{isHighlightTextTransparent ? 'None' : highlightTextColor}</span>
                        </button>
                        <button
                          onClick={() => { setIsHighlightTextTransparent(true); setActiveColorPicker(null); }}
                          className={`w-7 h-7 rounded-lg border-2 border-dashed flex items-center justify-center transition-all ${isHighlightTextTransparent ? 'border-amber-400 opacity-100' : 'border-zinc-500 opacity-50 hover:opacity-100'}`}>
                        </button>
                      </div>
                      {activeColorPicker === 'highlightText' && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveColorPicker(null)} />
                          <div className="absolute top-14 right-0 z-50 p-4 bg-[#18181b] border border-[#27272a] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] w-[240px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                            <div className="custom-color-picker w-full flex justify-center">
                              <HexColorPicker color={highlightTextColor} onChange={setHighlightTextColor} style={{ width: '100%', height: '160px' }} />
                            </div>
                            <div className="bg-[#27272a] rounded-lg px-3 py-2 border border-[#3f3f46] flex items-center gap-2">
                              <span className="text-zinc-500 font-mono text-sm">#</span>
                              <input
                                type="text"
                                value={highlightTextColor.replace('#', '')}
                                onChange={(e) => setHighlightTextColor(`#${e.target.value}`)}
                                className="bg-transparent border-none outline-none text-sm text-white w-full uppercase font-mono"
                                maxLength={6}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
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
                    videoRef.current.currentTime = 0;
                    setCurrentTime(0);
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

            {subtitlesEnabled && (() => {
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
                      ...(!isOutlineTransparent ? { WebkitTextStroke: `${(outlineWidth / 100) * 20}px ${outlineColor}` } : {}),
                      ...(!isShadowTransparent ? { textShadow: `${Math.cos(shadowAngle * Math.PI / 180) * (shadowDistance / 100) * 30}px ${Math.sin(shadowAngle * Math.PI / 180) * (shadowDistance / 100) * 30}px ${(shadowBlur / 100) * 30}px ${shadowColor}` } : {}),
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

              let activeWordIndex = -1;
              if (activeSub.words && activeSub.words.length === words.length) {
                // Precise word-level timings from backend
                for (let i = 0; i < activeSub.words.length; i++) {
                  const w = activeSub.words[i];
                  // Add a small 50ms tolerance so consecutive words feel continuous
                  if (currentTime >= w.start && currentTime <= w.end + 0.05) {
                    activeWordIndex = i;
                    // If it's a perfect match, break. If multiple overlap, the last one wins.
                  }
                }
              } else {
                // Fallback: Character-proportional estimation (for user-edited text)
                const totalChars = Math.max(1, words.reduce((acc, w) => acc + w.length, 0));
                const duration = activeSub.end - activeSub.start;
                let currentStart = activeSub.start;
                for (let i = 0; i < words.length; i++) {
                  const wordDur = (words[i].length / totalChars) * duration;
                  if (currentTime >= currentStart && currentTime < currentStart + wordDur) {
                    activeWordIndex = i;
                    break;
                  }
                  currentStart += wordDur;
                }
                if (activeWordIndex === -1 && currentTime >= activeSub.end) {
                  activeWordIndex = words.length - 1;
                }
              }

              const limit = maxWordsPerLine !== 'Auto' ? parseInt(maxWordsPerLine, 10) : words.length;
              let activeChunkIdx = 0;
              if (activeWordIndex >= 0) {
                activeChunkIdx = Math.floor(activeWordIndex / limit);
              }

              let visibleChunks = chunkedWords.map((chunk, idx) => ({ chunk, originalChunkIdx: idx }));
              if (maxLines > 0 && maxWordsPerLine !== 'Auto') {
                const startChunkIdx = Math.floor(activeChunkIdx / maxLines) * maxLines;
                visibleChunks = visibleChunks.slice(startChunkIdx, startChunkIdx + maxLines);
              }

              const renderTextChunks = (isStrokeLayer: boolean) => (
                visibleChunks.map(({ chunk, originalChunkIdx }, renderIdx) => (
                  <span key={originalChunkIdx} className={bgStyle === 'Fit' || bgStyle === 'Wrap' ? 'block' : 'inline'}>
                    <span
                      className={bgStyle === 'Fit' || bgStyle === 'Wrap' ? 'inline-block' : 'inline'}
                      style={(bgStyle === 'Fit' || bgStyle === 'Wrap') && !isBgTransparent ? { backgroundColor, borderRadius: `${bgRadius}px`, padding: `${bgPaddingY}px ${bgPaddingX}px`, marginBottom: '4px' } : {}}
                    >
                      {chunk.map((w, idx) => {
                        const globalIdx = originalChunkIdx * limit + idx;
                        let wordClasses = "inline-block mx-[0.12em] transition-all duration-75 ";
                        let wordStyles: React.CSSProperties = {};

                        if (wordAnim === 'None') {
                          // No active word styling
                        } else if (wordAnim === 'Reveal') {
                          wordClasses += globalIdx <= activeWordIndex ? "opacity-100" : "opacity-0";
                        } else if (wordAnim === 'Karaoke') {
                          if (globalIdx === activeWordIndex && !isWordColorTransparent) {
                            if (isStrokeLayer) {
                              wordStyles = { color: outlineColor };
                            } else {
                              wordStyles = { color: wordColor, filter: `drop-shadow(0 0 8px ${wordColor}CC)` };
                            }
                          }
                        } else if (wordAnim === 'Alternating') {
                          if (globalIdx === activeWordIndex) {
                            if (isStrokeLayer) {
                              wordStyles = { color: outlineColor };
                            } else {
                              wordClasses += currentActiveSubIdx % 2 === 0 ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" : "text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]";
                            }
                          }
                        } else if (wordAnim === 'Highlight') {
                          if (globalIdx === activeWordIndex) {
                            wordClasses += " px-1 rounded-sm";
                            if (isStrokeLayer) {
                              wordStyles = { backgroundColor: 'transparent', color: outlineColor };
                            } else {
                              const hBg = isHighlightBgTransparent ? 'transparent' : highlightBgColor;
                              const hText = isHighlightTextTransparent ? 'inherit' : highlightTextColor;
                              wordStyles = { backgroundColor: hBg, color: hText };
                            }
                          }
                        } else if (wordAnim === 'Scale') {
                          if (globalIdx === activeWordIndex) {
                            wordClasses += " scale-[1.2]";
                            if (isStrokeLayer) {
                              wordStyles = { color: outlineColor };
                            } else {
                              wordClasses += " text-amber-400";
                            }
                          }
                        }

                        const isFiller = filterFillerWords && w.match(/\b(um|uh|ums|uhs)\b/i);
                        if (isFiller) {
                          wordClasses += " line-through opacity-50 decoration-red-500 decoration-2";
                        }

                        return (
                          <span key={globalIdx} className={wordClasses} style={wordStyles}>
                            {w}
                          </span>
                        );
                      })}
                    </span>
                    {renderIdx < visibleChunks.length - 1 && <br />}
                  </span>
                ))
              );

              return (
                <div key={`${activeSub.start}-${subtitleAnim}`} className="relative w-full">
                  {!isOutlineTransparent && (
                    <h2
                      className={`absolute inset-0 leading-tight ${templateClassName} ${animClass} ${subtitleStyle.italic ? 'italic' : ''} ${subtitleStyle.allCaps ? 'uppercase' : ''}`}
                      style={{
                        ...templateStyle,
                        fontSize: `${subtitleFontSize}px`,
                        fontWeight: subtitleStyle.bold ? 900 : (templateStyle.fontWeight || 700),
                        fontFamily: fontFamily || 'inherit',
                        color: outlineColor,
                        lineHeight: lineSpacing,
                        fontStyle: subtitleStyle.italic ? 'italic' : (templateStyle.fontStyle || 'normal'),
                        textTransform: subtitleStyle.allCaps ? 'uppercase' : (templateStyle.textTransform || 'none'),
                        textAlign: fontAlign as any,
                        WebkitTextStroke: `${(outlineWidth / 100) * 20}px ${outlineColor}`,
                        ...(!isShadowTransparent ? { textShadow: `${Math.cos(shadowAngle * Math.PI / 180) * (shadowDistance / 100) * 30}px ${Math.sin(shadowAngle * Math.PI / 180) * (shadowDistance / 100) * 30}px ${(shadowBlur / 100) * 30}px ${shadowColor}` } : {}),
                        backgroundColor: 'transparent',
                        width: bgStyle === 'Fill' ? '100%' : 'auto',
                        transform: randomRotate ? `rotate(${(Math.round(activeSub.start * 13) % 5) - 2}deg)` : (templateStyle.transform || 'none'),
                        zIndex: 1,
                      }}
                    >
                      {renderTextChunks(true)}
                    </h2>
                  )}

                  <h2
                    className={`relative leading-tight ${templateClassName} ${animClass} ${subtitleStyle.italic ? 'italic' : ''} ${subtitleStyle.allCaps ? 'uppercase' : ''}`}
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
                      ...(isOutlineTransparent && !isShadowTransparent ? { textShadow: `${Math.cos(shadowAngle * Math.PI / 180) * (shadowDistance / 100) * 30}px ${Math.sin(shadowAngle * Math.PI / 180) * (shadowDistance / 100) * 30}px ${(shadowBlur / 100) * 30}px ${shadowColor}` } : {}),
                      backgroundColor: bgStyle === 'Fill' && !isBgTransparent ? backgroundColor : (templateStyle.backgroundColor || 'transparent'),
                      borderRadius: `${bgRadius}px`,
                      padding: bgStyle === 'Fill' && !isBgTransparent ? `${bgPaddingY}px ${bgPaddingX}px` : (templateStyle.padding || '0'),
                      width: bgStyle === 'Fill' ? '100%' : 'auto',
                      transform: randomRotate ? `rotate(${(Math.round(activeSub.start * 13) % 5) - 2}deg)` : (templateStyle.transform || 'none'),
                      zIndex: 2,
                    }}
                  >
                    {renderTextChunks(false)}
                  </h2>
                </div>
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
                Selected: {selectedItem.type === 'subtitle' ? 'Subtitle' : 'Video'}. <span className="hidden md:inline">Press Delete or Backspace key to remove.</span>
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
                className="w-24 accent-amber-500 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] text-zinc-400 font-mono w-14 text-right whitespace-nowrap">{timelineZoom} px/s</span>
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
          className="relative h-[128px] shrink-0 bg-[#090d1f] rounded-xl border border-[#1e2a4a]/40 flex overflow-hidden select-none shadow-2xl"
        >
          {/* Left-side Track Header Panel */}
          <div className="w-12 md:w-14 bg-[#0d142d] border-r border-[#1e2a4a]/40 flex flex-col pt-8 text-[#ccd6e8]/80 shrink-0">
            {/* Video Track Header */}
            <div className="h-10 flex flex-row items-center justify-center gap-1 border-b border-[#1e2a4a]/20">
              <FileVideo className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[8px] font-bold text-zinc-500 tracking-wider">V1</span>
            </div>

            {/* Subtitles Track Header */}
            <div className="h-10 flex flex-row items-center justify-center gap-1 border-b border-[#1e2a4a]/20">
              <Type className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-[8px] font-bold text-zinc-500 tracking-wider">T1</span>
            </div>
          </div>

          {/* Right-side Timeline Workspace */}
          <div
            ref={timelineRef}
            className="flex-1 relative flex flex-col bg-[#070b19] overflow-x-auto overflow-y-hidden animate-in fade-in duration-300"
          >
            {/* Scalable Track Wrapper */}
            <div
              style={{ width: `${totalDuration * timelineZoom}px`, minWidth: '100%' }}
              className="relative shrink-0 flex flex-col h-full"
            >
              {/* Time Ticks Header (Ruler) */}
              <div
                onMouseDown={(e) => {
                  setIsDraggingTimeline(true);
                  handleTimelineDrag(e);
                }}
                onTouchStart={(e) => {
                  setIsDraggingTimeline(true);
                  handleTimelineDrag(e);
                }}
                className="h-8 bg-[#0a0f24] border-b border-[#1e2a4a]/50 relative w-full shrink-0 flex items-end cursor-ew-resize"
              >
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
              <div className="flex-1 flex flex-col">

                {/* Video Track (Green Horizontal Bar with Thumbnails) */}
                <div
                  onClick={() => setAddSubtitleTime(null)}
                  className="h-10 relative w-full bg-[#052e16]/30 border-b border-[#1e2a4a]/20 flex items-center overflow-hidden"
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

                      {/* Silence Cut Zones — shown when removeSilences is ON and cuts exist */}
                      {removeSilences && silenceCuts.length > 0 && silenceCuts.map((cut, idx) => {
                        const leftPct = (cut.start / totalDuration) * 100;
                        const widthPct = ((cut.end - cut.start) / totalDuration) * 100;
                        return (
                          <div
                            key={`cut-${idx}`}
                            className="absolute inset-y-0 z-20 pointer-events-none"
                            style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                            title={`Silence: ${cut.start.toFixed(2)}s – ${cut.end.toFixed(2)}s`}
                          >
                            {/* Diagonal striped overlay */}
                            <div
                              className="w-full h-full opacity-80"
                              style={{
                                background: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.7) 0px, rgba(0,0,0,0.7) 4px, rgba(80,80,80,0.4) 4px, rgba(80,80,80,0.4) 8px)',
                                borderLeft: '1px solid rgba(255,255,255,0.2)',
                                borderRight: '1px solid rgba(255,255,255,0.2)',
                              }}
                            />
                            {/* Scissors icon for cuts wider than ~1% */}
                            {widthPct > 1 && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[8px] text-zinc-300/70 font-bold select-none">✂</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
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
                  onTouchStart={(e) => {
                    if (!timelineRef.current) return;
                    const rect = timelineRef.current.getBoundingClientRect();
                    const trackWidth = Math.max(rect.width, totalDuration * timelineZoom);
                    const clientX = e.touches[0].clientX;
                    const clickX = clientX - rect.left + timelineRef.current.scrollLeft;
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
                  className="h-10 relative w-full bg-[#1e293b]/20 border-b border-[#1e2a4a]/20 flex items-center cursor-pointer overflow-visible"
                >
                  {subtitlesEnabled && timelineSegments.map((seg, i) => {
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
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          if (!timelineRef.current) return;
                          const rect = timelineRef.current.getBoundingClientRect();
                          const trackWidth = Math.max(rect.width, totalDuration * timelineZoom);
                          const clientX = e.touches[0].clientX;
                          const clickX = clientX - rect.left + timelineRef.current.scrollLeft;
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
                          onTouchStart={(e) => { e.stopPropagation(); setResizeState({ index: i, edge: 'start' }); }}
                          className="h-full w-2.5 cursor-col-resize flex flex-col justify-center gap-0.5 px-0.5 opacity-50 group-hover:opacity-100 transition-opacity border-r border-white/5"
                        >
                          <div className="w-[1.5px] h-3 bg-white/50 rounded-full mx-auto" />
                        </div>

                        <span className="text-[10px] font-semibold truncate px-2 w-full text-center">{seg.label}</span>

                        {/* Right Grip Handle */}
                        <div
                          onMouseDown={(e) => { e.stopPropagation(); setResizeState({ index: i, edge: 'end' }); }}
                          onTouchStart={(e) => { e.stopPropagation(); setResizeState({ index: i, edge: 'end' }); }}
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
          <div
            ref={playerProgressRef}
            className="relative w-full h-4 flex items-center group cursor-pointer"
            onMouseDown={(e) => {
              setIsDraggingPlayerProgress(true);
              const rect = e.currentTarget.getBoundingClientRect();
              const percentage = Math.max(0, Math.min(e.clientX - rect.left, rect.width)) / rect.width;
              setCurrentTime(percentage * totalDuration);
              if (videoRef.current) videoRef.current.currentTime = percentage * totalDuration;
            }}
            onTouchStart={(e) => {
              setIsDraggingPlayerProgress(true);
              const rect = e.currentTarget.getBoundingClientRect();
              const clientX = e.touches[0].clientX;
              const percentage = Math.max(0, Math.min(clientX - rect.left, rect.width)) / rect.width;
              setCurrentTime(percentage * totalDuration);
              if (videoRef.current) videoRef.current.currentTime = percentage * totalDuration;
            }}
          >
            <div className="absolute left-0 right-0 h-[3px] bg-[#404040] rounded-full pointer-events-none overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 bg-[#3b82f6] rounded-full" style={{ width: `${(currentTime / Math.max(0.1, totalDuration)) * 100}%` }} />
            </div>
            <div
              className={`absolute w-3.5 h-3.5 bg-white rounded-full shadow-md pointer-events-none transition-transform ${isDraggingPlayerProgress ? 'scale-100' : 'scale-0 group-hover:scale-100'}`}
              style={{ left: `calc(${(currentTime / Math.max(0.1, totalDuration)) * 100}% - 7px)` }}
            />
          </div>

          {/* Playback Controls */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center">
            {/* Left: Volume (Icon visible on Mobile, Slider hidden) */}
            <div className="flex items-center gap-2 md:gap-3 justify-start">
              <button onClick={() => setIsMuted(!isMuted)} className="text-[#a0a0a0] hover:text-white transition-colors">
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 shrink-0" /> : <Volume2 className="w-4 h-4 shrink-0" />}
              </button>
              <div className="hidden md:flex relative w-24 lg:w-32 h-4 items-center group cursor-pointer">
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
            <div className="flex items-center gap-2 md:gap-5 justify-center">
              <div className="flex items-center gap-1 mr-1 md:mr-3 border-r border-[#404040] pr-2 md:pr-4">
                <button onClick={handleUndo} disabled={historyIndex <= 0} className={`p-1 rounded transition-all ${historyIndex <= 0 ? 'text-zinc-600 opacity-55 cursor-not-allowed' : 'text-zinc-400 hover:text-white'}`}>
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className={`p-1 rounded transition-all ${historyIndex >= history.length - 1 ? 'text-zinc-600 opacity-55 cursor-not-allowed' : 'text-zinc-400 hover:text-white'}`}>
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>
              <button className="text-[#a0a0a0] hover:text-white transition-colors"><SkipBack className="w-4.5 h-4.5" /></button>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-9 h-9 bg-white rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md shrink-0">
                {isPlaying ? <Pause className="w-4 h-4 fill-black text-black" /> : <Play className="w-4 h-4 fill-black text-black translate-x-0.5" />}
              </button>
              <button className="text-[#a0a0a0] hover:text-white transition-colors"><SkipForward className="w-4.5 h-4.5" /></button>

              <span className="text-[10px] md:text-[11px] font-mono text-[#a0a0a0] font-medium tracking-wide ml-1 md:ml-2 shrink-0 truncate">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime) % 60).toString().padStart(2, '0')}.{Math.floor((currentTime % 1) * 10)} / {Math.floor(totalDuration / 60)}:{(Math.floor(totalDuration) % 60).toString().padStart(2, '0')}.{Math.floor((totalDuration % 1) * 10)}
              </span>
            </div>

            {/* Right: Tools */}
            <div className="flex items-center gap-2 justify-end md:pr-14">
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

              {(subtitlesEnabled || pendingSubtitleEnable) && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-zinc-300">Spoken Language</label>
                  <div className="relative">
                    <select
                      value={uploadLanguage}
                      onChange={(e) => setUploadLanguage(e.target.value)}
                      className="w-full appearance-none bg-[#0d132d] border border-[#253966] rounded-lg px-4 py-3 text-sm text-zinc-200 outline-none focus:border-amber-400/50 transition-colors cursor-pointer font-medium"
                    >
                      <optgroup label="── Popular ──">
                        <option value="en-US">🇺🇸 English (US)</option>
                        <option value="en-GB">🇬🇧 English (UK)</option>
                        <option value="en-AU">🇦🇺 English (Australia)</option>
                        <option value="en-IN">🇮🇳 English (India)</option>
                        <option value="hi">🇮🇳 Hindi — हिन्दी</option>
                        <option value="es">🇪🇸 Spanish — Español</option>
                        <option value="es-419">🌎 Spanish (Latin Am)</option>
                        <option value="fr">🇫🇷 French — Français</option>
                        <option value="fr-CA">🇨🇦 French (Canada)</option>
                        <option value="de">🇩🇪 German — Deutsch</option>
                        <option value="it">🇮🇹 Italian — Italiano</option>
                        <option value="pt">🇵🇹 Portuguese — Português</option>
                        <option value="pt-BR">🇧🇷 Portuguese (Brazil)</option>
                        <option value="ja">🇯🇵 Japanese — 日本語</option>
                        <option value="ko">🇰🇷 Korean — 한국어</option>
                        <option value="zh-CN">🇨🇳 Chinese (Simplified)</option>
                        <option value="zh-TW">🇹🇼 Chinese (Traditional)</option>
                        <option value="ar">🇸🇦 Arabic — العربية</option>
                        <option value="ru">🇷🇺 Russian — Русский</option>
                        <option value="tr">🇹🇷 Turkish — Türkçe</option>
                        <option value="multi">🌐 Auto-Detect (Multi)</option>
                      </optgroup>
                      <optgroup label="── More Languages ──">
                        <option value="bg">Bulgarian — Български</option>
                        <option value="ca">Catalan — Català</option>
                        <option value="cs">Czech — Čeština</option>
                        <option value="da-DK">Danish — Dansk</option>
                        <option value="nl">Dutch — Nederlands</option>
                        <option value="et">Estonian — Eesti</option>
                        <option value="fi">Finnish — Suomi</option>
                        <option value="fl">Flemish — Vlaams</option>
                        <option value="el">Greek — Ελληνικά</option>
                        <option value="hr">Croatian — Hrvatski</option>
                        <option value="hu">Hungarian — Magyar</option>
                        <option value="id">Indonesian — Bahasa Indonesia</option>
                        <option value="lv">Latvian — Latviešu</option>
                        <option value="lt">Lithuanian — Lietuvių</option>
                        <option value="ms">Malay — Bahasa Melayu</option>
                        <option value="no">Norwegian — Norsk</option>
                        <option value="pl">Polish — Polski</option>
                        <option value="ro">Romanian — Română</option>
                        <option value="sk">Slovak — Slovenčina</option>
                        <option value="sl">Slovenian — Slovenščina</option>
                        <option value="sv-SE">Swedish — Svenska</option>
                        <option value="ta">Tamil — தமிழ்</option>
                        <option value="th">Thai — ภาษาไทย</option>
                        <option value="uk">Ukrainian — Українська</option>
                        <option value="vi">Vietnamese — Tiếng Việt</option>
                      </optgroup>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t border-[#1e2a4a]/50 bg-[#070b19]">
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setPendingSubtitleEnable(false); // Reset intent if they cancel
                }}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={!videoFile || isExtractingAudio}
                onClick={async () => {
                  if (!videoFile) return;

                  setTimelineSegments([]); // Clear mock subtitles on upload
                  setHistory([]);
                  setHistoryIndex(-1);

                  // ── Subtitles-disabled fast path ──────────────────────────
                  // When subtitles are turned off (e.g. coming from the silence-removal
                  // tool), skip the backend entirely. Just set the video src and close.
                  if (!subtitlesEnabled && !pendingSubtitleEnable) {
                    // Extract audio locally to find silences if the toggle is enabled
                    if (removeSilences) {
                      try {
                        setIsExtractingAudio(true);
                        setAudioExtractProgress(0);
                        const { extractAudioToWav } = await import('@/lib/audioExtractor');
                        const { silenceCuts: cuts } = await extractAudioToWav(videoFile, (p) => setAudioExtractProgress(p));
                        setSilenceCuts(cuts);
                      } catch (err) {
                        console.warn("Local audio extraction failed for silence detection.", err);
                      } finally {
                        setIsExtractingAudio(false);
                      }
                    }

                    setVideoSrc(URL.createObjectURL(videoFile));
                    setShowUploadModal(false);
                    return;
                  }

                  await handleUploadAndTranscribe();
                }}
                className="subplus-button px-2 py-1 rounded-lg text-sm font-semibold text-zinc-900 disabled:opacity-50"
              >
                {isExtractingAudio ? `Extracting Audio... ${Math.round(audioExtractProgress)}%` : subtitlesEnabled ? "Create Project" : "Load Video"}
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
              {isLoadingProjects ? (
                <div className="flex items-center justify-center h-full text-zinc-400">Loading projects...</div>
              ) : userProjects.length === 0 ? (
                <div className="flex items-center justify-center h-full text-zinc-500">No projects found. Create one!</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {userProjects.map((proj) => (
                    <div
                      key={proj.id}
                      className="flex flex-col bg-[#0d132d] border border-[#1e2a4a] rounded-lg overflow-hidden hover:border-amber-400/50 hover:shadow-[0_0_15px_rgba(251,191,36,0.1)] transition-all cursor-pointer group"
                      onClick={() => {
                        setShowOpenProjectModal(false);
                        setActiveProjectId(proj.id);
                        pollProjectStatus(proj.id);
                      }}
                    >
                      <div className="h-32 bg-[#16223f] flex items-center justify-center group-hover:bg-[#1a294d] transition-colors relative">
                        <FileVideo className="w-10 h-10 text-zinc-600 group-hover:text-amber-400/80 transition-colors" />
                        <span className="absolute bottom-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-zinc-300 font-mono font-bold">
                          {new Date(proj.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="p-3 flex flex-col">
                        <span className="text-sm font-semibold text-white truncate">{proj.name || 'Untitled Project'}</span>
                        <span className="text-xs text-zinc-500 mt-1 capitalize">{proj.status.toLowerCase()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

      {/* Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpgrade={() => setShowUpgradeModal(true)}
        onLogout={handleLogout}
      />

      {/* Download Options Modal */}
      {showDownloadModal && exportedVideoUrl && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-[#0b1329] border border-[#1e2a4a] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Glow backgrounds */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/5 blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/5 blur-[80px] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between p-6 border-b border-[#1e2a4a]/50">
              <h2 className="text-xl font-bold font-heading text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Export Successful!
              </h2>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="p-1.5 text-zinc-400 hover:text-white hover:bg-[#16223f] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="relative z-10 p-6 space-y-5">
              <p className="text-sm text-zinc-300 leading-relaxed">
                Your video has been rendered and subtitles have been baked. Choose an option below to save your files:
              </p>

              <div className="flex flex-col gap-3">
                <a
                  href={exportedVideoUrl}
                  download="exported_video.mp4"
                  className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-600 text-[#332b10] hover:shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-[1.01] transition-all flex justify-center items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Video (.mp4)
                </a>

                {subtitlesEnabled && (
                  <button
                    type="button"
                    onClick={() => {
                      const formatTime = (secs: number) => {
                        const date = new Date(0);
                        date.setSeconds(secs);
                        const ms = Math.round((secs % 1) * 1000).toString().padStart(3, '0');
                        const timeStr = date.toISOString().substring(11, 19);
                        return `${timeStr},${ms}`;
                      };

                      const srtContent = timelineSegments
                        .map((seg, idx) => {
                          return `${idx + 1}\n${formatTime(seg.start)} --> ${formatTime(seg.end)}\n${seg.label}\n`;
                        })
                        .join('\n');

                      const srtBlob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
                      const srtUrl = URL.createObjectURL(srtBlob);
                      const link = document.createElement('a');
                      link.href = srtUrl;
                      link.download = 'subtitles.srt';
                      link.click();
                      URL.revokeObjectURL(srtUrl);
                    }}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-transparent border border-white/10 hover:border-white/30 text-white hover:bg-white/5 transition-all flex justify-center items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    Download Subtitles (.srt)
                  </button>
                )}
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDownloadModal(false);
                    if (exportedVideoUrl) {
                      URL.revokeObjectURL(exportedVideoUrl);
                      setExportedVideoUrl(null);
                    }
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Discard Export Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="w-full h-screen bg-[#070b19]" />}>
      <EditorPage />
    </Suspense>
  );
}
