/** Pure quota arithmetic, kept free of I/O so it is trivially testable. */

export type Period = { start: string; end: string };

/** Calendar month in UTC containing `now`. Quotas reset on the 1st. */
export function currentPeriod(now: Date = new Date()): Period {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start: start.toISOString(), end: end.toISOString() };
}

export type QuotaStatus = { quota: number | null; used: number; remaining: number | null; exceeded: boolean };

export function quotaStatus(quota: number | null | undefined, used: number): QuotaStatus {
  if (quota === null || quota === undefined) return { quota: null, used, remaining: null, exceeded: false };
  const remaining = Math.max(0, quota - used);
  return { quota, used, remaining, exceeded: used >= quota };
}

/** Subscription statuses that grant access. `paid` is our own value for one-off purchases. */
export const ENTITLED_STATUSES = new Set(["active", "trialing", "paid", "past_due"]);

export function isEntitled(status: string): boolean {
  return ENTITLED_STATUSES.has(status);
}
