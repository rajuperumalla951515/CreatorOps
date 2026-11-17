# React dashboard

This directory contains the primary CreatorOps web application, built with
React, TypeScript, and Vite.

## Structure

```text
src/
├── components/       Shared layout, auth, navigation, and loading components
├── pages/
│   ├── app/          Authenticated creator workspace pages
│   ├── auth/         Login and signup pages
│   └── public/       Public marketing and policy pages
├── services/         Backend API clients
├── types/            Shared TypeScript domain types
└── utils/             Supabase and browser utilities
```

## Commands

```powershell
npm install
npm run dev
npm run build
```

The API base URL is configured through the frontend environment settings. See
the root [deployment guide](../../DEPLOYMENT.md) before deploying.

## Request flow

Pages use `src/services/api.ts` to call FastAPI. Authentication state is
handled by `src/utils/supabase.ts` and the route guards. Keep API calls and
shared domain types out of individual page components so the application stays
easy to navigate.
