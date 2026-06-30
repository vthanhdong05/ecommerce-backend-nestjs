# Multi-Vendor E-Commerce Backend (NestJS)

A production-oriented REST API for a multi-vendor e-commerce marketplace, built with NestJS, Prisma, and PostgreSQL. Supports independent vendor shops, role-based access control scoped per vendor, product variants, promotions, and order management — the core domain logic behind platforms like Shopee or Etsy.

**Live API:** _coming soon_
**API Docs (Swagger):** `/api-docs` _(once deployed)_

## Why this project

Most CRUD tutorials stop at "create a product." This project goes further into the parts that are actually hard in a real marketplace backend:

- **Two-tier authorization** — a global admin can manage everything, while a vendor can only act within their own shop. The same service layer powers both `/products` (admin) and `/vendors/:vendorId/products` (vendor-scoped) controllers, with ownership checks enforced at the database query level, not just at the route.
- **Permission system, not just roles** — permissions are computed per route + HTTP method (`[/products]_[CREATE]`), checked against role-permission mappings stored in the database, so access control changes don't require a redeploy.
- **Soft delete and audit fields applied globally** — handled once via a Prisma Client Extension, not repeated in every service (`deletedAt`, `createdBy`, slug generation are automatic for every model).
- **Price/stock integrity between Product and its default variant** — every product implicitly owns a hidden default `ProductVariant`, kept in sync on update so order pricing always reads from the variant layer, never directly from the product.

## Tech Stack

| Layer               | Choice                                                          |
| ------------------- | --------------------------------------------------------------- |
| Framework           | NestJS 11                                                       |
| Database            | PostgreSQL (Prisma ORM)                                         |
| Validation          | Zod (via `nestjs-zod`), generated directly into Swagger/OpenAPI |
| Auth                | JWT (access + refresh), cookie or Bearer header                 |
| Cache               | Redis (`@keyv/redis`), with graceful degradation if unavailable |
| File storage        | Cloudinary                                                      |
| Email               | Nodemailer + Pug templates                                      |
| Realtime            | Socket.IO (order/vendor events)                                 |
| Excel import/export | ExcelJS, with per-vendor scoping on import                      |
| Containerization    | Docker (multi-stage build)                                      |
| Testing             | Jest (unit + e2e)                                               |

## Architecture highlights

**Domain-driven module structure.** Each business entity (`products`, `orders`, `vendors`, `promotions`...) is a self-contained NestJS module with its own controller, service, DTO (Zod schema), and Prisma-backed entity — 20+ modules following the same convention, making the codebase predictable to navigate.

**Database layer extends Prisma, doesn't wrap it.** Instead of a generic repository pattern, `PrismaService` uses Prisma Client Extensions (`$extends`) to inject cross-cutting behavior into every query:

```ts
findMany: ({ args, query, model }) => {
  if (!JUNCTION_TABLES.includes(model)) {
    args.where = { ...args.where, deletedAt: null };
  }
  return query(args);
};
```

This means soft delete, slug generation, and `createdBy` tracking are correct by construction — a developer adding a new model gets these for free, with no risk of forgetting a `where: { deletedAt: null }` somewhere.

**Database connection split for pooled vs. direct access.** The app connects through Supabase's connection pooler (`pgbouncer`) for normal queries, but uses a direct connection (`directUrl`) for Prisma migrations — a detail that's easy to miss and causes silent migration failures in serverless/pooled Postgres setups if skipped.

## Local Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Setup

```bash
git clone https://github.com/vthanhdong05/ecommerce-backend-nestjs.git
cd ecommerce-backend-nestjs
cp .env.example .env   # fill in your local values
npm install
```

### Run with Docker (Postgres + Redis, app on host)

```bash
docker-compose up -d postgres redis
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

API available at `http://localhost:8888/api`
Swagger UI at `http://localhost:8888/api-docs`

### Run fully containerized

```bash
docker-compose up -d
```

## Environment Variables

See [`.env.example`](./.env.example) for the full list. Key variables:

| Variable                           | Purpose                                    |
| ---------------------------------- | ------------------------------------------ |
| `DATABASE_URL`                     | Pooled connection string (runtime queries) |
| `DIRECT_URL`                       | Direct connection string (migrations only) |
| `JWT_SECRET`, `RESET_TOKEN_SECRET` | Auth token signing                         |
| `REDIS_HOST`, `REDIS_PORT`         | Optional — falls back gracefully if unset  |
| `CLOUDINARY_*`                     | Image upload provider                      |

## Database Schema

The data model covers: users, vendors, role-based permissions (system + per-vendor), products with variants and images, categories, multi-vendor orders, promotions, and carts. Full schema in [`prisma/schema.prisma`](./prisma/schema.prisma).

## Testing

```bash
npm run test        # unit tests
npm run test:e2e    # end-to-end tests
npm run test:cov    # coverage report
```

## Deployment

Containerized via a multi-stage Dockerfile (builder stage compiles + generates Prisma Client, production stage runs `prisma migrate deploy` on boot, then starts the compiled app). Deployed on Render, connected to a managed PostgreSQL instance on Supabase.

## Author

**[Your name]** — [LinkedIn] · [GitHub] · [Portfolio]
