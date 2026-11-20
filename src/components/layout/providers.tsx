'use client';
import { ClerkProvider } from '@clerk/nextjs';
import React from 'react';
import { ActiveThemeProvider } from '../themes/active-theme';
import QueryProvider from './query-provider';

export default function Providers({
  activeThemeValue,
  children
}: {
  activeThemeValue: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <ActiveThemeProvider initialTheme={activeThemeValue}>
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? (
          <ClerkProvider
            // Without an explicit fallback, Clerk sends users to "/" after
            // sign-in/sign-up — here that is the marketing landing page, so a
            // successful login looks like nothing happened.
            signInUrl='/auth/sign-in'
            signUpUrl='/auth/sign-up'
            signInFallbackRedirectUrl='/dashboard/overview'
            signUpFallbackRedirectUrl='/dashboard/overview'
            appearance={{
              variables: {
                colorPrimary: 'var(--primary)',
                colorPrimaryForeground: 'var(--primary-foreground)',
                colorDanger: 'var(--destructive)',
                colorBackground: 'var(--card)',
                colorForeground: 'var(--foreground)',
                colorMuted: 'var(--muted)',
                colorMutedForeground: 'var(--muted-foreground)',
                colorInput: 'var(--input)',
                colorInputForeground: 'var(--foreground)',
                colorBorder: 'var(--border)',
                colorRing: 'var(--ring)',
                fontFamily: 'var(--font-sans)'
              }
            }}
          >
            <QueryProvider>{children}</QueryProvider>
          </ClerkProvider>
        ) : (
          <QueryProvider>{children}</QueryProvider>
        )}
      </ActiveThemeProvider>
    </>
  );
}
