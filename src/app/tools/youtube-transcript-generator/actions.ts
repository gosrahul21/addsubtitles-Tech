"use server";

import { YoutubeTranscript } from 'youtube-transcript';

export async function fetchYoutubeTranscript(url: string) {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(url);
    return { success: true, data: transcript };
  } catch (error: any) {
    console.error("Error fetching transcript:", error);
    return { success: false, error: error.message || "Failed to fetch transcript" };
  }
}
