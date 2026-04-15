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

interface AdminContextType {
  workers: Worker[];
  attendance: Attendance[];
  payroll: Payroll[];
  
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
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Inicializar datos desde localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedWorkers = localStorage.getItem('workers');
      const storedAttendance = localStorage.getItem('attendance');
      const storedPayroll = localStorage.getItem('payroll');
      
      if (storedWorkers) setWorkers(JSON.parse(storedWorkers));
      if (storedAttendance) setAttendance(JSON.parse(storedAttendance));
      if (storedPayroll) setPayroll(JSON.parse(storedPayroll));
      
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

  const value: AdminContextType = {
    workers,
    attendance,
    payroll,
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
