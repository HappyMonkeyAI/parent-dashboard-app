export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center px-6 text-center">
      <p className="text-2xl font-bold text-ink">You are offline</p>
      <p className="mt-2 text-base text-ink-muted">
        Check your internet connection and try again. Your schedule will be
        here when you are back.
      </p>
    </main>
  );
}
