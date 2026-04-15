'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainLayout } from '@/components/MainLayout';
import { useAdmin } from '@/context/AdminContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function AsistenciaPage() {
  const { workers, attendance, checkIn, checkOut, updateAttendance, getAttendanceByWorker, justifyAbsence, isScheduledFreeDay } = useAdmin();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [justifyingAttendanceId, setJustifyingAttendanceId] = useState<string | null>(null);
  const [justificationText, setJustificationText] = useState('');

  const dayAttendance = attendance.filter(a => a.fecha === selectedDate);
  
  const filteredWorkers = useMemo(() => {
    return workers.filter(w => 
      w.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.cedula.includes(searchTerm)
    );
  }, [workers, searchTerm]);

  const getWorkerAttendance = (workerId: string) => {
    return dayAttendance.find(a => a.workerId === workerId);
  };

  const handleCheckIn = (workerId: string) => {
    checkIn(workerId, selectedDate);
  };

  const handleCheckOut = (workerId: string) => {
    checkOut(workerId, selectedDate);
  };

  const handleStatusChange = (attendanceId: string, newStatus: 'Presente' | 'Ausente' | 'Justificado' | 'Día Libre') => {
    updateAttendance(attendanceId, { estado: newStatus });
  };

  const openJustifyModal = (attendanceId: string) => {
    setJustifyingAttendanceId(attendanceId);
    setJustificationText('');
    setShowJustifyModal(true);
  };

  const submitJustification = () => {
    if (justifyingAttendanceId && justificationText.trim()) {
      justifyAbsence(justifyingAttendanceId, justificationText);
      setShowJustifyModal(false);
      setJustifyingAttendanceId(null);
      setJustificationText('');
    }
  };

  // Estadísticas del día
  const presentCount = dayAttendance.filter(a => a.estado === 'Presente').length;
  const absentCount = dayAttendance.filter(a => a.estado === 'Ausente').length;
  const justifiedCount = dayAttendance.filter(a => a.estado === 'Justificado').length;
  const freeDayCount = dayAttendance.filter(a => a.estado === 'Día Libre').length;

  return (
    <div className="flex">
      <Sidebar />
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">Control de Asistencia y Rotación</h1>
            <p className="text-neutral-medium-gray mt-1">Registra entrada/salida y gestiona el sistema rotativo de días libres</p>
          </div>

          {/* Date Selector */}
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-semibold text-neutral-dark mb-2">
                Selecciona la fecha
              </label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white"
                >
                  Hoy
                </Button>
              </div>
            </div>
          </div>

          {/* Search */}
          <Input
            type="text"
            placeholder="Buscar por nombre, apellido o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <Card className="p-4 text-center border-l-4 border-l-primary">
              <p className="text-neutral-medium-gray text-xs font-medium">Activos</p>
              <p className="text-2xl font-bold text-primary mt-1">{workers.filter(w => w.estado === 'Activo').length}</p>
            </Card>
            <Card className="p-4 text-center border-l-4 border-l-status-success">
              <p className="text-neutral-medium-gray text-xs font-medium">Presentes</p>
              <p className="text-2xl font-bold text-status-success mt-1">{presentCount}</p>
            </Card>
            <Card className="p-4 text-center border-l-4 border-l-status-error">
              <p className="text-neutral-medium-gray text-xs font-medium">Ausentes</p>
              <p className="text-2xl font-bold text-status-error mt-1">{absentCount}</p>
            </Card>
            <Card className="p-4 text-center border-l-4 border-l-status-warning">
              <p className="text-neutral-medium-gray text-xs font-medium">Justificados</p>
              <p className="text-2xl font-bold text-status-warning mt-1">{justifiedCount}</p>
            </Card>
            <Card className="p-4 text-center border-l-4 border-l-secondary-green">
              <p className="text-neutral-medium-gray text-xs font-medium">Días Libres</p>
              <p className="text-2xl font-bold text-secondary-green mt-1">{freeDayCount}</p>
            </Card>
          </div>

          {/* Attendance Records */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-green text-white">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Trabajador</th>
                    <th className="px-6 py-3 text-left font-semibold">Tipo</th>
                    <th className="px-6 py-3 text-left font-semibold">Entrada</th>
                    <th className="px-6 py-3 text-left font-semibold">Salida</th>
                    <th className="px-6 py-3 text-left font-semibold">Estado</th>
                    <th className="px-6 py-3 text-left font-semibold">Días Libres</th>
                    <th className="px-6 py-3 text-left font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredWorkers.map((worker) => {
                    const att = getWorkerAttendance(worker.id);
                    const isScheduledFree = isScheduledFreeDay(worker.id, selectedDate);
                    
                    return (
                      <tr key={worker.id} className="hover:bg-neutral-light-gray transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-neutral-dark">
                            {worker.nombre} {worker.apellido}
                          </p>
                          <p className="text-xs text-neutral-medium-gray">{worker.cedula}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            worker.tipoContrato === 'Fijo'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-secondary-green/20 text-secondary-green'
                          }`}>
                            {worker.tipoContrato}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {att?.checkIn ? (
                            <span className="bg-status-success/20 text-status-success px-2 py-1 rounded text-sm font-semibold flex items-center gap-1 w-fit">
                              <CheckCircle size={14} />
                              {att.checkIn}
                            </span>
                          ) : (
                            <span className="text-neutral-medium-gray">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {att?.checkOut ? (
                            <span className="bg-status-error/20 text-status-error px-2 py-1 rounded text-sm font-semibold">
                              {att.checkOut}
                            </span>
                          ) : (
                            <span className="text-neutral-medium-gray">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={att?.estado || (isScheduledFree ? 'Día Libre' : 'Ausente')}
                            onChange={(e) => {
                              if (att) {
                                handleStatusChange(att.id, e.target.value as any);
                              } else {
                                // Crear registro si no existe
                                updateAttendance(att?.id || '', {
                                  estado: e.target.value as any,
                                });
                              }
                            }}
                            className={`px-2 py-1 rounded font-medium border-0 cursor-pointer text-sm ${
                              att?.estado === 'Presente'
                                ? 'bg-status-success/20 text-status-success'
                                : att?.estado === 'Ausente'
                                ? 'bg-status-error/20 text-status-error'
                                : att?.estado === 'Justificado'
                                ? 'bg-status-warning/20 text-status-warning'
                                : 'bg-secondary-green/20 text-secondary-green'
                            }`}
                          >
                            <option value="Presente">Presente</option>
                            <option value="Ausente">Ausente</option>
                            <option value="Justificado">Justificado</option>
                            <option value="Día Libre">Día Libre</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {worker.diasLibreRotacion.length > 0 && (
                              <div className="flex gap-1">
                                {worker.diasLibreRotacion.map((d) => (
                                  <span key={d} className="bg-status-warning/20 text-status-warning px-2 py-1 rounded text-xs font-semibold">
                                    {d.slice(0, 3)}
                                  </span>
                                ))}
                              </div>
                            )}
                            {isScheduledFree && (
                              <span className="bg-secondary-green/20 text-secondary-green px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                <Calendar size={12} />
                                Hoy libre
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-1 flex-wrap">
                            <button
                              onClick={() => handleCheckIn(worker.id)}
                              disabled={att?.checkIn !== null}
                              className="p-2 hover:bg-status-success/20 text-status-success rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Registrar entrada"
                            >
                              <LogIn size={16} />
                            </button>
                            <button
                              onClick={() => handleCheckOut(worker.id)}
                              disabled={!att?.checkIn || att?.checkOut !== null}
                              className="p-2 hover:bg-status-error/20 text-status-error rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Registrar salida"
                            >
                              <LogOut size={16} />
                            </button>
                            {att?.estado === 'Ausente' && (
                              <button
                                onClick={() => openJustifyModal(att.id)}
                                className="p-2 hover:bg-status-warning/20 text-status-warning rounded transition-colors"
                                title="Justificar ausencia"
                              >
                                <AlertCircle size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredWorkers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-medium-gray">
                    {searchTerm ? 'No hay trabajadores que coincidan con la búsqueda' : 'No hay trabajadores registrados'}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Justification Modal */}
          {showJustifyModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-neutral-dark mb-4">Justificar Ausencia</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-dark mb-2">
                        Motivo de la ausencia *
                      </label>
                      <textarea
                        value={justificationText}
                        onChange={(e) => setJustificationText(e.target.value)}
                        placeholder="Ej: Enfermedad, cita médica, emergencia familiar..."
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none h-32"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={() => setShowJustifyModal(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={submitJustification}
                        disabled={!justificationText.trim()}
                        className="flex-1 bg-status-warning hover:bg-status-warning/80 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Justificar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </MainLayout>
    </div>
  );
}
