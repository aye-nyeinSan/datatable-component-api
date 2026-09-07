# Data Table — headless-first, fully typed, built from scratch

A reusable `DataTable<T>` with no table library behind it, rendering a fitness studio dashboard.
Sorting, pagination, expansion, pinning, skeletons and error states are all first-class, and the
same component runs client-side or server-side without knowing which it is in.

```bash
npm install
npm run dev
```

| Route | What it shows |
|---|---|
| `/` | Class timetable: pinned column, expandable attendee rows (inline **and** lazy) |
| `/members` | A different row shape, no children, defaults to server mode |

Every screen has a toolbar to switch data mode, add latency, force a failure, and force the
loading / empty / error states. `npm run lint` · `npm run typecheck` · `npm run build`.

---

## Architecture

Two hook layers, deliberately named so the call site reads correctly.

| Hook | Layer | Called by | Job |
|---|---|---|---|
| `useTable<T>` | inside the component | `DataTable` | Composes sorting, pagination and expansion, derives the rows to render. Never fetches. |
| `useDataTable<T>` | inside the page | dashboards | Feeds the table: fetches in client or server mode, returns spread-ready props. Never renders. |

`useTable` is built from three single-purpose hooks (`useSorting`, `usePagination`,
`useRowExpansion`), each of which is built on one primitive, `useControllableState`. That is where
the controlled/uncontrolled contract lives, so it behaves identically everywhere.

```
src/
├── components/
│   ├── data-table/     the reusable component (publishable as-is)
│   ├── ui/             small primitives: Badge, Button, Skeleton, SegmentedControl
│   └── demo/           reviewer controls; NOT part of the table API
├── hooks/              every reusable hook
├── features/           timetable/ and members/ — columns, panels, dashboards
├── services/           the only place that knows about URLs
├── mocks/              deterministic seed data + latency/failure simulation
├── lib/                cn, comparators, formatters, query helpers
└── app/                routes and API handlers only
```

---

## Component API

### Column definitions

```ts
interface ColumnDef<T> {
  key: Extract<keyof T, string> | (string & {});  // autocompletes real fields, allows computed ones
  header: ReactNode;
  cell?: (row: T) => ReactNode;
  sortAccessor?: (row: T) => SortValue;      // for computed columns
  sortComparator?: (a: T, b: T) => number;   // full escape hatch
  sortable?: boolean;
  width?: number;
  minWidth?: number;
  pinned?: 'left';
  align?: 'left' | 'center' | 'right';
}
```

Cells receive the **whole row**, not a pre-extracted value. That is what keeps the surface at a
single generic: no `DataTable<T, TValue>`, and field access stays fully typed.

### Uncontrolled — the zero-config path

```tsx
<DataTable
  data={classes}
  columns={columns}
  defaultSortState={{ columnKey: 'time', direction: 'asc' }}
  defaultPagination={{ pageIndex: 0, pageSize: 20 }}
/>
```

### Controlled + server-side

```tsx
<DataTable
  data={page.rows}
  columns={columns}
  sortState={sortState}
  onSortChange={setSortState}
  pagination={pagination}
  onPaginationChange={setPagination}
  totalCount={page.totalCount}
  manualSorting
  manualPagination
/>
```

`manualSorting` / `manualPagination` are **orthogonal** to being controlled. You can control the
state (to keep it in the URL, say) while the table still sorts and slices locally. The `manual*`
flags only decide who does the work.

### Expansion — both modes, still one generic

```tsx
expansion={{
  renderExpanded: (session) => <AttendeePanel session={session} />,
  canExpand: (session) => session.status !== 'Cancelled',
}}
```

- **Inline children:** `renderExpanded` reads `session.attendees` straight off the typed row.
- **On-demand children:** the panel renders `<LazyRowContent load={…} fallback={<Skeleton/>}>`,
  which owns its loading skeleton, error message, retry button, abort-on-collapse and result cache.

Child fetching deliberately lives *beside* the table, not inside it. Putting it on `DataTable`
would force a second generic (`DataTable<TRow, TChild>`) or an `unknown` payload. This way the
component stays headless and the same mechanism works for any expanded content.

---

## Feature notes

