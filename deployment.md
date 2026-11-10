# OnboardX Enterprise — Zero-Dollar ($0) Free Deployment Guide
*Production-Grade Next.js 15 Deployment Walkthrough for SMEs and Startups*

---

## 1. Executive Summary & Cost Breakdown

OnboardX is engineered as a modern, high-performance enterprise onboarding operating system with full TypeScript safety, Next.js 15 App Router architecture, and cryptographic AES-256-GCM data security.

You can deploy and run OnboardX in production for **$0.00 / month forever** using industry-standard enterprise free tiers:

| Component | Recommended Service | Free Tier Allowance | Real Cost |
| :--- | :--- | :--- | :--- |
| **Web Application & API** | **Vercel Hobby Tier** | 100 GB Bandwidth, Unlimited Edge Deployments, Global Anycast CDN, Automatic SSL | **$0.00 / mo** |
| **PostgreSQL Database** *(Optional)* | **Neon Serverless Postgres** | 0.5 GB Storage, Autoscaling, Free Connection Pooling, Branching | **$0.00 / mo** |
| **Database Alternative** | **Supabase Free Tier** | 500 MB Database, 50,000 Monthly Active Users, Free SSL | **$0.00 / mo** |
| **Default Internal Storage** | **Built-in OnboardX Store** | High-performance in-memory + disk-synced state machine (`lib/db.ts`) | **$0.00 / mo** |
| **SSL / HTTPS** | **Let's Encrypt / Vercel** | Automated SSL renewal, HTTP/2 & HTTP/3 termination | **$0.00 / mo** |
| **Uptime Monitoring** | **BetterStack / UptimeRobot** | 50 monitors, 5-minute intervals, email/SMS incident alerts | **$0.00 / mo** |
| **Total Monthly Investment** | — | — | **$0.00 / mo** |

---

## 2. Choosing Your Deployment Architecture

OnboardX supports three zero-cost production deployment pathways:

```mermaid
graph TD
    A[OnboardX Codebase] --> B{Choose $0 Strategy}
    B -->|Fastest: 3 Minutes| C[Option A: Vercel Serverless]
    B -->|Containerized / Persistent Disk| D[Option B: Render Web Service]
    B -->|Self-Hosted Hardware / Cloud| E[Option C: Oracle Cloud Always Free]
    
    C --> F[Vercel Global Edge CDN]
    F --> G[Built-in Memory Store or Neon Postgres]
    
    D --> H[Persistent Docker / Node Container]
    H --> I[/data/server-storage.json on Disk]
    
    E --> J[Docker Compose + Caddy SSL]
```

### Option A: Vercel (Recommended — Fastest & Easiest)
- **Time to Deploy**: ~3 minutes
- **Best for**: Serverless performance, instant preview branches, automated global CDN.
- **Storage Mode**: Runs out of the box with the self-healing memory store, or connects to Neon Serverless Postgres in 1 click.

### Option B: Render.com (Containerized with Persistent Disk)
- **Time to Deploy**: ~6 minutes
- **Best for**: Teams that want a persistent Node.js process where the local `/data/server-storage.json` file survives across server restarts.

### Option C: Oracle Cloud Always Free (Self-Hosted VPS)
- **Time to Deploy**: ~15 minutes
- **Best for**: Complete data sovereignty. Oracle provides 4 ARM Ampere cores, 24 GB RAM, and 200 GB NVMe storage 100% free forever.

---

## 3. Option A: Step-by-Step Vercel Deployment Walkthrough (Recommended)

### Step 1: Push Code to GitHub / GitLab / Bitbucket
Ensure your repository is initialized and pushed to a remote git provider:

```bash
git init
git add .
git commit -m "feat: initial production release of OnboardX"
git branch -M main
git remote add origin https://github.com/YOUR_ORGANIZATION/onboardx.git
git push -u origin main
```

---

