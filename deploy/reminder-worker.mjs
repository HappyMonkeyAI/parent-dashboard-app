const secret = process.env.CRON_SECRET;
if (!secret) {
  console.error("Reminder worker needs CRON_SECRET.");
  process.exit(1);
}

async function run() {
  try {
    const response = await fetch("http://web:3020/api/push/reminders", {
      method: "POST",
      headers: { authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(50_000),
    });
    if (!response.ok) console.error(`Reminder check failed with HTTP ${Number(response.status)}.`);
    else {
      const result = await response.json();
      if (result.failed > 0) console.error(`Reminder delivery failed on ${result.failed} subscription(s).`);
    }
  } catch {
    console.error("Reminder check could not reach the web service.");
  }
}

while (true) {
  await run();
  const untilNextMinute = 60_000 - (Date.now() % 60_000);
  await new Promise((resolve) => setTimeout(resolve, untilNextMinute));
}
