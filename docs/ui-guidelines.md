# GCS UI guidelines

How new screens should look and be built so they match the rest of the site. When in
doubt, copy an existing screen: the student dashboard (`src/app/student`) and the
portal (`src/app/portal`) follow every rule below.

## 1. Look and feel

- **Calm and flat.** White cards on an off-white page, separated by 1px borders. No
  drop shadows on surfaces (popovers and toasts are the exception).
- **Generous and rounded.** Large radii, relaxed spacing, a light display typeface
  weight for big headings.
- **Amber means action.** The brand colour is for primary buttons, selected states,
  unread dots and focus. Never use it for large backgrounds or body text.
- **Photography carries warmth.** Hero and content images use large rounded corners.

## 2. Tokens

Always use semantic token classes. Raw palette classes (`bg-white`, `text-gray-500`,
`bg-blue-100`) are not allowed outside `src/components/ui`.

| Use                               | Class                                                 | Instead of          |
| --------------------------------- | ----------------------------------------------------- | ------------------- |
| Page background                   | `bg-background`                                       | `bg-gray-50`        |
| Card / surface                    | `bg-card`                                             | `bg-white`          |
| Border                            | `border` (uses `--border`)                            | `border-gray-200`   |
| Secondary text                    | `text-muted-foreground`                               | `text-gray-500/600` |
| Subtle fill (hover, table header) | `bg-muted`, `bg-muted/60`                             | `bg-gray-100`       |
| Primary action                    | `bg-primary text-primary-foreground` (Button default) | `bg-brand-normal`   |
| Tinted highlight (unread row)     | `bg-brand-subtle`                                     | `bg-blue-50`        |
| Decorative gradient only          | `from-brand-light to-brand`                           | —                   |
| Appointment status                | `StatusBadge` / `bg-status-*`                         | `bg-green-100` etc. |

Colours live in `src/app/globals.css`. `--brand` (`oklch(0.56 0.13 60)`) gives
4.84:1 against white text; the old amber gave about 2:1. Check any new colour pair with
`node scripts/contrast.mjs "<L C H>" "<L C H>"` and keep text at 4.5:1 or more.

Dark mode is not enabled, but because everything uses tokens it can be added by
filling in the `.dark` block.

## 3. Typography

Font: Geist (sans), body size `text-sm`.

| Role                         | Classes                                              | Element                     |
| ---------------------------- | ---------------------------------------------------- | --------------------------- |
| Hero / display               | `text-4xl sm:text-5xl md:text-6xl tracking-tight`    | `h1`                        |
| Page title                   | `PageHeader` (`text-3xl md:text-4xl tracking-tight`) | `h1`                        |
| Section title (public pages) | `text-2xl md:text-3xl tracking-tight`                | `h2`                        |
| Card title                   | `font-medium`                                        | `h2`/`h3` via `SectionCard` |
| Description                  | `text-muted-foreground`                              | `p`                         |
| Meta / captions              | `text-xs text-muted-foreground`                      | `p`, `span`                 |

Every page has exactly one `h1`. Never style a `<p>` to look like a heading.

## 4. Shape and spacing

| Thing                                    | Radius                           |
| ---------------------------------------- | -------------------------------- |
| Cards (`SectionCard`)                    | `rounded-2xl`                    |
| Tiles, list items, callouts, inner boxes | `rounded-xl`                     |
| Inputs, buttons                          | `rounded-md` (component default) |
| Hero and feature media                   | `rounded-3xl md:rounded-4xl`     |
| Pills, avatars, icon badges              | `rounded-full`                   |

Spacing rhythm: `gap-2` inside controls, `gap-4` between related items, `gap-6`/`gap-8`
between sections. Card padding is `p-5 md:p-8` (built into `SectionCard`). Page gutters
are `px-4 md:px-8`; never use fixed `px-15`.

## 5. Components

Reach for these before writing markup. Hand-rolled equivalents are what produced most
of the old inconsistencies.

| Need                                    | Use                                               | Location                                  |
| --------------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| Page title + description + actions      | `PageHeader`                                      | `components/app/page-header`              |
| A card with title, description, actions | `SectionCard`                                     | `components/app/section-card`             |
| Label/value pairs                       | `DetailList`                                      | `components/app/detail-list`              |
| Nothing to show                         | `EmptyState`                                      | `components/app/empty-state`              |
| Informational note or warning           | `InfoCallout`                                     | `components/app/info-callout`             |
| Circle icon beside a title              | `IconBadge`                                       | `components/app/icon-badge`               |
| Person photo or initials                | `UserAvatar`                                      | `components/app/user-avatar`              |
| Appointment status                      | `StatusBadge`                                     | `components/app/status-badge`             |
| Search box                              | `SearchInput` + `useDebouncedValue`               | `components/app/search-input`             |
| Prev/next for a list                    | `PaginationControls`                              | `components/app/pagination-controls`      |
| Logo link                               | `BrandMark`                                       | `components/app/brand-mark`               |
| Server-paginated table                  | `DataTable`, `SortableHeader`                     | `app/admin/_components/data-table`        |
| Article / announcement / playlist tile  | `ArticleCard`, `AnnouncementCard`, `PlaylistCard` | `components/content/cards`                |
| Tile grid with search and pager         | `ContentGrid`                                     | `components/content/content-grid`         |
| "Are you sure?"                         | `useConfirm()`                                    | `hooks/use-confirm`                       |
| Leaving the site                        | `ExternalLinkDialog`                              | `components/content/external-link-dialog` |
| Pick a counselor's free slot            | `SlotPicker`                                      | `components/appointments/slot-picker`     |

