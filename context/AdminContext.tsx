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

const STORAGE_KEYS = {
  workers: 'workers',
  attendance: 'attendance',
  payroll: 'payroll',
  medicamentos: 'medicamentos',
  usosMedicamentos: 'usosMedicamentos',
  insumos: 'insumos',
  usosInsumos: 'usosInsumos',
} as const;

function loadStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

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
    if (typeof window === 'undefined') return;
    const loadedWorkers = loadStorage<Worker[]>(STORAGE_KEYS.workers, []);
    const loadedAttendance = loadStorage<Attendance[]>(STORAGE_KEYS.attendance, []);
    const loadedPayroll = loadStorage<Payroll[]>(STORAGE_KEYS.payroll, []);
    const loadedMedicamentos = loadStorage<Medicina[]>(STORAGE_KEYS.medicamentos, []);
    const loadedUsosMedicamentos = loadStorage<UsoMedicina[]>(STORAGE_KEYS.usosMedicamentos, []);
    const loadedInsumos = loadStorage<Insumo[]>(STORAGE_KEYS.insumos, []);
    const loadedUsosInsumos = loadStorage<UsoInsumo[]>(STORAGE_KEYS.usosInsumos, []);

    const dedupeByKey = <T,>(arr: T[], keyFn: (t: T) => string) => {
      const seen = new Set<string>();
      return arr.filter((item) => {
        const k = keyFn(item);
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
    };

    setWorkers(loadedWorkers);
    setAttendance(loadedAttendance);
    // Ensure payroll IDs are unique (reassign duplicates) and deduplicate by worker-month-year
    const makeUniqueId = (prefix: string) => {
      if (typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function') {
        return `${prefix}-${(crypto as any).randomUUID()}`;
      }
      return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    };

    const normalizedPayroll: Payroll[] = [];
    const seenIds = new Set<string>();
    for (const p of loadedPayroll) {
      let id = p.id;
      if (!id || seenIds.has(id)) {
        // assign a fresh unique id when missing or duplicate
        let newId: string;
        do {
          newId = makeUniqueId('P');
        } while (seenIds.has(newId));
        id = newId;
        // eslint-disable-next-line no-console
        console.warn('AdminContext: duplicate payroll id detected. Reassigning id.', p);
      }
      normalizedPayroll.push({ ...p, id });
      seenIds.add(id);
    }

    setPayroll(dedupeByKey(normalizedPayroll, (p: Payroll) => `${p.workerId}-${p.mes}-${p.año}`));
    setMedicamentos(loadedMedicamentos);
    setUsosMedicamentos(loadedUsosMedicamentos);
    setInsumos(loadedInsumos);
    setUsosInsumos(loadedUsosInsumos);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;

    saveStorage(STORAGE_KEYS.workers, workers);
    saveStorage(STORAGE_KEYS.attendance, attendance);
    saveStorage(STORAGE_KEYS.payroll, payroll);
    saveStorage(STORAGE_KEYS.medicamentos, medicamentos);
    saveStorage(STORAGE_KEYS.usosMedicamentos, usosMedicamentos);
    saveStorage(STORAGE_KEYS.insumos, insumos);
    saveStorage(STORAGE_KEYS.usosInsumos, usosInsumos);
  }, [workers, attendance, payroll, medicamentos, usosMedicamentos, insumos, usosInsumos, isInitialized]);

  // Workers functions
  const addWorker = (worker: Omit<Worker, 'id'>) => {
    const newWorker: Worker = {
      ...worker,
      id: `W-${Date.now()}`,
    };
    setWorkers((prev) => [...prev, newWorker]);
  };

  const updateWorker = (id: string, updates: Partial<Worker>) => {
    setWorkers((prev) => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const deleteWorker = (id: string) => {
    setWorkers((prev) => prev.filter(w => w.id !== id));
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
    setAttendance((prev) => [...prev, newAttendance]);
  };

  const updateAttendance = (id: string, updates: Partial<Attendance>) => {
    setAttendance((prev) => prev.map(a => a.id === id ? { ...a, ...updates } : a));
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
        justificada: false,
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

  const generateUniqueId = (prefix: string) => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return `${prefix}-${crypto.randomUUID()}`;
    }
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  };

  // Payroll functions
  const addPayroll = (pay: Omit<Payroll, 'id'>) => {
    setPayroll((prev) => {
      const exists = prev.some(p => p.workerId === pay.workerId && p.mes === pay.mes && p.año === pay.año);
      if (exists) return prev;
      const newPayroll: Payroll = {
        ...pay,
        id: generateUniqueId('P'),
      };
      return [...prev, newPayroll];
    });
  };

  const updatePayroll = (id: string, updates: Partial<Payroll>) => {
    setPayroll((prev) => prev.map(p => p.id === id ? { ...p, ...updates } : p));
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
    setMedicamentos((prev) => [...prev, newMedicina]);
  };

  const updateMedicina = (id: string, updates: Partial<Medicina>) => {
    setMedicamentos((prev) => prev.map(m => m.id === id ? { ...m, ...updates } : m));
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
    setInsumos((prev) => [...prev, newInsumo]);
  };

  const updateInsumo = (id: string, updates: Partial<Insumo>) => {
    setInsumos((prev) => prev.map(i => i.id === id ? { ...i, ...updates } : i));
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
