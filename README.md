# safeTalk

Anonymous, pay-per-minute emotional support marketplace built with **React Native + Expo SDK 54**.

## Features

- **Seeker flow**: Anonymous signup, browse listeners, chat/voice/video sessions, wallet recharge
- **Listener flow**: Multi-step onboarding, ID verification UI, dashboard with online toggle
- **Mock services**: `MockCallService` and `MockPaymentService` — fully demoable without API keys
- **Real backend**: Supabase Auth, Postgres, Realtime chat, Edge Functions for wallet/billing

## Quick Start

```bash
cd safeTalk
npm install
npm start
```

Scan the QR code with **Expo Go** (SDK 54) on your iPhone or Android device.

## Dev Login (no phone OTP needed)

Phone OTP requires Twilio configuration in Supabase. For development:

1. Open the app → Phone screen
2. Use **Dev Sign In** with any email/password (e.g. `test@safetalk.app` / `password123`)
3. Complete role selection and profile setup

## Project Structure

```
app/           # Expo Router screens
components/    # Reusable UI
constants/     # Theme, categories, mock data
services/      # Auth, wallet, billing, chat, call, payment (interfaces + mocks)
store/         # Zustand state
types/         # TypeScript types
lib/           # Supabase client
```

## Swapping Mock Services

- **Calls**: Change import in `services/call/index.ts` → `AgoraCallService`
- **Payments**: Change import in `services/payment/index.ts` → `RazorpayPaymentService`

## Supabase

- Database schema applied via migration (`profiles`, `listener_profiles`, `sessions`, `messages`, `transactions`)
- Edge Functions: `wallet-recharge`, `session-billing`
- Wallet balance is **never** updated client-side — only via Edge Functions

## Environment

Copy `.env` and set:

```
EXPO_PUBLIC_SUPABASE_URL=your_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```
