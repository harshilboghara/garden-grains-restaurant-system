# Garden Grains — Restaurant Ordering & Management System

A full-stack web application for a restaurant: customers browse a menu, order online,
pay, and book tables; staff manage orders, inventory, reservations and discounts from a
role-protected admin panel. Order status changes are pushed to both sides in real time
over WebSockets.

Built as a university project. **~21,700 lines** of JavaScript across a REST API and a
single-page React client.

---

## Architecture

```
┌──────────────────────┐      REST (JSON)      ┌──────────────────────┐
│  React 18 + Vite     │ ───────────────────►  │  Express REST API    │
│  TailwindCSS         │ ◄───────────────────  │  12 route modules    │
│  React Query         │                       │  JWT auth + RBAC     │
│                      │   Socket.IO (live     │                      │
│  customer + admin    │ ◄──── order/status ──►│  Socket.IO server    │
│  SPA, 33 views       │        events)        │                      │
└──────────────────────┘                       └──────────┬───────────┘
                                                          │ Mongoose
                                               ┌──────────▼───────────┐
                                               │ MongoDB — 10 models  │
                                               └──────────────────────┘
                                   external: Stripe · Nodemailer · OpenAI
```

**Request path:** React Query calls the API with a JWT bearer token → Express validates
the token and the caller's role (`middleware/`) → `express-validator` checks the payload →
a Mongoose model persists it → the relevant Socket.IO room is notified so open clients
update without polling.

## Tech stack

| Layer | Choices |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, React Router, React Query, Framer Motion, Recharts, Three.js |
| Backend | Node.js, Express 4, Mongoose 7, Socket.IO |
| Auth | JWT, bcrypt password hashing, role-based route guards |
| Payments | Stripe (card), UPI (recorded, no gateway), cash on delivery |
| Other | Nodemailer (transactional email), OpenAI chatbot with rule-based fallback, Helmet, CORS, rate limiting, Multer (avatar uploads), PDFKit receipts |

## Features

**Customer** — registration and login, menu browsing with search and filters, cart with
per-item customisation, checkout with cash, UPI or card (Stripe), discount codes, live order tracking,
order history and PDF receipts, table reservations, loyalty points, feedback, AI chatbot.

**Admin** — dashboard with revenue and order analytics, menu CRUD with image upload,
order queue with status transitions, manual order entry, reservation handling, inventory
levels with change logs, discount-code management, user management, feedback review.

## Data model

`User`, `MenuItem`, `Order`, `Reservation`, `Inventory`, `InventoryLog`, `Discount`,
`Feedback`, `Contact`, `OTP`.

## API surface

All under `/api`: `auth`, `users`, `menu`, `orders`, `reservations`, `payments`,
`discounts`, `inventory`, `feedback`, `contact`, `chatbot`, `admin`.

## Running it locally

**Prerequisites:** Node.js 18+, MongoDB 4.4+ (local or Atlas).

```bash
# 1. backend
cd backend
npm install
cp .env.example .env          # then fill in the values below
npm run seed                  # optional: 10 demo menu items
npm run create-admin          # optional: admin account (needs ADMIN_PASSWORD)
npm run create-discounts      # optional: promo codes WELCOME10, SAVE50, BIG20
npm run dev                   # http://localhost:5000

# 2. frontend (second terminal)
cd frontend
npm install
cp .env.example .env
npm run dev                   # http://localhost:3000
```

### Environment variables

`backend/.env` — only the first four are required to boot:

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | yes | MongoDB connection string (default `mongodb://localhost:27017/GardenGrains1`) |
| `JWT_SECRET` | yes | Token signing secret |
| `PORT` | yes | API port (default 5000) |
| `FRONTEND_URL` | yes | CORS origin (`http://localhost:3000`) |
| `JWT_EXPIRE` | no | Token lifetime (default `7d`) |
| `GMAIL_USER` / `GMAIL_PASS` | no | Transactional email (app password) |
| `STRIPE_SECRET_KEY` | no | Card payments |
| `OPENAI_API_KEY` | no | AI chatbot replies; without it the chatbot uses rule-based replies |
| `OPENAI_MODEL` / `OPENAI_TIMEOUT_MS` | no | Chatbot model (default `gpt-4o-mini`) and timeout |
| `ADMIN_PASSWORD` | for `create-admin` | Password of `admin@gardengrains.com` |
| `ADMIN_RESET_EMAIL` | no | Inbox that receives admin password-reset codes |

`frontend/.env` — `VITE_API_URL`, `VITE_STRIPE_PUBLISHABLE_KEY`.

> No real credentials are committed to this repository. `.env` is gitignored; use the
> `.env.example` files as templates and supply your own test keys.

## Project layout

```
backend/
  server.js        Express app, middleware, route mounting
  socket.js        Socket.IO setup and event rooms
  models/          10 Mongoose schemas
  routes/          12 REST route modules
  middleware/      auth + role guards
  utils/           email, receipts, helpers
  seedDatabase.js  demo data
frontend/
  src/pages/       23 customer views + 10 admin views
  src/components/  layout, cart, admin, payment, auth, chat, UI
  src/contexts/    Auth, Cart, Notification providers
docs/              setup guides + project report and presentation (PDF)
scripts/           environment diagnostics
```

## Documentation

Detailed guides live in [`docs/`](docs/): [setup](docs/SETUP.md),
[database](docs/DATABASE_SETUP.md), [backend](docs/BACKEND_SETUP_GUIDE.md),
[payments](docs/PAYMENT_SETUP_GUIDE.md), [Stripe](docs/STRIPE_SETUP.md),
[admin panel](docs/ADMIN_GUIDE.md), [discount codes](docs/TEST_DISCOUNT_CODES.md),
[images](docs/IMAGE_UPLOAD_GUIDE.md), [full feature list](docs/COMPLETE_FEATURES_LIST.md).

Project documents (Semester VI, GLS University):
[project report](docs/Project_Report_Smart_Restaurant_Ordering_System.pdf) ·
[presentation: UML diagrams and screen layouts](docs/Project_Documentation_UML_and_Layouts.pdf).

## Status and known limitations

- Automated test coverage is not yet in place; `jest` is configured but suites are pending.
- Payment flows run against provider **test** keys only.
- Profile avatars are stored on the local filesystem (`backend/uploads/avatars/`); menu images are
  embedded in the menu item (URL or data URL) rather than kept in object storage.
- UPI payments are recorded but not processed by a gateway; the order stays payment-pending.

## License

MIT — see [LICENSE](LICENSE).
