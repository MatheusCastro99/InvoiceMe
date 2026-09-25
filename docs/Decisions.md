# InvoiceMe Decision Log

Architecture and engineering decisions for InvoiceMe, recorded as they are made.
Each entry states the context that forced the decision, what was decided, and what it commits us to.
Entries are append-only: a reversed decision gets a new entry that supersedes the old one, rather than an edit.

| ID | Decision | Status | Date |
| --- | --- | --- | --- |
| [ADR-0001](#adr-0001-store-money-as-integer-cents) | Store money as integer cents | Accepted | 2026-09-25 |
| [ADR-0002](#adr-0002-store-service-dates-as-mongoose-date) | Store service dates as Mongoose `Date` | Accepted | 2026-09-25 |
| [ADR-0003](#adr-0003-move-to-apiv2-in-place-without-a-compatibility-layer) | Move to `/api/v2` in place, without a compatibility layer | Accepted | 2026-09-25 |
| [ADR-0004](#adr-0004-defer-the-authentication-strategy) | Defer the authentication strategy | Deferred | 2026-09-25 |
| [ADR-0005](#adr-0005-stop-versioning-graphify-output) | Stop versioning Graphify output | Accepted | 2026-09-25 |

---

## ADR-0001: Store money as integer cents

**Status:** Accepted, 2026-09-25

### Context

Every monetary value in the invoice model is a JavaScript float: `finalPrice` and `subtotal` are `Number`,
and each line item in `tableData` carries a float `price` and `itemTotal`. Floats can't represent most decimal
amounts exactly (`0.1 + 0.2 !== 0.3`), so totals drift by fractions of a cent and different code paths can round
the same amount differently.

In practice, both of those are already happening:

- `taxController.calculateTax` does float arithmetic and rounds with `parseFloat(x.toFixed(2))` at the API boundary.
- The frontend works out tax again on its own as `subtotal * (taxRate / 100)` in three places in `TableInvoice.jsx`
  and once in `PdfDocument.jsx`, so the stored total and the displayed tax can disagree.
- Line-item `quantity` and `price` come from text inputs as strings, and `itemTotal` comes from multiplying them
  with implicit string coercion in `TableDescription.jsx`.

### Decision

All monetary amounts are stored, computed and sent over the API as **integer cents**.

- Money fields carry a `Cents` suffix (for example `subtotalCents` and `totalCents`) so a field's unit is clear from its name.
- Mongoose validators reject any value that isn't a non-negative integer.
- The server calculates totals. Tax is `Math.round(subtotalCents * rate)` using one rounding rule,
  applied in one place. The client displays the server's figures and doesn't compute its own.
- Cents turn into dollars only at display time (`cents / 100`, formatted with `Intl.NumberFormat`).
  Dollar input turns into cents once, when the form submits.

### Consequences

- The response contract changes, which ADR-0003 covers.
- A one-time migration converts stored floats with `Math.round(value * 100)`.
- The API and the frontend share one small money module so the conversion rules can't drift apart.
- **Open question for the Schema epic:** `taxRate` is a rate rather than an amount, so this ADR doesn't cover it,
  but it's still a float percentage (`7.25`, `6.875`). Storing it as integer basis points (`725`, `688`)
  would remove the last float from the calculation. That's the recommended choice, pending confirmation.

---

## ADR-0002: Store service dates as Mongoose `Date`

**Status:** Accepted, 2026-09-25

### Context

`dateOfService` is a `String` in `MM/DD/YYYY` form. The invoice page validates a typed `MMDDYYYY` value with a regex
and inserts the slashes itself. The invoice table filters by month with `parseInt(dateOfService.slice(0, 2))`.
The database can't sort or range-query dates stored as strings, so all date logic has ended up in the browser.

### Decision

`dateOfService` becomes a Mongoose `Date`.

- A service date is a calendar day, not a moment in time. It's stored as **UTC midnight** of that day
  (`Date.UTC(y, m - 1, d)`) and read back with the UTC accessors (`getUTCMonth()` and so on).
  If it were stored as local midnight, anyone west of UTC would see it rendered as the previous day.
- Clients send dates as ISO `YYYY-MM-DD` strings. The API is the only place that turns them into `Date` objects.
- The free-text `MMDDYYYY` field becomes a date picker. `@mui/x-date-pickers` is already a frontend dependency.

### Consequences

- Month and date-range filtering can move to the server as indexed range queries.
- `dateOfService` gets an index.
- A one-time migration parses the existing `MM/DD/YYYY` strings. Records that don't parse get reported
  and left alone rather than guessed at.

---

## ADR-0003: Move to `/api/v2` in place, without a compatibility layer

**Status:** Accepted, 2026-09-25

### Context

ADR-0001 and ADR-0002 change the invoice response shape, and breaking changes to a public API normally need a
parallel version so existing clients keep working. InvoiceMe has no active users right now (confirmed 2026-09-25),
and its frontend is the only client.

### Decision

The API moves from `/api/v1` to `/api/v2`, and the breaking changes are made **in place**:

- v1 is not kept running alongside v2, and there's no v1-to-v2 adapter.
- The frontend moves to v2 in the same change set, so no commit ever has a client and server that disagree.
- The version bump marks the contract break even though nothing else needs it.

### Consequences

- `/api/v1` stops existing. Documentation for it will describe it as retired, not deprecated.
- The data migration is one-way. Take a `mongodump` before running it; that dump is the only rollback.
- This decision relies on having no users. If InvoiceMe goes into use before the Schema epic ships,
  this decision needs to be revisited before implementation.

---

## ADR-0004: Defer the authentication strategy

**Status:** Deferred, 2026-09-25

### Context

The API has no authentication. InvoiceMe is meant for closed-network use, so a simple strategy that assumes a
trusted network may be enough. JWT, OIDC and Microsoft Entra ID are all candidates, but Entra ID is
**aspirational**: no tenant is committed to it.

### Decision

No authentication strategy is chosen yet. The choice gets its own entry when the Authentication epic is designed.

### Consequences

- Earlier epics must not assume a particular auth model. The Schema epic doesn't add user or ownership fields,
  and the Docker epic doesn't bake in an identity provider.
- The unauthenticated `GET /debug/db` endpoint in `server.js` is a known exposure until then.
  If an earlier epic touches it, it should be removed or restricted to development.
- `.env.example` already has a `JWT_SECRET` placeholder. It remains a placeholder and doesn't mean JWT was chosen.

---

## ADR-0005: Stop versioning Graphify output

**Status:** Accepted, 2026-09-25

### Context

`graphify-out/` holds generated output: graph data, an HTML render and an AST cache. It's only used locally
to map the folder structure for agentic tooling, but 12 of its files were committed.

### Decision

`graphify-out/` is added to `.gitignore` and removed from the index. The local copy stays on disk.

### Consequences

- Anyone who wants the graph regenerates it locally.
- `docs/README.md` still describes `graphify-out/` as if it were part of the repository.
  That section gets updated in the Documentation epic.
