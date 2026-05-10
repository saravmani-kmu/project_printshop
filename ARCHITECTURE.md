# PrintShop Web App — Architecture Plan

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | TailwindCSS + shadcn/ui |
| State | Zustand |
| Backend | FastAPI (Python 3.11+) |
| ORM | SQLAlchemy 2.x + Alembic migrations |
| Database | SQLite (swap-ready for PostgreSQL/MySQL) |
| Auth | Google OAuth 2.0 + JWT (access + refresh) |
| File Scan | ClamAV (self-hosted daemon) |
| Email | Gmail SMTP (via smtplib) |
| WhatsApp | Meta WhatsApp Cloud API (1,000 free conversations/month) |
| Dev WA | Twilio WhatsApp Sandbox (testing only) |
| Deployment | Railway / Render / Fly.io → future GCP or Azure |

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      BROWSER (React)                         │
│  Landing | Products | Cart | Orders | Profile | Admin        │
└──────────────────────┬───────────────────────────────────────┘
                       │ HTTPS + JWT Bearer
┌──────────────────────▼───────────────────────────────────────┐
│                   FastAPI Backend                             │
│  /auth  /products  /orders  /uploads  /admin  /config        │
├──────────┬────────────┬────────────┬─────────────────────────┤
│ SQLite   │ Local File │ ClamAV     │ External Services        │
│ (SQLAlch)│ Storage    │ Daemon     │ Google OAuth             │
│          │ /uploads/  │ (clamd)    │ Gmail SMTP               │
└──────────┴────────────┴────────────┤ WhatsApp Cloud API       │
                                     └──────────────────────────┘
