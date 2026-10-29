export default function Home() {
  return (
    <main className="mx-auto max-w-[720px] space-y-4 p-4">
      <h1 className="text-title font-semibold">PlatePulse tokens</h1>
      <p className="text-ink-600">Secondary text on white.</p>
      <div className="rounded-control border border-ink-300 bg-surface-subtle p-4">
        <p className="text-display font-semibold">Rs 1,250</p>
        <p className="text-caption text-ink-600">Caption text</p>
      </div>
      <button className="h-[52px] w-full rounded-control bg-accent text-white">
        Primary action
      </button>
      <div className="flex gap-2 text-label font-medium">
        <span className="text-ok">Matched</span>
        <span className="text-warn">Pending</span>
        <span className="text-bad">Short</span>
      </div>
    </main>
  );
}
