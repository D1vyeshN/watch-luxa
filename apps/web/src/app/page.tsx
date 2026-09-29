export default function Step1TestPage() {
  return (
    <div className="container-luxe py-20">
      <p className="label-luxe">Step 1 — Design System</p>
      <h1 className="heading-luxe mt-4 text-6xl">
        Time, Refined.
      </h1>
      <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-soft">
        Precision crafted for those who appreciate the extraordinary.
      </p>

      <div className="mt-10 flex flex-wrap gap-3">
        <span className="rounded-sm bg-forest-900 px-4 py-2 text-xs uppercase tracking-[0.18em] text-cream-100">
          Forest 900
        </span>
        <span className="rounded-sm bg-cream-600 px-4 py-2 text-xs uppercase tracking-[0.18em] text-forest-900">
          Gold
        </span>
        <span className="rounded-sm bg-cream-200 px-4 py-2 text-xs uppercase tracking-[0.18em] text-forest-900">
          Cream 200
        </span>
        <span className="rounded-sm border border-forest-900/20 px-4 py-2 text-xs uppercase tracking-[0.18em] text-forest-900">
          Outline
        </span>
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="aspect-square bg-forest-900" />
        <div className="aspect-square bg-forest-700" />
        <div className="aspect-square bg-forest-500" />
        <div className="aspect-square bg-forest-300" />
        <div className="aspect-square bg-cream-100" />
        <div className="aspect-square bg-cream-200" />
        <div className="aspect-square bg-cream-400" />
        <div className="aspect-square bg-cream-600" />
      </div>
    </div>
  );
}
