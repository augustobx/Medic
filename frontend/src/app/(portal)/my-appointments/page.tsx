
'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Calendar, Clock, User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const STATUS_MAP: Record<string, { variant: 'warning' | 'primary' | 'success' | 'danger'; label: string }> = {
  PENDING: { variant: 'warning', label: 'Pendiente' },
  CONFIRMED: { variant: 'primary', label: 'Confirmado' },
  ATTENDED: { variant: 'success', label: 'Asistió' },
  CANCELLED: { variant: 'danger', label: 'Cancelado' },
};

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // Use /bookings/my — works for patients without tenant guard
      const res = await api.get('/bookings/my');
      setAppointments(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('¿Estás seguro de que querés cancelar este turno?')) return;
    try {
      await api.delete(`/bookings/my/${id}`);
      alert('Turno cancelado exitosamente');
      fetchAppointments();
    } catch (e: any) {
      alert(e.message || 'Error al cancelar');
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 animate-pulse text-surface-400">Cargando turnos...</div>;
  }

  const upcoming = appointments.filter((a) => ['PENDING', 'CONFIRMED'].includes(a.status));
  const past = appointments.filter((a) => ['ATTENDED', 'CANCELLED'].includes(a.status));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-surface-100">Mis Turnos</h1>
        <p className="text-surface-400 mt-1">Consultá y gestioná tus próximos turnos</p>
      </div>

      {/* Upcoming */}
      <div>
        <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wide mb-3">Próximos</h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-8 bg-surface-900 rounded-xl border border-dashed border-surface-700">
            <p className="text-sm text-surface-400">No tenés próximos turnos agendados.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {upcoming.map((apt) => (
              <Card key={apt.id} variant="bordered" className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary-500/10 border border-primary-500/20 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs text-primary-400 font-medium">
                    {new Date(apt.date).toLocaleDateString('es-AR', { month: 'short' }).toUpperCase()}
                  </span>
                  <span className="text-lg font-bold text-primary-400">
                    {new Date(apt.date).getDate()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-surface-200">{apt.sessionType?.name || 'Turno'}</span>
                    <Badge variant={STATUS_MAP[apt.status]?.variant || 'primary'} dot>
                      {STATUS_MAP[apt.status]?.label || apt.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-surface-400">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.startTime}</span>
                  </div>
                </div>
                {apt.status !== 'ATTENDED' && (
                  <Button variant="danger" size="sm" onClick={() => handleCancel(apt.id)}>Cancelar</Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-surface-300 uppercase tracking-wide mb-3">Historial</h2>
          <div className="grid gap-3">
            {past.map((apt) => (
              <Card key={apt.id} className="flex items-center gap-4 opacity-70">
                <div className="w-14 h-14 rounded-xl bg-surface-800 border border-surface-700 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-xs text-surface-400 font-medium">
                    {new Date(apt.date).toLocaleDateString('es-AR', { month: 'short' }).toUpperCase()}
                  </span>
                  <span className="text-lg font-bold text-surface-300">
                    {new Date(apt.date).getDate()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-surface-300">{apt.sessionType?.name || 'Turno'}</span>
                    <Badge variant={STATUS_MAP[apt.status]?.variant || 'primary'}>{STATUS_MAP[apt.status]?.label || apt.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-surface-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.startTime}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="text-center mt-8">
        <Button onClick={() => router.push('/booking')} id="btn-book-new">
          <Calendar className="w-4 h-4" />
          Reservar Nuevo Turno
        </Button>
      </div>
    </div>
  );
}
