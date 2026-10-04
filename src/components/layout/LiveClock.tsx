"use client";

import { useEffect, useState } from "react";

/** Heure locale en direct (signature du pied de page). Rien n'est affiché avant l'hydratation. */
export function LiveClock({ timeZone }: { timeZone: string }) {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("fr-BE", { timeZone, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const tick = () => setNow(format.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [timeZone]);

  return (
    <time className="t-tabular" suppressHydrationWarning>
      {now ?? "--:--:--"}
    </time>
  );
}
