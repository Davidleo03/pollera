'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Clock, FileText, BarChart3, Home, Pill, Package, Menu, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function Sidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Inicio', href: '/', icon: Home },
    { label: 'Personal', href: '/personal', icon: Users },
    { label: 'Asistencia', href: '/asistencia', icon: Clock },
    { label: 'Nómina', href: '/nomina', icon: FileText },
    { label: 'Medicinas', href: '/medicinas', icon: Pill },
    { label: 'Insumos', href: '/insumos', icon: Package },
    { label: 'Reportes', href: '/reportes', icon: BarChart3 },
  ];

  const handleLinkClick = () => {
    if (isMobile) setIsOpen(false);
  };

  const sidebarContent = (
    <>
      {isMobile && (
        <div className="p-4 border-b border-sidebar-border flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center">
              <Users size={24} className="text-sidebar-accent-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Sistema</h1>
              <p className="text-sm text-opacity-90">Admin</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-primary-burgundy-light rounded-lg">
            <X size={24} />
          </button>
        </div>
      )}
      <nav className={`flex-1 p-4 ${isMobile ? 'space-y-2' : 'space-y-2'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground font-semibold'
                  : 'text-sidebar-foreground hover:bg-primary-burgundy-light hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      {!isMobile && (
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-center text-opacity-75">© 2024 Sistema Admin</p>
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-40 p-2 bg-primary text-white rounded-lg shadow-lg"
        >
          <Menu size={24} />
        </button>
        {isOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
            <aside className="absolute left-0 top-0 h-full w-56 bg-primary text-sidebar-foreground shadow-lg flex flex-col animate-in slide-in-from-left">
              {sidebarContent}
            </aside>
          </div>
        )}
      </>
    );
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-primary text-sidebar-foreground shadow-lg flex flex-col">
      {sidebarContent}
    </aside>
  );
}