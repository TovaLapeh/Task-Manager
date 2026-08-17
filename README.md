# Task Manager

A full-stack task management application built for the Level 3 Software Developer take-home assignment. Tasks are created, edited, and deleted from an Angular client and persisted through a Node/Express REST API to a JSON file.

## 1. Project Overview

The application lets a user manage a list of tasks (title, description, priority, due date, status). The task list is always visible; the create/edit form opens in a Bootstrap modal, triggered either by the **New Task** button or by the **Edit** action on a row.

All state lives on the server: the client is a thin view over the API, so every create/edit/delete goes through `GET/POST/PUT/DELETE /tasks` and is written to `server/data/tasks.json`. Refreshing the page always reflects the current server state.

The UI is bilingual (Hebrew / English) with full RTL/LTR support. Hebrew is the default; the language can be switched at any time from the header.

## 2. Technologies Used

**Client**
- Angular 22 (standalone components, no NgModules)
- TypeScript (strict mode)
- Reactive Forms (`FormBuilder`, `Validators`)
- Angular Signals for state, `computed` + `effect` for derived state and side effects
- Bootstrap 5, compiled from SASS so the theme colour is set in one place
- Bootstrap Icons; Bootstrap's JS bundle for the Modal, Dropdown and Tooltip plugins

**Server**
- Node.js + Express 4
- TypeScript (strict mode)
- JSON file persistence (`fs/promises`), no database
- `tsx` for the dev server, `tsc` for production builds

No state-management library, ORM, database, authentication, i18n library, or Docker was introduced — none is required by the assignment, and each would add complexity without a corresponding requirement.

## 3. Project Structure

```
task-manager/
├── package.json                   Root scripts: install + run both projects
├── .stackblitzrc                  StackBlitz install/start configuration
├── server/                        Express + TypeScript API
│   ├── data/
│   │   └── tasks.json             JSON persistence file (the "database")
│   └── src/
│       ├── models/                Task type, enums, typed error hierarchy
│       ├── persistence/           File read/write, isolated from HTTP layer
│       ├── services/              Validation + business logic
│       ├── controllers/           Express request/response handlers
│       ├── routes/                Route → controller wiring
│       ├── middleware/            404 + centralized error handler
│       ├── app.ts                 Express app assembly (middleware, routes)
│       └── index.ts               Process entry point (starts the HTTP server)
│
└── client/                        Angular application
    ├── proxy.config.json          Dev-server proxy: /tasks -> API
    └── src/
        ├── styles.scss            Bootstrap SASS build + theme colour + 2 utilities
        └── app/
            ├── core/
            │   ├── i18n/          Translation dictionary + LanguageService
            │   ├── models/        Task type, enums (mirrors the server model)
            │   ├── services/      TaskService — the only place that calls HttpClient
            │   └── tokens/        DI token for the API base URL
            ├── shared/
            │   ├── bootstrap-plugins.ts        Typed access to Bootstrap's JS plugins
            │   └── truncation-tooltip.directive.ts
            ├── features/tasks/
            │   ├── task-manager/  Container: owns state, calls TaskService, drives the modal
            │   ├── task-form/     Reactive form for create/edit (rendered inside the modal)
            │   ├── task-list/     Table shell + empty state
            │   └── task-item/     Single task row (badges, edit/delete buttons)
            └── app.ts             Root component, hosts <app-task-manager>
```

## 4. Prerequisites

- Node.js 20+ (developed and tested with Node 24)
- npm 10+

## 5. Installation

A single install from the project root sets up both projects (a `postinstall`
script installs `server/` and `client/`):

```bash
npm install
```

## 5a. Quick Start (both projects at once)

```bash
npm start
```

This runs the API and the Angular dev server together via `concurrently`, and is
the command StackBlitz uses. Open <http://localhost:4200>.

The client talks to the API through the Angular dev-server proxy
(`client/proxy.config.json`), so requests go to `/tasks` on the same origin and
are forwarded to `http://localhost:3000`. That means there is no hardcoded API
host and no CORS round-trip in development, and the app also runs unchanged in
sandboxed environments such as StackBlitz, where the browser cannot reach the
container's `localhost`.

The two projects can still be run separately — see below.

## 6. Running the Server

```bash
cd server
npm run dev      # starts on http://localhost:3000 with auto-reload (tsx watch)
```

Production-style run:

```bash
cd server
npm run build     # compiles src/ -> dist/
npm start         # runs the compiled server
```

Both `npm run dev` and `npm start` must be run with `server/` as the working directory — the JSON data file path (`server/data/tasks.json`) is resolved from `process.cwd()`, not from the compiled file location, so dev and prod always read/write the same file.

The API defaults to port `3000`. Override with `PORT=4000 npm run dev` if needed.

## 7. Running the Client

```bash
cd client
npm start          # ng serve, http://localhost:4200
```

