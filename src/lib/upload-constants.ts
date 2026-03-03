export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const ALLOWED_IMAGE_MIMES = Object.keys(ALLOWED_IMAGE_TYPES);

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
