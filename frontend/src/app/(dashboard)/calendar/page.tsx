
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import {
  ChevronLeft, ChevronRight, Plus, Clock, User, X, Check, XCircle, ShieldBan, MonitorX, Play
} from 'lucide-react';

type ViewMode = 'day' | 'week' | 'month';

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 — 20:00

const getLocalYMD = (d: Date) => {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'border-l-warning-400 bg-warning-500/10',
  CONFIRMED: 'border-l-primary-400 bg-primary-500/10',
  CANCELLED: 'border-l-danger-400 bg-danger-500/10 opacity-50',
  ATTENDED: 'border-l-success-400 bg-success-500/10',
  BLOCKED: 'border-l-surface-400 bg-surface-600/30 pattern-diagonal-lines opacity-80',
};

const STATUS_BADGE: Record<string, { variant: 'warning' | 'primary' | 'danger' | 'success' | 'default'; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pendiente' },
  CONFIRMED: { variant: 'primary', label: 'Confirmado' },
  CANCELLED: { variant: 'danger', label: 'Cancelado' },
  ATTENDED: { variant: 'success', label: 'Asistió' },
  BLOCKED: { variant: 'default', label: 'Bloqueado' },
};

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // New Booking / Block state
  const [modalType, setModalType] = useState<'booking'|'block'>('booking');
  const [patients, setPatients] = useState<any[]>([]);
  const [sessionTypes, setSessionTypes] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '09:50',
    patientId: '',
    sessionTypeId: '',
    reason: ''
  });

  const fetchBookings = async (start: Date, end: Date) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/bookings?startDate=${start.toISOString().split('T')[0]}&endDate=${end.toISOString().split('T')[0]}`);
      setBookings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load patients and session types for the modal
    api.get('/patients').then(res => setPatients(res.data)).catch(console.error);
    api.get('/tenants/me').then(res => setSessionTypes(res.sessionTypes)).catch(console.error);
  }, []);

  const refreshCalendar = () => {
    let start = new Date(currentDate);
    let end = new Date(currentDate);

    if (viewMode === 'day') {
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
    } else if (viewMode === 'week') {
      start.setDate(start.getDate() - start.getDay() + 1);
      start.setHours(0,0,0,0);
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23,59,59,999);
    } else if (viewMode === 'month') {
      start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      end.setHours(23,59,59,999);
    }
    fetchBookings(start, end);
  };

  useEffect(() => {
    refreshCalendar();
  }, [currentDate, viewMode]);

  const handleCreateAction = async () => {
    try {
      const payload: any = {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      if (modalType === 'booking') {
        if (!formData.patientId || !formData.sessionTypeId) {
          alert('Paciente y tipo de sesión requeridos.'); return;
        }
        payload.patientId = formData.patientId;
        payload.sessionTypeId = formData.sessionTypeId;
        payload.status = 'CONFIRMED';
      } else {
        payload.status = 'BLOCKED';
        payload.reason = formData.reason || 'Bloqueo Manual';
      }

      await api.post('/bookings', payload);
      setShowNewModal(false);
      refreshCalendar();
    } catch (e: any) {
      alert(e.message || 'Error al crear turno/bloqueo (verifique superposición)');
    }
  };

  const handleStatusChange = async (bookingId: string, status: string) => {
    try {
      await api.patch(`/bookings/${bookingId}`, { status });
      setSelectedBooking(null);
      refreshCalendar();
    } catch (e: any) {
      alert(e.message || 'Error al cambiar estado');
    }
  };

  const dateStr = currentDate.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const navigate = (dir: number) => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + dir);
    else if (viewMode === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    setCurrentDate(d);
  };

  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentDate]);

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days: (number | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentDate]);

  const currDateStr = getLocalYMD(currentDate);
  const dayBookings = bookings.filter(b => b.date.startsWith(currDateStr));
  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Calendario</h1>
          <p className="text-surface-400 capitalize">{dateStr}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-surface-800 rounded-xl p-1 border border-surface-700">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={clsx(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200',
                  viewMode === mode
                    ? 'bg-primary-500 text-white shadow-glow-primary'
                    : 'text-surface-400 hover:text-surface-200',
                )}
              >
                {mode === 'day' ? 'Día' : mode === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 text-sm font-medium text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors"
            >
              Hoy
            </button>
            <button onClick={() => navigate(1)} className="p-2 rounded-lg hover:bg-surface-800 text-surface-400 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <Button size="sm" onClick={() => setShowNewModal(true)}>
            <Plus className="w-4 h-4" />
            Nuevo
          </Button>
        </div>
      </div>

      {isLoading && <div className="h-1 bg-primary-500/20 rounded overflow-hidden"><div className="h-full bg-primary-500 w-1/3 animate-slide-right"></div></div>}

      {/* Day View */}
      {viewMode === 'day' && (
        <Card padding="none" className="overflow-hidden">
          <div className="grid grid-cols-[60px_1fr] divide-x divide-surface-700/50">
            {HOURS.map((hour) => (
              <div key={hour} className="contents">
                <div className="h-20 flex items-start justify-end pr-3 pt-1">
                  <span className="text-xs text-surface-500 font-medium">{hour.toString().padStart(2, '0')}:00</span>
                </div>
                <div className="h-20 border-b border-surface-700/30 relative group hover:bg-surface-800/30 transition-colors">
                  {dayBookings.filter((b) => parseInt(b.startTime) === hour).map((booking) => (
                    <div
                      key={booking.id}
                      onClick={() => setSelectedBooking(booking)}
                      className={clsx(
                        'absolute inset-x-2 top-1 rounded-lg border-l-[3px] p-2.5 cursor-pointer',
                        'hover:shadow-lg transition-shadow duration-200 z-10',
                        STATUS_COLORS[booking.status]
                      )}
                      style={{ borderLeftColor: booking.status === 'BLOCKED' ? '#9ca3af' : (booking.sessionType?.color || '#0ea5e9') }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-surface-100">
                           {booking.status === 'BLOCKED' ? booking.reason || 'Bloqueo' : `${booking.patient?.firstName} ${booking.patient?.lastName}`}
                        </span>
                        <Badge variant={STATUS_BADGE[booking.status]?.variant} dot>
                          {STATUS_BADGE[booking.status]?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-surface-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {booking.startTime} - {booking.endTime}
                        </span>
                        {booking.sessionType && <span className="text-xs text-surface-400">{booking.sessionType.name}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Week View */}
      {viewMode === 'week' && (
        <Card padding="none" className="overflow-x-auto">
          <div className="grid grid-cols-8 min-w-[800px]">
            <div className="p-3 border-b border-surface-700/50" />
            {weekDays.map((day, i) => {
              const isToday = day.toDateString() === new Date().toDateString();
              return (
                <div key={i} className={clsx(
                  'p-3 text-center border-b border-l border-surface-700/50',
                  isToday && 'bg-primary-500/5'
                )}>
                  <p className="text-xs text-surface-400 uppercase">{day.toLocaleDateString('es-AR', { weekday: 'short' })}</p>
                  <p className={clsx('text-lg font-bold mt-1', isToday ? 'text-primary-400' : 'text-surface-200')}>{day.getDate()}</p>
                </div>
              );
            })}
            {HOURS.slice(0, 10).map((hour) => (
              <div key={hour} className="contents">
                <div className="p-2 text-right border-b border-surface-700/30"><span className="text-xs text-surface-500">{hour}:00</span></div>
                {weekDays.map((day, di) => {
                  const dayStr = getLocalYMD(day);
                  const cellBookings = bookings.filter(b => b.date.startsWith(dayStr) && parseInt(b.startTime) === hour);
                  return (
                    <div key={di} className="h-16 border-b border-l border-surface-700/30 hover:bg-surface-800/30 transition-colors relative">
                      {cellBookings.map((b) => (
                        <div key={b.id} onClick={() => setSelectedBooking(b)} className={clsx("absolute inset-1 rounded border-l-2 p-1 overflow-hidden z-10 cursor-pointer", STATUS_COLORS[b.status])} style={{ borderLeftColor: b.status === 'BLOCKED' ? '#9ca3af' : b.sessionType?.color }}>
                          <p className="text-[10px] font-semibold text-surface-200 truncate">{b.status === 'BLOCKED' ? 'Bloqueo' : `${b.patient?.firstName} ${b.patient?.lastName}`}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <Card padding="sm">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-surface-400 py-2">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day, i) => {
              const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day || 1);
              const dayStr = getLocalYMD(dateObj);
              const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
              const monthDayBookings = day !== null ? bookings.filter(b => b.date.startsWith(dayStr)) : [];
              return (
                <div key={i} className={clsx('aspect-square rounded-xl flex flex-col items-center justify-start p-2 transition-colors cursor-pointer', day !== null && 'hover:bg-surface-800 border border-transparent hover:border-surface-700', isToday && 'bg-primary-500/10 border-primary-500/30')}>
                  {day !== null && (
                    <>
                      <span className={clsx('text-sm font-medium', isToday ? 'text-primary-400' : 'text-surface-300')}>{day}</span>
                      {monthDayBookings.length > 0 && (
                        <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                          {monthDayBookings.map(b => (
                            <span key={b.id} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.status === 'BLOCKED' ? '#9ca3af' : (b.sessionType?.color || '#3b82f6') }} title={b.startTime} />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Action Popover */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedBooking(null)}>
          <Card className="w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-surface-100">
                {selectedBooking.status === 'BLOCKED' ? 'Bloqueo de Agenda' : 'Gestión de Turno'}
              </h3>
              <button onClick={() => setSelectedBooking(null)} className="text-surface-400 hover:text-surface-200"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="mb-6 space-y-2 text-sm text-surface-300">
              <p><strong className="text-surface-200">Fecha:</strong> {new Date(selectedBooking.date).toLocaleDateString()} ({selectedBooking.startTime} - {selectedBooking.endTime})</p>
              {selectedBooking.status !== 'BLOCKED' && (
                <>
                  <p><strong className="text-surface-200">Paciente:</strong> {selectedBooking.patient?.lastName}, {selectedBooking.patient?.firstName}</p>
                  <p><strong className="text-surface-200">Tipo:</strong> {selectedBooking.sessionType?.name}</p>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="success" onClick={() => handleStatusChange(selectedBooking.id, 'ATTENDED')} className="flex flex-col items-center py-4 h-auto">
                <Check className="w-5 h-5 mb-1" /> Asistió
              </Button>
              <Button size="sm" variant="primary" onClick={() => handleStatusChange(selectedBooking.id, 'CONFIRMED')} className="flex flex-col items-center py-4 h-auto">
                <Play className="w-5 h-5 mb-1" /> Confirmar
              </Button>
              <Button size="sm" variant="warning" onClick={() => handleStatusChange(selectedBooking.id, 'NO_SHOW')} className="flex flex-col items-center py-4 h-auto">
                <ShieldBan className="w-5 h-5 mb-1" /> Ausente
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleStatusChange(selectedBooking.id, 'CANCELLED')} className="flex flex-col items-center py-4 h-auto">
                <XCircle className="w-5 h-5 mb-1" /> Cancelar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* New Booking / Block Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowNewModal(false)}>
          <Card className="w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-surface-100">Nuevo Evento</h3>
              <button onClick={() => setShowNewModal(false)} className="text-surface-400 hover:text-surface-200"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex bg-surface-800 p-1 rounded-lg mb-6">
              <button
                className={clsx('flex-1 py-1.5 text-sm font-medium rounded-md transition-colors', modalType === 'booking' ? 'bg-surface-700 text-white' : 'text-surface-400 hover:text-surface-300')}
                onClick={() => setModalType('booking')}
              >
                Turno Paciente
              </button>
              <button
                className={clsx('flex-1 py-1.5 text-sm font-medium rounded-md transition-colors', modalType === 'block' ? 'bg-surface-700 text-white' : 'text-surface-400 hover:text-surface-300')}
                onClick={() => setModalType('block')}
              >
                Bloquear Horario
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-surface-400 mb-1">Fecha</label>
                  <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs text-surface-400 mb-1">Inicio</label>
                    <Input type="time" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-400 mb-1">Fin</label>
                    <Input type="time" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                  </div>
                </div>
              </div>

              {modalType === 'booking' ? (
                <>
                  <div>
                    <label className="block text-xs text-surface-400 mb-1">Paciente</label>
                    <select className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-surface-100" value={formData.patientId} onChange={e => setFormData({...formData, patientId: e.target.value})}>
                      <option value="">Seleccione paciente...</option>
                      {patients.map(p => <option key={p.id} value={p.id}>{p.lastName}, {p.firstName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-surface-400 mb-1">Tipo de Sesión</label>
                    <select className="w-full bg-surface-800 border border-surface-700 rounded-xl px-3 py-2 text-surface-100" value={formData.sessionTypeId} onChange={e => setFormData({...formData, sessionTypeId: e.target.value})}>
                      <option value="">Seleccione tipo...</option>
                      {sessionTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs text-surface-400 mb-1">Motivo / Título (Opcional)</label>
                  <Input placeholder="Ej. Almuerzo, Reunión" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
                </div>
              )}

              <Button className="w-full mt-4" onClick={handleCreateAction}>
                {modalType === 'booking' ? 'Crear Turno' : 'Guardar Bloqueo'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
