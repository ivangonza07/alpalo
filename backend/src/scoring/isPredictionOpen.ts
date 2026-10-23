export function isPredictionOpen(locksAt: Date, now: Date): boolean {
  if (locksAt > now) {
    return true;
  }

  return false;
}
