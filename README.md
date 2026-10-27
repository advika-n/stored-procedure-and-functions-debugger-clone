# Stored Procedure and Functions Debugger

A mini SQL interpreter that lets you step through stored procedures and
functions one statement at a time. Monorepo with a Python (FastAPI) backend and
a React (Vite) frontend.

```
.
├── backend/     FastAPI app: tokenizer → parser → interpreter → DebugStep trace
├── frontend/    React 19 + Vite app (Monaco editor, Mermaid flowcharts)
└── docs/        features.md (design rationale), schema.md (DebugStep contract)
```

## Live URLs

- **Frontend**: `https://<your-frontend>.vercel.app` _(placeholder)_
- **Backend API**: `https://<your-backend>.onrender.com` _(placeholder)_ —
  check it with `GET /health`, which returns `{"status":"ok"}`

## Features

- **SQL Console** (`/sql-console`) — one Monaco editor and one Run button. Run
  a `CREATE PROCEDURE`/`CREATE FUNCTION` (or a bare statement body) and you get
  the step-by-step debugger. Run plain SQL and it goes straight to the database
  (see [SQL Console](#sql-console) below). The old `/debugger` route redirects
  here.
- **Step-by-step debugger** — step forward and back through the trace, with
  live variables, a gutter caret on the current line, a Mermaid control-flow
  flowchart, and AI explanations for each step (`/explain`, plus `/ask` for
  follow-up questions).
- **Breakpoints + Continue/Restart** — click the gutter to set a breakpoint,
  then Continue runs until the next one.
- **Call Stack panel** — shows nested `CALL`s and function calls as they go
  deeper and return.
- **Compare** (`/compare`) — runs two procedures (or the same one with
  different inputs) side by side and diffs their traces.
- **SQL Anti-Pattern Advisor** — static analysis of the AST (ten checks)
  that comes back with every `/debug` run as `issues`.
- **AI Practice** (`/practice`) — pick a difficulty (Easy/Medium/Hard) and a
  question count (1–15), and Gemini generates GATE/placement-style DBMS MCQs.
  If Gemini isn't available, it uses a built-in question bank. You get two
  attempts per question, and the score screen breaks results into first try,
  retry, and incorrect.
- **Competitive Exam** (`/practice/competitive-exam`) — a fixed list of 15
  hand-written PL/SQL questions on transactions, cursors, exception handling
  and triggers. Each question expands to show its options, the correct answer
  and an explanation. It's a study list, not a scored quiz, and it never calls
  Gemini.
- **Learn** (`/learn`) — concept explanation, an embedded video, a **Deep
  Dive** panel with one write-up per supported construct, and references.
- **Download Report** — PDF / DOCX / TXT export of a run (`/debug/report`).
- **Help** (`/help`) — full user manual. **Day/Night mode** toggle in the
  header.
- Also available but not shown in the nav: Run History (`/history`, the 50
  most recent successful runs) and the Test-Case Runner (`/tests`).

## Prerequisites

- Python 3.10+
- Node.js 18+ and npm

## Local setup

### Backend

```bash
cd backend
python -m venv .venv

# Activate the virtual environment
.venv\Scripts\activate      # Windows
source .venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Optional: enables Gemini (see Environment variables below)
cp .env.example .env   # then fill in GEMINI_API_KEY

uvicorn app.main:app --reload --port 8000
```

The API is now running at http://127.0.0.1:8000:

```bash
curl http://127.0.0.1:8000/health
# {"status":"ok"}
```

Run the tests with:

```bash
cd backend
.venv/Scripts/python.exe -m pytest -q     # Windows
.venv/bin/python -m pytest -q             # macOS/Linux
```

On first use the backend creates `backend/data/user_data.db`, which is the
persistent SQLite database used by cursors, SQL passthrough statements and the
SQL Console. It's gitignored. Delete it to reset to the seeded `products`
table.

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env   # optional; the default already points at localhost:8000
npm run dev
```

The app runs at http://localhost:5173 (Vite may pick a different port if that
one is busy). There's no Vite dev proxy. Every backend call goes to
`VITE_API_URL` (see `frontend/src/api.js`), and the backend's CORS settings
allow the Vite dev origin directly. The SQL Console page shows a `backend: ok`
status chip once it can reach `/health`.

Before shipping frontend changes, run `npm run lint` and `npm run build`.

### Environment variables

| Variable | Where | Default | Purpose |
|---|---|---|---|
| `GEMINI_API_KEY` | backend (`backend/.env` or real env) | unset | Turns on Gemini for `/explain`, `/ask` and `/practice/generate`. If it's unset or invalid, the app falls back to template explanations and a built-in practice question bank. |
| `CORS_ORIGINS` | backend | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated list of browser origins allowed to call the API. Set it to your deployed frontend URL in production. |
| `VITE_API_URL` | frontend (`frontend/.env`, or the host's build env) | `http://localhost:8000` | Base URL of the backend. Vite reads it **at build time**, so changing it means rebuilding. |

## SQL Console

The SQL Console page decides what to do from what you type:

- **Procedure / function** (`CREATE PROCEDURE`, `CREATE FUNCTION`, or a bare
  procedural statement body): it runs through `POST /debug` and you get the
  full debugger UI (steps, variables, flowchart, advisor, breakpoints, call
  stack).
- **Plain SQL** (e.g. `SELECT * FROM products;`): it runs as-is through
  `POST /sql/execute` against the persistent database, one statement per run,
  and shows the result rows or the affected-row count. It doesn't go through
  this project's tokenizer or parser, so it isn't limited by the grammar
  below.

Both paths use the same database (`backend/data/user_data.db`). A table you
create in the console can be read by a procedure's cursor, and the other way
round.

## Supported grammar & scope

The interpreter runs a small procedural-SQL subset, not full MySQL/PL-SQL.
`backend/app/parser.py`'s module docstring has the formal grammar. Supported:

- **Two ways to write a procedure**, both first-class:
  1. A bare statement body with no wrapper at all. This is the original
     form, and it stays supported because every History entry saved before
     `CREATE PROCEDURE` support existed is stored this way.
  2. `CREATE PROCEDURE name(params) BEGIN ... END`. Params are
     `[IN | OUT | INOUT] name TYPE`, and the mode defaults to `IN`.
     `IN`/`INOUT` values come from the caller. An `OUT` param starts as
     `null` if the caller didn't supply one. Every variable in the trace has
     an `isOutput` flag, which is `true` only for a declared `OUT`/`INOUT`
     param.
- **Functions**: `CREATE FUNCTION name(params) RETURNS type BEGIN ... END`.
  Params are plain `name TYPE`, with no mode. `RETURN expr;` is an ordinary
  statement (it's valid inside `IF`/`WHILE` too) and stops the function
  immediately. Its DebugStep has a `returnValue` field. If a function body
  finishes without running a `RETURN`, that's an `InterpreterError`, not a
  silent `null`.
- **Variables**: `DECLARE name TYPE [DEFAULT expr];`, `SET name = expr;`
- **Control flow**:
  - `IF ... THEN ... [ELSE ...] END IF;`
  - `WHILE ... DO ... END WHILE;`
  - `CASE ... WHEN ... THEN ... [ELSE ...] END CASE;`, in both the simple
    form (`CASE expr WHEN val THEN ...`) and the searched form
    (`CASE WHEN cond THEN ...`)
  - `[label:] LOOP ... END LOOP [label];` with `LEAVE [label];`. `LOOP`
    has no condition, so `LEAVE` is the only way out. A label lets a
    `LEAVE` inside nested loops say which loop to exit.
- **Procedure and function calls**: `CALL name(arg1, ...);` calls another
  procedure, or the same one recursively. Inside an expression,
  `name(arg1, ...)` calls a `CREATE FUNCTION` and uses its `RETURN` value.
  You can submit several `CREATE PROCEDURE`/`CREATE FUNCTION` definitions
  together; the **last** one is the entry point.
- **Expressions**: `+ - * /`, unary `-`, the comparisons
  `> < = != >= <= <>` (`<>` is the same as `!=`), number and string
  literals, `NULL`, parentheses, function calls, and the
  `cur%FOUND`/`cur%NOTFOUND` cursor attributes.
- **Cursors** (MySQL-style): `DECLARE cur CURSOR FOR SELECT ...;`, then
  `OPEN`, `FETCH cur INTO a, b, ...;` and `CLOSE`. The embedded `SELECT`
  isn't parsed. It's kept as raw text and run as-is against the persistent
  database, so it can read the seeded `products(name, price)` table
  (Widget/10, Gadget/25, Gizmo/15) or any table you've created yourself.
  Every comparison operator above, including `>=`/`<=`/`<>`, works inside
  its `WHERE`. `cur%FOUND` means "the next FETCH will find a row" (so
  `WHILE cur%FOUND DO ... FETCH ... END WHILE` works). `cur%NOTFOUND` means
  "the last FETCH found nothing". `backend/app/interpreter.py`'s module
  docstring explains why they behave differently.
- **`SELECT ... INTO`**: `SELECT col1, col2 INTO var1, var2 FROM ... [WHERE
  ...];` is a single-row lookup into variables. If it finds no rows, it
  raises the same `NOT_FOUND` condition as a `FETCH` past the last row.
- **SQL passthrough statements**: `CREATE TABLE`, `INSERT`, `UPDATE`,
  `DELETE` and a bare `SELECT` (one without `INTO`) can appear anywhere a
  statement can. They run **as real SQL** against the persistent database,
  exactly as written. There's no simulation, and any SQLite syntax works,
  e.g. `CREATE TABLE IF NOT EXISTS`, `INSERT OR REPLACE`, or `AND`/`OR` in a
  `WHERE`. A cursor in the same run can read the rows they write. Changes
  **persist across runs**. **No variable interpolation**: a procedure
  variable named inside one of these statements is treated as a SQL column
  name, not replaced with the variable's value.
- **Exception handling**: `DECLARE CONTINUE HANDLER FOR condition
  statement;`, for exactly two conditions: **`NOT_FOUND`** (a `FETCH` or
  `SELECT ... INTO` that finds no row) and **`DIVISION_BY_ZERO`**. Only
  `CONTINUE` handlers are supported, and a handler's action is a single
  statement. `NOT_FOUND` is never fatal, handled or not. `DIVISION_BY_ZERO`
  stops the run unless a handler is registered for it.

**Not supported**:
- `ELSEIF`/`ELSIF` (nest another `IF` inside the `ELSE` instead)
- `AND`/`OR`/`NOT` in procedural expressions (`IF`/`WHILE`/`CASE`
  conditions, `SET`). Raw SQL passthrough statements, cursor queries and
  the SQL Console aren't affected, because SQLite runs those directly.
- string concatenation
- cursor parameters
- transactions
- `EXIT` handlers, `SQLEXCEPTION` and named conditions
- anything else not listed above

### Where to see each piece in action

The **Learn** page's **Deep Dive** panel has a write-up and a runnable
example for each supported construct. Sample procedures in the SQL Console's
library (`frontend/src/samples.js`):

- **ComputeTax**: a declared `OUT` param
- **ProductPriceTotal**: cursors
- **SafeAverageWithHandlers**: exception handling
- **ManageInventory**: `CREATE TABLE`/`INSERT`/`UPDATE`/`DELETE` as real SQL
- **InventoryValueReport**: a cursor reading back rows the same procedure
  just inserted
- **OperatorShowcase**: `>=`/`<=`/`<>`
- **LookupOnePlayer**: `SELECT ... INTO`, including the `NOT_FOUND` case
- **RecursiveFactorial**: recursion

All samples use the full `CREATE PROCEDURE(...) BEGIN...END` wrapper, to
match the syntax the Learn page teaches. `frontend/src/samples.js`'s header
comment explains why. The bare, wrapper-less form still works; it's only kept
for backward compatibility, so no sample uses it.
