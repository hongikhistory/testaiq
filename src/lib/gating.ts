// Session time-gating logic
// LIVE OPEN: session start - 10min ~ session end + 10min
// LIVE CLOSED: outside that window

export type GateStatus = "LIVE_OPEN" | "LIVE_CLOSED" | "UPCOMING";

export function getGateStatus(
  startsAt: Date,
  endsAt: Date,
  now: Date = new Date()
): { status: GateStatus; remainingMs: number } {
  const openTime = new Date(startsAt.getTime() - 10 * 60 * 1000); // 10 min before
  const closeTime = new Date(endsAt.getTime() + 10 * 60 * 1000); // 10 min after

  if (now >= openTime && now <= closeTime) {
    return {
      status: "LIVE_OPEN",
      remainingMs: closeTime.getTime() - now.getTime(),
    };
  }

  if (now < openTime) {
    return {
      status: "UPCOMING",
      remainingMs: openTime.getTime() - now.getTime(),
    };
  }

  return {
    status: "LIVE_CLOSED",
    remainingMs: 0,
  };
}
