type PageHeaderProps = {
  eyebrow: string;
  title: string;
  intro: string;
};

export default function PageHeader({ eyebrow, title, intro }: PageHeaderProps) {
  return (
    <header className="border-b border-hairline">
      <div className="mx-auto grid w-full max-w-[1280px] gap-8 px-5 py-14 sm:px-8 sm:py-18 lg:grid-cols-12 lg:px-12 lg:py-24">
        <div className="lg:col-span-8">
          <div className="mb-5">
            <span className="page-eyebrow">{eyebrow}</span>
          </div>
          <h1 className="max-w-4xl font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.98] tracking-[-0.035em] text-ink">
            {title}
          </h1>
        </div>
        <div className="flex items-end lg:col-span-4">
          <p className="max-w-xl text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
            {intro}
          </p>
        </div>
      </div>
    </header>
  );
}
