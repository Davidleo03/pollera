'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, Clock, FileText, BarChart3, Home } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    {
      label: 'Inicio',
      href: '/',
      icon: Home,
    },
    {
      label: 'Personal',
      href: '/personal',
      icon: Users,
    },
    {
      label: 'Asistencia',
      href: '/asistencia',
      icon: Clock,
    },
    {
      label: 'Nómina',
      href: '/nomina',
      icon: FileText,
    },
    {
      label: 'Reportes',
      href: '/reportes',
      icon: BarChart3,
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-primary text-sidebar-foreground shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center">
            <Users size={24} className="text-sidebar-accent-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">Sistema</h1>
            <p className="text-sm text-opacity-90">Administrativo</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
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

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-center text-opacity-75">
          © 2024 Sistema Admin
        </p>
      </div>
    </aside>
  );
}
