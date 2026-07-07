# VTDhub - Multi-Vendor E-Commerce Backend

![NestJS](https://img.shields.io/badge/NestJS-11-red)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.15-2D3748)
![License](https://img.shields.io/badge/License-Private-yellow)
![Redis](https://img.shields.io/badge/Redis-red)

## 📖 Overview

RESTful API backend for a multi-vendor e-commerce marketplace, supporting authentication, product management with variants, shopping cart, orders, promotions, shipping fee calculation by vendor count, and payments (COD + VNPay).

## 🛠 Tech Stack

| Layer          | Technology                    |
| -------------- | ----------------------------- |
| Framework      | NestJS 11                     |
| Language       | TypeScript 5.7                |
| Database       | PostgreSQL 16 (Prisma ORM)    |
| Cache          | Redis                         |
| Authentication | JWT (Access + Refresh tokens) |
| Validation     | Zod + nestjs-zod              |
| Payment        | VNPay Sandbox                 |
| File Storage   | Cloudinary                    |
| Email          | Nodemailer + Pug templates    |
| Real-time      | Socket.IO                     |
| Deployment     | Render + Supabase             |

## ✨ Features

- [x] **Authentication** - JWT login/register, password reset via email
- [x] **RBAC 2-Layer** - System roles (admin) + Vendor roles (staff)
- [x] **Multi-Vendor** - Independent vendor shops with ownership verification
- [x] **Products** - CRUD with variants (size, color, attributes JSON), publish workflow
- [x] **Categories** - Hierarchical category tree
- [x] **Orders** - Multi-vendor orders with shipping fee calculation
- [x] **Shipping Fee** - 30,000 VND × number of vendors in order
- [x] **Payments** - COD (cash on delivery) + VNPay (online payment)
- [x] **Promotions** - Percentage, Fixed amount, Buy X Get Y
- [x] **Carts** - Shopping cart with add/update/remove items
- [x] **Images** - Upload to Cloudinary
- [x] **Excel Import/Export** - Bulk operations for products, orders
- [x] **Cron Jobs** - Auto-cancel pending payments after 24h
- [x] **Soft Delete** - Global via Prisma Client Extension
- [x] **Email Notifications** - Welcome email, order confirmation

## 📁 Project Structure

```text
src/
├── apps/
│   ├── auth/                 # JWT authentication, login, register
│   ├── users/                # User management, profile
│   ├── roles/                # Role definitions
│   ├── permissions/          # Permission management
│   ├── role-permissions/     # Role ↔ Permission mappings
│   ├── user-system-role/     # User ↔ System role
│   ├── user-vendor-roles/    # User ↔ Vendor ↔ Role
│   ├── vendors/              # Vendor/shop management
│   ├── products/             # Product CRUD, publish workflow
│   ├── product-variants/     # Size, color, attributes
│   ├── product-images/       # Image upload (Cloudinary)
│   ├── product-categories/   # Product ↔ Category
│   ├── categories/           # Hierarchical categories
│   ├── orders/               # Order management
│   ├── order-items/          # Line items
│   ├── order-addresses/      # Shipping/Billing addresses
│   ├── order-promotions/     # Applied promotions
│   ├── promotions/           # Discount codes
│   ├── payments/             # Payment (COD, VNPay)
│   ├── carts/                # Shopping cart
│   └── cart-items/           # Cart line items
│
├── common/
│   ├── prisma/               # PrismaService & extensions
│   ├── guards/               # RBAC guards
│   ├── decorators/           # Custom decorators
│   ├── interceptors/         # Response formatting & logging
│   ├── pipes/                # Validation pipes
│   ├── middleware/           # Custom middleware
│   └── utils/                # Helpers (pagination, mail, cache, excel, ...)
│
├── events/                   # Socket.IO gateway
├── catch-everything/         # Global exception filter
├── testing/                  # Test utilities
└── main.ts                   # Application entry point
```

## 🗄️ Database Schema

**21 Prisma entities:** Users, Vendors, Products, ProductVariants, ProductImages, Categories, Orders, OrderItems, OrderAddresses, OrderPromotions, Promotions, Payments, Carts, CartItems, Roles, Permissions, RolePermissions, UserSystemRoles, UserVendorRoles.

[View Database Schema on DrawSQL](https://drawsql.app/teams/vthanhdong/diagrams/database-nestjs-ecommerce)

## 📚 API Documentation

**Swagger UI:** https://ecommerce-backend-nestjs-3yvn.onrender.com/api-docs

### 🔑 Test Account

| Role        | Email                 | Password      |
| ----------- | --------------------- | ------------- |
| Super Admin | superAdmin@vtdhub.com | superadmin123 |

## 🚀 Setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose

### Installation

```bash
# Clone repository
git clone https://github.com/vthanhdong05/ecommerce-backend-nestjs.git

# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Run with Docker (PostgreSQL + Redis)

```bash
# Start PostgreSQL and Redis containers
docker-compose up -d postgres redis

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Start development server
npm run start:dev
```

### Run fully containerized

```bash
docker-compose up -d
```

### Environment Variables

| Variable               | Description                         |
| ---------------------- | ----------------------------------- |
| `DATABASE_URL`         | PostgreSQL connection string        |
| `DIRECT_URL`           | Direct connection (migrations only) |
| `JWT_SECRET`           | Access token signing                |
| `REFRESH_TOKEN_SECRET` | Refresh token signing               |
| `VNPAY_TMN_CODE`       | VNPay merchant code                 |
| `VNPAY_HASH_SECRET`    | VNPay API secret                    |
| `CLOUDINARY_*`         | Cloudinary credentials              |
| `MAIL_*`               | SMTP email credentials              |
| `REDIS_*`              | Redis connection                    |

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Coverage report
npm run test:cov
```

## 📄 License

Private - for portfolio and educational purposes only.

---

**Author:** Võ Thành Đông
**Email:** v.thanhdong05@gmail.com
**LinkedIn:** https://www.linkedin.com/in/thành-đông-võ-1aa270420
**GitHub:** https://github.com/vthanhdong05
