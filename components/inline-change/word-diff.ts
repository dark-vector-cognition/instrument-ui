/**
 * Word-level changes between two sentences: the words that stayed, the words taken
 * out and the words put in. Tokens are a word with the space after it, so joining
 * every kept and inserted token gives back the new sentence exactly, and every kept
 * and deleted token the old one. Alignment is a longest common subsequence over
 * tokens. A pair longer than MAX_TOKENS is shown as one deletion and one insertion.
 */
export type WordOp = ["=" | "-" | "+", string];

// The LCS table below is a Uint16Array, so MAX_TOKENS must stay below 65535.
export const MAX_TOKENS = 600;

/** Split text into words, each with the whitespace that follows it. */
export function tokens(s: string): string[] {
  return s.match(/\S+\s*|\s+/g) ?? [];
}

/** Compare tokens without their trailing space, so a moved line end is not a change. */
const key = (t: string) => t.trimEnd();

export function wordDiff(before: string, after: string): WordOp[] {
  const a = tokens(before);
  const b = tokens(after);
  if (a.length > MAX_TOKENS || b.length > MAX_TOKENS) {
    return merge(([["-", before], ["+", after]] as WordOp[]).filter((o) => o[1]));
  }
  const lcs: Uint16Array[] = Array.from({ length: a.length + 1 }, () => new Uint16Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = key(a[i]) === key(b[j]) ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const ops: WordOp[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (key(a[i]) === key(b[j])) {
      const word = key(b[j]);
      const sa = a[i].slice(word.length);
      const sb = b[j].slice(word.length);
      if (sa === sb) ops.push(["=", b[j]]);
      else ops.push(["=", word], ...([["-", sa], ["+", sb]] as WordOp[]).filter((o) => o[1]));
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push(["-", a[i++]]);
    } else {
      ops.push(["+", b[j++]]);
    }
  }
  while (i < a.length) ops.push(["-", a[i++]]);
  while (j < b.length) ops.push(["+", b[j++]]);
  return merge(ops);
}

/** Adjacent operations of the same kind become one run. */
function merge(ops: WordOp[]): WordOp[] {
  const out: WordOp[] = [];
  for (const [k, t] of ops) {
    const last = out[out.length - 1];
    if (last && last[0] === k) last[1] += t;
    else out.push([k, t]);
  }
  return out;
}
