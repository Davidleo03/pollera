'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainLayout } from '@/components/MainLayout';
import { useAdmin, CategoriaMedicina } from '@/context/AdminContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, AlertTriangle, Package, Trash2, Edit, Save, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categorias: CategoriaMedicina[] = ['Medicamento', 'Vacuna', 'Multivitamínico', 'Suplemento', 'Aditivo'];

export default function MedicinasPage() {
  const { medicamentos, addMedicina, updateMedicina, deleteMedicina, registrarUsoMedicina } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<CategoriaMedicina | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showUsoModal, setShowUsoModal] = useState(false);
  const [selectedMedicinaId, setSelectedMedicinaId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Medicamento' as CategoriaMedicina,
    presentacion: '',
    cantidadInicial: 0,
    cantidadActual: 0,
    unidad: '',
    numeroLote: '',
    fechaVencimiento: '',
    observaciones: '',
  });
  
  const [usoData, setUsoData] = useState({
    cantidad: 1,
    motivo: '',
    observaciones: '',
  });

  const filteredMedicamentos = useMemo(() => {
    return medicamentos.filter(m => {
      const matchesSearch = m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.numeroLote.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategoria = filterCategoria === 'all' || m.categoria === filterCategoria;
      return matchesSearch && matchesCategoria;
    });
  }, [medicamentos, searchTerm, filterCategoria]);

  const totalItems = medicamentos.length;
  const stockBajo = medicamentos.filter(m => m.cantidadActual <= m.cantidadInicial * 0.2).length;
  const proximosVencer = medicamentos.filter(m => {
    if (!m.fechaVencimiento) return false;
    const fechaVenc = new Date(m.fechaVencimiento);
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaVenc.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes > 0 && diasRestantes <= 30;
  }).length;

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: 'Medicamento',
      presentacion: '',
      cantidadInicial: 0,
      cantidadActual: 0,
      unidad: '',
      numeroLote: '',
      fechaVencimiento: '',
      observaciones: '',
    });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.nombre.trim() || !formData.categoria || !formData.unidad) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (editingId) {
      updateMedicina(editingId, {
        ...formData,
        fechaActualizacion: today,
      });
    } else {
      addMedicina({
        ...formData,
        cantidadInicial: formData.cantidadInicial || formData.cantidadActual,
        cantidadActual: formData.cantidadActual || formData.cantidadInicial,
        fechaActualizacion: today,
      });
    }
    
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (med: typeof medicamentos[0]) => {
    setFormData({
      nombre: med.nombre,
      categoria: med.categoria,
      presentacion: med.presentacion,
      cantidadInicial: med.cantidadInicial,
      cantidadActual: med.cantidadActual,
      unidad: med.unidad,
      numeroLote: med.numeroLote,
      fechaVencimiento: med.fechaVencimiento,
      observaciones: med.observaciones || '',
    });
    setEditingId(med.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este medicamento?')) {
      deleteMedicina(id);
    }
  };

  const openUsoModal = (medicinaId: string) => {
    setSelectedMedicinaId(medicinaId);
    setUsoData({ cantidad: 1, motivo: '', observaciones: '' });
    setShowUsoModal(true);
  };

  const handleRegistrarUso = () => {
    if (!selectedMedicinaId || usoData.cantidad <= 0 || !usoData.motivo.trim()) return;
    
    registrarUsoMedicina({
      medicinaId: selectedMedicinaId,
      cantidad: usoData.cantidad,
      fecha: new Date().toISOString().split('T')[0],
      motivo: usoData.motivo,
      observaciones: usoData.observaciones,
    });
    
    setShowUsoModal(false);
    setSelectedMedicinaId(null);
  };

  const getStockStatus = (cantidadActual: number, cantidadInicial: number) => {
    if (cantidadActual === 0) return 'text-status-error';
    if (cantidadActual <= cantidadInicial * 0.2) return 'text-status-warning';
    return 'text-status-success';
  };

  return (
    <div className="flex">
      <Sidebar />
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-dark">Inventario de Medicinas y Veterinarios</h1>
            <p className="text-neutral-medium-gray mt-1">
              Control diario de medicamentos, vacunas, multivitamínicos, suplementos y aditivos
            </p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-medium-gray" size={18} />
                <Input
                  type="text"
                  placeholder="Buscar por nombre o lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategoria} onValueChange={(v) => setFilterCategoria(v as CategoriaMedicina | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="bg-primary hover:bg-primary/80 text-white"
            >
              <Plus size={18} className="mr-2" />
              Agregar
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="p-4 text-center border-l-4 border-l-primary">
              <p className="text-neutral-medium-gray text-xs font-medium">Total Items</p>
              <p className="text-2xl font-bold text-primary mt-1">{totalItems}</p>
            </Card>
            <Card className="p-4 text-center border-l-4 border-l-status-error">
              <p className="text-neutral-medium-gray text-xs font-medium">Stock Bajo</p>
              <p className="text-2xl font-bold text-status-error mt-1">{stockBajo}</p>
            </Card>
            <Card className="p-4 text-center border-l-4 border-l-status-warning">
              <p className="text-neutral-medium-gray text-xs font-medium">Próximos a Vencer</p>
              <p className="text-2xl font-bold text-status-warning mt-1">{proximosVencer}</p>
            </Card>
            <Card className="p-4 text-center border-l-4 border-l-secondary-green">
              <p className="text-neutral-medium-gray text-xs font-medium">Sin Registro Hoy</p>
              <p className="text-2xl font-bold text-secondary-green mt-1">
                {medicamentos.filter(m => m.fechaActualizacion !== new Date().toISOString().split('T')[0]).length}
              </p>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Nombre</th>
                    <th className="px-4 py-3 text-left font-semibold">Categoría</th>
                    <th className="px-4 py-3 text-left font-semibold">Presentación</th>
                    <th className="px-4 py-3 text-left font-semibold">Lote</th>
                    <th className="px-4 py-3 text-left font-semibold">Stock</th>
                    <th className="px-4 py-3 text-left font-semibold">Vencimiento</th>
                    <th className="px-4 py-3 text-left font-semibold">Actualizado</th>
                    <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMedicamentos.map((med) => {
                    const isLowStock = med.cantidadActual <= med.cantidadInicial * 0.2;
                    const isVencido = med.fechaVencimiento && new Date(med.fechaVencimiento) < new Date();
                    
                    return (
                      <tr key={med.id} className="hover:bg-neutral-light-gray transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-neutral-dark">{med.nombre}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            med.categoria === 'Vacuna' ? 'bg-secondary-green/20 text-secondary-green' :
                            med.categoria === 'Medicamento' ? 'bg-primary/20 text-primary' :
                            'bg-status-warning/20 text-status-warning'
                          }`}>
                            {med.categoria}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-dark">{med.presentacion}</td>
                        <td className="px-4 py-3 font-mono text-sm">{med.numeroLote}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getStockStatus(med.cantidadActual, med.cantidadInicial)}`}>
                              {med.cantidadActual} {med.unidad}
                            </span>
                            {isLowStock && <AlertTriangle size={16} className="text-status-error" />}
                          </div>
                          <p className="text-xs text-neutral-medium-gray">de {med.cantidadInicial}</p>
                        </td>
                        <td className="px-4 py-3">
                          {med.fechaVencimiento ? (
                            <span className={isVencido ? 'text-status-error font-semibold' : ''}>
                              {med.fechaVencimiento}
                            </span>
                          ) : (
                            <span className="text-neutral-medium-gray">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-neutral-medium-gray text-sm">{med.fechaActualizacion}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openUsoModal(med.id)}
                              className="p-2 hover:bg-secondary-green/20 text-secondary-green rounded transition-colors"
                              title="Registrar uso"
                            >
                              <Package size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(med)}
                              className="p-2 hover:bg-primary/20 text-primary rounded transition-colors"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(med.id)}
                              className="p-2 hover:bg-status-error/20 text-status-error rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredMedicamentos.length === 0 && (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-neutral-medium-gray mb-4" />
                  <p className="text-neutral-medium-gray">
                    {searchTerm || filterCategoria !== 'all' 
                      ? 'No hay medicamentos que coincidan con la búsqueda' 
                      : 'No hay medicamentos registrados. Agrega el primer elemento.'}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {showModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-neutral-dark">
                      {editingId ? 'Editar' : 'Agregar'} Medicina
                    </h2>
                    <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-neutral-light-gray rounded">
                      <X size={20} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-dark mb-2">Nombre *</label>
                      <Input
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        placeholder="Ej: Amoxicilina, Vitaminex, etc."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Categoría *</label>
                        <Select 
                          value={formData.categoria} 
                          onValueChange={(v) => setFormData({...formData, categoria: v as CategoriaMedicina})}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {categorias.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Presentación</label>
                        <Input
                          value={formData.presentacion}
                          onChange={(e) => setFormData({...formData, presentacion: e.target.value})}
                          placeholder="Ej: 500mg, 100ml"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Cantidad Inicial *</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.cantidadInicial}
                          onChange={(e) => setFormData({...formData, cantidadInicial: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Cantidad Actual *</label>
                        <Input
                          type="number"
                          min="0"
                          value={formData.cantidadActual}
                          onChange={(e) => setFormData({...formData, cantidadActual: parseInt(e.target.value) || 0})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Unidad *</label>
                        <Input
                          value={formData.unidad}
                          onChange={(e) => setFormData({...formData, unidad: e.target.value})}
                          placeholder="Ej: ml, tabletas"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Número de Lote</label>
                        <Input
                          value={formData.numeroLote}
                          onChange={(e) => setFormData({...formData, numeroLote: e.target.value})}
                          placeholder="Lote-2024-001"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-neutral-dark mb-2">Fecha de Vencimiento</label>
                      <Input
                        type="date"
                        value={formData.fechaVencimiento}
                        onChange={(e) => setFormData({...formData, fechaVencimiento: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-neutral-dark mb-2">Observaciones</label>
                      <textarea
                        value={formData.observaciones}
                        onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                        placeholder="Notas adicionales..."
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none h-20"
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-4">
                      <Button
                        type="button"
                        onClick={() => { setShowModal(false); resetForm(); }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        disabled={!formData.nombre.trim() || !formData.unidad}
                        className="flex-1 bg-primary hover:bg-primary/80 text-white"
                      >
                        <Save size={18} className="mr-2" />
                        {editingId ? 'Actualizar' : 'Guardar'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {showUsoModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <Card className="w-full max-w-md">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-neutral-dark mb-4">Registrar Uso</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-dark mb-2">Cantidad Utilizada *</label>
                      <Input
                        type="number"
                        min="1"
                        value={usoData.cantidad}
                        onChange={(e) => setUsoData({...usoData, cantidad: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-neutral-dark mb-2">Motivo *</label>
                      <Select 
                        value={usoData.motivo} 
                        onValueChange={(v) => setUsoData({...usoData, motivo: v})}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecciona el motivo" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tratamiento">Tratamiento</SelectItem>
                          <SelectItem value="Prevención">Prevención</SelectItem>
                          <SelectItem value="Vacunación">Vacunación</SelectItem>
                          <SelectItem value="Suplementación">Suplementación</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-neutral-dark mb-2">Observaciones</label>
                      <textarea
                        value={usoData.observaciones}
                        onChange={(e) => setUsoData({...usoData, observaciones: e.target.value})}
                        placeholder="Detalles adicionales..."
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none h-20"
                      />
                    </div>
                    
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={() => { setShowUsoModal(false); setSelectedMedicinaId(null); }}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleRegistrarUso}
                        disabled={usoData.cantidad <= 0 || !usoData.motivo.trim()}
                        className="flex-1 bg-secondary-green hover:bg-secondary-green/80 text-white"
                      >
                        Registrar Uso
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