`API_BASE_URL` (see `app.config.ts`) is intentionally empty, so the client issues same-origin requests to `/tasks` and the dev-server proxy forwards them to the API. Start the server first, or reload the page after starting it — the client shows a clear error banner if the API is unreachable rather than failing silently.

## 8. API Endpoints

| Method | Path         | Body                         | Success | Notes                              |
|--------|--------------|------------------------------|---------|-------------------------------------|
| GET    | `/tasks`     | —                            | 200     | Returns all tasks                   |
| POST   | `/tasks`     | `TaskInput` (see data model) | 201     | Returns the created task with `id`  |
| PUT    | `/tasks/:id` | `TaskInput`                  | 200     | Returns the updated task            |
| DELETE | `/tasks/:id` | —                            | 204     | No body                             |

Error responses are always `{ "message": string }`:

| Status | Cause                                                   |
|--------|---------------------------------------------------------|
| 400    | Missing/invalid field, malformed JSON, invalid `:id`    |
| 404    | Task with the given `id` does not exist                 |
| 500    | Unexpected server error or JSON file read/write failure |

## 9. Data Model

```ts
enum TaskPriority { Low = "Low", Medium = "Medium", High = "High" }
enum TaskStatus { Pending = "Pending", InProgress = "In Progress", Completed = "Completed" }

interface Task {
  id: number;
  title: string;
  description: string;   // always present, may be an empty string
  priority: TaskPriority;
  dueDate: string;       // ISO date, yyyy-MM-dd
  status: TaskStatus;
}
```

Defined once per project (`server/src/models/task.model.ts` and `client/src/app/core/models/task.model.ts`) — see "Architectural Decisions" for why it isn't shared via a package.

The enum values above are the canonical stored representation. They are **never** translated: the Hebrew UI localizes only the *display label* of a priority/status, while the value held by the form control and sent to the API stays `"High"`, `"In Progress"`, and so on.

## 10. Validation Behavior

**Client (Reactive Forms):**
- Title: required, max 200 characters.
- Due Date: required (native `<input type="date">`).
- Description: optional, no constraint.
- Priority / Status: `<select>` dropdowns, so only valid enum values are selectable — no free-text entry is possible.
- The Save/Update button is disabled while a request is in flight (`saving` signal), so the form cannot be double-submitted.
- Invalid fields get a red outline and inline feedback text once touched, in the active language.

**Server (defense in depth — never trusts the client):**
- `title`: required, non-empty after trimming.
- `dueDate`: required, must match `yyyy-MM-dd` and be a parseable date.
- `priority` / `status`: must be one of the exact enum values; anything else is rejected with 400.
- `:id` route params must be a positive integer, or 400 is returned before touching the data file.
- Malformed JSON bodies are caught and turned into a 400, not a 500.

## 11. Internationalization (Hebrew / English)

- The dictionary lives in `core/i18n/translations.ts`. Both languages implement a shared `Translations` interface, so a missing or misspelled key is a **compile-time error** rather than a blank label at runtime.
- `LanguageService` holds the active language in a signal and exposes `t = computed(() => TRANSLATIONS[language()])`. Templates read keys as `i18n.t().tasks.priority`; switching language updates the UI instantly with no page reload and **no API calls**.
- An `effect()` mirrors the language onto `<html lang dir>`, so Hebrew renders the whole app RTL.
- The choice persists in `localStorage` under a single key; `DEFAULT_LANGUAGE` (Hebrew) is used whenever nothing valid is stored. `index.html` ships with `lang="he" dir="rtl"` to match, so the first paint is already RTL and there is no left-to-right flash.
- Only static UI text is translated. Task data (titles, descriptions) is rendered with `dir="auto"` so each task's own text picks its direction and stays readable regardless of the UI language.

## 12. Important Architectural Decisions

