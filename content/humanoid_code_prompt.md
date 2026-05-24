
## RULE 1 — No Dead Code. Ever.

Dead code is the single biggest AI signature.

- **Never leave unused imports.** If a component, hook, type, or library is imported but not used in that file, delete it. No exceptions.
- **Never declare a variable that is never read.** `const foo = ...` that is never referenced below must be removed.
- **Never leave unreachable code blocks** — logic after a `return` statement, disabled branches like `if (false) { ... }`, or empty `catch` blocks that do nothing.
- **Never write "safety net" state** — do not declare `const [loading, setLoading] = useState(false)` unless that loading state is actually rendered or read somewhere in the JSX.
- **Real-world example of what NOT to do:**
  ```ts
  // ❌ AI-generated dead code
  const [error, setError] = useState(null);   // declared but never shown in UI
  const [data, setData] = useState([]);        // overwritten immediately, useState is pointless
  const BASE_URL = "/api";                     // imported from config but declared again here
  ```

---

## RULE 2 — No Repetitive / Copy-Paste Logic Blocks

Repeated logic patterns are an instant AI tell. A human refactors.

- If the same `if (x) data.filter(...)` block appears in more than one place, extract it into a shared helper function or utility.
- If two API route files (e.g., `/api/inventory/route.ts` and `/api/inventory/export/route.ts`) perform the same filtering logic, they must share a single `applyFilters(data, params)` utility — not duplicate the filter chain.
- If the same style object (`{ fontSize: 13, color: "#45464c" }`) is repeated on 4+ elements, define it as a named constant at the top of the file.
- **Real-world example of what NOT to do:**
  ```ts
  // ❌ In route A
  if (search) data = data.filter(i => i.name.includes(search) || i.sku.includes(search));
  
  // ❌ Same block copy-pasted in route B — a human would have extracted this
  if (search) data = data.filter(i => i.name.includes(search) || i.sku.includes(search));
  ```

---

## RULE 3 — Comments: Only The "Why", Never The "What"

- **Never** write a comment that describes what the next line does:
  ```ts
  // ❌ Wrong — describes the "what"
  // Set the loading state to true
  setLoading(true);
  
  // ✅ Right — explains the "why" (architectural reason)
  // Run after paint so DOM dimensions are accurate before measuring pill offsets
  useLayoutEffect(() => { ... }, [view]);
  ```
- **Never** use decorative comment headers with dashes or equals signs:
  ```ts
  // ❌ Wrong — robotic visual separator
  // ======== STATE MANAGEMENT ========
  // ----------- HOOKS ----------------
  // ██ FILTER SECTION ██
  
  // ✅ Right — no section dividers at all. Let the code structure speak.
  ```
- Comments are allowed for:
  - Performance hacks (e.g., why `useLayoutEffect` instead of `useEffect`)
  - Non-obvious browser behaviour (e.g., why a `setTimeout(..., 0)` is needed)
  - Intentional workarounds for third-party library limitations

---

## RULE 4 — Consistent Export Declarations Across All Files

One of the clearest AI signatures is mixed export styles within the same codebase.

- **Pick one style and use it everywhere.** For Next.js App Router API routes, use direct function exports:
  ```ts
  // ✅ Consistent — direct export
  export async function GET(req: NextRequest) { ... }
  export async function POST(req: NextRequest) { ... }
  ```
- **Never mix** direct exports with const arrow function exports in the same project:
  ```ts
  // ❌ Mixed — AI wrote these files separately without checking consistency
  // route-a.ts
  export const GET = async (req: NextRequest) => { ... }
  
  // route-b.ts
  export async function POST(req: NextRequest) { ... }
  ```
- Same rule applies to React components — pick `export default function Foo()` or `const Foo = () => {}; export default Foo;` and stick to it across all component files.

---

## RULE 5 — No Placeholder Logic or TODO Comments

A human developer never submits code with unfinished stubs.

- **Never write:**
  ```ts
  // ❌ Instant AI tell
  // TODO: connect to real database
  // TODO: replace with actual API call
  const data = []; // placeholder
  return null; // implement later
  ```
- If mock data is needed, write it as a **realistic, complete seeded dataset** — not an empty array or a single hardcoded object.
- If an error handler is needed, write a real one. If a loading state is needed, show it in the UI.

---

## RULE 6 — No Over-Engineered File Structure

AI tends to create one file per tiny utility.

