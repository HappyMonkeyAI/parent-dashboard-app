"use client";

import { useEffect, useState } from "react";

function urlBase64ToArrayBuffer(value: string): ArrayBuffer {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

export function PushNotificationSetup() {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function checkSupport() {
      try {
        const available =
          "serviceWorker" in navigator &&
          "PushManager" in window &&
          "Notification" in window;
        if (!available) return;
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        let registered = false;
        if (subscription && Notification.permission === "granted") {
          const response = await fetch("/api/push/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription.toJSON()),
          });
          registered = response.ok;
        }
        if (!cancelled) {
          setSupported(true);
          setEnabled(registered);
          if (subscription && !registered) setMessage("Could not connect this device. Try again.");
        }
      } catch {
        if (!cancelled) setMessage("Could not check this device. Try again.");
      }
    }
    void checkSupport();
    return () => {
      cancelled = true;
    };
  }, []);

  async function enablePush() {
    setBusy(true);
    setMessage(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setMessage("Notifications are turned off in this browser.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const response = await fetch("/api/push/public-key");
      if (!response.ok) throw new Error("Push notifications are not configured yet.");
      const { publicKey } = (await response.json()) as { publicKey: string };
      const subscription = await registration.pushManager.getSubscription() ??
        await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToArrayBuffer(publicKey),
      });

      const saveResponse = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!saveResponse.ok) throw new Error("Could not save this device.");
      setEnabled(true);
      setMessage("Reminders are set up in this browser.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not enable notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function disablePush() {
    setBusy(true);
    setMessage(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const response = await fetch("/api/push/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(subscription.toJSON()),
        });
        if (!response.ok) throw new Error("Could not remove this device. Try again.");
        await subscription.unsubscribe();
      }
      setEnabled(false);
      setMessage("Reminders are turned off in this browser.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not turn off notifications.");
    } finally {
      setBusy(false);
    }
  }

  if (!supported) return null;

  return (
    <section className="rounded-md border border-border bg-surface p-6">
      <h2 className="text-lg font-bold text-ink">This browser</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Allow reminders for tasks and events assigned to this account. Set this up separately in each browser you use.
      </p>
      <p className="mt-2 text-sm text-ink-muted">
        On Android, also allow notifications for this browser in your phone settings.
      </p>
      <button
        type="button"
        onClick={() => void (enabled ? disablePush() : enablePush())}
        disabled={busy}
        className="mt-4 rounded-md border border-border-strong bg-surface px-4 py-2 text-base font-bold text-accent disabled:opacity-60"
      >
        {busy ? "Updating…" : enabled ? "Turn off reminders" : "Turn on reminders"}
      </button>
      {message && <p className="mt-3 text-sm text-ink-muted">{message}</p>}
    </section>
  );
}
