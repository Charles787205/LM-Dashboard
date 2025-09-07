'use client';

import { TransportSidebar } from '@/components';

export default function TransportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      <div className="w-64 flex-shrink-0">
        <TransportSidebar className="h-full" />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