**Sorting.** Header click cycles ascending → descending → unsorted. `aria-sort` mirrors the state
on the `<th>`; the control itself is a real `<button>`. Empty values sort last in *both*
directions so flipping the sort never fills page one with blanks.

**Pagination.** Page size select, prev/next, and a windowed page list with ellipses. Collapses to
`2 / 7` on narrow screens. `aria-current="page"` marks the active page.

**Pinned column.** Sticky cells with offsets stacked from the widths of preceding pinned columns,
so multiple left-pinned columns work. A CSS-only shadow appears when the container scrolls: the
hook writes `data-scrolled-x` onto the DOM node rather than into React state, so scrolling never
re-renders a single row.

**Skeletons.** Real `<tr>`/`<td>` skeletons that keep the column layout, including the pinned
column, with varied bar widths so it does not read as a grid of identical blocks.

**Expand/collapse.** A CSS grid `0fr → 1fr` transition, which animates to `height: auto` without
measuring anything. Content unmounts after the collapse transition ends and the animation is
skipped under `prefers-reduced-motion`. The panel cell spans the whole table, which is far wider
than the screen once the table scrolls, so its content is stuck to the visible area at the
container's own width. Without that, anything right-aligned inside a panel (a Retry button, say)
ends up off-screen.

**Height cap.** `maxHeight` bounds the scroll container so a long body scrolls vertically under
the sticky header instead of growing without limit. The attendee panel uses it once a class has
more than eight bookings.

**Accessibility.** Semantic `<table>` with a visually hidden `<caption>` and `<th scope="col">`,
`aria-sort`, `aria-expanded` + `aria-controls` on the row toggles, `aria-busy` on the body while
loading, `role="alert"` on errors, a polite live region announcing page, sort and loading changes,
and a single focus-visible ring on every interactive element.

**Performance.** Sorting is memoised on `(data, sortState)` so paging never re-sorts. Sort values
are computed once per row rather than on every comparison, so an expensive accessor runs O(n)
instead of O(n log n). Rows are `memo`ised with stable callbacks and ids, so expanding one row
does not re-render the others. The DOM stays small because page size bounds it, which is why no
virtualization is needed here.

**Responsive.** Below `640px` pinning is dropped on purpose: a 220px sticky column on a 375px
screen costs more than it gives. The attendee panel switches from a nested table to stacked cards.

---

## Edge cases

| Case | Behaviour |
|---|---|
| Empty dataset | Full-width empty state; header stays, pagination disabled |
| Empty child list | The panel shows its own "No attendees booked yet" state |
| Failed initial fetch | Table-level error row with `role="alert"` and Retry |
| Failed child fetch | Error stays inside that one panel; the rest of the table keeps working |
| Slow fetch | Skeletons immediately; server-mode page changes keep the old page visible and dimmed |
| Invalid sort key | Renders unsorted, keeps the state, warns in dev, never throws |
| Out-of-range page | Clamped for render, then `onPaginationChange` fires so a controlled parent converges |
| Duplicate row ids | Falls back sensibly and warns in dev, since duplicates would break expansion |
| Sort during load | Header buttons disabled while loading so a queued sort cannot desync server mode |

---

## Decisions and trade-offs

1. **Cells take the row, not a value.** One generic on the surface, at the cost of one property
   access inside the renderer.
2. **Child fetching sits outside the table.** Avoids a second generic; makes the panel reusable
   for anything, not just child rows.
3. **`manual*` separate from controlled.** Lets a consumer own the state without giving up client
   processing, which is what makes the mode toggle seamless.
4. **CSS grid height animation.** No measuring, works with dynamic content, and a `<tr>` cannot be
   height-animated directly anyway.
5. **Pinned columns need explicit widths.** Sticky offsets must be deterministic; documented
   constraint instead of runtime measurement.
6. **No virtualization.** Page size bounds the DOM, and `useTable` already returns the rows to
   render, so a windowing layer could wrap the body without changing the hook.
7. **No internal context.** Sub-components take explicit props so row memoisation is not defeated
   by a context value changing on every render.
8. **Row reordering is not animated.** A FLIP animation over 50 rows looks impressive in a demo and
   feels slow in daily use.
