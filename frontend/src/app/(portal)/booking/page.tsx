'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { clsx } from 'clsx';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import {
  User, Calendar, Clock, CreditCard, CheckCircle2,
  ChevronRight, ArrowLeft, Shield, DollarSign, Building2,
} from 'lucide-react';

type Step = 'professional' | 'session' | 'datetime' | 'payment' | 'confirm';

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'professional', label: 'Profesional', icon: User },
  { key: 'session', label: 'Tipo', icon: Calendar },
  { key: 'datetime', label: 'Horario', icon: Clock },
  { key: 'payment', label: 'Pago', icon: CreditCard },
  { key: 'confirm', label: 'Confirmar', icon: CheckCircle2 },
];

// Dynamic data will be loaded here

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('professional');
  
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [sessionTypes, setSessionTypes] = useState<any[]>([]);
  const [insurances, setInsurances] = useState<any[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedProfessional, setSelectedProfessional] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [insurance, setInsurance] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    // Load all professionals dynamically
    api.get('/tenants/public').then((list: any[]) => {
      setProfessionals(list.map((t: any) => ({
        id: t.id, name: t.name, specialty: t.specialty || 'Especialista', slug: t.slug
      })));
      setIsLoading(false);
    }).catch(console.error);
  }, []);

  // When a professional is selected, load their session types and insurances
  useEffect(() => {
    if (!selectedProfessional) return;
    const prof = professionals.find(p => p.id === selectedProfessional);
    if (!prof) return;
    api.get(`/tenants/slug/${prof.slug}`).then((data: any) => {
      setSessionTypes(data.sessionTypes || []);
      setInsurances(data.tenantInsurances?.map((ti: any) => ({
        id: ti.id,
        name: ti.insuranceProvider.name,
        copay: ti.copayAmount
      })) || []);
    }).catch(console.error);
  }, [selectedProfessional]);

  useEffect(() => {
    if (selectedDate && selectedSession && selectedProfessional) {
      api.get(`/bookings/availability?tenantId=${selectedProfessional}&date=${selectedDate}&sessionTypeId=${selectedSession}`)
        .then((slots) => setTimeSlots(slots.map((s: any) => s.startTime)))
        .catch(console.error);
    }
  }, [selectedDate, selectedSession, selectedProfessional]);

  const currentStepIndex = STEPS.findIndex((s) => s.key === step);
  const selectedSessionData = sessionTypes.find((s) => s.id === selectedSession);
  const selectedInsurance = insurances.find((i) => i.name === insurance);

  const goNext = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) setStep(STEPS[nextIndex].key);
  };

  const goBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) setStep(STEPS[prevIndex].key);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const startMinutes = parseInt(selectedTime.split(':')[0]) * 60 + parseInt(selectedTime.split(':')[1]);
      const endMinutes = startMinutes + (selectedSessionData?.durationMin || 60);
      const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;
      
      const totalAmount = selectedSessionData?.price || 0;
      const copayAmount = selectedInsurance ? selectedInsurance.copay : 0;

      await api.post('/bookings', {
        date: selectedDate + 'T00:00:00Z',
        startTime: selectedTime,
        endTime,
        sessionTypeId: selectedSession,
        tenantId: selectedProfessional,
        reason,
        copayAmount,
        totalAmount
      });
      alert('Turno confirmado exitosamente!');
      router.push('/my-appointments');
    } catch (e: any) {
      alert(e.message || 'Error al confirmar turno');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="text-center py-20 animate-pulse text-surface-400">Cargando...</div>;


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-surface-100">Reservar Turno</h1>
        <p className="text-surface-400 mt-1">Seleccioná profesional, tipo de sesión y horario</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-1">
            <div className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              i <= currentStepIndex
                ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                : 'bg-surface-800 text-surface-500 border border-surface-700',
            )}>
              <s.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-3 h-3 text-surface-600" />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card variant="glass" padding="lg" className="animate-scale-in">
        {/* Step 1: Professional */}
        {step === 'professional' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-surface-200">Elegí un profesional</h2>
            <div className="grid gap-3">
              {professionals.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => { setSelectedProfessional(prof.id); goNext(); }}
                  className={clsx(
                    'flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left w-full',
                    'hover:border-primary-500/50 hover:bg-primary-500/5',
                    selectedProfessional === prof.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-surface-700 bg-surface-800/50',
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-surface-200">{prof.name}</p>
                    <p className="text-sm text-surface-400">{prof.specialty}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Session Type */}
        {step === 'session' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-surface-200">Tipo de sesión</h2>
            <div className="grid gap-3">
              {sessionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => { setSelectedSession(type.id); goNext(); }}
                  className={clsx(
                    'flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 text-left w-full',
                    'hover:border-primary-500/50',
                    selectedSession === type.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-surface-700 bg-surface-800/50',
                  )}
                >
                  <div
                    className="w-3 h-12 rounded-full"
                    style={{ backgroundColor: type.color }}
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-surface-200">{type.name}</p>
                    <p className="text-sm text-surface-400">{type.durationMin} min</p>
                  </div>
                  <span className="text-lg font-bold text-primary-400">
                    ${type.price.toLocaleString('es-AR')}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {step === 'datetime' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-surface-200">Elegí fecha y hora</h2>
            <Input
              type="date"
              label="Fecha"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              id="input-booking-date"
            />

            {selectedDate && (
              <div>
                <p className="text-sm font-medium text-surface-300 mb-3">Horarios disponibles</p>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={clsx(
                        'py-3 rounded-xl text-sm font-medium transition-all duration-200 border',
                        selectedTime === time
                          ? 'bg-primary-500 text-white border-primary-500 shadow-glow-primary'
                          : 'bg-surface-800 text-surface-300 border-surface-700 hover:border-primary-500/50',
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Input
              label="Motivo de consulta"
              placeholder="Describí brevemente el motivo..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              id="input-booking-reason"
            />
          </div>
        )}

        {/* Step 4: Payment Info */}
        {step === 'payment' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-surface-200">Información de Pago</h2>

            <Select
              label="¿Tenés obra social?"
              options={[
                { value: '', label: 'No, particular' },
                ...insurances.map((i) => ({ value: i.name, label: i.name })),
              ]}
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
              id="select-insurance"
            />

            {/* Dynamic Payment Summary */}
            <Card variant="bordered">
              <h3 className="text-sm font-semibold text-surface-200 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary-400" />
                Resumen de Costos
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">{selectedSessionData?.name}</span>
                  <span className="text-surface-200">${selectedSessionData?.price.toLocaleString('es-AR')}</span>
                </div>
                {selectedInsurance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-400">Copago ({selectedInsurance.name})</span>
                    <span className="text-success-400">-${(selectedSessionData!.price - selectedInsurance.copay).toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="border-t border-surface-700 pt-2 flex justify-between">
                  <span className="text-sm font-semibold text-surface-200">Total a pagar</span>
                  <span className="text-lg font-bold text-primary-400">
                    ${(selectedInsurance ? selectedInsurance.copay : selectedSessionData?.price || 0).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </Card>

            {/* Payment details */}
            <Card variant="bordered">
              <h3 className="text-sm font-semibold text-surface-200 mb-2 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary-400" />
                Datos para Transferencia
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Alias</span>
                  <span className="text-surface-200 font-mono">consultorio.martinez.mp</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Titular</span>
                  <span className="text-surface-200">Ana Martínez</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {step === 'confirm' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-success-500/20 border border-success-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-success-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-surface-100">¡Confirmar Turno!</h2>
              <p className="text-surface-400 mt-1">Revisá los datos antes de confirmar</p>
            </div>

            <Card variant="bordered" className="text-left">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Profesional</span>
                  <span className="text-surface-200">
                    {professionals.find((p) => p.id === selectedProfessional)?.name}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Tipo</span>
                  <span className="text-surface-200">{selectedSessionData?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Fecha</span>
                  <span className="text-surface-200">{selectedDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Hora</span>
                  <span className="text-surface-200">{selectedTime}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-surface-700 pt-2">
                  <span className="text-surface-400 font-medium">Total</span>
                  <span className="text-primary-400 font-bold">
                    ${(selectedInsurance ? selectedInsurance.copay : selectedSessionData?.price || 0).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </Card>

            <Button size="lg" fullWidth id="btn-confirm-booking" onClick={handleConfirm} disabled={isSubmitting}>
              {isSubmitting ? 'Confirmando...' : 'Confirmar Reserva'}
            </Button>
          </div>
        )}

        {/* Navigation Buttons */}
        {step !== 'confirm' && (
          <div className="flex justify-between mt-6 pt-4 border-t border-surface-700/50">
            <Button
              variant="ghost"
              onClick={goBack}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="w-4 h-4" />
              Anterior
            </Button>

            {step !== 'professional' && step !== 'session' && (
              <Button
                onClick={goNext}
                disabled={
                  (step === 'datetime' && (!selectedDate || !selectedTime)) ||
                  false
                }
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
