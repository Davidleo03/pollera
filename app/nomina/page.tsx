'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainLayout } from '@/components/MainLayout';
import { useAdmin } from '@/context/AdminContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, FileText, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function NominaPage() {
  const { workers, payroll, attendance, addPayroll, updatePayroll, getPayrollByMonth, getAttendanceByWorker } = useAdmin();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const currentYear = new Date().getFullYear();
  const currentMonth = selectedMonth;
  const monthPayrolls = getPayrollByMonth(currentMonth, currentYear);

  const handleGeneratePayroll = () => {
    const [year, month] = selectedMonth.split('-');
    
    workers.forEach(worker => {
      // Verificar si ya existe nómina para este mes
      const existing = payroll.find(
        p => p.workerId === worker.id && p.mes === month && p.año === parseInt(year)
      );

      if (!existing) {
        // Calcular horas trabajadas
        const monthAttendance = getAttendanceByWorker(worker.id, selectedMonth);
        const horasTrabajadas = monthAttendance.filter(a => a.estado === 'Presente').length * 8;
        
        const salarioBase = worker.salarioBase;
        const horas = horasTrabajadas;
        const bonificacion = horas > 160 ? (horas - 160) * (salarioBase / 160) * 1.5 : 0;
        const descuentos = monthAttendance.filter(a => a.estado === 'Ausente').length * (salarioBase / 20);
        const salarioNeto = salarioBase + bonificacion - descuentos;

        addPayroll({
          workerId: worker.id,
          mes: month,
          año: parseInt(year),
          salarioBase,
          horas,
          bonificacion,
          descuentos,
          salarioNeto,
          estado: 'Generada',
        });
      }
    });

    setShowGenerateModal(false);
    alert('Nóminas generadas correctamente');
  };

  const detailedPayroll = showDetails 
    ? payroll.find(p => p.id === showDetails)
    : null;
  
  const detailedWorker = detailedPayroll
    ? workers.find(w => w.id === detailedPayroll.workerId)
    : null;

  return (
    <div className="flex">
      <Sidebar />
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-dark">Gestión de Nómina</h1>
              <p className="text-neutral-medium-gray mt-1">Administra salarios y comprobantes de pago</p>
            </div>
            <Button
              onClick={() => setShowGenerateModal(true)}
              className="bg-primary hover:bg-primary-burgundy-light text-white gap-2"
            >
              <Plus size={20} />
              Generar Nóminas
            </Button>
          </div>

          {/* Month Selector */}
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-neutral-dark mb-2">
                Selecciona mes
              </label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <div className="text-right">
              <p className="text-sm text-neutral-medium-gray">Total a pagar</p>
              <p className="text-3xl font-bold text-primary mt-2">
                ${monthPayrolls.reduce((sum, p) => sum + p.salarioNeto, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payroll List */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Trabajador</th>
                    <th className="px-6 py-3 text-left font-semibold">Salario Base</th>
                    <th className="px-6 py-3 text-left font-semibold">Horas</th>
                    <th className="px-6 py-3 text-left font-semibold">Bonificación</th>
                    <th className="px-6 py-3 text-left font-semibold">Descuentos</th>
                    <th className="px-6 py-3 text-left font-semibold">Salario Neto</th>
                    <th className="px-6 py-3 text-left font-semibold">Estado</th>
                    <th className="px-6 py-3 text-left font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {monthPayrolls.map((pay) => {
                    const worker = workers.find(w => w.id === pay.workerId);
                    if (!worker) return null;
                    
                    return (
                      <tr key={pay.id} className="hover:bg-neutral-light-gray transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-neutral-dark">
                            {worker.nombre} {worker.apellido}
                          </p>
                          <p className="text-sm text-neutral-medium-gray">{worker.cedula}</p>
                        </td>
                        <td className="px-6 py-4 text-neutral-medium-gray">
                          ${pay.salarioBase.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-neutral-medium-gray">
                          {pay.horas} hrs
                        </td>
                        <td className="px-6 py-4 text-status-success font-semibold">
                          ${pay.bonificacion.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-status-error font-semibold">
                          ${pay.descuentos.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-primary font-bold text-lg">
                          ${pay.salarioNeto.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={pay.estado}
                            onChange={(e) => updatePayroll(pay.id, { estado: e.target.value as any })}
                            className={`px-3 py-1 rounded font-medium border-0 cursor-pointer ${
                              pay.estado === 'Pagada'
                                ? 'bg-status-success/20 text-status-success'
                                : pay.estado === 'Procesada'
                                ? 'bg-status-info/20 text-status-info'
                                : 'bg-status-warning/20 text-status-warning'
                            }`}
                          >
                            <option value="Generada">Generada</option>
                            <option value="Procesada">Procesada</option>
                            <option value="Pagada">Pagada</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setShowDetails(pay.id)}
                            className="p-2 hover:bg-accent-blue/20 text-accent-blue rounded transition-colors"
                            title="Ver detalles"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {monthPayrolls.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-medium-gray mb-4">No hay nóminas generadas para este mes</p>
                  <Button
                    onClick={() => setShowGenerateModal(true)}
                    className="bg-primary hover:bg-primary-burgundy-light text-white"
                  >
                    Generar Nóminas
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-neutral-medium-gray text-sm">Generadas</p>
              <p className="text-2xl font-bold text-neutral-dark mt-2">
                {monthPayrolls.filter(p => p.estado === 'Generada').length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-neutral-medium-gray text-sm">Procesadas</p>
              <p className="text-2xl font-bold text-neutral-dark mt-2">
                {monthPayrolls.filter(p => p.estado === 'Procesada').length}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-neutral-medium-gray text-sm">Pagadas</p>
              <p className="text-2xl font-bold text-neutral-dark mt-2">
                {monthPayrolls.filter(p => p.estado === 'Pagada').length}
              </p>
            </Card>
          </div>

          {/* Generate Modal */}
          {showGenerateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md p-6">
                <h2 className="text-2xl font-bold text-neutral-dark mb-4">Generar Nóminas</h2>
                <p className="text-neutral-medium-gray mb-6">
                  ¿Deseas generar nóminas para {new Date(selectedMonth).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}?
                </p>
                <p className="text-sm text-neutral-medium-gray mb-6 p-3 bg-neutral-light-gray rounded">
                  Se generarán {workers.length} nóminas basadas en el registro de asistencia.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowGenerateModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleGeneratePayroll}
                    className="flex-1 bg-secondary-green hover:bg-secondary-green-light text-white"
                  >
                    Generar
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Details Modal */}
          {detailedPayroll && detailedWorker && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-neutral-dark">Comprobante de Pago</h2>
                  <button
                    onClick={() => setShowDetails(null)}
                    className="text-neutral-medium-gray hover:text-neutral-dark"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 border-b border-border pb-4 mb-4">
                  <div>
                    <p className="text-sm text-neutral-medium-gray">Trabajador</p>
                    <p className="font-bold text-neutral-dark">
                      {detailedWorker.nombre} {detailedWorker.apellido}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-medium-gray">Período</p>
                    <p className="font-semibold text-neutral-dark">
                      {new Date(detailedPayroll.año, parseInt(detailedPayroll.mes) - 1).toLocaleDateString('es-ES', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-neutral-medium-gray">Salario Base</span>
                    <span className="font-semibold">${detailedPayroll.salarioBase.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-medium-gray">Horas Trabajadas</span>
                    <span className="font-semibold">{detailedPayroll.horas} hrs</span>
                  </div>
                  {detailedPayroll.bonificacion > 0 && (
                    <div className="flex justify-between text-status-success">
                      <span>Bonificación (Horas Extra)</span>
                      <span className="font-semibold">+${detailedPayroll.bonificacion.toLocaleString()}</span>
                    </div>
                  )}
                  {detailedPayroll.descuentos > 0 && (
                    <div className="flex justify-between text-status-error">
                      <span>Descuentos (Inasistencias)</span>
                      <span className="font-semibold">-${detailedPayroll.descuentos.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="bg-primary/10 p-4 rounded-lg mb-6">
                  <p className="text-sm text-neutral-medium-gray">Total a Pagar</p>
                  <p className="text-3xl font-bold text-primary">
                    ${detailedPayroll.salarioNeto.toLocaleString()}
                  </p>
                </div>

                <div className="text-center">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
                    detailedPayroll.estado === 'Pagada'
                      ? 'bg-status-success/20 text-status-success'
                      : detailedPayroll.estado === 'Procesada'
                      ? 'bg-status-info/20 text-status-info'
                      : 'bg-status-warning/20 text-status-warning'
                  }`}>
                    <CheckCircle size={16} />
                    {detailedPayroll.estado}
                  </span>
                </div>
              </Card>
            </div>
          )}
        </div>
      </MainLayout>
    </div>
  );
}
