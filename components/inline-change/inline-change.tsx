import * as React from "react";
import { wordDiff, type WordOp } from "./word-diff";
import "./inline-change.css";

/**
 * InlineChange: one rewritten sentence with its edits shown in place. Words that were
 * in the earlier text are struck through; words that are new are underlined on a
 * shaded ground. The two marks differ in shape as well as colour, and each carries a
 * screen-reader label, so colour is never the only signal. The word diff is built in
 * (longest common subsequence over words); no dependencies.
 *
 * Agent notes
 * - Pass `before` and `after` as plain sentences. Markdown bold markers are stripped
 *   before the diff, so a word that only gained or lost bold is not a change.
 * - Pairs over 600 words are shown as one deletion and one insertion, not aligned.
 * - Or pass `ops` if you already have a diff: an array of ["=" | "-" | "+", text].
 * - Set `legend` with the two version names to print the reading key under the text.
 * - Good for: terms-of-service diffs, contract redlines, filing-to-filing changes,
 *   prompt or copy revisions, changelogs. Not for whole-document diffs; use it per sentence.
 * - Theme: override --text, --muted, --error, --panel, --mono, --sans.
 */
export interface InlineChangeProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The earlier sentence. */
  before?: string;
  /** The later sentence. */
  after?: string;
  /** A ready diff; when given, `before` and `after` are ignored. */
  ops?: WordOp[];
  /** Names for the key under the text, e.g. { older: "2024 filing", newer: "2025 filing" }. */
  legend?: { older: string; newer: string };
}

const DEFAULT_BEFORE = "We expect revenue growth to continue at a moderate pace in the coming year, subject to market conditions.";
const DEFAULT_AFTER = "We expect revenue growth to slow in the coming year, subject to market conditions and currency effects.";

export function InlineChange({
  before = DEFAULT_BEFORE,
  after = DEFAULT_AFTER,
  ops,
  legend = { older: "the earlier version", newer: "the new version" },
  className,
  ...rest
}: InlineChangeProps) {
  const list = (ops ?? wordDiff(plain(before), plain(after))).map(([k, t]) => [k, plain(t)] as WordOp).filter(([, t]) => t);
  const cls = ["ins-chg", className ?? ""].filter(Boolean).join(" ");
  return (
    <div className={cls} {...rest}>
      <p>
        {list.map(([kind, text], i) => {
          if (kind === "=") return <span key={i}>{text}</span>;
          if (!text.trim()) return kind === "+" ? <span key={i}>{text}</span> : null;
          const lead = text.match(/^\s*/)![0];
          const trail = text.match(/\s*$/)![0];
          const word = text.trim();
          return kind === "-" ? (
            <span key={i}>
              {lead}
              <del>
                <span className="ins-sr">[removed: </span>
                {word}
                <span className="ins-sr">]</span>
              </del>
              {trail}
            </span>
          ) : (
            <span key={i}>
              {lead}
              <ins>
                <span className="ins-sr">[added: </span>
                {word}
                <span className="ins-sr">]</span>
              </ins>
              {trail}
            </span>
          );
        })}
      </p>
      {legend ? (
        <p className="ins-legend">
          <ins>Underlined words on a shaded ground</ins> are new in {legend.newer}; <del>struck-through words</del> were in {legend.older}.
        </p>
      ) : null}
    </div>
  );
}

/** Bold markers from Markdown sources are markup, not words; readers do not see them. */
export function plain(text: string): string {
  return text.replace(/\*\*/g, "");
}

export { wordDiff, type WordOp } from "./word-diff";
export default InlineChange;
