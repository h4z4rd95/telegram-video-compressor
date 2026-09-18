# Web Video Compressor

This repository has been cut over from the legacy Python Telegram bot to a Next.js web application in `apps/web`.

## Current App

- Frontend and server: Next.js 15 App Router
- Auth: `next-auth` with Google, email, and Telegram-oriented credential scaffolding
- Data layer: Prisma with PostgreSQL
- Background infra targets: Redis queueing and S3-compatible object storage
- Tests: Vitest with unit, integration, UI, and smoke coverage

## Repository Layout

- `apps/web`: main product web app
- `docker-compose.yml`: local PostgreSQL, Redis, and MinIO services
- `.env.example`: example environment variables for local setup
- `bot.py`: deprecated legacy entrypoint kept only to fail fast with a migration message
- `docs/superpowers/plans/2026-09-18-web-video-compressor-saas.md`: implementation plan

## Local Setup

1. Start local infrastructure:

   ```bash
   docker compose up -d
   ```

2. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

3. Install web app dependencies:

   ```bash
   cd apps/web
   npm install
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

5. Run the test suite:

   ```bash
   npm test
   ```

6. Create a production build:

   ```bash
   npm run build
   ```

## Environment Variables

The local example file includes the following environment variables for the current web stack and near-term integrations:

- `DATABASE_URL`
- `REDIS_URL`
- `S3_ENDPOINT`
- `S3_BUCKET`
- `APP_URL`
- `NEXTAUTH_URL`
- `AUTH_SECRET` or `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `EMAIL_SERVER`
- `EMAIL_FROM`
- `TELEGRAM_BOT_USERNAME`
- `TELEGRAM_WEBHOOK_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `ZARINPAL_MERCHANT_ID`
- `AGHAPAY_API_KEY`

## Legacy Bot Status

The historical Python bot entrypoint is deprecated. Running:

```bash
python bot.py
```

now exits immediately and directs you to run the web app in `apps/web` instead.

## Notes

- `docker-compose.yml` brings up only the local infrastructure dependencies; it does not run the web app itself.
- MinIO is provisioned as the local S3-compatible endpoint on ports `9000` and `9001`.
- Some payment and Telegram flows are scaffolded and still depend on real provider credentials and follow-up integration work.

## License

This project is licensed under the MIT License. See `LICENSE` for details.
