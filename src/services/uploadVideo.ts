const uploadVideo = async (apiUrl: string, projectId: string, finalVideoUrl: string) => {
  // Update Backend with videoUrl and trigger processing
  const uploadRes = await fetch(`${apiUrl}/projects/${projectId}/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoUrl: finalVideoUrl }),
  });
  
  if (!uploadRes.ok) {
    throw new Error("Failed to save URL to backend");
  }

  return uploadRes.json();
};

export default uploadVideo;