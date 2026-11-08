import { test } from "node:test";
import assert from "node:assert/strict";
import * as React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ReticleFrame } from "../components/reticle-frame/reticle-frame";
import { MeasuredWait, reading } from "../components/measured-wait/measured-wait";
import { InlineChange, wordDiff } from "../components/inline-change/inline-change";

test("reticle frame renders four corners and the lock class", () => {
  const html = renderToStaticMarkup(<ReticleFrame lock label="FIG 1" />);
  assert.equal((html.match(/ins-rc/g) ?? []).length, 4);
  assert.match(html, /class="ins-reticle lock"/);
  assert.match(html, />FIG 1</);
});

test("measured wait reads elapsed against the limit and marks over and done", () => {
  assert.deepEqual(reading(0, 41000, 30, false), { elapsed: 41, over: true, pct: 100 });
  // 30.5 s against a 30 s limit is over, even though the counter still reads 30.
  assert.deepEqual(reading(0, 30500, 30, false), { elapsed: 30, over: true, pct: 100 });
  assert.deepEqual(reading(0, 23000, 60, false), { elapsed: 23, over: false, pct: (23 / 60) * 100 });
  assert.deepEqual(reading(0, 41000, 30, true), { elapsed: 41, over: false, pct: 100 });
  // Before the browser clock is read, server and client both show 0 s.
  assert.deepEqual(reading(0, null, 60, false), { elapsed: 0, over: false, pct: 0 });
  const first = renderToStaticMarkup(<MeasuredWait limitSeconds={30} startedAt={Date.now() - 41000} />);
  assert.match(first, />0<small/);
  assert.doesNotMatch(first, /ins-wait over/);
  const done = renderToStaticMarkup(<MeasuredWait done />);
  assert.match(done, /ins-wait done/);
  assert.match(done, /width:100%/);
  assert.match(done, /<span class="ins-state" role="status" aria-live="polite">result arrived<\/span>/);
});

test("inline change strips bold markers before the diff, so bold alone is not a change", () => {
  const html = renderToStaticMarkup(<InlineChange before="we expect **growth**" after="we expect growth" />);
  const sentence = html.split('<p class="ins-legend">')[0];
  assert.doesNotMatch(sentence, /<del>|<ins>/);
  assert.match(sentence, /we expect growth/);
});

test("inline change marks removed and added words and keeps both sentences rebuildable", () => {
  const ops = wordDiff("a b c", "a x c");
  assert.deepEqual(ops, [["=", "a "], ["-", "b "], ["+", "x "], ["=", "c"]]);
  assert.equal(ops.filter(([k]) => k !== "+").map(([, t]) => t).join(""), "a b c");
  assert.equal(ops.filter(([k]) => k !== "-").map(([, t]) => t).join(""), "a x c");
  const html = renderToStaticMarkup(<InlineChange before="a b c" after="a x c" />);
  assert.match(html, /<del>.*b.*<\/del>/);
  assert.match(html, /<ins>.*x.*<\/ins>/);
});
