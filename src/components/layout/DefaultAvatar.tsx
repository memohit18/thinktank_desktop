import Image from 'next/image';

export default function DefaultAvatar({
  name,
  size = 40,
}: {
  name?: string;
  size?: number;
}) {
  const label = name?.charAt(0).toUpperCase() || 'U';

  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/20 ring-2 ring-accent/30"
      style={{ width: size, height: size }}
    >
      <Image
        src="/avatar-default.svg"
        alt="User avatar"
        width={size}
        height={size}
        className="object-cover"
        priority
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
