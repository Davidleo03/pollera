'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipos de datos
export interface Worker {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  rol: 'Técnico de Galpón' | 'Vacunador' | 'Técnico de Climatización' | 'Otro';
  tipoContrato: 'Fijo' | 'Suplente';
  galpones: string[];
  estado: 'Activo' | 'Inactivo' | 'Descanso';
  salarioBase: number;
  fechaIngreso: string;
  diasLibreRotacion: string[]; // Ej: ['Lunes', 'Martes'] o ['Miércoles', 'Jueves']
  disponibilidad: 'Disponible' | 'En rotación' | 'Vacaciones';
}

export interface Attendance {
  id: string;
  workerId: string;
  fecha: string;
  checkIn: string | null;
  checkOut: string | null;
  estado: 'Presente' | 'Ausente' | 'Justificado' | 'Día Libre';
  notas?: string;
  justificacion?: string;
  justificada: boolean;
}

export interface Payroll {
  id: string;
  workerId: string;
  mes: string;
  año: number;
  salarioBase: number;
  horas: number;
  bonificacion: number;
  descuentos: number;
  salarioNeto: number;
  estado: 'Generada' | 'Procesada' | 'Pagada';
}

export type CategoriaMedicina = 'Medicamento' | 'Vacuna' | 'Multivitamínico' | 'Suplemento' | 'Aditivo';

export interface Medicina {
  id: string;
  nombre: string;
  categoria: CategoriaMedicina;
  presentacion: string;
  cantidadInicial: number;
  cantidadActual: number;
  unidad: string;
  numeroLote: string;
  fechaVencimiento: string;
  fechaActualizacion: string;
  observaciones?: string;
}

export interface UsoMedicina {
  id: string;
  medicinaId: string;
  cantidad: number;
  fecha: string;
  motivo: string;
  observaciones?: string;
}

export type CategoriaInsumo = 'Material de Oficina' | 'Insumo Operativo' | 'Herramienta' | 'Repuesto' | 'Equipo';

export interface Insumo {
  id: string;
  nombre: string;
  categoria: CategoriaInsumo;
  marca?: string;
  modelo?: string;
  numeroLote?: string;
  cantidadInicial: number;
  cantidadActual: number;
  unidad: string;
  fechaActualizacion: string;
  observaciones?: string;
}

export interface UsoInsumo {
  id: string;
  insumoId: string;
  cantidad: number;
  fecha: string;
  motivo: string;
  observaciones?: string;
}

interface AdminContextType {
  workers: Worker[];
  attendance: Attendance[];
  payroll: Payroll[];
  medicamentos: Medicina[];
  usosMedicamentos: UsoMedicina[];
  insumos: Insumo[];
  usosInsumos: UsoInsumo[];
  
  // Workers
  addWorker: (worker: Omit<Worker, 'id'>) => void;
  updateWorker: (id: string, worker: Partial<Worker>) => void;
  deleteWorker: (id: string) => void;
  getWorker: (id: string) => Worker | undefined;
  getWorkersByType: (tipoContrato: 'Fijo' | 'Suplente') => Worker[];
  
  // Attendance
  addAttendance: (attendance: Omit<Attendance, 'id'>) => void;
  updateAttendance: (id: string, attendance: Partial<Attendance>) => void;
  checkIn: (workerId: string, fecha: string) => void;
  checkOut: (workerId: string, fecha: string) => void;
  getAttendanceByWorker: (workerId: string, mes?: string) => Attendance[];
  justifyAbsence: (attendanceId: string, justificacion: string) => void;
  isScheduledFreeDay: (workerId: string, fecha: string) => boolean;
  
  // Payroll
  addPayroll: (payroll: Omit<Payroll, 'id'>) => void;
  updatePayroll: (id: string, payroll: Partial<Payroll>) => void;
  getPayrollByWorker: (workerId: string) => Payroll[];
  getPayrollByMonth: (mes: string, año: number) => Payroll[];
  
  // Inventario de Medicinas
  addMedicina: (medicina: Omit<Medicina, 'id'>) => void;
  updateMedicina: (id: string, medicina: Partial<Medicina>) => void;
  deleteMedicina: (id: string) => void;
  registrarUsoMedicina: (uso: Omit<UsoMedicina, 'id'>) => void;
  
