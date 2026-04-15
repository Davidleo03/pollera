'use client';

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainLayout } from '@/components/MainLayout';
import { useAdmin } from '@/context/AdminContext';
import { Users, Clock, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function Home() {
  const { workers, attendance, payroll } = useAdmin();
  
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter(a => a.fecha === today);
  const presentToday = todayAttendance.filter(a => a.estado === 'Presente').length;
  const activeWorkers = workers.filter(w => w.estado === 'Activo').length;

  const stats = [
    {
      label: 'Trabajadores Activos',
      value: activeWorkers,
      icon: Users,
      color: 'bg-primary',
      textColor: 'text-primary',
    },
    {
      label: 'Presentes Hoy',
      value: presentToday,
      icon: Clock,
      color: 'bg-secondary-green',
      textColor: 'text-secondary-green',
    },
    {
      label: 'Nóminas Generadas',
      value: payroll.filter(p => p.estado === 'Generada').length,
      icon: FileText,
      color: 'bg-accent-blue',
      textColor: 'text-accent-blue',
    },
    {
      label: 'Total Personal',
      value: workers.length,
      icon: BarChart3,
      color: 'bg-status-warning',
      textColor: 'text-status-warning',
    },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <MainLayout>
        <div className="space-y-6 md:space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-neutral-dark text-balance">
              Bienvenido al Sistema Administrativo
            </h1>
            <p className="text-neutral-medium-gray mt-2">
              Gestión de Personal Obrero - {new Date().toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-neutral-medium-gray text-sm font-medium">
                        {stat.label}
                      </p>
                      <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <Icon size={24} className="text-white" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8">
            {/* Recent Workers */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-neutral-dark mb-4 flex items-center gap-2">
                <Users size={24} className="text-primary" />
                Trabajadores Recientes
              </h2>
              <div className="space-y-3">
                {workers.slice(-5).reverse().map((worker) => (
                  <div key={worker.id} className="flex items-center justify-between p-3 bg-neutral-light-gray rounded-lg">
                    <div>
                      <p className="font-semibold text-neutral-dark">
                        {worker.nombre} {worker.apellido}
                      </p>
                      <p className="text-sm text-neutral-medium-gray">{worker.rol}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      worker.estado === 'Activo' 
                        ? 'bg-status-success/20 text-status-success'
                        : worker.estado === 'Descanso'
                        ? 'bg-status-warning/20 text-status-warning'
                        : 'bg-status-error/20 text-status-error'
                    }`}>
                      {worker.estado}
                    </span>
                  </div>
                ))}
                {workers.length === 0 && (
                  <p className="text-neutral-medium-gray text-center py-4">
                    No hay trabajadores registrados
                  </p>
                )}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-neutral-dark mb-4 flex items-center gap-2">
                <TrendingUp size={24} className="text-secondary-green" />
                Acciones Rápidas
              </h2>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-burgundy-light transition-colors">
                  Registrar Asistencia
                </button>
                <button className="w-full px-4 py-3 bg-secondary-green text-white rounded-lg font-semibold hover:bg-secondary-green-light transition-colors">
                  Generar Nómina
                </button>
                <button className="w-full px-4 py-3 bg-accent-blue text-white rounded-lg font-semibold hover:bg-accent-blue-light transition-colors">
                  Ver Reportes
                </button>
                <button className="w-full px-4 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors">
                  Agregar Personal
                </button>
              </div>
            </Card>
          </div>
        </div>
      </MainLayout>
    </div>
  );
}
