'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { User, Phone, Mail, Activity, ClipboardList } from 'lucide-react';

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/profile')
      .then((data) => {
        setProfile(data);
        setIsLoading(false);
      })
      .catch(console.error);
  }, []);

  if (isLoading) {
    return <div className="text-center py-20 animate-pulse text-surface-400">Cargando perfil...</div>;
  }

  if (!profile) {
    return <div className="text-center py-20 text-surface-400">No se pudo cargar el perfil.</div>;
  }

  const patient = profile.patient;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-surface-100">Mi Perfil</h1>
        <p className="text-surface-400 mt-1">Tus datos personales y ficha clínica</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-surface-600 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-primary-400">
                {profile.firstName[0]}{profile.lastName[0]}
              </span>
            </div>
            <h2 className="text-xl font-bold text-surface-100">
              {profile.firstName} {profile.lastName}
            </h2>
            <Badge variant="primary" className="mt-2">Paciente</Badge>
          </Card>

          <Card>
            <h3 className="font-semibold text-surface-200 mb-4 border-b border-surface-700 pb-2">Datos de Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-surface-400" />
                <span className="text-surface-200">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-surface-400" />
                  <span className="text-surface-200">{profile.phone}</span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Clinical Info (Anamnesis) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4 border-b border-surface-700 pb-2">
              <ClipboardList className="w-5 h-5 text-primary-400" />
              <h3 className="font-semibold text-surface-200">Datos Clínicos / Anamnesis</h3>
            </div>
            {patient && patient.anamneses && patient.anamneses.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-surface-900 rounded-xl border border-surface-800">
                  <div className="space-y-3">
                    {Object.entries(patient.anamneses[0].data || {}).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-xs font-semibold text-surface-400 capitalize block mb-1">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="text-sm text-surface-200">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-surface-900/50 rounded-xl border border-dashed border-surface-700">
                <p className="text-sm text-surface-400">No hay datos clínicos registrados aún.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
