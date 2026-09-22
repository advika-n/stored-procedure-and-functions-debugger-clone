# HANDOFF.md

**A snapshot of exactly where the project stands right now.** Fully rewritten at the end
of every session, not appended to — it's a status board, not a diary. Session-by-session
history lives in `git log` and `PROMPT_LOG.md`; stable project facts live in `CLAUDE.md`
(`docs/features.md`/`docs/schema.md` for design detail).

**Last updated**: 2026-09-22, end of a "Learn page panel order" fix session
(`PROMPT_LOG.md` #35) — swapped the Learn page's Concept Explanation and Video panels
(new order: Concept Explanation → Video → Deep Dive → References; was Video → Concept
Explanation → Deep Dive → References). Pure reorder, no content/styling changes, `git
diff` scoped to exactly the two swapped JSX blocks in `LearnPage.jsx`. No backend
involved.

Immediately prior: a "Competitive Exam — accordion list, not a quiz flow" fix session
(`PROMPT_LOG.md` #34) replaced that page's one-question-at-a-time quiz interaction with a
static expandable reference list (all 15 questions visible at once, each independently
expandable to reveal its options + explanation, no scoring). Third consecutive session on
that one feature (#32 shipped it as a "Hard Practice" quiz behind an in-page toggle; #33
gave it its own top-level nav entry and renamed it; #34 replaced the interaction model
entirely) — see `PROMPT_LOG.md` #32–34 and `docs/features.md`'s "Competitive Exam"
section for the full history. No backend changes in any of those three sessions either.

---

## Feature status

**Mandatory (5/5 done)**: Day/Night Mode · Developed By (real photo + name + register
number + Guided By) · Help tab (accurate for the merged page + AI Practice + Competitive
Exam) · Learn tab (real embedded video + real MySQL/Oracle reference citations) ·
Download (PDF/DOCX/Text export).

**Innovation (2/4 done, 2 dropped)**: SQL Anti-Pattern Advisor · Side-by-Side Run
Comparison. **Variable Timeline — dropped** (#29; it had shipped and was removed, not
"never started"). **Live Parameter Tuning — dropped**, never started; don't pick either
back up without a fresh scoping prompt.

**Tier 1 (4/4 done)**: Breakpoints + Continue/Restart · `CALL` support · Call Stack
panel.

**Extras beyond original scope (all done)**: Text-to-Speech · Test-Case Runner ·
Extended Static Analysis Warnings (advisor: 6→10 checks across all phases) · Function
calls in expressions · CASE statement · LOOP/LEAVE · Persistent user database · Merged
Debugger/SQL Console page + SQL passthrough statements · Comparison operators
`>=`/`<=`/`<>` + `SELECT ... INTO` (backend grammar, full detail: `PROMPT_LOG.md` #26 /
`docs/features.md`) · Compact Procedure Library + control-bar/Variables-table density pass
(`PROMPT_LOG.md` #27) · Hover-flyout sample rail + Live State/editor rebalance
(`PROMPT_LOG.md` #28) · Sample-row overflow fix + centered Learn video (`PROMPT_LOG.md`
#29) · Download Report: real diagram image, no false ERROR labels, no Intermediate
Results (`PROMPT_LOG.md` #30) · AI Practice — replaces the standalone Quiz page with a
general-purpose, competitive-exam-style MCQ practice tool (`PROMPT_LOG.md` #31) ·
**Competitive Exam** — a fixed, hand-written 15-question PL/SQL bank with its own
top-level nav tab, rendered as a static expandable study-reference list (never goes
through Gemini; `PROMPT_LOG.md` #32–34 — see above).

---

## This session's work — Learn page panel order

Full prompt + rationale: `PROMPT_LOG.md` #35.

1. **`LearnPage.jsx` reordered.** The Video panel block (caption + `<iframe>`) and the
   Concept Explanation panel block (the `<article className="learn-concept">`) swapped
   positions — new order Concept Explanation → Video → Deep Dive → References. No JSX
   content, class names, or text inside either block changed; their `{/* a. */}`/
   `{/* b. */}` ordering comments were relabeled to match the new order. Deep Dive and
   References were untouched, including their own comment labels.

**Verification**: `npm run lint`/`npm run build` both clean (same two pre-existing
warnings as every recent session). Live-verified via headless Chrome against a freshly
restarted frontend dev server: read all four `.learn-panel > .panel-tab` labels in DOM
order and confirmed they match `['CONCEPT EXPLANATION', 'VIDEO', 'DEEP DIVE',
'REFERENCES']` exactly; independently confirmed via each panel's bounding-box Y position
that the visual top-to-bottom order matches (not just DOM query order); confirmed each
panel's content is intact (Concept Explanation's `<h2>`, the video iframe's `src`, Deep
Dive's 5 topics, all 4 reference categories) — in both Day and Night mode, with full-page
screenshots taken and inspected in both. Spot-checked the Home page's top nav to confirm
nothing else in the app shifted. No backend involved.

### Previous session — Competitive Exam: accordion list, not a quiz flow

Full prompt + rationale: `PROMPT_LOG.md` #34, `docs/features.md`'s "Competitive Exam"
section (describes the current shape, with a 3-phase "Evolution" summary).

Replaced `CompetitiveExamPage.jsx`'s entire `setup`/`question`/`score` quiz state machine
and scoring/retry state with a single `expanded` (`Set` of open question ids). All 15
questions now render in one fixed list, each a `.competitive-exam-card` with a
toggle-button header, an always-visible code snippet (if any) as a *sibling* of the
collapsible region (not inside it — a plain `<details>` couldn't do this, since
everything after `<summary>` hides together, hence the manual `Set`-based toggle instead),
and a conditionally-rendered answer region reusing AI Practice's own
`.practice-review-option`/`-correct`/`.practice-review-mark`/`.practice-review-explanation`
classes. Options are plain `<li>`s — no click-to-check interaction. CSS: replaced the dead
`.competitive-exam-intro-panel` rule with `.competitive-exam-list`/`-card`/`-card-header`/
`-question`/`-chevron`/`-answer`. `HelpPage.jsx` updated to match. Verified live in both
themes (all 15 cards collapsed on load, expand/collapse/multi-open all confirmed).

---

## Testing infrastructure (see `CLAUDE.md` §6 for the mechanics)

- **Golden-trace regression harness** (`backend/app/tests/test_golden_traces.py` +
  `backend/app/tests/golden/*.json`, **21 fixtures**): runs every sample through the REAL
  `/debug` endpoint and diffs the resulting step trace against a checked-in baseline.
  **Run this before considering any future tokenizer/parser/interpreter-touching phase
  done.** Untouched this session (no backend/interpreter changes at all — frontend-only).
- **Property-based tests** (`backend/app/tests/test_property_based.py`, `hypothesis`):
  mutates the real samples via `demo_db.create_demo_connection()`; two invariants across
  1000 examples each.
- **Known-bugs tracker** (`backend/app/tests/test_known_bugs.py`): empty of unfixed bugs.
- **Hand-written grammar edge cases** (`backend/app/tests/test_grammar_edge_cases.py`).
- **AI Practice tests** (`backend/app/tests/test_practice.py` + `test_practice_endpoint.py`).
- Backend suite: **568 passing, 0 xfailed** — unchanged this session (no backend touched;
  Competitive Exam has no backend, so no backend tests were ever needed for it).

---

## Immediate next steps

1. SQL Anti-Pattern Advisor still doesn't analyze a `ProgramNode` AST at all (a
   `CALL`-based multi-procedure source always shows "no issues"); Download/Compare have
   never been exercised against one either. Pre-existing, unrelated to recent sessions.
2. The SQL Console (whether reached via the flat results view or the debugger UI's `sql`
   step panel) executes exactly one statement per Run click — running multiple
   `;`-separated statements at once fails cleanly rather than running any of them.
   Deliberate scope boundary, not a bug; worth a fresh scoping prompt if multi-statement
   support is ever wanted. Applies equally to `SELECT ... INTO` (one lookup per statement).
3. No server-side constraint enforcement (NOT NULL/PRIMARY KEY) or variable interpolation
   for SQL passthrough statements (`SqlStatement` or `SelectIntoStatement`) — a real,
   documented, deliberate capability loss versus an earlier phase's retired simulated
   feature. If a future phase wants either back, it needs its own scoping.
4. `SELECT ... INTO`'s zero-row NOT_FOUND path assigns no target variable at all (they
   keep whatever value they held before) — same convention an exhausted cursor FETCH
   already has, deliberate and tested, not a gap.
5. Both `.panel-samples`'s `max-height: 560px` (rail/flyout scroll cap, from #27) and the
   grid's `60px`/`2fr`/`0.8fr` column split (#28) are fixed values tuned to that session's
   own editor/content proportions — if a future phase changes what sits above the editor
   (taller Monaco, more controls) or the Live State panel's typical content width, re-check
   these rather than assuming they still balance correctly.
6. `getSampleInitials`'s PascalCase-capital-letter extraction can collide for two samples
   that happen to share their first two capitals (not currently the case among the 21
   samples, checked by eye, but worth a glance whenever a new sample is added) — a
   collision is a cosmetic ambiguity in the rail only, not a functional bug.
7. `.sample-card`/`.rail-item` carry `flex-shrink: 0` (#29) so a height-constrained
   `.sample-list` never squeezes a row below its own content height — if a future phase
   adds any other row-style list inside a height-capped flex column, check it for the same
   squeeze rather than assuming `min-height` alone is a safe floor.
8. The exported diagram image (`svgToPng.js`'s `foreignObjectsToSvgText`) is a close
   visual approximation of the on-screen Mermaid diagram, not a pixel-perfect one — line
   wrapping is approximated with a fixed line height rather than Mermaid's own
   font-metric-based wrapping logic, and a `CALL` node currently just labels itself
   "CallStatement". Good enough for a report figure; revisit only if a future session
   wants pixel parity specifically.
9. `svgToPng.js`'s `foreignObjectsToSvgText`/`shrinkTextNodesToFit` were built and
   verified against THIS app's specific Mermaid output shape — if a future phase changes
   Mermaid version, diagram type, or theme config, re-verify this conversion still finds
   the right text/colors rather than assuming it degrades gracefully.
10. **AI Practice has no persistence of past sessions/history** (flagged, not built —
    explicitly out of scope). Competitive Exam has even less state to persist now (no
    scoring at all post-#34) — its only remaining per-viewer state is which cards are
    expanded, intentionally not persisted (a fresh page load always starts fully
    collapsed).
11. `practice.py`'s `_FALLBACK_BANK` is static/hand-written (8 questions per difficulty) —
    a user who exhausts Gemini and generates many sets in a row at the same difficulty
    will start seeing repeats (samples with replacement once `numQuestions` exceeds the
    bank size, e.g. asking for 15 at once already does). Acceptable for a fallback path,
    not the primary path, but worth knowing if a future session wants to grow the bank.
    (Unrelated to Competitive Exam's own bank, which always renders all 15, no sampling.)
12. The **general CSS lesson from an earlier session's specificity bug is worth
    remembering for any future page**: a modifier class meant to override styling on a
    `<button disabled>` (or any element the app's existing global `button`/
    `button:disabled` rules already target) needs a compound selector (`.base-class
    .modifier-class`) to reliably outrank those global rules — a bare single-class
    modifier can silently lose. (Not triggered by this session's changes.)
13. **A nav item's `NavLink` needs `end: true` whenever a new route is added that's a
    literal path-prefix extension of an existing nav item's route** (e.g. `/practice` vs.
    `/practice/competitive-exam`) — fixed for this pair in #33; worth checking any time a
    new nested route is added under an existing top-level one.
14. **`<details>`/`<summary>` cannot show an always-visible sibling element while
    collapsed** — everything after `<summary>` inside a `<details>` hides together when
    closed, so a design that needs one child to stay visible while collapsed (like
    Competitive Exam's code snippet, visible even when the options/explanation are
    hidden) needs a manual open/closed state (a plain `<button>` header + conditional
    rendering) instead of native `<details>`, even though `<details>` is otherwise the
    simpler/more accessible default the codebase reaches for elsewhere (e.g. AI Practice's
    own review accordion, which doesn't have this requirement and still uses `<details>`
    correctly). Worth remembering before reaching for `<details>` on any future
    collapsible-with-a-visible-preview design.

---

## Live gotchas

- **`<details>`/`<summary>` hides ALL content after `<summary>` when closed — there's no
  way to keep one child visible while collapsed** — if a design needs that (a preview
  element that stays visible while the rest is collapsed), use a manual `Set`/boolean
  open-state + a `<button>` header + conditional rendering instead, not `<details>`. See
  Competitive Exam's code-snippet-stays-visible-while-collapsed requirement, `PROMPT_LOG.md`
  #34.
- **A CSS modifier class on a `<button disabled>` can silently lose to this app's global
  `button:disabled` rule** (App.css, top of file) — that rule's specificity `(0,1,1)`
  (type selector + pseudo-class) beats a single custom class `(0,1,0)`, regardless of
  source order. Confirmed live via `getComputedStyle`, not assumed from reading the CSS.
  Fix: make the modifier a compound selector with the element's base class
  (`.base-class.modifier-class`, specificity `(0,2,0)`), not a bare `.modifier-class`.
  See AI Practice's `.practice-option-correct`/`-wrong`/`-tried`.
- **A `NavLink` without `end: true` matches any path that starts with its `to` value** —
  so a nav item at `/practice` stays "active" on `/practice/competitive-exam` too unless
  `end: true` is set. Always add `end: true` to an existing nav item when a new route is
  introduced that literally extends its path as a prefix. See Layout.jsx's `/practice`
  entry, fixed in #33.
- **`str.format()` cannot be used on a prompt-instruction string that itself contains a
  literal JSON example** (real `{`/`}` characters) — Python tries to interpret every
  brace pair as a format field and raises `KeyError` on the first one it doesn't
  recognize. Use a unique marker (e.g. `__COUNT__`) + `str.replace()` instead whenever a
  template string needs one substitution but also contains literal braces elsewhere. See
  `practice.py`'s `_JSON_SHAPE_INSTRUCTIONS`/`_build_system_prompt`.
- **Vite's dev proxy (`vite.config.js`) matches config keys as path PREFIXES, not exact
  paths** — adding a new page route AND a same-named API path prefix (e.g. `/practice`
  page + `/practice/generate` endpoint) needs its own proxy entry with the
  `bypassNavigations` guard, same as the existing `/debug`/`/history`/`/sql` entries.
  Forgetting this 404s the API call from the dev server with no other symptom — easy to
  miss without live-verifying an actual fetch, not just a page load. (Not relevant to
  Competitive Exam — it has no backend endpoint at all, so no proxy entry was needed.)
- **Renaming/rewriting frontend files mid-session is safer verified against a freshly
  restarted Vite dev server, not just relying on HMR** — this and the previous session
  both stopped the running `vite.js` process and started a clean one after structural
  file changes, rather than trusting hot-module-reload to cleanly drop old module graph
  entries.
- **Both dev servers may not be running at the start of a new session** — always
  `curl`/`netstat` before assuming either is already running rather than trusting a
  previous session's HANDOFF note. Restarting is `uvicorn app.main:app --port 8000` (from
  `backend/`, `.venv/Scripts/python.exe -m uvicorn ...` on Windows) and `npm run dev`
  (from `frontend/`) — and after any `vite.config.js` edit, the Vite dev server needs an
  actual restart (not just a file save) to pick up new/changed proxy entries. This
  session only started the frontend dev server (Competitive Exam has no backend surface).
- **A `<foreignObject>`-containing SVG permanently taints a `<canvas>` once drawn via
  `<img>` + `drawImage`** — `canvas.toDataURL()`/`toBlob()` then throws `SecurityError:
  Tainted canvases may not be exported`, confirmed live, regardless of the image source
  being a same-origin blob URL. This is a hard browser restriction, not fixable by
  tweaking the SVG markup or trying `flowchart.htmlLabels: false` (confirmed NOT to
  actually suppress `<foreignObject>` in Mermaid v11 — a known upstream limitation, not a
  config mistake). If you need to rasterize a Mermaid diagram (or any `<foreignObject>`-
  bearing SVG) client-side again, don't re-attempt the `<img>`+canvas route on the raw
  SVG — see `svgToPng.js`'s `foreignObjectsToSvgText` for the actual working approach
  (strip `<foreignObject>` to plain `<text>` first).
- **html2canvas does not reliably rasterize this app's Mermaid SVG output** — it runs
  without error but silently produces a 100%-blank white canvas (confirmed by sampling
  pixel data directly, not just eyeballing a screenshot). Don't reach for it again for
  this specific diagram-export use case without re-verifying against pixel data first.
- **An SVG presentation attribute (`fill="..."`, `stroke="..."`, etc.) loses to ANY
  matching rule in an embedded/external `<style>` block, even a plain non-`!important`
  one** — confirmed live: `text.setAttribute('fill', '#1a1a1a')` was silently overridden
  by Mermaid's own `#flowchart-1{fill:#edeff4}` rule. An inline `style="fill:..."`
  (`element.style.fill = ...`) does win. Relevant to any future code that builds/modifies
  SVG programmatically in this app.
- **`SVGTextElement.getComputedTextLength()`/`getBBox()` return 0 (or throw) on a
  detached DOM node** — real layout is required, so measuring text on a `cloneNode(true)`
  copy before it's ever attached anywhere silently gives wrong answers rather than an
  error. `svgToPng.js`'s `shrinkTextNodesToFit` temporarily attaches its clone
  off-screen (`position:fixed; left:-99999px; visibility:hidden`) specifically for this.
- **reportlab (PDF) refuses to lay out any `Flowable` — including an `Image` — that's
  taller than a full page's own frame height, even a fresh, otherwise-empty page** (a
  "Flowable ... too large ... in frame" exception, which fails the ENTIRE PDF build, not
  just that one element). Scale any variably-sized image by both width AND height ratios
  (`min()` of both), never width alone — see `render_pdf`'s `content_height`.
- **Puppeteer `fullPage: true` screenshots can show a stale "ghost" of a just-collapsed
  CSS-opacity-transitioned element** even when `getComputedStyle` confirms the correct
  hidden state at the same moment. Workaround: a fresh `browser.newPage()` per `fullPage`
  capture, or `fullPage: false`. (This session used `fullPage: true` successfully for the
  final expanded-state screenshots since no opacity-transitioned element was involved.)
- **`backend/data/debug_history.db` needs manual cleanup after any live-verification
  session that actually clicks Run** (on a procedure/function trace) — it auto-rotates at
  50 rows but real `/debug` calls during manual testing still show up; delete test-run
  rows afterward (`DELETE /history/{id}` while the backend is up). Not needed this
  session (Competitive Exam never calls `/debug` or any backend endpoint).
- **`backend/data/user_data.db` is a similarly real, persistent artifact** — any live
  verification that runs CREATE TABLE/INSERT/UPDATE/DELETE against the real backend
  leaves real rows/tables behind if not cleaned up. Not needed this session.
- Puppeteer-core + a local Chrome install (`C:\Program Files\Google\Chrome\Application\
  chrome.exe`) is the live-verification approach in use. Scratchpad `node_modules` from
  prior sessions are NOT persistent across genuinely new sessions — but this session
  reused the still-live scratchpad install from the immediately preceding session within
  the same working directory, confirmed present before reusing rather than assuming.
- `found`/`notfound` are reserved KEYWORDs in this grammar (the `cur_name%FOUND`/
  `cur_name%NOTFOUND` cursor-attribute suffix) — a variable or OUT parameter literally
  named `found` fails to parse with a confusing "Expected IDENTIFIER (got KEYWORD)"
  error; use `was_found`/`matched`/similar instead.
- Mobile nav overflows horizontally at ~400px width — actually NOT reproduced across
  multiple recent sessions (`.top-nav` has `flex-wrap: wrap` already). Treat a HANDOFF
  note calling this a live pre-existing bug as stale unless re-verified with an actual
  `scrollWidth`/`clientWidth` measurement.
