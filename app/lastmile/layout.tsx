'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components';
import HubSidebar from '@/components/HubSidebar';

export default function LastMileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHubRoute = pathname.startsWith('/lastmile/hubs');
  const hubId = isHubRoute ? pathname.split('/')[3] : undefined;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 flex-shrink-0">
        {isHubRoute ? (
          <HubSidebar currentPath={pathname} hubId={hubId} />
        ) : (
          <Sidebar />
        )}
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