- **Reactive Forms over template-driven forms**: required by the assignment, and it gives a single typed `FormGroup` as the source of truth, explicit `Validators`, and straightforward programmatic reset.
- **Layered server (`routes → controllers → services → persistence`)**: each layer has one job. This keeps `fs` calls out of request handlers and validation out of the file layer, and each layer is replaceable (persistence could become a database module without touching controllers).
- **Typed error hierarchy (`AppError` → `ValidationError` / `NotFoundError` / `PersistenceError`)**: services throw these and a single Express error middleware maps them to HTTP status codes. Controllers contain no status-code branching, and unexpected errors fall through to a generic 500 without leaking stack traces.
- **Container/presentational split**: `TaskManager` is the only component that injects `TaskService` and owns tasks/loading/error state; `TaskForm`, `TaskList` and `TaskItem` only take inputs and emit outputs, so they are testable without mocking HTTP.
- **`TaskItem` uses an attribute selector (`tr[app-task-item]`)** rather than an element selector. With an element selector Angular renders `<app-task-item>` between `<tbody>` and `<tr>`, which breaks Bootstrap's child-combinator rules (`.table-striped > tbody > tr`, `.table-hover > tbody > tr`) and puts the header and body in separate anonymous tables, so columns do not line up. The attribute selector makes the component *be* the row.
- **Edit/create mode is a single nullable signal** (`editingTask: Task | null`) on the container, passed to `TaskForm` as `taskToEdit`. The form has no local mode flag — it derives `isEditMode` from that input, and an `effect()` keeps the values in sync. One form, one code path.
- **The form is driven programmatically inside a Bootstrap modal**, not with `data-bs-toggle`, because it must also close itself after an async save completes. Keeping it in a modal frees the full page width for the table.
- **Bootstrap compiled from SASS** rather than loaded as prebuilt CSS. Overriding `--bs-primary` would not work: Bootstrap compiles theme colours into hardcoded values (`.btn-primary` sets `--bs-btn-bg: #0d6efd`), so the palette must be set before compilation. `styles.scss` sets `$primary` once and every button, focus ring, link and dropdown highlight follows.
- **Bootstrap JS plugins are accessed through `shared/bootstrap-plugins.ts`**, which declares the minimal typed surface used. The bundle is loaded globally via `angular.json`, so it cannot be imported as a module; this keeps the untyped `window` cast in one place instead of at each call site, and returns `null` when unavailable so callers degrade gracefully.
- **Long descriptions are clamped to two lines**, with `appTruncationTooltip` showing the full text on hover/focus — and only when the text is actually clipped. A `title` attribute remains as a fallback if Bootstrap's JS is unavailable.
- **API base URL via an `InjectionToken`** rather than hardcoded in `TaskService`, so it can be swapped per environment or in tests.
- **Data file path anchored to `process.cwd()`**, not `__dirname`: `tsx` runs `src/index.ts` while the production build runs `dist/index.js`, so a `__dirname`-relative path would resolve to two different files. Anchoring to the working directory keeps dev and prod on the same `server/data/tasks.json`.

## 13. Assumptions

- The client always talks to a server on `http://localhost:3000`; no environment-specific build configuration was introduced, since the assignment targets local evaluation.
- `id` is a server-assigned auto-incrementing integer (`max existing id + 1`), matching the example in the assignment (`"id": 1`).
- Language names in the switcher ("English", "עברית") are shown in their own language and are deliberately identical in both dictionaries — a user who cannot read the current language still needs to find their way back.
- **Priority and status are stored in English, not Hebrew.** The brief's sample JSON shows Hebrew values (`"priority": "גבוהה"`). This implementation stores the canonical enum (`"High"`) and localizes only the display label, so the persisted data does not change meaning when the UI language changes and the server can validate against a fixed set. The trade-off is that the file format differs from the sample; switching to Hebrew values would tie the stored data to one UI language.
- The Task/TaskPriority/TaskStatus types are intentionally duplicated between `client/` and `server/` rather than extracted into a shared package. The two projects have independent `package.json`s, build tools and lifecycles; a shared workspace package would add real tooling complexity (workspace config, a build step, path resolution in both `tsconfig`s) to keep ~15 lines of types in one place.

## 14. Known Limitations

- No authentication/authorization — out of scope per the assignment.
- No pagination, filtering or sorting on the task list — not required, and the table suits a demo-sized list.
- The JSON file is not safe for concurrent writers (e.g. two server instances). This is expected for a single-process take-home API and is the persistence mechanism the assignment specifies.
- **Success/error toast messages are not translated.** They are composed at runtime inside `TaskManager` (e.g. `"<title>" was created.`) and always render in English, even when the UI is Hebrew. Localizing them would need interpolated translation keys.
- **Deleting a task is not confirmed.** The delete button removes the task immediately; there is no confirmation prompt.
- Automated client tests cover the app-bootstrap spec only. The CRUD flow, validation, i18n/RTL behaviour and responsive layout were verified by driving the running application in a headless browser (see below) rather than through an added Angular test suite, to keep the scope aligned with the assignment.

## 15. Verification Performed

- `npm run typecheck` and `npm run build` pass on the server; `ng build` and `ng test` pass on the client with no errors and no browser console errors.
- Server endpoints exercised directly with `curl`: valid/invalid POST and PUT payloads, invalid and non-existent `:id` on PUT/DELETE, malformed JSON, and an unknown route — each returned the documented status code and message.
- The running application was driven in a headless browser to verify: required-field validation, create → form reset → row appears, edit prefill with the "Save" → "Update" switch, update, delete, persistence across a page refresh, and the API-unreachable error banner.
- Bootstrap table behaviour verified from computed styles: striping alternates, hover applies, and every header column aligns with its body column to within 1px.
- Language switching verified end to end: English default with `dir=ltr`, Hebrew with `dir=rtl`, instant switch with zero `/tasks` requests, task data unchanged across languages, and enum values still sent to the API in English.
- Layout checked at 1280px, 768px and 390px in both languages.
