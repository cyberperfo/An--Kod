const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

type ImageValidationResult =
  | { valid: true; extension: string }
  | { valid: false; error: string };

export function validateImageFile(file: File): ImageValidationResult {
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: "Fotoğraf en fazla 5 MB olabilir." };
  }

  const extension = IMAGE_EXTENSIONS[file.type];
  if (!extension) {
    return { valid: false, error: "Sadece JPG, PNG veya WebP fotoğrafları yüklenebilir." };
  }

  return { valid: true, extension };
}