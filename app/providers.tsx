'use client';

import { SessionProvider } from 'next-auth/react';

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: any;
}) {
  return (
    <SessionProvider 
      session={session}
      basePath="/api/auth"
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={false} // Don't refetch on window focus to reduce requests
    >
      {children}
    </SessionProvider>
  );
}
