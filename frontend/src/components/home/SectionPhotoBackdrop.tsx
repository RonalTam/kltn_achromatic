import Image from "next/image";

interface SectionPhotoBackdropProps {
  src: string;
  position?: string;
  tone?: "light" | "dark";
}

/**
 * Decorative editorial photography that softens the white space at the start
 * of a homepage section. The gradients keep headings and controls readable.
 */
export function SectionPhotoBackdrop({
  src,
  position = "center 35%",
  tone = "light",
}: SectionPhotoBackdropProps) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 top-0 z-0 h-72 overflow-hidden md:h-80 lg:h-[26rem]"
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        fill
        sizes="(max-width: 767px) 140vw, 100vw"
        quality={90}
        className={
          tone === "dark"
            ? "object-cover opacity-100 saturate-[0.92] contrast-[1.06]"
            : "object-cover opacity-[0.72] saturate-[0.94] contrast-[1.04]"
        }
        style={{ objectPosition: position }}
      />
      {tone === "dark" ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-white" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/10 to-white/35" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-white/20 to-white" />
        </>
      )}
    </div>
  );
}
