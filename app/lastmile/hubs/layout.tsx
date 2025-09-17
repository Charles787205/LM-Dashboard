'use client';

import { usePathname } from 'next/navigation';
import HubSidebar from '@/components/HubSidebar';

export default function HubsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const hubId = pathname.split('/')[3]; // Extract hubId from path like /lastmile/hubs/[hubId]

  return (
    <div className="min-h-screen bg-gray-50 flex">
   
      <div className="flex-1 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
