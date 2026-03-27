export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <span className="w-8 h-8 border-3 border-border border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-text-tertiary">Loading...</p>
      </div>
    </div>
  );
}
