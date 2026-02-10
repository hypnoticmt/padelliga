import Image from "next/image";

export function IconBadge({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <div className="w-10 h-10 rounded-lg bg-brand-orange flex items-center justify-center flex-shrink-0">
      <Image src={src} alt={alt} width={22} height={22} className="object-contain" />
    </div>
  );
}
