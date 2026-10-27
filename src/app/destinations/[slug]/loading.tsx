/** Instant shell shown while a guide's content streams in during navigation. */
export default function LoadingGuide() {
  return (
    <div className="flex min-h-[max(34rem,88svh)] items-end bg-page" aria-busy="true">
      <div className="page-container pb-20">
        <div className="h-3 w-56 animate-pulse rounded bg-fg/15 motion-reduce:animate-none" />
        <div className="mt-6 h-20 w-full max-w-xl animate-pulse rounded bg-fg/10 motion-reduce:animate-none" />
        <p className="sr-only" role="status">
          Loading destination guide…
        </p>
      </div>
    </div>
  );
}
