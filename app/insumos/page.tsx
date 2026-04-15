'use client';

import React, { useState, useMemo } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { MainLayout } from '@/components/MainLayout';
import { useAdmin, CategoriaInsumo } from '@/context/AdminContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, AlertTriangle, Package, Trash2, Edit, Save, X, MinusCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categoriasInsumos: CategoriaInsumo[] = ['Material de Oficina', 'Insumo Operativo', 'Herramienta', 'Repuesto', 'Equipo'];

export default function InsumosPage() {
  const { insumos, addInsumo, updateInsumo, deleteInsumo, registrarUsoInsumo } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<CategoriaInsumo | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showUsoModal, setShowUsoModal] = useState(false);
  const [selectedInsumoId, setSelectedInsumoId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    categoria: 'Insumo Operativo' as CategoriaInsumo,
    marca: '',
    modelo: '',
    numeroLote: '',
    cantidadInicial: 0,
    cantidadActual: 0,
    unidad: '',
    observaciones: '',
  });
  
  const [usoData, setUsoData] = useState({
    cantidad: 1,
    motivo: '',
    observaciones: '',
  });

  const filteredInsumos = useMemo(() => {
    return insumos.filter(i => {
      const matchesSearch = i.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.marca && i.marca.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (i.numeroLote && i.numeroLote.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategoria = filterCategoria === 'all' || i.categoria === filterCategoria;
      return matchesSearch && matchesCategoria;
    });
  }, [insumos, searchTerm, filterCategoria]);

  const totalItems = insumos.length;
  const stockBajo = insumos.filter(i => i.cantidadActual <= i.cantidadInicial * 0.2 && i.cantidadInicial > 0).length;
  
  const getCategoriaColor = (categoria: CategoriaInsumo) => {
    switch (categoria) {
      case 'Material de Oficina': return 'bg-primary/20 text-primary';
      case 'Insumo Operativo': return 'bg-secondary-green/20 text-secondary-green';
      case 'Herramienta': return 'bg-status-warning/20 text-status-warning';
      case 'Repuesto': return 'bg-status-error/20 text-status-error';
      case 'Equipo': return 'bg-neutral-medium-gray/20 text-neutral-medium-gray';
      default: return 'bg-neutral-light-gray text-neutral-dark';
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      categoria: 'Insumo Operativo',
      marca: '',
      modelo: '',
      numeroLote: '',
      cantidadInicial: 0,
      cantidadActual: 0,
      unidad: '',
      observaciones: '',
    });
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!formData.nombre.trim() || !formData.categoria || !formData.unidad) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    if (editingId) {
      updateInsumo(editingId, {
        ...formData,
        fechaActualizacion: today,
      });
    } else {
      addInsumo({
        ...formData,
        cantidadInicial: formData.cantidadInicial || formData.cantidadActual,
        cantidadActual: formData.cantidadActual || formData.cantidadInicial,
        fechaActualizacion: today,
      });
    }
    
    setShowModal(false);
    resetForm();
  };

  const handleEdit = (ins: typeof insumos[0]) => {
    setFormData({
      nombre: ins.nombre,
      categoria: ins.categoria,
      marca: ins.marca || '',
      modelo: ins.modelo || '',
      numeroLote: ins.numeroLote || '',
      cantidadInicial: ins.cantidadInicial,
      cantidadActual: ins.cantidadActual,
      unidad: ins.unidad,
      observaciones: ins.observaciones || '',
    });
    setEditingId(ins.id);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de eliminar este insumo?')) {
      deleteInsumo(id);
    }
  };

  const openUsoModal = (insumoId: string) => {
    const insumo = insumos.find(i => i.id === insumoId);
    setSelectedInsumoId(insumoId);
    setUsoData({
      cantidad: 1,
      motivo: insumo?.categoria === 'Herramienta' || insumo?.categoria === 'Equipo' ? 'Préstamo' : 'Uso',
      observaciones: '',
    });
    setShowUsoModal(true);
  };

  const handleRegistrarUso = () => {
    if (!selectedInsumoId || usoData.cantidad <= 0 || !usoData.motivo.trim()) return;
    
    registrarUsoInsumo({
      insumoId: selectedInsumoId,
      cantidad: usoData.cantidad,
      fecha: new Date().toISOString().split('T')[0],
      motivo: usoData.motivo,
      observaciones: usoData.observaciones,
    });
    
    setShowUsoModal(false);
    setSelectedInsumoId(null);
  };

  const getStockStatus = (cantidadActual: number, cantidadInicial: number) => {
    if (cantidadActual === 0) return 'text-status-error';
    if (cantidadActual <= cantidadInicial * 0.2 && cantidadInicial > 0) return 'text-status-warning';
    return 'text-status-success';
  };

  return (
    <div className="flex h-screen bg-neutral-light-gray">
      <Sidebar />
      <MainLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-neutral-dark">Inventario General de Insumos y Materiales</h1>
            <p className="text-neutral-medium-gray mt-1">
              Control de material de oficina, insumos operativos, herramientas, repuestos y equipos
            </p>
          </div>

          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-medium-gray" size={18} />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, marca o lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterCategoria} onValueChange={(v) => setFilterCategoria(v as CategoriaInsumo | 'all')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categoriasInsumos.map((cat) => (
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
            <Card className="p-4 text-center border-l-4 border-l-secondary-green">
              <p className="text-neutral-medium-gray text-xs font-medium">Insumos Operativos</p>
              <p className="text-2xl font-bold text-secondary-green mt-1">
                {insumos.filter(i => i.categoria === 'Insumo Operativo').length}
              </p>
            </Card>
            <Card className="p-4 text-center border-l-4 border-l-status-warning">
              <p className="text-neutral-medium-gray text-xs font-medium">Herramientas</p>
              <p className="text-2xl font-bold text-status-warning mt-1">
                {insumos.filter(i => i.categoria === 'Herramienta').length}
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
                    <th className="px-4 py-3 text-left font-semibold">Marca/Modelo</th>
                    <th className="px-4 py-3 text-left font-semibold">Lote</th>
                    <th className="px-4 py-3 text-left font-semibold">Stock</th>
                    <th className="px-4 py-3 text-left font-semibold">Actualizado</th>
                    <th className="px-4 py-3 text-left font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInsumos.map((ins) => {
                    const isLowStock = ins.cantidadActual <= ins.cantidadInicial * 0.2 && ins.cantidadInicial > 0;
                    
                    return (
                      <tr key={ins.id} className="hover:bg-neutral-light-gray transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-neutral-dark">{ins.nombre}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getCategoriaColor(ins.categoria)}`}>
                            {ins.categoria}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-neutral-dark">{ins.marca || '—'}</p>
                          {ins.modelo && <p className="text-xs text-neutral-medium-gray">{ins.modelo}</p>}
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">
                          {ins.numeroLote || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold ${getStockStatus(ins.cantidadActual, ins.cantidadInicial)}`}>
                              {ins.cantidadActual} {ins.unidad}
                            </span>
                            {isLowStock && <AlertTriangle size={16} className="text-status-error" />}
                          </div>
                          {ins.cantidadInicial > 0 && (
                            <p className="text-xs text-neutral-medium-gray">de {ins.cantidadInicial}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-neutral-medium-gray text-sm">{ins.fechaActualizacion}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button
                              onClick={() => openUsoModal(ins.id)}
                              className="p-2 hover:bg-secondary-green/20 text-secondary-green rounded transition-colors"
                              title="Registrar uso"
                            >
                              <MinusCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(ins)}
                              className="p-2 hover:bg-primary/20 text-primary rounded transition-colors"
                              title="Editar"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(ins.id)}
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
              {filteredInsumos.length === 0 && (
                <div className="text-center py-12">
                  <Package size={48} className="mx-auto text-neutral-medium-gray mb-4" />
                  <p className="text-neutral-medium-gray">
                    {searchTerm || filterCategoria !== 'all' 
                      ? 'No hay insumos que coincidan con la búsqueda' 
                      : 'No hay insumos registrados. Agrega el primer elemento.'}
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
                      {editingId ? 'Editar' : 'Agregar'} Insumo
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
                        placeholder="Ej: Alimento concentrado, Papel bond, etc."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Categoría *</label>
                        <Select 
                          value={formData.categoria} 
                          onValueChange={(v) => setFormData({...formData, categoria: v as CategoriaInsumo})}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {categoriasInsumos.map((cat) => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Marca</label>
                        <Input
                          value={formData.marca}
                          onChange={(e) => setFormData({...formData, marca: e.target.value})}
                          placeholder="Ej: 3M, Truper"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-dark mb-2">Modelo</label>
                        <Input
                          value={formData.modelo}
                          onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                          placeholder="Ej: TK-500"
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
                    
                    <div>
                      <label className="block text-sm font-semibold text-neutral-dark mb-2">Unidad *</label>
                      <Input
                        value={formData.unidad}
                        onChange={(e) => setFormData({...formData, unidad: e.target.value})}
                        placeholder="Ej: kg, resmas, piezas"
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
                          <SelectItem value="Uso">Uso operativo</SelectItem>
                          <SelectItem value="Préstamo">Préstamo</SelectItem>
                          <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                          <SelectItem value="Reposición">Reposición</SelectItem>
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
                        onClick={() => { setShowUsoModal(false); setSelectedInsumoId(null); }}
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