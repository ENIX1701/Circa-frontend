# Circa [Frontend]

Frontend for [Circa](https://github.com/ENIX1701/Circa). It provides the event operations interface: login, event hub, overview, planner, branding, socials, collaborators, staff, and test inbox.

## Prerequisites

- `Node.js` `24.15+`
- `npm`

## Run locally

```bash
npm ci
npm run dev
```

The Vite dev server proxies `/api` to:
```text
http://localhost:8080
```

Run the [backend](https://github.com/ENIX1701/Circa-backend) separately from `../backend`.

## Environment variables

| Name                      | Type     | Default | Description                                      |
|---------------------------|----------|---------|--------------------------------------------------|
| `VITE_AUTH_DELIVERY_MODE` | `String` | unset   | Set to `outbox` to expose test inbox preview UI. |

Local development usually uses:
```env
VITE_AUTH_DELIVERY_MODE=outbox
```

## Views

| Route                         | View            | Description                         |
|-------------------------------|-----------------|-------------------------------------|
| `/login`                      | Login           | Magic-link request and verification |
| `/test-inbox`                 | Test inbox      | Local/demo magic-link preview       |
| `/events`                     | Events hub      | Event list and creation             |
| `/events/:id`                 | Overview        | Event metadata and lifecycle        |
| `/events/:id/planner`         | Planner         | Checklist and timeline planning     |
| `/events/:id/branding`        | Branding        | Event theme and brand metadata      |
| `/events/:id/socials`         | Socials         | Social post planning                |
| `/events/:id/collaborators`   | Collaborators   | Event membership management         |
| `/events/:id/staff`           | Staff           | Staff directory and work overview   |

## Architecture

```text
src/
├── components/     # reusable UI and domain components
├── composables/    # auth, events, navigation, theme, toast state
├── config/         # navigation sections and form options
├── enums/          # shared frontend enums
├── router/         # Vue Router setup and auth guard
├── test/           # test factories
└── views/          # route-level screens
```

The app stores the JWT in `localStorage`, validates token expiry client-side, and redirects unauthenticated users to `/login`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run test:unit -- --run
npm run type-check
npm run lint
npm run format
```

## Build

```bash
npm run build
```

The production build is emitted to:
```text
dist/
```

In the root Docker build, this directory is copied into the backend runtime image and served by Actix in production mode.
