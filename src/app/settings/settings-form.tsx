"use client";

import { useState, useTransition } from "react";
import { useTheme } from "next-themes";
import { updateSettings } from "./actions";

interface Prefs {
  email_digest: boolean;
  push_enabled: boolean;
  daily_lookahead: boolean;
  weekly_summary: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
}

interface SettingsFormProps {
  userId: string;
  role: string;
  lowStimMode: boolean;
  prefs: Prefs;
  timeZone: string;
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-base font-bold text-ink">{label}</p>
        <p className="text-sm text-ink-muted">{description}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-150 ${
          checked ? "bg-accent" : "bg-border-strong"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-150 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export function SettingsForm({ userId, role, lowStimMode, prefs, timeZone }: SettingsFormProps) {
  const { setTheme } = useTheme();
  const [currentPrefs, setCurrentPrefs] = useState(prefs);
  const [lowStim, setLowStim] = useState(lowStimMode);
  const [saved, setSaved] = useState(false);
  const [zone, setZone] = useState(timeZone);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  function updatePref(key: keyof Prefs, value: boolean | string) {
    setCurrentPrefs((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleLowStim(value: boolean) {
    setLowStim(value);
    setTheme(value ? "low-stim" : "light");
    setSaved(false);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateSettings(userId, currentPrefs, lowStim, zone);
      setError(result.error ?? null);
      setSaved(result.ok === true);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Notifications */}
      <section className="rounded-md border border-border bg-surface p-6">
        <h2 className="text-lg font-bold text-ink">Notifications</h2>
        <div className="mt-2 divide-y divide-border">
          <Toggle
            label="Email digest"
            description="Get a summary of changes by email."
            checked={currentPrefs.email_digest}
            onChange={(v) => updatePref("email_digest", v)}
          />
          <Toggle
            label="Push notifications"
            description="Send upcoming task and event reminders to browsers you have set up below."
            checked={currentPrefs.push_enabled}
            onChange={(v) => updatePref("push_enabled", v)}
          />
          <Toggle
            label="Daily look-ahead"
            description="Receive tomorrow's schedule by email each evening."
            checked={currentPrefs.daily_lookahead}
            onChange={(v) => updatePref("daily_lookahead", v)}
          />
          <Toggle
            label="Weekly summary"
            description="Get a summary of the week every Sunday."
            checked={currentPrefs.weekly_summary}
            onChange={(v) => updatePref("weekly_summary", v)}
          />
        </div>
      </section>

      {role === "parent" && (
        <section className="rounded-md border border-border bg-surface p-6">
          <h2 className="text-lg font-bold text-ink">Family time zone</h2>
          <p className="mt-1 text-sm text-ink-muted">Reminders and quiet hours use this time zone.</p>
          <label htmlFor="family-time-zone" className="mt-4 block text-sm font-bold text-ink">Time zone</label>
          <input
            id="family-time-zone"
            value={zone}
            onChange={(event) => { setZone(event.target.value); setSaved(false); }}
            list="time-zone-options"
            className="mt-1 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
          />
          <datalist id="time-zone-options">
            <option value="Europe/London" />
            <option value="Europe/Dublin" />
            <option value="America/New_York" />
            <option value="America/Los_Angeles" />
            <option value="UTC" />
          </datalist>
        </section>
      )}

      {/* Quiet hours */}
      <section className="rounded-md border border-border bg-surface p-6">
        <h2 className="text-lg font-bold text-ink">Quiet hours</h2>
        <p className="mt-1 text-sm text-ink-muted">
          No notifications during these hours.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div>
            <label htmlFor="quiet-start" className="mb-1 block text-sm font-bold text-ink">
              From
            </label>
            <input
              id="quiet-start"
              type="time"
              value={currentPrefs.quiet_hours_start}
              onChange={(e) => updatePref("quiet_hours_start", e.target.value)}
              className="rounded-md border border-border-strong bg-surface px-3 py-2 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
          </div>
          <span className="mt-5 text-sm text-ink-muted">to</span>
          <div>
            <label htmlFor="quiet-end" className="mb-1 block text-sm font-bold text-ink">
              To
            </label>
            <input
              id="quiet-end"
              type="time"
              value={currentPrefs.quiet_hours_end}
              onChange={(e) => updatePref("quiet_hours_end", e.target.value)}
              className="rounded-md border border-border-strong bg-surface px-3 py-2 text-base text-ink focus:border-focus-ring focus:outline-none focus:ring-2 focus:ring-focus-ring"
            />
          </div>
        </div>
      </section>

      {/* Display */}
      <section className="rounded-md border border-border bg-surface p-6">
        <h2 className="text-lg font-bold text-ink">Display</h2>
        <div className="mt-2 divide-y divide-border">
          <Toggle
            label="Low-stim mode"
            description="Reduce colour saturation for a calmer, near-monochrome display."
            checked={lowStim}
            onChange={handleLowStim}
          />
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          className="rounded-md bg-accent px-6 py-3 text-base font-bold text-ink-inverse transition-colors duration-150 hover:bg-accent-hover"
        >
          Save settings
        </button>
        {saved && (
          <span className="text-sm font-bold text-done">✓ Saved</span>
        )}
        {error && <span role="alert" className="text-sm font-bold text-ink">{error}</span>}
      </div>
    </div>
  );
}
