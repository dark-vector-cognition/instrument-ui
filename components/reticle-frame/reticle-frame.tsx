import * as React from "react";
import "./reticle-frame.css";

/**
 * ReticleFrame: four corner brackets that frame the real subject of a page, the way a
 * measuring instrument frames what it reads. Set `lock` when the content has just
 * arrived and the brackets close in once; they then hold still. Respects
 * prefers-reduced-motion. No dependencies, square corners, one accent colour at most.
 *
 * Agent notes
 * - Wrap one subject per composition: a result, a document, a chart. Not a card grid.
 * - `lock` is for arrival only. Flip it to true once; do not toggle it on hover.
 * - `label` is a short mono caption printed on the top edge (e.g. "FIG 1", "OUTPUT").
 * - Theme: override --graphite, --text, --muted, --mono on any ancestor.
 */
export interface ReticleFrameProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Closes the brackets in once when true. Default false. */
  lock?: boolean;
  /** Short caption on the top edge, set in caps mono. */
  label?: string;
  /** Render as another element, e.g. "figure" or "section". Default "div". */
  as?: "div" | "figure" | "section" | "article";
  children?: React.ReactNode;
}

export function ReticleFrame({
  lock = false,
  label,
  as: Tag = "div",
  className,
  children = <DefaultSubject />,
  ...rest
}: ReticleFrameProps) {
  const cls = ["ins-reticle", lock ? "lock" : "", className ?? ""].filter(Boolean).join(" ");
  return (
    <Tag className={cls} {...rest}>
      <i className="ins-rc tl" aria-hidden="true" />
      <i className="ins-rc tr" aria-hidden="true" />
      <i className="ins-rc bl" aria-hidden="true" />
      <i className="ins-rc br" aria-hidden="true" />
      {label ? <p className="ins-label">{label}</p> : null}
      {children}
    </Tag>
  );
}

/** Shown when the frame is rendered with no children, so a preview has a subject. */
function DefaultSubject() {
  return (
    <div style={{ font: "400 18px/1.6 var(--sans, 'Space Grotesk', system-ui, sans-serif)", maxWidth: 520 }}>
      <p style={{ margin: "6px 0 0" }}>
        The frame marks what the page is about. Put the result, the document or the chart inside it, and nothing else.
      </p>
    </div>
  );
}

export default ReticleFrame;
