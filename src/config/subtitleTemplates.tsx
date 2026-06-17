import React from 'react';

export interface SubtitleTemplate {
  id: string;
  name: string;
  type: string;
  categories: string[];
  
  // State overrides applied to the video editor when this template is selected
  overrides: Record<string, any>;
  
  // Inline CSS properties applied directly to the text rendering
  cssStyle: React.CSSProperties;
  
  // The JSX element used to represent this template in the Styles panel
  element: React.ReactNode;
  
  // The background JSX element for the Styles panel button
  bgElement?: React.ReactNode;
}

export const BASE_STYLE = {
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

export const SUBTITLE_TEMPLATES: SubtitleTemplate[] = [
  {
    id: 'Default',
    name: 'Default',
    type: 'blank',
    categories: ['All'],
    overrides: { shadow: 'Soft', fontFamily: 'Montserrat' },
    cssStyle: { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.9))' },
    element: <span className="text-xs text-zinc-500 font-medium group-hover:text-amber-400/70 transition-colors pointer-events-none">Default</span>,
    bgElement: <div className="absolute inset-0 bg-[#060a16]/50 border-2 border-dashed border-[#1e2a4a] rounded-xl pointer-events-none" />
  },
  {
    id: 'Classic',
    name: 'Classic',
    type: 'classic',
    categories: ['All', 'Business'],
    overrides: { bgStyle: 'Fill', bgColor: '#000000', outline: 'None', shadow: 'None', subtitleStyle: { bold: true, italic: false, allCaps: false }, fontFamily: 'Inter' },
    cssStyle: { filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.07)) drop-shadow(0 2px 2px rgba(0,0,0,0.06))' },
    element: <span className="px-3 py-1 bg-black/80 rounded-md text-white font-sans font-bold text-sm shadow-md z-10 transition-transform group-hover:scale-105 pointer-events-none">Classic</span>,
    bgElement: <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />
  },
  {
    id: 'BANGERS',
    name: 'BANGERS',
    type: 'bangers',
    categories: ['All'],
    overrides: { fontColor: '#FFFFFF', fontFamily: 'Bangers', outline: 'Hard', shadow: 'Hard', subtitleStyle: { bold: true, italic: true, allCaps: true }, subtitleFontSize: 25, maxLines: 1, maxWordsPerLine: "3", wordAnim: 'Karaoke', wordColor: '#EAB308' },
    cssStyle: { letterSpacing: '0.025em' },
    element: <span className="text-amber-400 font-black text-xl italic tracking-wider drop-shadow-[0_2px_0_rgba(0,0,0,1)] z-10 transition-transform group-hover:scale-105 pointer-events-none" style={{ WebkitTextStroke: '1px black' }}>BANGERS</span>,
    bgElement: <div className="absolute inset-0 bg-gradient-to-br from-[#16223f]/50 to-[#0c1122] opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />
  },
  {
    id: 'STREET',
    name: 'STREET',
    type: 'street',
    categories: ['All'],
    overrides: { fontFamily: 'Anton', outline: 'Hard', shadow: 'Soft', subtitleStyle: { bold: true, italic: false, allCaps: true }, wordAnim: 'None' },
    cssStyle: { letterSpacing: '0.1em', filter: 'drop-shadow(0 10px 8px rgba(0,0,0,0.04)) drop-shadow(0 4px 3px rgba(0,0,0,0.1))' },
    element: <span className="text-white font-black text-lg uppercase tracking-widest z-10 drop-shadow-md transition-transform group-hover:scale-105 pointer-events-none" style={{ WebkitTextStroke: '0.5px rgba(255,255,255,0.5)' }}>STREET</span>,
    bgElement: <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black pointer-events-none" />
  },
  {
    id: 'BEAST',
    name: 'BEAST',
    type: 'beast',
    categories: ['All'],
    overrides: { fontColor: '#FFFFFF', fontFamily: 'Montserrat', outline: 'Hard', shadow: 'Hard', subtitleStyle: { bold: true, italic: true, allCaps: true }, subtitleFontSize: 25, wordAnim: 'Karaoke', wordColor: '#EAB308' },
    cssStyle: { letterSpacing: '-0.05em' },
    element: <span className="text-yellow-500 font-black text-xl italic uppercase tracking-tighter drop-shadow-[0_3px_5px_rgba(0,0,0,1)] z-10 transition-transform group-hover:scale-105 pointer-events-none">BEAST</span>,
    bgElement: <div className="absolute inset-0 shadow-inner pointer-events-none" />
  },
  {
    id: 'Clean',
    name: 'Clean',
    type: 'clean',
    categories: ['All', 'Business'],
    overrides: { fontFamily: 'Montserrat', shadow: 'None' },
    cssStyle: { letterSpacing: '-0.025em', filter: 'drop-shadow(0 4px 3px rgba(0,0,0,0.07)) drop-shadow(0 2px 2px rgba(0,0,0,0.06))' },
    element: <span className="text-white font-medium text-lg tracking-tight z-10 transition-transform group-hover:scale-105 pointer-events-none">Clean</span>,
    bgElement: <div className="absolute inset-0 bg-[#16223f]/40 pointer-events-none" />
  },
  {
    id: 'Highlight',
    name: 'Highlight',
    type: 'highlight',
    categories: ['All'],
    overrides: { fontColor: '#FFFFFF', fontFamily: 'Montserrat', bgStyle: 'Wrap', bgColor: '#1A1C29', shadow: 'None', outline: 'None', subtitleStyle: { bold: true, italic: false, allCaps: false }, wordAnim: 'Highlight', highlightBgColor: '#FF6333', highlightTextColor: '#FFFFFF', wordColor: '#FFFFFF' },
    cssStyle: {},
    element: <span className="bg-amber-500 text-[#0d142d] px-2.5 py-0.5 font-bold text-sm transform -rotate-2 z-10 shadow-lg transition-transform group-hover:scale-110 group-hover:-rotate-3 pointer-events-none">Highlight</span>,
    bgElement: <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all pointer-events-none" />
  },
  {
    id: 'FIRE',
    name: 'FIRE',
    type: 'fire',
    categories: ['All'],
    overrides: { fontColor: '#FFFFFF', fontFamily: 'Oswald', outline: 'Hard', shadow: 'Hard', subtitleStyle: { bold: false, italic: false, allCaps: true }, wordAnim: 'Karaoke', wordColor: '#FF0000' },
    cssStyle: { letterSpacing: '-0.025em' },
    element: <span className="text-red-500 font-black text-xl uppercase tracking-widest z-10 transition-transform group-hover:scale-105 pointer-events-none" style={{ WebkitTextStroke: '1px #450a0a' }}>FIRE</span>,
    bgElement: <div className="absolute inset-0 bg-gradient-to-t from-red-950/40 to-[#0c1122] pointer-events-none" />
  },
  {
    id: 'BEN',
    name: 'BEN',
    type: 'ben',
    categories: ['All'],
    overrides: { fontColor: '#FFFFFF', fontFamily: 'Anton', outline: 'Hard', shadow: 'Hard', subtitleStyle: { bold: true, italic: false, allCaps: true }, subtitleFontSize: 25, wordAnim: 'Alternating' },
    cssStyle: { letterSpacing: '-0.025em' },
    element: <span className="text-white font-black text-2xl uppercase tracking-tight z-10 transition-transform group-hover:scale-105 pointer-events-none" style={{ WebkitTextStroke: '2px black', textShadow: '3px 3px 0px black' }}>BEN</span>,
    bgElement: <div className="absolute inset-0 bg-gradient-to-br from-[#0c1122] to-[#1e2a4a]/40 shadow-inner pointer-events-none" />
  },
  {
    id: 'NEON',
    name: 'NEON',
    type: 'neon',
    categories: ['All'],
    overrides: { fontColor: '#00FFCC', fontFamily: 'Montserrat', outline: 'None', shadow: 'Neon', subtitleStyle: { bold: true, italic: false, allCaps: true }, wordAnim: 'Karaoke', wordColor: '#FFFFFF' },
    cssStyle: { letterSpacing: '0.025em' },
    element: <span className="text-[#00FFCC] font-bold text-xl uppercase tracking-widest z-10 transition-transform group-hover:scale-105 pointer-events-none drop-shadow-[0_0_8px_rgba(0,255,204,0.8)]">NEON</span>
  },
  {
    id: 'HYPE',
    name: 'HYPE',
    type: 'hype',
    categories: ['All'],
    overrides: { fontColor: '#FFFFFF', fontFamily: 'Lilita One', bgStyle: 'Wrap', bgColor: 'transparent', shadow: 'Soft', outline: 'Thick', subtitleStyle: { bold: false, italic: false, allCaps: true }, wordAnim: 'Highlight', highlightBgColor: '#FF2A5F', highlightTextColor: '#FFFFFF', wordColor: '#FFFFFF' },
    cssStyle: { letterSpacing: '0em' },
    element: <span className="bg-[#FF2A5F] text-white px-2 py-0.5 font-bold text-xl uppercase tracking-normal z-10 transition-transform group-hover:scale-105 pointer-events-none rounded-md" style={{ WebkitTextStroke: '1.5px black', fontFamily: '"Lilita One", sans-serif' }}>HYPE</span>
  },
  {
    id: 'Simple',
    name: 'Simple',
    type: 'simple',
    categories: ['Business'],
    overrides: { fontColor: '#FFFFFF', fontFamily: 'Inter', bgStyle: 'None', outline: 'None', shadow: 'Soft', subtitleStyle: { bold: true, italic: false, allCaps: false }, wordAnim: 'None' },
    cssStyle: { letterSpacing: '0em' },
    element: <span className="text-white font-bold text-lg tracking-tight z-10 transition-transform group-hover:scale-105 pointer-events-none">Simple</span>
  },
  {
    id: 'Corporate',
    name: 'Corporate',
    type: 'corporate',
    categories: ['Business'],
    overrides: { fontColor: '#FFFFFF', fontFamily: 'Inter', bgStyle: 'Fill', bgColor: '#2563EB', outline: 'None', shadow: 'None', subtitleStyle: { bold: true, italic: false, allCaps: false }, wordAnim: 'None' },
    cssStyle: { letterSpacing: '-0.025em' },
    element: <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-bold text-sm shadow-lg z-10 transition-transform group-hover:scale-105 pointer-events-none">Corporate</span>
  },
  {
    id: 'Branded',
    name: 'Branded',
    type: 'branded',
    categories: ['Business'],
    overrides: { fontColor: '#3B82F6', fontFamily: 'Montserrat', bgStyle: 'Fill', bgColor: '#FFFFFF', outline: 'None', shadow: 'Soft', subtitleStyle: { bold: true, italic: false, allCaps: false }, wordAnim: 'Highlight', highlightBgColor: '#DBEAFE', highlightTextColor: '#1D4ED8' },
    cssStyle: { letterSpacing: '-0.025em' },
    element: <span className="text-blue-500 bg-white px-2 py-0.5 rounded font-bold text-sm shadow-md z-10 transition-transform group-hover:scale-105 pointer-events-none border border-blue-500/20">Branded</span>
  },
  {
    id: 'Editorial',
    name: 'Editorial',
    type: 'editorial',
    categories: ['Business'],
    overrides: { fontColor: '#000000', fontFamily: 'Inter', bgStyle: 'Fill', bgColor: '#C2F05A', outline: 'None', shadow: 'None', subtitleStyle: { bold: true, italic: false, allCaps: false }, wordAnim: 'Highlight', highlightBgColor: '#000000', highlightTextColor: '#C2F05A' },
    cssStyle: { letterSpacing: '0em' },
    element: <span className="bg-[#c2f05a] text-black px-2 py-0.5 font-serif font-bold text-sm shadow-md z-10 transition-transform group-hover:scale-105 pointer-events-none border border-black/10">Editorial</span>
  },
  {
    id: 'Pop Emoji',
    name: 'Pop Emoji',
    type: 'pop emoji',
    categories: ['Emoji'],
    overrides: { fontColor: '#FFFFFF', fontFamily: 'Montserrat', bgStyle: 'None', outline: 'Hard', shadow: 'Hard', subtitleStyle: { bold: true, italic: false, allCaps: false }, wordAnim: 'Karaoke', wordColor: '#FFCC00' },
    cssStyle: { letterSpacing: '0em' },
    element: <span className="text-white font-bold text-lg tracking-tight z-10 transition-transform group-hover:scale-105 pointer-events-none">Pop Emoji 😊</span>
  },
  {
    id: 'Float Emoji',
    name: 'Float Emoji',
    type: 'float emoji',
    categories: ['Emoji'],
    overrides: { fontColor: '#FFD700', fontFamily: 'Montserrat', bgStyle: 'None', outline: 'None', shadow: 'Soft', subtitleStyle: { bold: true, italic: false, allCaps: false }, wordAnim: 'Highlight', highlightBgColor: '#000000', highlightTextColor: '#FFD700' },
    cssStyle: { letterSpacing: '0em' },
    element: <span className="text-[#FFD700] font-bold text-lg tracking-tight z-10 transition-transform group-hover:scale-105 pointer-events-none">Float Emoji 🚀</span>
  }
];

export const getTemplateByName = (name: string): SubtitleTemplate => {
  return SUBTITLE_TEMPLATES.find(t => t.name === name) || SUBTITLE_TEMPLATES[0];
};

export const getTemplatesByCategory = (category: string): SubtitleTemplate[] => {
  if (category === 'All' || category === 'Custom') {
    // Return base templates for All, Custom templates handled separately in component if needed
    return SUBTITLE_TEMPLATES.filter(t => t.categories.includes('All'));
  }
  return SUBTITLE_TEMPLATES.filter(t => t.categories.includes(category));
};
