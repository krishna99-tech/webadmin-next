# ThingsNXT IoT Admin Console

Web administration portal for IoT device management, user access control, analytics, and system configuration.

## Features

- **Dashboard** — System overview, KPIs, device/user growth charts, quick actions
- **Device Fleet** — Register, manage, transfer ownership of IoT devices
- **User Directory** — Manage identities, roles, and permissions
- **Broadcast** — Send notifications to users
- **Webhooks** — Configure event callbacks
- **Security Rules** — JSON-based access control
- **Audit Logs** — Activity timeline with filters
- **Analytics** — Charts and metrics
- **Settings** — Theme, security, API keys

## Getting Started

1. Copy `.env.example` to `.env.local` and set your API URL:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

2. Run the dev server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 and log in.

## Tech Stack

- Next.js 16, React 19
- Recharts, Lucide icons, Axios
