'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainLayout } from '@/components/MainLayout';
import { useAdmin, Worker } from '@/context/AdminContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, X, Users, User } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PersonalPage() {
  const { workers, addWorker, updateWorker, deleteWorker } = useAdmin();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Fijo' | 'Suplente'>('Fijo');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Omit<Worker, 'id'>>({
    nombre: '',
    apellido: '',
    cedula: '',
    rol: 'Técnico de Galpón',
    tipoContrato: 'Fijo',
    galpones: [],
    estado: 'Activo',
    salarioBase: 0,
    fechaIngreso: new Date().toISOString().split('T')[0],
    diasLibreRotacion: [],
    disponibilidad: 'Disponible',
  });

  const roles = ['Técnico de Galpón', 'Vacunador', 'Técnico de Climatización', 'Otro'];
  const galpones = ['G-001', 'G-002', 'G-003', 'G-004', 'G-005', 'G-006', 'G-007', 'G-008', 'G-009'];
  const diasLibres = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  // Filtrar trabajadores por tipo de contrato
  const filteredWorkers = useMemo(() => {
    return workers
      .filter(w => w.tipoContrato === activeTab)
      .filter(w =>
        w.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.cedula.includes(searchTerm)
      );
  }, [workers, activeTab, searchTerm]);

  // Contar fijos y suplentes
  const fijoCount = workers.filter(w => w.tipoContrato === 'Fijo').length;
  const suplenteCount = workers.filter(w => w.tipoContrato === 'Suplente').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.apellido || !formData.cedula) {
      alert('Por favor completa los campos requeridos');
      return;
    }

    // Validar límite de trabajadores
    if (!editingId) {
      const currentTypeCount = workers.filter(w => w.tipoContrato === formData.tipoContrato).length;
      if (formData.tipoContrato === 'Fijo' && currentTypeCount >= 12) {
        alert('Ya tienes 12 trabajadores fijos registrados');
        return;
      }
      if (formData.tipoContrato === 'Suplente' && currentTypeCount >= 12) {
        alert('Ya tienes 12 trabajadores suplentes registrados');
        return;
      }
    }

    if (editingId) {
      updateWorker(editingId, formData);
      setEditingId(null);
    } else {
      addWorker(formData);
    }

    setFormData({
      nombre: '',
      apellido: '',
      cedula: '',
      rol: 'Técnico de Galpón',
      tipoContrato: 'Fijo',
      galpones: [],
      estado: 'Activo',
      salarioBase: 0,
      fechaIngreso: new Date().toISOString().split('T')[0],
      diasLibreRotacion: [],
      disponibilidad: 'Disponible',
    });
    setShowModal(false);
  };

  const handleEdit = (worker: Worker) => {
    setFormData({
      nombre: worker.nombre,
      apellido: worker.apellido,
      cedula: worker.cedula,
      rol: worker.rol,
      tipoContrato: worker.tipoContrato,
      galpones: worker.galpones || [],
      estado: worker.estado,
      salarioBase: worker.salarioBase,
      fechaIngreso: worker.fechaIngreso,
      diasLibreRotacion: worker.diasLibreRotacion || [],
      disponibilidad: worker.disponibilidad || 'Disponible',
    });
    setEditingId(worker.id);
    setShowModal(true);
  };

  const handleToggleGalpon = (galpon: string) => {
    setFormData({
      ...formData,
      galpones: formData.galpones.includes(galpon)
        ? formData.galpones.filter(g => g !== galpon)
        : [...formData.galpones, galpon],
    });
  };

  const handleToggleDiaLibre = (dia: string) => {
    setFormData({
      ...formData,
      diasLibreRotacion: formData.diasLibreRotacion.includes(dia)
        ? formData.diasLibreRotacion.filter(d => d !== dia)
        : [...formData.diasLibreRotacion, dia],
    });
  };

  return (
    <div className="flex">
      <Sidebar />
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-neutral-dark">Gestión de Personal</h1>
              <p className="text-neutral-medium-gray mt-1">Administra los 24 trabajadores (12 fijos + 12 suplentes)</p>
            </div>
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  nombre: '',
                  apellido: '',
                  cedula: '',
                  rol: 'Técnico de Galpón',
                  tipoContrato: activeTab,
                  galpones: [],
                  estado: 'Activo',
                  salarioBase: 0,
                  fechaIngreso: new Date().toISOString().split('T')[0],
                  diasLibreRotacion: [],
                  disponibilidad: 'Disponible',
                });
                setShowModal(true);
              }}
              className="bg-primary hover:bg-primary-burgundy-light text-white gap-2"
            >
              <Plus size={20} />
              Agregar Personal
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-6 border-l-4 border-l-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-medium-gray text-sm">Trabajadores Fijos</p>
                  <p className="text-4xl font-bold text-primary mt-2">{fijoCount}/12</p>
                </div>
                <Users size={40} className="text-primary opacity-20" />
              </div>
              <p className="text-xs text-neutral-medium-gray mt-4">
                {12 - fijoCount} espacio{12 - fijoCount !== 1 ? 's' : ''} disponible{12 - fijoCount !== 1 ? 's' : ''}
              </p>
            </Card>

            <Card className="p-6 border-l-4 border-l-secondary-green">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-medium-gray text-sm">Trabajadores Suplentes</p>
                  <p className="text-4xl font-bold text-secondary-green mt-2">{suplenteCount}/12</p>
                </div>
                <User size={40} className="text-secondary-green opacity-20" />
              </div>
              <p className="text-xs text-neutral-medium-gray mt-4">
                {12 - suplenteCount} espacio{12 - suplenteCount !== 1 ? 's' : ''} disponible{12 - suplenteCount !== 1 ? 's' : ''}
              </p>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab('Fijo')}
              className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
                activeTab === 'Fijo'
                  ? 'border-b-primary text-primary'
                  : 'border-b-transparent text-neutral-medium-gray hover:text-neutral-dark'
              }`}
            >
              Fijos ({fijoCount})
            </button>
            <button
              onClick={() => setActiveTab('Suplente')}
              className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
                activeTab === 'Suplente'
                  ? 'border-b-secondary-green text-secondary-green'
                  : 'border-b-transparent text-neutral-medium-gray hover:text-neutral-dark'
              }`}
            >
              Suplentes ({suplenteCount})
            </button>
          </div>

          {/* Search */}
          <Input
            type="text"
            placeholder="Buscar por nombre, apellido o cédula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />

          {/* Workers Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`text-white ${activeTab === 'Fijo' ? 'bg-primary' : 'bg-secondary-green'}`}>
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">Nombre</th>
                    <th className="px-6 py-3 text-left font-semibold">Cédula</th>
                    <th className="px-6 py-3 text-left font-semibold">Rol</th>
                    <th className="px-6 py-3 text-left font-semibold">Galpones</th>
                    <th className="px-6 py-3 text-left font-semibold">Días Libres</th>
                    <th className="px-6 py-3 text-left font-semibold">Disponibilidad</th>
                    <th className="px-6 py-3 text-left font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-neutral-light-gray transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-neutral-dark">
                          {worker.nombre} {worker.apellido}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-neutral-medium-gray">{worker.cedula}</td>
                      <td className="px-6 py-4 text-neutral-medium-gray">{worker.rol}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(worker.galpones?.length ?? 0) > 0 ? (
                            worker.galpones.map((g) => (
                              <span key={g} className="bg-secondary-green/20 text-secondary-green px-2 py-1 rounded text-sm font-medium">
                                {g}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-medium-gray text-sm">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(worker.diasLibreRotacion?.length ?? 0) > 0 ? (
                            worker.diasLibreRotacion.map((d) => (
                              <span key={d} className="bg-status-warning/20 text-status-warning px-2 py-1 rounded text-sm font-medium">
                                {d.slice(0, 3)}
                              </span>
                            ))
                          ) : (
                            <span className="text-neutral-medium-gray text-sm">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          worker.disponibilidad === 'Disponible'
                            ? 'bg-status-success/20 text-status-success'
                            : worker.disponibilidad === 'En rotación'
                            ? 'bg-status-warning/20 text-status-warning'
                            : 'bg-status-error/20 text-status-error'
                        }`}>
                          {worker.disponibilidad}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(worker)}
                            className="p-2 hover:bg-secondary-green/20 text-secondary-green rounded transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('¿Estás seguro de que quieres eliminar este trabajador?')) {
                                deleteWorker(worker.id);
                              }
                            }}
                            className="p-2 hover:bg-status-error/20 text-status-error rounded transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredWorkers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-medium-gray">
                    {searchTerm ? 'No hay trabajadores que coincidan con la búsqueda' : `No hay trabajadores ${activeTab === 'Fijo' ? 'fijos' : 'suplentes'} registrados`}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-white">
                  <h2 className="text-2xl font-bold text-neutral-dark">
                    {editingId ? 'Editar Trabajador' : 'Agregar Nuevo Trabajador'}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 hover:bg-neutral-light-gray rounded transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Datos Básicos */}
                  <div>
                    <h3 className="font-semibold text-neutral-dark mb-4">Información Básica</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Nombre *</label>
                        <Input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          placeholder="Juan"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Apellido *</label>
                        <Input
                          type="text"
                          value={formData.apellido}
                          onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                          placeholder="Pérez"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Cédula *</label>
                        <Input
                          type="text"
                          value={formData.cedula}
                          onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                          placeholder="123456789"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Salario Base</label>
                        <Input
                          type="number"
                          value={formData.salarioBase}
                          onChange={(e) => setFormData({ ...formData, salarioBase: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Roles y Clasificación */}
                  <div>
                    <h3 className="font-semibold text-neutral-dark mb-4">Rol y Clasificación</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Rol</label>
                        <select
                          value={formData.rol}
                          onChange={(e) => setFormData({ ...formData, rol: e.target.value as any })}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {roles.map((role) => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Tipo de Contrato</label>
                        <select
                          value={formData.tipoContrato}
                          onChange={(e) => setFormData({ ...formData, tipoContrato: e.target.value as any })}
                          disabled={!!editingId}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-light-gray disabled:cursor-not-allowed"
                        >
                          <option value="Fijo">Fijo</option>
                          <option value="Suplente">Suplente</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Disponibilidad</label>
                        <select
                          value={formData.disponibilidad}
                          onChange={(e) => setFormData({ ...formData, disponibilidad: e.target.value as any })}
                          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="Disponible">Disponible</option>
                          <option value="En rotación">En rotación</option>
                          <option value="Vacaciones">Vacaciones</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Galpones */}
                  <div>
                    <h3 className="font-semibold text-neutral-dark mb-4">Galpones Asignados</h3>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                      {galpones.map((galpon) => (
                        <label key={galpon} className="flex items-center gap-2 cursor-pointer p-2 border border-border rounded hover:bg-neutral-light-gray transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.galpones.includes(galpon)}
                            onChange={() => handleToggleGalpon(galpon)}
                            className="w-4 h-4 rounded border-border cursor-pointer"
                          />
                          <span className="text-sm font-medium text-neutral-dark">{galpon}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Sistema Rotativo de Días Libres */}
                  <div>
                    <h3 className="font-semibold text-neutral-dark mb-2">Sistema Rotativo de Días Libres</h3>
                    <p className="text-sm text-neutral-medium-gray mb-4">Selecciona los dos días consecutivos de descanso (ej: Lunes y Martes)</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {diasLibres.map((dia) => (
                        <label key={dia} className="flex items-center gap-2 cursor-pointer p-2 border border-border rounded hover:bg-neutral-light-gray transition-colors">
                          <input
                            type="checkbox"
                            checked={formData.diasLibreRotacion.includes(dia)}
                            onChange={() => handleToggleDiaLibre(dia)}
                            className="w-4 h-4 rounded border-border cursor-pointer"
                          />
                          <span className="text-sm font-medium text-neutral-dark">{dia}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                    <Button
                      type="button"
                      onClick={() => setShowModal(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="w-full bg-primary hover:bg-primary-burgundy-light text-white">
                      {editingId ? 'Actualizar' : 'Guardar'} Trabajador
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          )}
        </div>
      </MainLayout>
    </div>
  );
}