```

---

## Folder Structure

```
project_printshop/
├── backend/
│   ├── app/
│   │   ├── main.py                      # FastAPI app + lifespan
│   │   ├── config.py                    # pydantic-settings (reads .env)
│   │   ├── database.py                  # SQLAlchemy engine + session factory
│   │   │
│   │   ├── models/                      # SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── admin.py
│   │   │   ├── product.py               # Product + ProductVariant (qty tiers)
│   │   │   ├── template.py
│   │   │   ├── cart.py
│   │   │   ├── order.py                 # Order + OrderItem + OrderStatusHistory
│   │   │   ├── address.py
│   │   │   ├── discount.py
│   │   │   └── app_config.py            # Key-value config table
│   │   │
│   │   ├── schemas/                     # Pydantic v2 request/response models
│   │   │   ├── user.py
│   │   │   ├── product.py
│   │   │   ├── template.py
│   │   │   ├── cart.py
│   │   │   ├── order.py
│   │   │   ├── address.py
│   │   │   ├── discount.py
│   │   │   └── admin.py
│   │   │
│   │   ├── routers/                     # Route handlers (thin — call services)
│   │   │   ├── auth.py                  # Google OAuth callback + token refresh
│   │   │   ├── products.py              # Public product listing
│   │   │   ├── templates.py             # Template listing per product
│   │   │   ├── uploads.py               # Custom image upload endpoint
│   │   │   ├── cart.py
│   │   │   ├── orders.py                # Place order, view status
│   │   │   ├── addresses.py             # CRUD + default address
│   │   │   └── admin/
│   │   │       ├── register.py          # /admin/register + approval flow
│   │   │       ├── products.py          # Admin CRUD for products
│   │   │       ├── templates.py         # Admin CRUD for templates
│   │   │       ├── orders.py            # View orders + update status + notes
│   │   │       ├── discounts.py         # Discount/offer rules
│   │   │       ├── users.py             # View/manage customers
│   │   │       └── config.py            # App config management (file size etc.)
│   │   │
│   │   ├── services/                    # Business logic layer
│   │   │   ├── auth_service.py          # Google token verify + JWT issue
│   │   │   ├── upload_service.py        # MIME check + ClamAV scan + save
│   │   │   ├── order_service.py         # Order creation + discount calc
│   │   │   ├── discount_service.py      # Discount rule evaluation engine
│   │   │   ├── notification_service.py  # Orchestrates email + WhatsApp
│   │   │   ├── email_service.py         # Gmail SMTP
│   │   │   └── whatsapp_service.py      # Meta Cloud API / Twilio adapter
│   │   │
│   │   ├── core/
│   │   │   ├── security.py              # JWT create/verify, password utils
│   │   │   ├── dependencies.py          # get_db, get_current_user, require_admin
│   │   │   └── middleware.py            # CORS, rate limiting (slowapi)
│   │   │
│   │   └── utils/
│   │       ├── file_utils.py            # UUID rename, allowed extension check
│   │       └── india.py                 # Indian states list, mobile validation
│   │
│   ├── migrations/                      # Alembic migration scripts
│   │   ├── env.py
│   │   └── versions/
│   ├── uploads/                         # Uploaded files (gitignored)
│   │   └── .gitkeep
│   ├── seeds/                           # Seed data scripts
│   │   └── seed_templates.py
│   ├── tests/
│   │   ├── test_auth.py
│   │   ├── test_products.py
│   │   ├── test_orders.py
│   │   └── test_uploads.py
│   ├── .env                             # Secrets (gitignored)
│   ├── .env.example                     # Template with all keys listed
│   ├── requirements.txt
│   └── alembic.ini
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   │
│   │   ├── router/
│   │   │   └── index.tsx                # React Router v6 routes
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing.tsx              # Public homepage
│   │   │   ├── Products.tsx             # Product grid
│   │   │   ├── ProductDetail.tsx        # Templates + upload
│   │   │   ├── Cart.tsx
│   │   │   ├── Checkout.tsx             # Address + payment method
│   │   │   ├── Orders.tsx               # Customer order list
│   │   │   ├── OrderDetail.tsx          # Order status bar + items
│   │   │   ├── Profile.tsx
│   │   │   ├── UserTypeSelect.tsx       # First-login: Retail or B2B
│   │   │   └── admin/
│   │   │       ├── AdminLayout.tsx      # Sidebar layout
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Products.tsx
│   │   │       ├── Templates.tsx
│   │   │       ├── Orders.tsx           # Order list + status update
│   │   │       ├── OrderDetail.tsx      # Add notes, update status
│   │   │       ├── Discounts.tsx
│   │   │       ├── Users.tsx
│   │   │       ├── Config.tsx           # App config (file size, email, etc.)
│   │   │       └── Register.tsx         # /admin registration form
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── TemplateSelector.tsx
│   │   │   ├── ImageUploader.tsx        # Drag-drop + preview
│   │   │   ├── CartItem.tsx
│   │   │   ├── OrderStatusBar.tsx       # Visual step progress bar
│   │   │   ├── AddressForm.tsx          # Address CRUD + default select
│   │   │   ├── QuantitySelector.tsx     # Tier price picker
│   │   │   ├── DiscountBadge.tsx
│   │   │   └── ui/                      # shadcn/ui components
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useCart.ts
│   │   │   └── useOrders.ts
│   │   │
│   │   ├── store/
│   │   │   ├── authStore.ts             # Zustand: user, token, user_type
│   │   │   └── cartStore.ts             # Zustand: cart items
│   │   │
│   │   ├── api/
│   │   │   ├── client.ts                # Axios instance + token interceptor
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── orders.ts
│   │   │   ├── addresses.ts
│   │   │   └── admin.ts
│   │   │
│   │   ├── types/
│   │   │   └── index.ts                 # Shared TypeScript interfaces
│   │   │
│   │   └── styles/
│   │       └── index.css
│   │
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── prompts/
│   └── initialpromt.md
└── ARCHITECTURE.md
```

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| google_id | VARCHAR UNIQUE | from Google OAuth |
| email | VARCHAR UNIQUE | |
| name | VARCHAR | |
| picture | VARCHAR | Google profile photo URL |
| user_type | ENUM(retail, b2b) | set once at first login |
| is_active | BOOLEAN | default true |
| created_at | DATETIME | |

### `admins`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | FK → users | |
| role | ENUM(super, sub) | super = first approved |
| status | ENUM(pending, approved, rejected) | |
| approved_by | FK → admins nullable | |
| approved_at | DATETIME nullable | |
| created_at | DATETIME | |

### `products`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR | e.g. "Visiting Cards" |
| description | TEXT | |
| icon | VARCHAR | image path or icon name |
| is_active | BOOLEAN | admin toggle |
| sort_order | INTEGER | display order |
| created_at | DATETIME | |

### `product_variants`  _(quantity tiers)_
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| product_id | FK → products | |
| quantity | INTEGER | e.g. 100, 250, 500 |
| retail_price | DECIMAL | |
| b2b_price | DECIMAL | |
| is_active | BOOLEAN | |

### `templates`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| product_id | FK → products | |
| name | VARCHAR | |
| preview_image | VARCHAR | path to preview |
| is_active | BOOLEAN | |
| is_seeded | BOOLEAN | true for default templates |
| created_at | DATETIME | |

### `cart_items`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | FK → users | |
| product_variant_id | FK → product_variants | |
| template_id | FK → templates nullable | |
| custom_image_path | VARCHAR nullable | uploaded file path |
| added_at | DATETIME | |

### `addresses`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | FK → users | |
| full_name | VARCHAR | |
| mobile | VARCHAR | Indian 10-digit |
| line1 | VARCHAR | |
| line2 | VARCHAR nullable | |
| city | VARCHAR | |
| district | VARCHAR | |
| state | VARCHAR | default: "Tamil Nadu" |
| pincode | VARCHAR | 6-digit |
| is_default | BOOLEAN | one per user |

### `orders`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| order_number | VARCHAR UNIQUE | human-readable, e.g. ORD-2024-0001 |
| user_id | FK → users | |
| address_id | FK → addresses | |
| subtotal | DECIMAL | |
| discount_amount | DECIMAL | |
| total_amount | DECIMAL | |
| payment_method | ENUM(cod, invoice) | |
| payment_status | ENUM(pending, paid, failed) | |
| current_status | ENUM(pending, inprogress, completed) | |
| created_at | DATETIME | |

### `order_items`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| order_id | FK → orders | |
| product_variant_id | FK → product_variants | |
| template_id | FK → templates nullable | |
| custom_image_path | VARCHAR nullable | |
| unit_price | DECIMAL | price at time of order |
| quantity | INTEGER | always 1 (variant defines qty) |

### `order_status_history`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| order_id | FK → orders | |
| status | ENUM(pending, inprogress, completed) | |
| note | TEXT nullable | admin's comment |
| is_public | BOOLEAN | true = visible to customer |
| created_by | FK → admins | |
| created_at | DATETIME | |

### `discounts`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | VARCHAR | e.g. "Festive 15% off" |
| type | ENUM(percentage, flat) | |
| value | DECIMAL | e.g. 15.0 or 50.0 |
| applies_to | ENUM(retail, b2b, both) | |
| trigger_type | ENUM(time_of_day, season, loyalty) | |
| trigger_config | JSON | e.g. {"start":"09:00","end":"11:00"} or {"months_since_join":6} |
| is_active | BOOLEAN | |
| valid_from | DATETIME nullable | |
| valid_until | DATETIME nullable | |

### `app_config`
| Column | Type | Notes |
|---|---|---|
| key | VARCHAR PK | e.g. "max_upload_size_mb" |
| value | VARCHAR | |
| description | VARCHAR | human-readable label |
| updated_at | DATETIME | |

**Default config keys:**
- `max_upload_size_mb` — default: `10`
- `allowed_upload_extensions` — default: `jpg,jpeg,png,pdf,svg`
- `notification_mobile` — WhatsApp number to notify on new order
- `admin_approval_email` — email to receive admin registration requests
- `whatsapp_provider` — `meta` or `twilio`

---

## API Endpoints

### Auth
```
GET  /auth/google/login        → redirect to Google
GET  /auth/google/callback     → exchange code, issue JWT
POST /auth/refresh             → refresh access token
POST /auth/logout              → invalidate refresh token
```

### Products (public)
```
GET  /products                 → list active products
GET  /products/{id}            → product detail + variants
GET  /products/{id}/templates  → templates for product
```

### Cart
```
GET    /cart                   → current user's cart
POST   /cart                   → add item (variant + template/upload)
DELETE /cart/{item_id}         → remove item
DELETE /cart                   → clear cart
```

### Uploads
```
POST /uploads/image            → upload custom design image
                                  (ClamAV scan + MIME check + size limit)
