import axios from 'axios';

export const generateHooksFromText = async (text: string): Promise<string[]> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await axios.post(`${apiUrl}/ai/generate-hooks`, { text }, { withCredentials: true });
    return response.data.hooks || [];
  } catch (error) {
    console.error('Failed to generate hooks:', error);
    // Fallback hooks if API fails
    return [
      "Stop Doing This IMMEDIATELY 🛑",
      "The Secret No One Tells You 🤫",
      "I Tested It So You Don't Have To 🚀",
    ];
  }
};

export const generateEmojisFromSegments = async (segments: any[]): Promise<any[]> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await axios.post(`${apiUrl}/ai/generate-emojis`, { segments }, { withCredentials: true });
    return response.data.emojis || [];
  } catch (error) {
    console.error('Failed to generate emojis:', error);
    return [];
  }
};

export const translateSubtitles = async (segments: any[], language: string): Promise<any[]> => {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await axios.post(
      `${apiUrl}/ai/translate-subtitles`,
      { segments, targetLanguage: language },
      { withCredentials: true }
    );
    return response.data.translatedSegments || [];
  } catch (error) {
    console.error('Failed to translate subtitles with Groq API:', error);
    // Fallback if network or backend error occurs
    return segments.map((seg) => ({
      ...seg,
      label: `[${language}] ${seg.label || seg.text}`,
      text: `[${language}] ${seg.text || seg.label}`,
    }));
  }
};
