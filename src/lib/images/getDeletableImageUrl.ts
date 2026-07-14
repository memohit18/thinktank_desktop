import {
  getImageUrlFromLibrary,
  getPreferredVariantUrl,
} from '@/components/images/ImageLibraryPicker';
import type { UserImage } from '@/lib/images/types';

/** Prefer medium.webp (matches profile/food usage); fall back across sizes. */
export function getDeletableImageUrl(image: UserImage) {
  return (
    getImageUrlFromLibrary(image, 'medium') ||
    getImageUrlFromLibrary(image, 'small') ||
    getImageUrlFromLibrary(image, 'large') ||
    getPreferredVariantUrl(image.images.thumbnail) ||
    getPreferredVariantUrl(image.images.original)
  );
}
