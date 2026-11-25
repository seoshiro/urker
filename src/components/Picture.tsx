/** AVIF/WebP responsive still from public/media. */
export function Picture({ name, widths, alt, sizes = '100vw', className }: {
  name: string;
  widths: number[];
  alt: string;
  sizes?: string;
  className?: string;
}) {
  const set = (ext: string) => widths.map((w) => `/media/${name}-${w}.${ext} ${w}w`).join(', ');
  return (
    <picture>
      <source type="image/avif" srcSet={set('avif')} sizes={sizes} />
      <img className={className} src={`/media/${name}-${widths[0]}.webp`} srcSet={set('webp')} sizes={sizes} alt={alt} loading="lazy" decoding="async" />
    </picture>
  );
}
