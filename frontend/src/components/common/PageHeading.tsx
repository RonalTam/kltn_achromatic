import Link from 'next/link';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeadingProps = {
  title: string;
  breadcrumbs: BreadcrumbItem[];
  className?: string;
};

export function PageHeading({
  title,
  breadcrumbs,
  className = '',
}: PageHeadingProps) {
  return (
    <header className={className}>
      <nav
        aria-label="Đường dẫn trang"
        className="mb-5 flex flex-wrap items-center gap-2 font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-[#6B6B6B]"
      >
        {breadcrumbs.map((item, index) => {
          const isCurrent = index === breadcrumbs.length - 1;

          return (
            <span key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center transition-colors duration-200 hover:text-[#0F4C81] focus-visible:text-[#0F4C81] focus-visible:outline-none"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isCurrent ? 'font-semibold text-[#0F4C81]' : undefined}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>

      <div className="accent-bar-left">
        <h1 className="heading-lg section-heading-accent text-primary">
          {title}
        </h1>
      </div>
    </header>
  );
}
