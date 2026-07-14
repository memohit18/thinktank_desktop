import {
  IMAGE_UPLOAD_MAX_BYTES,
  IMAGE_UPLOAD_MAX_DIMENSION,
  IMAGE_UPLOAD_QUALITY,
} from '@/lib/images/imageResponse';

export type PreparedImageUpload = {
  file: File;
  width: number;
  height: number;
  originalBytes: number;
  preparedBytes: number;
};

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image file.'));
    };
    image.src = url;
  });
}

function canvasToJpegFile(
  canvas: HTMLCanvasElement,
  fileName: string,
  quality: number,
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to compress image.'));
          return;
        }
        const safeName = fileName.replace(/\.[^.]+$/, '') || 'image';
        resolve(
          new File([blob], `${safeName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          }),
        );
      },
      'image/jpeg',
      quality,
    );
  });
}

/**
 * Resize long edge to maxDimension, JPEG compress ~80–90% quality.
 * Rejects files that remain over maxBytes after compression.
 */
export async function prepareImageForUpload(
  file: File,
  options?: {
    maxBytes?: number;
    maxDimension?: number;
    quality?: number;
  },
): Promise<PreparedImageUpload> {
  const maxBytes = options?.maxBytes ?? IMAGE_UPLOAD_MAX_BYTES;
  const maxDimension = options?.maxDimension ?? IMAGE_UPLOAD_MAX_DIMENSION;
  const quality = options?.quality ?? IMAGE_UPLOAD_QUALITY;

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }

  if (file.size > maxBytes * 2) {
    // Hard reject obviously huge sources before decode.
    throw new Error(
      `Image is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max is 7MB after compression.`,
    );
  }

  const image = await loadImageElement(file);
  const longest = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = longest > maxDimension ? maxDimension / longest : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas is not available in this browser.');

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  let qualityAttempt = quality;
  let prepared = await canvasToJpegFile(canvas, file.name, qualityAttempt);

  // If still over limit, step quality down toward 0.7.
  while (prepared.size > maxBytes && qualityAttempt > 0.7) {
    qualityAttempt = Math.max(0.7, qualityAttempt - 0.05);
    prepared = await canvasToJpegFile(canvas, file.name, qualityAttempt);
  }

  if (prepared.size > maxBytes) {
    throw new Error(
      `Compressed image is still ${(prepared.size / (1024 * 1024)).toFixed(1)}MB. Max upload size is 7MB.`,
    );
  }

  return {
    file: prepared,
    width,
    height,
    originalBytes: file.size,
    preparedBytes: prepared.size,
  };
}
