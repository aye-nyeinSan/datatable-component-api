# Data Table

A generic `DataTable<T>` built without a table library, plus two dashboards that use it. Sorting,
pagination, expandable rows, a pinned column, skeleton loading and error states live in the
component. The pages supply columns and data.

---

## Setup instructions

```bash
npm install
npm run dev       
```

Other scripts:

```bash
npm run build
npm run lint
npm run typecheck
```

Node 20 or newer. There is no backend to run — three Next.js route handlers serve mock data, with
query flags for artificial latency and forced failures.

| Route | Contents |
| --- | --- |
| `/` | Class timetable. Pinned column, expandable attendee rows, inline and on-demand |
| `/members` | A different row shape, no child rows, server mode by default |

Both screens carry a **Demo controls** toolbar for switching data mode, adding latency, forcing a
failed request, and forcing the loading, empty and error states.

```
src/
├── app/              routes: layout, 2 pages, 3 API handlers
├── components/
│   ├── data-table/   the component
│   ├── demo/         the review toolbar, not part of the table API
│   ├── members/      members dashboard and columns
│   ├── timetable/    timetable dashboard, columns, attendee panel
│   └── ui/           Badge, Button, Skeleton, SegmentedControl
├── constants/
├── hooks/
├── icons/            re-exports lucide-react
├── layouts/          AppHeader, Logo, NavLink
├── schemas/          domain types
├── server/mock/      seed data and latency/failure helpers
├── services/api/     fetch calls
├── styles/
└── utils/            cn, comparators, formatters
```

---

## Component API design and how column definitions work

A column definition is data describing  — its name, what it displays, how it behaves:

```ts
interface ColumnDef<T> {
  // Column id, and the field read from each row by default.
  key: Extract<keyof T, string> | (string & {});

  // What the header cell shows.
  header: ReactNode;

  // Renders one cell from the whole row.
  cell?: (row: T) => ReactNode;

  // Sort by this value instead of by what the cell shows.
  sortAccessor?: (row: T) => SortValue;

  // Turns the header into a sort button. Off by default.
  sortable?: boolean;

  // Fixed width in px. Required on pinned columns.
  width?: number;

  // Minimum width, so long text does not crush the column.
  minWidth?: number;

  // Freezes the column against the left edge during horizontal scroll.
  pinned?: 'left';

  // Text alignment for the header and its cells. Defaults to 'left'.
  align?: 'left' | 'center' | 'right';

  // Screen-reader name for a column with no visible header.
  srHeader?: string;
}
```

## Example for cloumn definition

The three shapes  — a pinned column with custom markup, a plain field, and a
computed column that sorts.

```tsx
const columns: ColumnDef<ClassSession>[] = [
  {
    key: 'name',
    header: 'Class',
    sortable: true,
    pinned: 'left',
    width: 220,
    cell: (session) => (
      <div>
        <p className="font-medium">{session.name}</p>
        <p className="text-xs text-ink-muted">{session.room}</p>
      </div>
    ),
  },

  { key: 'instructor', header: 'Instructor', sortable: true, width: 170 },

  {
    key: 'attendance',
    header: 'Attendance',
    sortable: true,
    width: 160,
    sortAccessor: (session) => session.booked / session.capacity,
    cell: (session) => `${session.booked} / ${session.capacity}`,
  },
];
```

The remaining props:

| Group | Props |
| --- | --- |
| Sorting | `sortState`, `defaultSortState`, `onSortChange`, `manualSorting` |
| Pagination | `pagination`, `defaultPagination`, `onPaginationChange`, `manualPagination`, `totalCount`, `pageSizeOptions`, `hidePagination` |
| Expansion | `expansion` |
| States and presentation | `isLoading`, `isFetching`, `error`, `onRetry`, `emptyState`, `skeletonRowCount`, `caption`, `maxHeight`, `density`, `className` |

Error state wins over loading, which wins over empty, which wins over rows. `getRowId` uses
`row.id` and falls back to the row index.

---

## Client-side vs server-side strategy (sort & pagination)

Uncontrolled, the table owns everything:

Example:

```tsx
<DataTable
  data={classes}
  columns={columns}
  defaultSortState={{ columnKey: 'time', direction: 'asc' }}
  defaultPagination={{ pageIndex: 0, pageSize: 20 }}
/>
```

Controlled and server-driven, the table renders what it is handed and reports changes:

Example:

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

### Reason

`manualSorting` and `manualPagination` are separate from being controlled. Controlled decides who
owns the state; the manual flags decide who does the work. Keeping sort state in the URL while the
browser still sorts is a valid combination.

Because of that split, the Client/Server toggle only flips the two flags.

Client-Side Strategy:
`useDataTable` handles the fetching side. Client mode requests the whole dataset once , never fetches again and leaves both `manualSorting` and `manualPagination` flags off.

Server-Side Stategy:  In server mode both flags are true. The table sorts nothing and slices nothing — it shows the rows it was given and gets the page count from totalCount. Every sort or page change means a new request.

Sorting:
Sorting cycle includes ascending, descending, unsorted. The control is a `<button>` inside the `<th>`, and
`aria-sort` follows the state. Empty values sort last in both directions.

Pagination has a page-size select, prev/next, and a windowed page list with ellipses that collapses
to like this example UI: `2 / 7` on narrow screens.

---

## Expandable-rows design for both inline and on-demand child rows

```tsx
expansion={{
  renderExpanded: (session) => <AttendeePanel session={session} />,
  canExpand: (session) => session.status !== 'Cancelled',
}}
```

Passing `expansion` adds a leading toggle column, pinned if any other column is.

`renderExpanded` is a render prop, so the table does not know where children come from:

- Inline: read `session.attendees` off the row.
- On-demand: render `<LazyRowContent load={…} fallback={<Skeleton/>} />`, which handles its own
  loading state, error message, retry, abort on collapse, and result cache.

---

## Sticky-column approach

Pin a column with `pinned: 'left'` and a `width`.

Pinned cells get `position: sticky` and a `left` offset equal to the widths of the pinned columns
before them, so more than one can be pinned.

---

## State management decision and why

Used just pure React State Mangement:

| Hook | Called by | Job |
| --- | --- | --- |
| `useTable<T>` | `DataTable` | Composes sorting, pagination and expansion, derives the rows to render. Does not fetch. |
| `useDataTable<T>` | the dashboards | Fetches for client or server mode, returns props to spread. Does not render. |

`useTable` is composed from `useSorting`, `usePagination` and `useRowExpansion`. All three are
built on custom `useControllableState`, so the controlled/uncontrolled contract exists in one file and the
three cannot drift apart.

---

## Tradeoffs considered and assumptions made

### Tradeoffs

- Cells take the row rather than a value. One generic instead of two, at the cost of a property
  access in the renderer.
- `manualSorting` and `manualPagination` are separate from controlled, so state
  can be owned externally without giving up client processing.
- The expand animation uses a CSS grid track instead of measured heights.
- Pinned columns must explictility declare a width and pinning is off below 640px
- Row reordering is not animated. It demos well and feels slow in use.
- Support only light-mode  

### Assumptions

- Mock route handlers stand in for a backend. All three return `{ rows, totalCount }`, so client
  mode calls them with no parameters and server mode asks for a page. Latency and failures come
  from query flags.
- Left pinning only. Right pinning is the same offset logic mirrored, left out to keep the API
  small.
- Mock data is seeded, so server and client produce identical rows.
- Single-column sorting. Multi-column would change `SortState` to an array; the rest of the
  pipeline would not change.
