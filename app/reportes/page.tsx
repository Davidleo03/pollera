'use client';

import React, { useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainLayout } from '@/components/MainLayout';
import { useAdmin } from '@/context/AdminContext';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Download, TrendingUp, Users, DollarSign, AlertCircle } from 'lucide-react';

export default function ReportesPage() {
  const { workers, attendance, payroll } = useAdmin();

  // Datos para gráficos
  const attendanceByStatus = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter(a => a.estado === 'Presente').length;
    const absent = attendance.filter(a => a.estado === 'Ausente').length;
    const justified = attendance.filter(a => a.estado === 'Justificado').length;

    return [
      { name: 'Presentes', value: present, fill: '#4CAF50' },
      { name: 'Ausentes', value: absent, fill: '#F44336' },
      { name: 'Justificados', value: justified, fill: '#FF9800' },
    ];
  }, [attendance]);

  const workersByRole = useMemo(() => {
    const roles: Record<string, number> = {};
    workers.forEach(w => {
      roles[w.rol] = (roles[w.rol] || 0) + 1;
    });
    return Object.entries(roles).map(([role, count]) => ({ name: role, value: count }));
  }, [workers]);

  const attendanceByWorker = useMemo(() => {
    const stats: Record<string, { presente: number; ausente: number; justificado: number }> = {};
    
    workers.forEach(w => {
      stats[w.id] = { presente: 0, ausente: 0, justificado: 0 };
    });

    attendance.forEach(a => {
      if (stats[a.workerId]) {
        if (a.estado === 'Presente') stats[a.workerId].presente++;
        else if (a.estado === 'Ausente') stats[a.workerId].ausente++;
        else stats[a.workerId].justificado++;
      }
    });

    return Object.entries(stats)
      .map(([workerId, stats]) => {
        const worker = workers.find(w => w.id === workerId);
        return {
          name: worker ? `${worker.nombre.substring(0, 3)}. ${worker.apellido.substring(0, 3)}.` : 'N/A',
          Presentes: stats.presente,
          Ausentes: stats.ausente,
          Justificados: stats.justificado,
        };
      })
      .slice(0, 10);
  }, [workers, attendance]);

  const payrollSummary = useMemo(() => {
    const totalNomina = payroll.reduce((sum, p) => sum + p.salarioNeto, 0);
    const totalBonificaciones = payroll.reduce((sum, p) => sum + p.bonificacion, 0);
    const totalDescuentos = payroll.reduce((sum, p) => sum + p.descuentos, 0);

    return { totalNomina, totalBonificaciones, totalDescuentos };
  }, [payroll]);

  const stats = [
    {
      label: 'Total de Trabajadores',
      value: workers.length,
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Tasa de Asistencia',
      value: `${Math.round((attendance.filter(a => a.estado === 'Presente').length / (attendance.length || 1)) * 100)}%`,
      icon: TrendingUp,
      color: 'text-status-success',
    },
    {
      label: 'Total Nóminas',
      value: `$${(payrollSummary.totalNomina / 1000).toFixed(1)}K`,
      icon: DollarSign,
      color: 'text-secondary-green',
    },
    {
      label: 'Inasistencias',
      value: attendance.filter(a => a.estado === 'Ausente').length,
      icon: AlertCircle,
      color: 'text-status-error',
    },
  ];

  const handleExportPDF = () => {
    const now = new Date().toLocaleDateString('es-ES');
    const content = `
REPORTE ADMINISTRATIVO - PERSONAL OBRERO
Fecha: ${now}

RESUMEN GENERAL
═══════════════════════════════════════
Total de Trabajadores: ${workers.length}
Trabajadores Activos: ${workers.filter(w => w.estado === 'Activo').length}
Trabajadores en Descanso: ${workers.filter(w => w.estado === 'Descanso').length}
Trabajadores Inactivos: ${workers.filter(w => w.estado === 'Inactivo').length}

ASISTENCIA
═══════════════════════════════════════
Registros de Asistencia: ${attendance.length}
Presentes: ${attendance.filter(a => a.estado === 'Presente').length}
Ausentes: ${attendance.filter(a => a.estado === 'Ausente').length}
Justificados: ${attendance.filter(a => a.estado === 'Justificado').length}

NÓMINA
═══════════════════════════════════════
Nóminas Generadas: ${payroll.filter(p => p.estado === 'Generada').length}
Nóminas Procesadas: ${payroll.filter(p => p.estado === 'Procesada').length}
Nóminas Pagadas: ${payroll.filter(p => p.estado === 'Pagada').length}
Total a Pagar: $${payrollSummary.totalNomina.toLocaleString()}

DETALLES POR TRABAJADOR
═══════════════════════════════════════
${workers.map(w => {
  const workerAttendance = attendance.filter(a => a.workerId === w.id);
  const present = workerAttendance.filter(a => a.estado === 'Presente').length;
  return `${w.nombre} ${w.apellido}: ${present} presencias, ${w.rol}`;
}).join('\n')}
    `;
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `reporte_${new Date().toISOString().split('T')[0]}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex">
      <Sidebar />
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-dark">Reportes y Supervisión</h1>
              <p className="text-neutral-medium-gray mt-1">Análisis consolidado del sistema</p>
            </div>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-secondary-green hover:bg-secondary-green-light text-white rounded-lg font-semibold transition-colors"
            >
              <Download size={20} />
              Descargar Reporte
            </button>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-neutral-medium-gray text-sm">{stat.label}</p>
                      <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                    </div>
                    <div className={`p-2 bg-neutral-light-gray rounded-lg ${stat.color}`}>
                      <Icon size={20} />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Attendance Status */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-neutral-dark mb-4">Estado de Asistencia</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={attendanceByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value} registros`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Workers by Role */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-neutral-dark mb-4">Trabajadores por Rol</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workersByRole}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Attendance by Worker */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-neutral-dark mb-4">Asistencia por Trabajador (Top 10)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={attendanceByWorker}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Presentes" fill="#4CAF50" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Ausentes" fill="#F44336" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Justificados" fill="#FF9800" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Payroll Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 bg-gradient-to-br from-status-success/5 to-status-success/10 border border-status-success/20">
              <p className="text-neutral-medium-gray text-sm font-semibold">Total Bonificaciones</p>
              <p className="text-3xl font-bold text-status-success mt-2">
                ${payrollSummary.totalBonificaciones.toLocaleString()}
              </p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <p className="text-neutral-medium-gray text-sm font-semibold">Total Nómina</p>
              <p className="text-3xl font-bold text-primary mt-2">
                ${payrollSummary.totalNomina.toLocaleString()}
              </p>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-status-error/5 to-status-error/10 border border-status-error/20">
              <p className="text-neutral-medium-gray text-sm font-semibold">Total Descuentos</p>
              <p className="text-3xl font-bold text-status-error mt-2">
                ${payrollSummary.totalDescuentos.toLocaleString()}
              </p>
            </Card>
          </div>
        </div>
      </MainLayout>
    </div>
  );
}
