
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api';
import { Plus, Search, User, Phone, Mail, Calendar, ChevronRight } from 'lucide-react';

export default function PatientsPage() {
  const [search, setSearch] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/patients')
      .then(res => {
        setPatients(res.data || []);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = patients.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.dni || ''}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-100">Pacientes</h1>
          <p className="text-surface-400">{patients.length} pacientes registrados</p>
        </div>
        <Button id="btn-new-patient" onClick={() => alert('Creación de pacientes desde dashboard próximamente disponible')}>
          <Plus className="w-4 h-4" />
          Nuevo Paciente
        </Button>
      </div>

      {/* Search */}
      <Input
        placeholder="Buscar por nombre, apellido o DNI..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        icon={<Search className="w-4 h-4" />}
        id="input-search-patients"
      />

      {isLoading && <div className="text-center py-10 text-surface-400 animate-pulse">Cargando pacientes...</div>}

      {/* Patient Cards */}
      {!isLoading && (
        <div className="grid gap-3">
          {filtered.map((patient) => (
            <Link href={`/patients/${patient.id}`} key={patient.id}>
              <Card hover className="flex items-center gap-4 group">
                {/* Avatar */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-surface-600 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-400">
                    {patient.firstName[0]}{patient.lastName[0]}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-surface-100 truncate">
                      {patient.lastName}, {patient.firstName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {patient.dni && (
                      <span className="text-xs text-surface-400 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        DNI {patient.dni}
                      </span>
                    )}
                    <span className="text-xs text-surface-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {patient.phone || 'Sin teléfono'}
                    </span>
                    <span className="text-xs text-surface-400 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {patient.email}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-surface-500 group-hover:text-primary-400 transition-colors" />
              </Card>
            </Link>
          ))}
          {filtered.length === 0 && (
             <div className="text-center py-10 text-surface-500">No se encontraron pacientes.</div>
          )}
        </div>
      )}
    </div>
  );
}
