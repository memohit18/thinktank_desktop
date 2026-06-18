type UserAvatarProps = {
  name: string;
  email: string;
  avatar?: string | null;
  size?: number;
  className?: string;
};

export function getCartoonAvatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}`;
}

export default function UserAvatar({
  name,
  email,
  avatar,
  size = 40,
  className = '',
}: UserAvatarProps) {
  const src = avatar || getCartoonAvatarUrl(email || name);

  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`shrink-0 rounded-full bg-muted object-cover ring-2 ring-accent/30 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
