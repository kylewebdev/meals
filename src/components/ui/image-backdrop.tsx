import Image from 'next/image';

interface ImageBackdropProps {
  src: string;
  sizes: string;
  priority?: boolean;
  variant: 'hero' | 'card';
}

const gradients = {
  hero: {
    radial:
      'radial-gradient(ellipse at center top, transparent 0%, color-mix(in srgb, var(--background) 20%, transparent) 35%, color-mix(in srgb, var(--background) 50%, transparent) 55%, var(--background) 85%)',
    linear: 'linear-gradient(to bottom, transparent 40%, var(--background) 100%)',
  },
  card: {
    radial: 'radial-gradient(ellipse at center, transparent 0%, var(--background) 90%)',
    linear:
      'linear-gradient(to bottom, color-mix(in srgb, var(--background) 40%, transparent) 0%, var(--background) 100%)',
  },
};

export function ImageBackdrop({ src, sizes, priority, variant }: ImageBackdropProps) {
  const { radial, linear } = gradients[variant];
  return (
    <>
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        aria-hidden="true"
      />
      <div className="absolute inset-0" style={{ background: radial }} />
      <div className="absolute inset-0" style={{ background: linear }} />
    </>
  );
}
