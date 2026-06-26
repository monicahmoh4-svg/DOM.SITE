# Deriv Trading Platform

A production-grade third-party Deriv trading platform with real-time WebSocket integration, copy trading, M-Pesa payments, and full admin panel.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │   NGINX     │  ← Reverse proxy, rate limiting,
                    │  :80/:443   │    SSL termination, WebSocket proxy
                    └──────┬──────┘
               ┌───────────┴───────────┐
        ┌──────▼──────┐         ┌──────▼──────┐
        │  Frontend   │         │   Backend   │
        │  Next.js    │         │   NestJS    │
        │   :3000     │         │    :5000    │
        └─────────────┘         └──────┬──────┘
                                       │
                          ┌────────────┼────────────┐
                   ┌──────▼──────┐ ┌──▼──┐  ┌──────▼──────┐
                   │ PostgreSQL  │ │Redis│  │  Deriv API   │
                   │   :5432     │ │:6379│  │  WebSocket   │
                   └─────────────┘ └─────┘  └─────────────┘
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local dev)
- A Deriv account and App ID (register at https://api.deriv.com)
- M-Pesa Daraja API credentials (https://developer.safaricom.co.ke)

### 1. Clone & Configure

```bash
git clone <your-repo>
cd deriv-platform

# Configure backend
cp backend/.env.example backend/.env
# Edit backend/.env with your real values

# Configure frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env
```

### 2. Critical .env Values

```env
# Generate with: openssl rand -hex 64
JWT_SECRET=<64-char-hex>
JWT_REFRESH_SECRET=<different-64-char-hex>
ENCRYPTION_KEY=<64-char-hex>

# From https://api.deriv.com → Register App
DERIV_APP_ID=your_app_id

# From https://developer.safaricom.co.ke
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=...
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://yourdomain.com
```

### 3. Deploy with Docker

```bash
# Production
docker compose up -d

# Check status
docker compose ps
docker compose logs -f backend

# View backend API docs (dev only)
open http://localhost:5000/api/docs
```

### 4. Local Development

```bash
# Start dependencies only
docker compose up -d postgres redis

# Backend
cd backend
npm install
npm run start:dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## Key Features

| Feature | Implementation |
|---------|---------------|
| Authentication | JWT + refresh tokens, bcrypt, 2FA (TOTP) |
| Deriv Integration | Native WebSocket per user session |
| Real-time Prices | Socket.IO gateway → client |
| Trade Execution | Full Deriv contract lifecycle |
| Copy Trading | Event-driven broadcast engine |
| M-Pesa Deposits | STK Push (Lipa na M-Pesa) |
| M-Pesa Withdrawals | B2C Payout API |
| Admin Panel | User mgmt, KYC, audit logs |
| Security | Helmet, rate limiting, encrypted API keys |

## Default Admin Account
- Email: `admin@derivplatform.com`
- Password: `Admin@123!`
- **Change this immediately after first login!**

## Production Checklist

- [ ] Change default admin password
- [ ] Set strong JWT secrets (64+ char random hex)
- [ ] Set ENCRYPTION_KEY (64+ char random hex)
- [ ] Configure real SMTP credentials
- [ ] Set DERIV_APP_ID from api.deriv.com
- [ ] Configure M-Pesa production credentials
- [ ] Set MPESA_ENVIRONMENT=production
- [ ] Configure CORS_ORIGINS to your domain
- [ ] Enable DB_SSL=true for production DB
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure MPESA_CALLBACK_URL to public HTTPS URL
- [ ] Remove Swagger docs (set NODE_ENV=production)

## Environment Variables Reference

See `backend/.env.example` and `frontend/.env.example` for full reference.

## Tech Stack

- **Backend**: NestJS, TypeORM, PostgreSQL, Redis/BullMQ, Socket.IO, ws
- **Frontend**: Next.js 14, TailwindCSS, TanStack Query, Zustand, Socket.IO
- **Infrastructure**: Docker, Nginx, GitHub Actions
- **Integrations**: Deriv WebSocket API, M-Pesa Daraja API (STK Push + B2C)
