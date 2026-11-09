# instrument-ui

Three dependency-free React components in the DARKVECTOR Instrument style, packaged for the Layro marketplace (layro.dev) so coding agents can search and install them over MCP.

Source of truth: this repo. Layro re-syncs from `registry.json` on every push to `main`.

| Slug | What it is |
| --- | --- |
| `reticle-frame` | Four corner brackets that frame the real subject; close in once on arrival |
| `measured-wait` | Elapsed seconds against a stated limit on a tick ruler, instead of a spinner |
| `inline-change` | One sentence with word-level edits in place; word diff built in |

Each component is one `.tsx` plus one `.css`, plain React and TypeScript, no Tailwind, no runtime dependencies. Theme by overriding `--text`, `--muted`, `--graphite`, `--signal`, `--error`, `--panel`, `--mono`, `--sans` on any ancestor. Dark mode follows `prefers-color-scheme`.

## Publishing

Layro reads `registry.json` from a public repo under an MIT, Apache-2.0, ISC or BSD-3-Clause licence. This folder carries its own `LICENSE` (MIT) and is self-contained, so it can be pushed to a public repo on its own:

1. Create the public repo `dark-vector-cognition/instrument-ui` (empty).
2. From the clone-tools root: `git subtree push --prefix packages/instrument-ui origin-instrument main` (after `git remote add origin-instrument git@github.com:dark-vector-cognition/instrument-ui.git`).
3. Install the Layro GitHub App on that repo at layro.dev/studio. Each push that changes a component sends a new version for review.

Alternative without a public repo: `npx layro-cli publish components/<slug>/<slug>.tsx components/<slug>/<slug>.css` from this folder, signed in to Layro. For `inline-change`, add `components/inline-change/word-diff.ts` as a third file argument.

Bump `meta.version` in `registry.json` with every code change; Layro only accepts a higher x.y.z.

## Rules carried over from DESIGN.md

Square corners, 1 px hairlines and 2 px rules, one signal colour per composition, no spinners, no gradients, no shadows, no em dashes. The components do not bundle fonts; the host supplies Space Grotesk and JetBrains Mono or the fallbacks apply.
