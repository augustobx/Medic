'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import {
  User, Clock, Calendar, Save, Plus, Trash2, Tag, Activity, FileText
} from 'lucide-react';
import { DEFAULT_ANAMNESIS_SECTIONS } from '@/lib/anamnesis';

const DAYS = [
  { id: 'MONDAY', label: 'Lunes' },
  { id: 'TUESDAY', label: 'Martes' },
  { id: 'WEDNESDAY', label: 'Miércoles' },
  { id: 'THURSDAY', label: 'Jueves' },
  { id: 'FRIDAY', label: 'Viernes' },
  { id: 'SATURDAY', label: 'Sábado' },
  { id: 'SUNDAY', label: 'Domingo' }
];

export default function SettingsPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form states for new items
  const [newSessionType, setNewSessionType] = useState({ name: '', durationMin: 50, price: 0, color: '#0EA5E9' });
  const [newAvailability, setNewAvailability] = useState({ dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '18:00' });

  useEffect(() => {
    fetchTenant();
  }, []);

  const fetchTenant = async () => {
    try {
      const res = await api.get('/tenants/me');
      if (!res.anamnesisTemplate) {
        res.anamnesisTemplate = DEFAULT_ANAMNESIS_SECTIONS;
      }
      setTenant(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/tenants/me', {
        name: tenant.name,
        specialty: tenant.specialty,
        phone: tenant.phone,
        email: tenant.email,
        address: tenant.address,
        anamnesisTemplate: tenant.anamnesisTemplate,
      });
      alert('Perfil y configuración actualizados');
    } catch (e) {
      alert('Error al actualizar');
    }
  };

  const handleCreateSessionType = async () => {
    if (!newSessionType.name) return;
    try {
      await api.post('/tenants/me/session-types', {
        ...newSessionType,
        durationMin: Number(newSessionType.durationMin),
        price: Number(newSessionType.price)
      });
      setNewSessionType({ name: '', durationMin: 50, price: 0, color: '#0EA5E9' });
      fetchTenant();
    } catch (e) {
      alert('Error al crear tipo de sesión');
    }
  };

  const handleDeleteSessionType = async (id: string) => {
    try {
      await api.delete(`/tenants/me/session-types/${id}`);
      fetchTenant();
    } catch (e) {
      alert('Error al eliminar');
    }
  };

  const handleCreateAvailability = async () => {
    try {
      await api.post('/tenants/me/availabilities', newAvailability);
      fetchTenant();
    } catch (e) {
      alert('Error al crear horario');
    }
  };

  const handleDeleteAvailability = async (id: string) => {
    try {
      await api.delete(`/tenants/me/availabilities/${id}`);
      fetchTenant();
    } catch (e) {
      alert('Error al eliminar');
    }
  };

  if (loading || !tenant) return <div className="p-8 text-center text-surface-400">Cargando configuración...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Configuración</h1>
        <p className="text-surface-400">Perfil, horarios de atención y servicios ofrecidos</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile */}
        <Card>
          <h3 className="font-semibold text-surface-200 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-400" />
            Perfil del Consultorio
          </h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input label="Nombre del consultorio" value={tenant.name || ''} onChange={e => setTenant({...tenant, name: e.target.value})} />
            <Input label="Especialidad" value={tenant.specialty || ''} onChange={e => setTenant({...tenant, specialty: e.target.value})} />
            <Input label="Email" type="email" value={tenant.email || ''} onChange={e => setTenant({...tenant, email: e.target.value})} />
            <Input label="Teléfono" value={tenant.phone || ''} onChange={e => setTenant({...tenant, phone: e.target.value})} />
            <Input label="Dirección" value={tenant.address || ''} onChange={e => setTenant({...tenant, address: e.target.value})} />
            <Button type="submit">
              <Save className="w-4 h-4" />
              Guardar Cambios
            </Button>
          </form>
        </Card>

        {/* Anamnesis Configuration */}
        <Card>
          <h3 className="font-semibold text-surface-200 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-400" />
            Configuración de Anamnesis
          </h3>
          <p className="text-sm text-surface-400 mb-4">
            Selecciona qué campos son obligatorios para los pacientes al completar su anamnesis.
          </p>
          <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {tenant.anamnesisTemplate?.map((section: any, sIdx: number) => (
              <div key={sIdx} className="space-y-3">
                <h4 className="text-sm font-medium text-surface-300 border-b border-surface-700 pb-1">{section.title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {section.fields.map((field: any, fIdx: number) => (
                    <label key={field.key} className="flex items-center gap-3 p-2 rounded-lg bg-surface-800/50 border border-surface-700/50 cursor-pointer hover:bg-surface-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => {
                          const newTemplate = [...tenant.anamnesisTemplate];
                          newTemplate[sIdx].fields[fIdx].required = e.target.checked;
                          setTenant({ ...tenant, anamnesisTemplate: newTemplate });
                        }}
                        className="w-4 h-4 rounded text-primary-500 bg-surface-900 border-surface-600 focus:ring-primary-500/50"
                      />
                      <div className="min-w-0">
                        <span className="text-sm text-surface-200 block truncate">{field.label}</span>
                        <span className="text-xs text-surface-500 block capitalize">{field.type}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button onClick={handleUpdateProfile} fullWidth>
              <Save className="w-4 h-4" />
              Guardar Configuración
            </Button>
          </div>
        </Card>

        {/* Schedule / Availability */}
        <Card>
          <h3 className="font-semibold text-surface-200 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-400" />
            Horarios de Atención
          </h3>
          <p className="text-sm text-surface-400 mb-4">
            Define tus bloques horarios. El motor armará la agenda dividiendo estos bloques según la duración de tus servicios.
          </p>
          
          <div className="space-y-3 mb-6">
            {tenant.availabilities?.length === 0 && <p className="text-sm text-surface-500">No hay horarios configurados.</p>}
            {tenant.availabilities?.map((avail: any) => (
              <div key={avail.id} className="flex items-center justify-between py-2 border-b border-surface-700/30">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-surface-200 w-24">{DAYS.find(d => d.id === avail.dayOfWeek)?.label}</span>
                  <span className="text-surface-400 text-sm bg-surface-800 px-2 py-1 rounded">{avail.startTime} - {avail.endTime}</span>
                </div>
                <button onClick={() => handleDeleteAvailability(avail.id)} className="p-1.5 rounded-lg text-danger-400 hover:bg-danger-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-surface-800/50 p-4 rounded-xl border border-surface-700/50 space-y-3">
            <h4 className="text-sm font-medium text-surface-300">Agregar nuevo horario</h4>
            <div className="flex gap-2">
              <select className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-2 text-sm text-surface-200" value={newAvailability.dayOfWeek} onChange={e => setNewAvailability({...newAvailability, dayOfWeek: e.target.value})}>
                {DAYS.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
              </select>
              <Input type="time" className="w-24 !py-1 text-sm" value={newAvailability.startTime} onChange={e => setNewAvailability({...newAvailability, startTime: e.target.value})} />
              <span className="text-surface-500 self-center">a</span>
              <Input type="time" className="w-24 !py-1 text-sm" value={newAvailability.endTime} onChange={e => setNewAvailability({...newAvailability, endTime: e.target.value})} />
            </div>
            <Button variant="secondary" size="sm" fullWidth onClick={handleCreateAvailability}>
              <Plus className="w-4 h-4" /> Agregar Bloque
            </Button>
          </div>
        </Card>

        {/* Session Types */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-surface-200 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-400" />
            Tipos de Sesión (Servicios)
          </h3>
          <p className="text-sm text-surface-400 mb-6">
            La <strong>Duración</strong> es fundamental. Si un paciente elige un servicio de 60 mins, el sistema bloqueará 60 mins de tu horario disponible.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {tenant.sessionTypes?.map((st: any) => (
              <div key={st.id} className="bg-surface-800/30 border border-surface-700 rounded-xl p-4 flex items-start justify-between group hover:border-surface-600 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }}></span>
                    <h4 className="font-semibold text-surface-200">{st.name}</h4>
                  </div>
                  <div className="text-sm text-surface-400 flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {st.durationMin} min</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3"/> ${st.price}</span>
                  </div>
                </div>
                <button onClick={() => handleDeleteSessionType(st.id)} className="p-2 rounded-lg text-surface-500 hover:text-danger-400 hover:bg-danger-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-surface-800/50 p-5 rounded-xl border border-surface-700/50">
            <h4 className="font-medium text-surface-300 mb-4">Agregar Nuevo Servicio</h4>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <Input label="Nombre del servicio" placeholder="Ej. Sesión Regular" value={newSessionType.name} onChange={e => setNewSessionType({...newSessionType, name: e.target.value})} />
              <Input label="Duración (minutos)" type="number" min="5" step="5" value={newSessionType.durationMin} onChange={e => setNewSessionType({...newSessionType, durationMin: Number(e.target.value)})} />
              <Input label="Precio ($)" type="number" min="0" step="100" value={newSessionType.price} onChange={e => setNewSessionType({...newSessionType, price: Number(e.target.value)})} />
              <div>
                <label className="block text-xs font-medium text-surface-400 mb-1.5">Color</label>
                <div className="flex gap-2">
                  <input type="color" className="h-10 w-12 rounded cursor-pointer bg-transparent border-0" value={newSessionType.color} onChange={e => setNewSessionType({...newSessionType, color: e.target.value})} />
                  <Button variant="primary" className="flex-1" onClick={handleCreateSessionType}>Guardar</Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
