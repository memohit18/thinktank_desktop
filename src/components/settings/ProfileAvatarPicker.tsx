'use client';

import ImageLibraryPicker, {
  getImageUrlFromLibrary,
  getPreferredVariantUrl,
  type ImageLibraryPickerProps,
  type ImageSizeOption,
} from '@/components/images/ImageLibraryPicker';
import type { UserImage } from '@/lib/images/types';

export {
  getImageUrlFromLibrary as getAvatarUrlFromImage,
  getPreferredVariantUrl,
};
export type { ImageSizeOption };

type ProfileAvatarPickerProps = {
  open: boolean;
  selectedImageId?: string | null;
  selectedAvatarUrl?: string | null;
  onClose: () => void;
  onSelect: (image: UserImage, imageUrl: string, size: ImageSizeOption) => void;
};

/** Profile-specific wrapper around the shared image library picker. */
export default function ProfileAvatarPicker({
  open,
  selectedImageId,
  selectedAvatarUrl,
  onClose,
  onSelect,
}: ProfileAvatarPickerProps) {
  const props: ImageLibraryPickerProps = {
    open,
    selectedImageId,
    selectedImageUrl: selectedAvatarUrl,
    title: 'Choose profile photo',
    description: 'Pick from your uploaded images',
    sizeStepTitle: 'Choose image size',
    onClose,
    onSelect,
  };

  return <ImageLibraryPicker {...props} />;
}