```

### Orders
```
POST /orders                   → place order from cart
GET  /orders                   → my orders list
GET  /orders/{id}              → order detail + status history
```

### Addresses
```
GET    /addresses              → my saved addresses
POST   /addresses              → add new address
PUT    /addresses/{id}         → update address
DELETE /addresses/{id}         → delete address
PATCH  /addresses/{id}/default → mark as default
```

### Admin — Registration
```
POST /admin/register           → submit registration request
GET  /admin/approve/{token}    → approve link (from email)
```

### Admin — Protected Routes (require admin JWT)
```
GET/POST/PUT/DELETE /admin/products
GET/POST/PUT/DELETE /admin/products/{id}/templates
GET/PUT             /admin/orders
POST                /admin/orders/{id}/status
GET/POST/PUT/DELETE /admin/discounts
GET/PUT             /admin/users
GET/PUT             /admin/config
```

---

## Security Design

| Concern | Approach |
|---|---|
| Authentication | Google OAuth only — no passwords stored |
| Authorization | JWT (15-min access token) + HTTP-only refresh token (7 days) |
| Admin protection | Middleware checks `admins` table + role |
| Upload safety | MIME type check + extension whitelist + ClamAV scan |
| File naming | UUID-renamed on save — original filename never used |
| SQL injection | SQLAlchemy ORM — no raw SQL |
| Rate limiting | slowapi: 5 req/min on auth, 10/min on uploads |
| CORS | Restricted to `FRONTEND_URL` env var only |
| Secrets | All in `.env`, never committed |
| Admin approval | Time-limited signed token in approval email (1-hour expiry) |
| Input validation | Pydantic v2 strict models on all endpoints |

---

## Notification Flows

### On Order Placed
1. **WhatsApp** → configured `notification_mobile` (shop owner)
   - Message: "New order ORD-2024-0001 placed by [customer name]. Amount: ₹XXX"
2. **Email** → customer's email
   - Order confirmation with summary

### On Admin Registration
1. **Email** → `admin_approval_email` config value
   - Link: `GET /admin/approve/{signed_token}` (expires 1 hour)

### On Order Status Change (public note)
1. **Email** → customer (if note is marked public)

---

## Customer Order Status Bar

The `OrderDetail` page shows a visual step-progress bar:

```
● Pending  →  ● In Progress  →  ○ Completed
[timestamp]    [timestamp]       [waiting]

