'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  title?: string;
  backLink?: {
    href: string;
    label: string;
  };
  actions?: React.ReactNode;
}

export default function Navbar({ title, backLink, actions }: NavbarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/' },
    { name: 'Hubs', href: '/hubs' },
    { name: 'Reports', href: '/reports' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Users', href: '/users' },
  ];

  return (
    <div className="bg-white shadow-sm border-b sticky top-0 z-10">
      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Int Tracker
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href || pathname.startsWith(item.href + '/')
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right side - can be customized per page */}
          <div className="flex items-center space-x-4">
            {actions}
          </div>
        </div>
      </div>

      {/* Page-specific header (if title or backLink provided) */}
      {(title || backLink) && (
        <div className="bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                {backLink && (
                  <Link
                    href={backLink.href}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    ← {backLink.label}
                  </Link>
                )}
                {title && (
                  <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
