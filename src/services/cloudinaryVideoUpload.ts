export const cloudinaryVideoUpload = async (
  file: File | Blob,
  fileName: string,
  cloudName: string,
  apiKey: string,
  timestamp: string | number,
  signature: string
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file, fileName);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp.toString());
  formData.append('signature', signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Cloudinary upload failed');
  }

  const data = await response.json();
  return data.secure_url;
};