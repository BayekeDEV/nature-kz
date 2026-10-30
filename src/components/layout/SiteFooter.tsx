import Link from "next/link";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/destinations", label: "All destinations" },
      { href: "/map", label: "Map overview" },
      { href: "/saved", label: "Saved destinations" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About this guide" },
      { href: "/about#methodology", label: "Sources & methodology" },
      { href: "/about#photo-credits", label: "Photo credits" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-[linear-gradient(to_bottom,var(--t-bg),color-mix(in_srgb,var(--t-bg)_72%,black)_9rem)] text-fg-soft">
      <div className="page-container grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:py-20">
        <div>
          <p className="font-display text-[1.6rem] font-semibold tracking-[0.12em] text-fg">NATURE KZ</p>
          <p className="mt-3 max-w-sm text-[0.98rem] leading-relaxed text-fg-muted">
            Discover Kazakhstan, beyond the familiar. An independent editorial guide to natural destinations across Kazakhstan — not an official
            tourism service and not a booking site.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="eyebrow text-fg-muted">{column.title}</h2>
            <ul className="mt-4 space-y-1">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center text-[0.98rem] text-fg-soft hover:text-fg hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-line">
        <p className="page-container py-6 text-sm text-fg-muted">
          Photographs are used under their individual licences; see the photo credits. Always check official park information
          before you travel.
        </p>
      </div>
    </footer>
  );
}
