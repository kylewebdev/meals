export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const ALLOWED_IMAGE_MIMES = Object.keys(ALLOWED_IMAGE_TYPES);

/** Reverse lookup: file extension (with dot) → MIME type */
export const EXT_TO_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(ALLOWED_IMAGE_TYPES).flatMap(([mime, ext]) => {
    const entries: [string, string][] = [[`.${ext}`, mime]];
    if (ext === 'jpg') entries.push(['.jpeg', mime]);
    return entries;
  }),
);

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
