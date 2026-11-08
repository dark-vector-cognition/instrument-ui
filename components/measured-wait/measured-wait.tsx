"use client";

import * as React from "react";
import "./measured-wait.css";

/**
 * MeasuredWait: a waiting state that counts elapsed seconds against a stated limit,
 * on a tick ruler, instead of a spinner. The user sees how long it has taken and how
 * long it may take. Past the limit the bar turns to the error colour and the state
 * text says so; a left rule carries the state as a shape, never colour alone.
 *
 * Agent notes
 * - Use for conversions, uploads, builds, long API calls: anything with a known budget.
 * - Pass `limitSeconds` from the real limit you enforce (e.g. a 60 s request timeout).
 * - Set `done` when the result has arrived; the bar fills to 100% in the signal colour.
 * - `startedAt` lets the count survive a re-mount (store Date.now() when the job starts).
 *   A new `startedAt` restarts the count for a new job in the same instance.
 * - The first render shows 0 s on server and client alike; the browser clock is read
 *   in an effect, so hydration never sees a mismatch.
 * - Theme: override --graphite, --text, --muted, --signal, --error, --panel, --mono, --sans.
 */
export interface MeasuredWaitProps extends React.HTMLAttributes<HTMLDivElement> {
  /** What is being waited on, printed as a caps mono label. Default "Converting". */
  label?: string;
  /** The stated limit in seconds. Default 60. */
  limitSeconds?: number;
  /** Epoch ms when the job started. Default: when the component mounted. */
  startedAt?: number;
  /** True once the result has arrived. Default false. */
  done?: boolean;
  /** Text shown while waiting. Default "elapsed against the stated limit". */
  waitingText?: string;
  /** Text shown once done. Default "result arrived". */
  doneText?: string;
  /** Text shown past the limit. Default "over the stated limit, still waiting". */
  overText?: string;
}

export interface Reading {
  elapsed: number;
  over: boolean;
  pct: number;
}

/** The pure reading: elapsed whole seconds, whether the limit is passed, and the bar width. */
export function reading(start: number, now: number | null, limitSeconds: number, done: boolean): Reading {
  const elapsed = now === null ? 0 : Math.max(0, Math.floor((now - start) / 1000));
  // Compare real time, not the floored counter, so 30.5 s against a 30 s limit reads as over.
  const over = !done && now !== null && now - start > limitSeconds * 1000;
  const pct = done ? 100 : Math.min(100, (elapsed / Math.max(1, limitSeconds)) * 100);
  return { elapsed, over, pct };
}

export function MeasuredWait({
  label = "Converting",
  limitSeconds = 60,
  startedAt,
  done = false,
  waitingText = "elapsed against the stated limit",
  doneText = "result arrived",
  overText = "over the stated limit, still waiting",
  className,
  ...rest
}: MeasuredWaitProps) {
  // Fallback start for when no startedAt is given; a supplied startedAt always wins,
  // so a new job passed into the same instance restarts the count.
  const [mountedAt, setMountedAt] = React.useState<number | null>(null);
  // null until the browser clock is read in an effect: the server and the client
  // render the same first frame (0 s), so hydration has nothing to reject.
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    const t = Date.now();
    setMountedAt((m) => m ?? t);
    setNow(t);
    if (done) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [done, startedAt]);

  const start = startedAt ?? mountedAt ?? now ?? 0;
  const { elapsed, over, pct } = reading(start, now, limitSeconds, done);
  const state = done ? doneText : over ? overText : waitingText;
  const cls = ["ins-wait", done ? "done" : "", over ? "over" : "", className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={cls} {...rest}>
      <div className="ins-head">
        <span className="ins-label">{label}</span>
        <span className="ins-count" aria-label={`${elapsed} of ${limitSeconds} seconds`}>
          {elapsed}
          <small aria-hidden="true">/ {limitSeconds} s</small>
        </span>
      </div>
      <div className="ins-ruler" aria-hidden="true" />
      <div className="ins-bar" aria-hidden="true">
        <i style={{ width: `${pct}%` }} />
      </div>
      <p className="ins-foot">
        {/* Only the state text is live, so the ticking counter is never announced. */}
        <span className="ins-state" role="status" aria-live="polite">
          {state}
        </span>
        <span>limit {limitSeconds} s</span>
      </p>
    </div>
  );
}

export default MeasuredWait;
