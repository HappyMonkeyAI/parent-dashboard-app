export type TodayItem = {
  id: string;
  time: string;
  endTime: string | null;
  title: string;
  status: "pending" | "in_progress" | "done" | "skipped";
  kind: "task" | "event";
};

export type TodayResponse = { date: string; childName: string; items: TodayItem[] };

const origin = process.env.EXPO_PUBLIC_API_URL;

function baseUrl(): string {
  if (!origin || !/^https:\/\//.test(origin)) {
    throw new Error("Set EXPO_PUBLIC_API_URL to the HTTPS portal address.");
  }
  return origin.replace(/\/$/, "");
}

async function parseResponse(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (response.status === 404) {
      throw new Error("The app server needs the mobile update before you can log in.");
    }
    throw new Error(`The app server returned an unexpected response (HTTP ${response.status}). Try again later.`);
  }
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error("The app server returned an invalid response. Try again later.");
  }
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
      ? body.error : "Could not connect. Try again.";
    throw new Error(message);
  }
  return body;
}

export async function signIn(email: string, password: string): Promise<string> {
  const response = await fetch(`${baseUrl()}/api/mobile/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  const body = await parseResponse(response);
  if (!body || typeof body !== "object" || !("token" in body) || typeof body.token !== "string") {
    throw new Error("The server returned an invalid sign-in response.");
  }
  return body.token;
}

export async function loadToday(token: string): Promise<TodayResponse> {
  const response = await fetch(`${baseUrl()}/api/mobile/today`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await parseResponse(response);
  if (!body || typeof body !== "object" || !("items" in body) || !Array.isArray(body.items)
      || !("date" in body) || typeof body.date !== "string"
      || !("childName" in body) || typeof body.childName !== "string") {
    throw new Error("The server returned an invalid schedule.");
  }
  return body as TodayResponse;
}

export async function signOut(token: string): Promise<void> {
  await fetch(`${baseUrl()}/api/mobile/session`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
}