- A 5-line helper function does NOT need its own file. Co-locate it with the component or module that uses it.
- Do not create `utils/helpers/formatters/constants/index.ts` barrel files unless the project is large enough to genuinely need them (50+ components).
- Standard Next.js App Router folder structure:
  ```
  src/
    app/           → pages + API routes
    features/      → domain-specific components + utilities
    hooks/         → shared custom hooks (used by 2+ components)
    store/         → global client state (Zustand, Redux, etc.)
    lib/           → server-side shared modules (data, db, config)
    types/         → shared TypeScript types only
  ```
- Do not create `src/components/ui/Button/index.tsx` for a button used in only one place.

---

## RULE 7 — Naming: Domain-Specific and Concise

- Variables should reflect the domain, not the data structure:
  ```ts
  // ❌ Generic / structural names
  const itemDataArray = [];
  const fetchedResponseObject = {};
  const inventoryItemsList = [];
  
  // ✅ Domain-specific, concise names
  const rows = [];
  const res = {};
  const items = [];
  ```
- Event handlers use the `handle` prefix — `handleSort`, `handleExport`, `handleRestock` — not `onButtonClickEvent` or `doExportAction`.
- Boolean flags use `is` / `has` prefix: `isLoading`, `isFetching`, `hasError` — not `loadingState`, `fetchingStatus`.

---

## RULE 8 — Realistic Code Density

AI writes everything at maximum verbosity. A senior dev balances density with readability.

- Single-line returns for tiny components are fine:
  ```tsx
  // ✅ Clean and readable — no need to expand this
  function StockBadge({ stock }: { stock: number }) {
    if (stock === 0) return <span style={outStyle}>Out of Stock</span>;
    if (stock <= 20) return <span style={lowStyle}>Low Stock</span>;
    return <span style={inStyle}>In Stock</span>;
  }
  ```
- Inline try/finally for short async handlers is fine:
  ```ts
  // ✅ Natural — not everything needs a 20-line try/catch block
  const handleExport = async () => {
    setExporting(true);
    try { await exportCSV(filters); }
    finally { setExporting(false); }
  };
  ```
- Do not split every JSX expression onto its own line when it makes the file 3x longer without adding clarity.

---

## RULE 9 — Search Logic Must Be Symmetric Across All Endpoints

A classic AI mistake: search in the grid but forget to search in the export endpoint.

- If `/api/inventory` searches `name`, `sku`, AND `supplier` — then `/api/inventory/export` must search the exact same three fields.
- If the grid filters by `category`, `maxStock`, `minPrice`, `maxPrice` — the export endpoint must apply all four of those same filters.
- Data displayed to the user must match data exported to CSV — no partial logic.

---

## RULE 10 — `Prompts.md` Engineering Log (Optional But Recommended)

If AI assistance was used for specific architectural decisions, document it professionally:

```markdown
# Prompts.md — AI Interaction Log
> Per delivery protocol: AI-assisted architectural decisions are documented here.
> This is engineering transparency, not a sign of weakness.

## Session: YYYY-MM-DD

**Problem:** [what you were unsure about]  
**AI response summary:** [what it suggested]  
**Decision made:** [what you actually implemented and why]
```

This turns AI use into a professional engineering artifact — the way senior developers actually work.

---

## RULE 11 — Strict Linting and TypeScript Compliance

A human developer ensures their code builds perfectly and passes all automated checks before checking in.

- **No Lint/Type Warnings or Errors:** All generated code must pass ESLint and TypeScript checks cleanly. There must be 0 compilation warnings and 0 linting errors.
- **Never bypass checks blindly:** Do not use `/* eslint-disable */` or `// @ts-ignore` comments to cover up type mismatches or warnings. If a library has missing/incorrect typings (e.g., Recharts interface limits), cast it cleanly with an explicit explanation comment of why it is safe (e.g., casting as custom interface, wrapping inside type-safeguards).
- **Clean Up Debug Statements:** Never leave active `console.log` statements in production-level code. Log statements must only be used in specific exception handling blocks using `console.error` for legitimate error notifications.
- **Real-world example of what NOT to do:**
  ```tsx
  // ❌ AI bypass signatures - very common
  // @ts-ignore
  const activeIndex = props.activeIndex; // bypassing type checker blindly
  
  console.log("here", activeIndex); // leaving debug statement in production
  ```

---

*Apply all 11 rules to every file in the project. If any rule is violated, refactor before moving on.*