### Step 2: Connect Repository to Vercel
1. Navigate to [vercel.com](https://vercel.com) and sign in (or create a free account with GitHub).
2. Click **"Add New..."** → **"Project"**.
3. Select your `onboardx` repository from the list and click **"Import"**.
4. Vercel automatically detects **Next.js**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `next build` (Default)
   - **Output Directory**: `.next` (Default)
   - **Install Command**: `npm install` (Default)

---

### Step 3: Configure Environment Variables
In the Vercel project configuration screen, open the **Environment Variables** accordion and add the following variables:

| Variable Name | Required | Default / Recommended Value | Description |
| :--- | :---: | :--- | :--- |
| `NODE_ENV` | **Yes** | `production` | Sets Next.js to production optimization mode. |
| `PII_SECRET_KEY` | **Yes** | `[Generate 32-byte hex]` | Secret key used for AES-256-GCM cryptographic encryption of sensitive tax/SSN data. |
| `DATABASE_URL` | *Optional* | `postgresql://...` | Connection string to your free Neon or Supabase PostgreSQL database. If omitted, OnboardX runs on its built-in zero-config in-memory engine. |
| `NEXT_PUBLIC_APP_URL` | *Optional* | `https://your-project.vercel.app` | Base canonical domain for webhook callbacks and invite links. |

> [!TIP]
> **Generate a Secure Cryptographic Key**: Run this one-line command in your terminal to generate an enterprise-grade 32-byte secret key:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```
> Paste this output as the value for `PII_SECRET_KEY`.

---

### Step 4: Click Deploy & Verify
1. Click **"Deploy"**.
2. Vercel will run `npm install`, compile TypeScript, and optimize all 56 static and dynamic routes.
3. Once the build completes (~60-90 seconds), you will receive your live URL:
   `https://onboardx-[team].vercel.app`
4. Visit your deployment and verify:
   - **Landing Page**: `https://your-domain.vercel.app/`
   - **HR Command Center**: `https://your-domain.vercel.app/dashboard`
   - **New Hire Portal**: `https://your-domain.vercel.app/portal`
   - **Live Currency API**: `https://your-domain.vercel.app/api/v1/currency`

---

## 4. Connecting a $0 Serverless Database (Neon PostgreSQL)

If your enterprise requires persistent relational storage across independent serverless invocations, you can pair Vercel with **Neon Serverless Postgres** ($0 Free Forever):

### Step 1: Create Free Neon Database
1. Go to [neon.tech](https://neon.tech) and sign up with GitHub.
2. Click **"Create Project"**:
   - **Project Name**: `onboardx-prod`
   - **Postgres Version**: `16` or `17`
   - **Region**: Choose the region closest to your Vercel deployment (e.g., `US East (N. Virginia)` / `iad1` or `Frankfurt` / `fra1`).
3. Neon immediately displays your `DATABASE_URL` connection string:
   ```text
   postgresql://onboardx_owner:AbCdEf123456@ep-cool-butterfly-123456.us-east-2.aws.neon.tech/onboardx?sslmode=require
   ```

### Step 2: Push Prisma Schema to Neon
Run the following from your local terminal with your Neon connection string:

```bash
DATABASE_URL="your-neon-connection-string" npx prisma db push
```

To seed the initial departments, roles, and template definitions:
```bash
DATABASE_URL="your-neon-connection-string" npm run db:seed
```

### Step 3: Add `DATABASE_URL` to Vercel
1. In your Vercel Dashboard, go to **Settings** → **Environment Variables**.
2. Add `DATABASE_URL` with your Neon connection string.
3. Click **Deployments** → Select the latest deployment → Click **"Redeploy"**.

Your deployment is now backed by a dedicated cloud PostgreSQL database with automated branching and connection pooling.

---

## 5. Option B: Step-by-Step Render.com Deployment Walkthrough

Render.com offers a free web service tier that runs persistent Docker containers or Node processes:

1. Sign up at [render.com](https://render.com).
2. Click **"New +"** → **"Web Service"**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Name**: `onboardx-app`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free` ($0/mo)
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PII_SECRET_KEY`: `[32-byte hex generated key]`
6. Click **"Create Web Service"**. Render will build and deploy your app at `https://onboardx-app.onrender.com`.

---

## 6. Option C: Self-Hosting with Docker ($0 Oracle Cloud Always Free)

If you operate your own server or use an Oracle Cloud Always Free instance (4 vCPU, 24 GB RAM):

### Step 1: Create a Production `Dockerfile`
A lightweight, multi-stage standalone Dockerfile for OnboardX:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/data ./data

RUN chown -R nextjs:nodejs /app/data

USER nextjs
EXPOSE 3000

CMD ["npm", "run", "start"]
```

### Step 2: Run with Docker Compose
```bash
docker compose up -d
```
Your instance will be available on `http://localhost:3000` with persistent local disk storage mounted to `/data`.

---

## 7. Connecting a Custom Domain with Free SSL

1. In your **Vercel Dashboard**, go to **Settings** → **Domains**.
2. Enter your custom domain (e.g., `onboarding.yourcompany.com` or `onboardx.io`).
3. Vercel provides DNS records:
   - For subdomains (`onboarding.yourcompany.com`): Add a `CNAME` record pointing to `cname.vercel-dns.com`.
   - For apex domains (`yourcompany.com`): Add an `A` record pointing to `76.76.21.21`.
4. Vercel automatically requests, verifies, and renews a free **Let's Encrypt Wildcard SSL Certificate**. HTTPS is enforced automatically with zero configuration.

---

## 8. Post-Deployment Verification & Health Checks

Run these smoke tests against your live deployment URL to verify system health:

```bash
# 1. Health check & landing page HTTP status
curl -I https://your-domain.vercel.app/

# 2. Check active currency configuration
curl https://your-domain.vercel.app/api/v1/currency

# 3. Test currency switching API
curl -X POST https://your-domain.vercel.app/api/v1/currency \
  -H "Content-Type: application/json" \
  -d '{"currency":"EUR"}'

# 4. Verify employee roster API
curl https://your-domain.vercel.app/api/v1/employees

# 5. Verify cryptographic tamper-evident audit logs
curl https://your-domain.vercel.app/api/v1/audit-logs
```

---

## 9. 24/7 Free Uptime Monitoring Setup

Keep your deployment monitored with 100% free automated alert pings:

1. Go to [betterstack.com](https://betterstack.com) or [uptimerobot.com](https://uptimerobot.com).
2. Create a new HTTP(s) Monitor:
   - **URL**: `https://your-domain.vercel.app/api/v1/currency`
   - **Interval**: 3 or 5 minutes
   - **Expected Status**: `200 OK`
3. Configure notification channels (Email, Slack webhook, or SMS).
4. You will be instantly alerted if your deployment experiences downtime.

---

## 10. Frequently Asked Questions (FAQ)

### Q: Does Vercel's serverless file system lose new hires on cold restarts?
**A**: Vercel functions run in an ephemeral execution environment. OnboardX is designed with a self-healing architecture:
- In memory, the application seeds and retains the active cohort for the lifetime of the warm container.
- For 100% persistent cross-session production data that survives cold container re-initializations, connect the **free Neon PostgreSQL** database described in Section 4.

### Q: Are there any hidden fees or charges on the Vercel Hobby Tier?
**A**: No. The Vercel Hobby tier is completely free for personal and non-commercial/internal operational tools. It includes 100 GB of egress bandwidth and 100,000 serverless execution units per month, which easily accommodates internal onboarding for growing SMEs.

### Q: How do I update OnboardX when new features are added?
**A**: Push your commits to your GitHub `main` branch. Vercel automatically triggers a zero-downtime rolling build, runs checks, and switches live traffic within 60 seconds.