shadcn primitives (`components/ui`): Button, Badge, Dialog, AlertDialog, Sheet,
Popover, DropdownMenu, Select, Tabs, ToggleGroup, Switch, Checkbox, Tooltip,
ScrollArea, Calendar, Table, Skeleton, Field, Input, InputGroup, Textarea, Alert,
Avatar, Empty. Add more with `pnpm dlx shadcn@latest add <name>` and fix the generated
`cn` import to `@/lib/utils`.

Choices between similar primitives:

- One of a few options, all visible → `ToggleGroup` (reasons, moods, days, time slots).
- One of many options → `Select`.
- On/off setting → `Switch`, not a Select with "Active/Inactive".
- Destructive or irreversible → `useConfirm({ destructive: true })`.
- Mobile navigation → `Sheet`.

## 6. Icons

lucide-react only. Sizes: `size-4` inline and in buttons (automatic), `size-5` in list
rows, `IconBadge` for 40px circles, `size-14`–`size-16` on status screens. Stroke:
default in buttons, `strokeWidth={1.25}`–`1.5` for decorative icons. Decorative icons
get `aria-hidden`. An icon-only button needs `aria-label` (and a `Tooltip` where the
meaning isn't obvious).

## 7. Forms and dialogs

- Build forms with TanStack Form and the shared fields: `FormInputField`,
  `FormSelectField`, `FormPasswordField`, `FormDateTimeField`. They wire `label` to
  `id`, show one error at a time and set `aria-invalid`.
- Validate with a zod schema from `src/lib/validation`, and use the **same schema** in
  the server action. Limits must match the database constraints.
- Validate on submit (and on blur for longer forms). Don't validate on every keystroke.
- Submit buttons show a `Spinner` and are disabled while `isSubmitting`.
- A dialog form: give the `<form>` an `id` and the footer button `form={id}`
  (`useId()` or a constant). Never guess the id.
- Every dialog has `DialogTitle` **and** `DialogDescription`. Keep the default close
  button.
- Footer order: Cancel (outline) on the left, primary action on the right. Delete
  goes far left as a ghost destructive button.
- Mount edit dialogs only while open (`{open && <Dialog open …/>}`) so defaults come
  from fresh data.
- Dates and times entered by staff are office time (Asia/Manila).

## 8. Loading, empty and error states

- Every route segment with data has a `loading.tsx` shaped like the page.
- Lists show skeletons while loading, `EmptyState` when empty, and keep the previous
  page visible while paging (`placeholderData: keepPreviousData`).
- Failed loads toast automatically (see `QueryCache` in `app/providers.tsx`).
- Mutations surface the server's message (`result.error`), not a generic sentence.
- Full-page problems use `StatusScreen` (`not-found.tsx`, `error.tsx`, `/error`).

## 9. Responsive rules

| Area                               | Target                                                                    |
| ---------------------------------- | ------------------------------------------------------------------------- |
| Public site, auth, portal, student | Fully usable at 390px. No horizontal scroll.                              |
| Counselor                          | Desktop-first; single column below `lg`, usable on tablets.               |
| Admin                              | Desktop only. Below `lg` the layout shows a "use a larger screen" notice. |

- Start single-column and add columns at `sm`/`md`/`lg`.
- Grid children that contain truncated text need `min-w-0`.
- Tables scroll inside their own `overflow-x-auto` container.
- The public nav collapses into a `Sheet` below `md`.
- Check with Playwright at 390px: `document.documentElement.scrollWidth <= innerWidth`.

## 10. Accessibility checklist

- One `h1`, headings in order.
- Anything clickable is a `button` or a link, never a `div` with `onClick`.
- Inputs have visible labels; search boxes have a screen-reader label.
- Icon-only buttons have `aria-label`.
- Decorative images use `alt=""`; meaningful ones describe the content.
- Colour is never the only signal (status badges include text).
- Focus rings stay visible (`focus-visible:ring-[3px]`).

## 11. Data conventions

- **Reads** live in `src/lib/<domain>/queries.ts`: plain functions that take a
  Supabase client, so they work from Server Components and from `useQuery` in the
  browser. Row-level security is the access control.
- **Writes** live in `src/lib/<domain>/actions.ts` (`"use server"`). Each one checks
  the role, validates with zod, and returns `Result` (`{ ok: true, data }` or
  `{ ok: false, error }`). Never throw from an action: production builds hide thrown
  messages.
- **Query keys** come from `src/lib/query-keys.ts`. Per-user data includes the user's
  id. Invalidate the domain root (`queryKeys.appointments.all`) after a change.
- **Who is signed in** comes from `useViewer()` / `useSignedInViewer()`, filled by the
  layout on the server. Don't read identity from localStorage.
- Public pages fetch in Server Components; interactive lists fetch on the client.
