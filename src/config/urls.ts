export const getEditorUrl = (toolSlug?: string): string => {
  if (toolSlug === 'remove-silences-online') {
    return '/editor?subtitles=false&removeSilences=true';
  }
  return '/editor';
};
