export type ImageVariantFormat = {
  webp: string;
  jpeg: string;
  avif: string;
  width: number;
  height: number;
  bytes: number;
};

export type ImageVariants = {
  original: ImageVariantFormat;
  thumbnail: ImageVariantFormat;
  small: ImageVariantFormat;
  medium: ImageVariantFormat;
  large: ImageVariantFormat;
};

export type UserImage = {
  id: string;
  userId: string;
  type: string;
  originalFileName: string;
  folderPath: string;
  blurDataUrl: string | null;
  images: ImageVariants;
  createdAt: string;
  updatedAt: string;
};

export type UserImagesMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UserImagesResponse = {
  items: UserImage[];
  meta: UserImagesMeta;
};

export type UserImagesParams = {
  page?: number;
  limit?: number;
  type?: string;
};
