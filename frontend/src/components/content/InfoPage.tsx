import Link from "next/link";
import Image from "next/image";

type InfoSection = {
  title: string;
  body?: string[];
  items?: string[];
};

type InfoPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  sections: InfoSection[];
  heroImage?: string;
  cta?: {
    label: string;
    href: string;
  };
};

export function InfoPage({
  eyebrow,
  title,
  description,
  sections,
  heroImage,
  cta,
}: InfoPageProps) {
  return (
    <div className="bg-background pb-20 pt-[72px]">
      {/* ── Hero Header with background image ── */}
      <header className="relative overflow-hidden">
        {/* Background Image */}
        {heroImage && (
          <>
            <Image
              src={heroImage}
              alt=""
              fill
              preload
              quality={90}
              className="page-hero-photo object-cover object-[center_8%]"
              sizes="(max-width: 767px) 125vw, 100vw"
            />
            <div className="page-hero-photo-overlay absolute inset-0" />
          </>
        )}
        {/* Fallback: use page-hero gradient if no image */}
        {!heroImage && <div className="absolute inset-0 page-hero" />}
        <div className="page-hero-grid absolute inset-0 deco-grid-pattern" />

        <div className="relative z-10 px-5 md:px-20 py-16 md:py-20">
          <div className="container-max">
            <div className="max-w-3xl accent-bar-left">
              <p className="label-xs mb-4 text-[#0F4C81]">{eyebrow}</p>
              <h1 className="heading-lg text-primary section-heading-accent">{title}</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                {description}
              </p>
              {cta && (
                <Link href={cta.href} className="btn-outline-dark mt-8">
                  {cta.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Content Sections ── */}
      <div className="px-5 md:px-20">
        <div className="container-max">
          <div className="border-t border-border">
            {sections.map((section) => (
              <section
                key={section.title}
                className="grid gap-5 border-b border-border py-8 md:grid-cols-[280px_1fr] md:gap-10"
              >
                  <h2 className="font-heading text-2xl font-light text-primary section-heading-accent">
                    {section.title}
                  </h2>
                  <div className="max-w-3xl space-y-4 text-sm leading-7 text-muted-foreground">
                    {section.body?.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                    {section.items && (
                      <ul className="grid gap-3 sm:grid-cols-2">
                        {section.items.map((item) => (
                          <li
                            key={item}
                            className="border border-border px-4 py-3 hover:border-[#0F4C81]/30 transition-colors"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
