"use client";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Keep it",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-overlay p-4">
      <div className="w-full max-w-sm max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg border border-border bg-surface p-6">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink-muted">{message}</p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 rounded-md bg-error px-6 py-3 text-base font-bold text-white transition-colors duration-150 hover:opacity-90"
          >
            {confirmLabel}
          </button>
          <button
            onClick={onCancel}
            className="flex-1 rounded-md border border-border-strong bg-surface px-6 py-3 text-base font-bold text-ink-muted transition-colors duration-150 hover:bg-surface-raised"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
