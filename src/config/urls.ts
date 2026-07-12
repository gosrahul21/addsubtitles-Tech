import { AppConfig } from './appConfig';

export const getEditorUrl = (toolSlug?: string): string => {
  if (toolSlug === 'remove-silences-online') {
    return `${AppConfig.EDITOR_URL}?subtitles=false&removeSilences=true`;
  }
  return AppConfig.EDITOR_URL;
};