Note from shop: "Your cards are being printed."
```

- Steps come from `order_status_history` table
- Only `is_public = true` notes shown to customers
- Admin sees all notes (internal + public)

---

## WhatsApp Setup (Meta Cloud API — Free Tier)

1. Create Meta Business Account → verify phone number
2. Create a WhatsApp Business App in Meta Developer Console
3. Get `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN`
4. 1,000 free conversations/month — sufficient for small shop
5. **Dev fallback**: set `WHATSAPP_PROVIDER=twilio` in `.env` to use Twilio sandbox

---

## Implementation Phases

### Phase 1 — Foundation
- [ ] Backend: project scaffold, config, DB models, Alembic migrations
- [ ] Backend: Google OAuth + JWT auth flow
- [ ] Frontend: Vite + React + Tailwind setup, router, auth pages

### Phase 2 — Product & Template Catalog
- [ ] Backend: products, variants, templates endpoints
- [ ] Backend: seed data (sample products + templates)
- [ ] Frontend: Landing page, Products page, ProductDetail page

### Phase 3 — Cart & Upload
- [ ] Backend: cart endpoints
- [ ] Backend: upload endpoint (ClamAV + validation)
- [ ] Frontend: Cart page, ImageUploader component

### Phase 4 — Orders & Address
- [ ] Backend: order creation, address CRUD
- [ ] Frontend: Checkout, Orders list, OrderDetail + status bar
- [ ] Backend: discount evaluation on order placement

### Phase 5 — Notifications
- [ ] Backend: Gmail SMTP service (order confirmation, status updates)
- [ ] Backend: WhatsApp service (Meta Cloud API + Twilio fallback)

### Phase 6 — Admin Panel
- [ ] Backend: admin registration + email approval flow
- [ ] Backend: all admin CRUD endpoints + order status management
- [ ] Frontend: Admin dashboard + all admin pages

### Phase 7 — Security Hardening & Polish
- [ ] Rate limiting, CORS lockdown
- [ ] Input sanitization audit
- [ ] ClamAV integration testing
- [ ] End-to-end testing of all flows
