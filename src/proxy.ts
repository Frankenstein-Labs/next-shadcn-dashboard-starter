import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

// Each /dashboard page and API route checks auth itself (`auth.protect()` / `auth()`).
// clerkMiddleware() only attaches the auth context to every request.
//
// signInUrl/signUpUrl must be passed here: `auth.protect()` reads them from the
// middleware request data, and without them it falls back to the Clerk-hosted
// Account Portal (https://<instance>.accounts.dev/sign-in) instead of these pages.
const middleware = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  ? clerkMiddleware({
      signInUrl: '/auth/sign-in',
      signUpUrl: '/auth/sign-up'
    })
  : (_request: NextRequest) => NextResponse.next();

export default middleware;
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)'
  ]
};