  // Inventario de Insumos
  addInsumo: (insumo: Omit<Insumo, 'id'>) => void;
  updateInsumo: (id: string, insumo: Partial<Insumo>) => void;
  deleteInsumo: (id: string) => void;
  registrarUsoInsumo: (uso: Omit<UsoInsumo, 'id'>) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicina[]>([]);
  const [usosMedicamentos, setUsosMedicamentos] = useState<UsoMedicina[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [usosInsumos, setUsosInsumos] = useState<UsoInsumo[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar datos desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWorkers = localStorage.getItem('workers');
      const storedAttendance = localStorage.getItem('attendance');
      const storedPayroll = localStorage.getItem('payroll');
      const storedMedicamentos = localStorage.getItem('medicamentos');
      const storedUsosMedicamentos = localStorage.getItem('usosMedicamentos');
      const storedInsumos = localStorage.getItem('insumos');
      const storedUsosInsumos = localStorage.getItem('usosInsumos');
      
      if (storedWorkers) setWorkers(JSON.parse(storedWorkers));
      if (storedAttendance) setAttendance(JSON.parse(storedAttendance));
      if (storedPayroll) setPayroll(JSON.parse(storedPayroll));
      if (storedMedicamentos) setMedicamentos(JSON.parse(storedMedicamentos));
      if (storedUsosMedicamentos) setUsosMedicamentos(JSON.parse(storedUsosMedicamentos));
      if (storedInsumos) setInsumos(JSON.parse(storedInsumos));
      if (storedUsosInsumos) setUsosInsumos(JSON.parse(storedUsosInsumos));
      
      setIsInitialized(true);
    }
  }, []);

  // Guardar workers
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('workers', JSON.stringify(workers));
    }
  }, [workers, isInitialized]);

  // Guardar attendance
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('attendance', JSON.stringify(attendance));
    }
  }, [attendance, isInitialized]);

  // Guardar payroll
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('payroll', JSON.stringify(payroll));
    }
  }, [payroll, isInitialized]);

  // Guardar medicamentos
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('medicamentos', JSON.stringify(medicamentos));
    }
  }, [medicamentos, isInitialized]);

  // Guardar usos de medicamentos
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('usosMedicamentos', JSON.stringify(usosMedicamentos));
    }
  }, [usosMedicamentos, isInitialized]);

  // Guardar insumos
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('insumos', JSON.stringify(insumos));
    }
  }, [insumos, isInitialized]);

  // Guardar usos de insumos
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      localStorage.setItem('usosInsumos', JSON.stringify(usosInsumos));
    }
  }, [usosInsumos, isInitialized]);

  // Workers functions
  const addWorker = (worker: Omit<Worker, 'id'>) => {
    const newWorker: Worker = {
      ...worker,
      id: `W-${Date.now()}`,
    };
    setWorkers([...workers, newWorker]);
  };

  const updateWorker = (id: string, updates: Partial<Worker>) => {
    setWorkers(workers.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWorker = (id: string) => {
    setWorkers(workers.filter(w => w.id !== id));
  };

  const getWorker = (id: string) => {
    return workers.find(w => w.id === id);
  };

  const getWorkersByType = (tipoContrato: 'Fijo' | 'Suplente') => {
    return workers.filter(w => w.tipoContrato === tipoContrato);
  };

  const isScheduledFreeDay = (workerId: string, fecha: string) => {
    const worker = getWorker(workerId);
    if (!worker || !worker.diasLibreRotacion) return false;
    
    const date = new Date(fecha);
    const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    return worker.diasLibreRotacion.includes(capitalizedDay);
  };

  // Attendance functions
  const addAttendance = (att: Omit<Attendance, 'id'>) => {
    const newAttendance: Attendance = {
      ...att,
      id: `A-${Date.now()}`,
    };
    setAttendance([...attendance, newAttendance]);
  };

  const updateAttendance = (id: string, updates: Partial<Attendance>) => {
    setAttendance(attendance.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const checkIn = (workerId: string, fecha: string) => {
    const existingRecord = attendance.find(
      a => a.workerId === workerId && a.fecha === fecha
    );
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (existingRecord) {
      updateAttendance(existingRecord.id, {
        checkIn: timeString,
        estado: 'Presente',
      });
    } else {
      addAttendance({
        workerId,
        fecha,
        checkIn: timeString,
        checkOut: null,
        estado: 'Presente',
      });
    }
  };

  const checkOut = (workerId: string, fecha: string) => {
    const record = attendance.find(
      a => a.workerId === workerId && a.fecha === fecha
    );
    if (record) {
      const now = new Date();
      const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      updateAttendance(record.id, { checkOut: timeString });
    }
  };

  const getAttendanceByWorker = (workerId: string, mes?: string) => {
    return attendance.filter(a => {
      if (a.workerId !== workerId) return false;
      if (mes) {
        const recordMonth = a.fecha.substring(0, 7);
        return recordMonth === mes;
      }
      return true;
    });
  };

  const justifyAbsence = (attendanceId: string, justificacion: string) => {
    updateAttendance(attendanceId, {
      justificada: true,
      justificacion,
      estado: 'Justificado',
    });
  };

  // Payroll functions
  const addPayroll = (pay: Omit<Payroll, 'id'>) => {
    const newPayroll: Payroll = {
      ...pay,
      id: `P-${Date.now()}`,
    };
    setPayroll([...payroll, newPayroll]);
  };

  const updatePayroll = (id: string, updates: Partial<Payroll>) => {
    setPayroll(payroll.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const getPayrollByWorker = (workerId: string) => {
    return payroll.filter(p => p.workerId === workerId);
  };

  const getPayrollByMonth = (mes: string, año: number) => {
    return payroll.filter(p => p.mes === mes && p.año === año);
  };

  // Inventario de Medicinas functions
  const addMedicina = (medicina: Omit<Medicina, 'id'>) => {
    const newMedicina: Medicina = {
      ...medicina,
      id: `M-${Date.now()}`,
    };
    setMedicamentos([...medicamentos, newMedicina]);
  };

  const updateMedicina = (id: string, updates: Partial<Medicina>) => {
    setMedicamentos(medicamentos.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deleteMedicina = (id: string) => {
    setMedicamentos(medicamentos.filter(m => m.id !== id));
  };

  const registrarUsoMedicina = (uso: Omit<UsoMedicina, 'id'>) => {
    const newUso: UsoMedicina = {
      ...uso,
      id: `UM-${Date.now()}`,
    };
    setUsosMedicamentos([...usosMedicamentos, newUso]);
    
    const medicina = medicamentos.find(m => m.id === uso.medicinaId);
    if (medicina) {
      const nuevaCantidad = medicina.cantidadActual - uso.cantidad;
      updateMedicina(uso.medicinaId, {
        cantidadActual: Math.max(0, nuevaCantidad),
        fechaActualizacion: new Date().toISOString().split('T')[0],
      });
    }
  };

  // Inventario de Insumos functions
  const addInsumo = (insumo: Omit<Insumo, 'id'>) => {
    const newInsumo: Insumo = {
      ...insumo,
      id: `I-${Date.now()}`,
    };
    setInsumos([...insumos, newInsumo]);
  };

  const updateInsumo = (id: string, updates: Partial<Insumo>) => {
    setInsumos(insumos.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const deleteInsumo = (id: string) => {
    setInsumos(insumos.filter(i => i.id !== id));
  };

  const registrarUsoInsumo = (uso: Omit<UsoInsumo, 'id'>) => {
    const newUso: UsoInsumo = {
      ...uso,
      id: `UI-${Date.now()}`,
    };
    setUsosInsumos([...usosInsumos, newUso]);
    
    const insumo = insumos.find(i => i.id === uso.insumoId);
    if (insumo) {
      const nuevaCantidad = insumo.cantidadActual - uso.cantidad;
      updateInsumo(uso.insumoId, {
        cantidadActual: Math.max(0, nuevaCantidad),
        fechaActualizacion: new Date().toISOString().split('T')[0],
      });
    }
  };

  const value: AdminContextType = {
    workers,
    attendance,
    payroll,
    medicamentos,
    usosMedicamentos,
    insumos,
    usosInsumos,
    addWorker,
    updateWorker,
    deleteWorker,
    getWorker,
    getWorkersByType,
    addAttendance,
    updateAttendance,
    checkIn,
    checkOut,
    getAttendanceByWorker,
    justifyAbsence,
    isScheduledFreeDay,
    addPayroll,
    updatePayroll,
    getPayrollByWorker,
    getPayrollByMonth,
    addMedicina,
    updateMedicina,
    deleteMedicina,
    registrarUsoMedicina,
    addInsumo,
    updateInsumo,
    deleteInsumo,
    registrarUsoInsumo,
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin debe ser usado dentro de AdminProvider');
  }
  return context;
}
