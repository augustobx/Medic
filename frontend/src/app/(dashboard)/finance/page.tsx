
'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api';
import {
  DollarSign, CreditCard, Shield, Plus,
  TrendingUp, Building2, PenLine,
} from 'lucide-react';

export default function FinancePage() {
  const [tenant, setTenant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/tenants/me')
      .then(res => {
        setTenant(res);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="text-center py-20 text-surface-400 animate-pulse">Cargando finanzas...</div>;
  }

  if (!tenant) {
    return <div className="text-center py-20 text-danger-400">Error al cargar datos.</div>;
  }

  const sessionTypes = tenant.sessionTypes || [];
  const insurances = tenant.tenantInsurances || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-100">Finanzas</h1>
        <p className="text-surface-400">Configuración de honorarios, obras sociales y datos de pago</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Obras Sociales', value: insurances.length.toString(), icon: Shield, color: 'text-accent-400' },
          { label: 'Tipos de Sesión', value: sessionTypes.length.toString(), icon: CreditCard, color: 'text-warning-400' },
        ].map((stat) => (
          <Card key={stat.label} hover>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-700 flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-surface-400">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Session Type Prices */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-200 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary-400" />
              Honorarios por Tipo de Sesión
            </h3>
            <Button variant="ghost" size="sm" onClick={() => alert('Edición de honorarios próximamente disponible')}>
              <PenLine className="w-3.5 h-3.5" />
              Editar
            </Button>
          </div>
          <div className="space-y-3">
            {sessionTypes.map((st: any) => (
              <div key={st.id} className="flex items-center justify-between py-2 border-b border-surface-700/30 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-8 rounded-full" style={{ backgroundColor: st.color || '#3b82f6' }} />
                  <span className="text-sm text-surface-200">{st.name}</span>
                </div>
                <span className="text-sm font-bold text-primary-400">${st.price?.toLocaleString('es-AR') || '0'}</span>
              </div>
            ))}
            {sessionTypes.length === 0 && <div className="text-sm text-surface-400 py-2">No hay tipos de sesión.</div>}
          </div>
        </Card>

        {/* Payment Config */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-200 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary-400" />
              Datos de Pago
            </h3>
            <Button variant="ghost" size="sm" onClick={() => alert('Edición de datos de pago próximamente disponible')}>
              <PenLine className="w-3.5 h-3.5" />
              Editar
            </Button>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Alias', value: tenant.paymentConfig?.alias || 'No configurado' },
              { label: 'CBU', value: tenant.paymentConfig?.cbu || 'No configurado' },
              { label: 'Banco', value: tenant.paymentConfig?.bank || 'No configurado' },
            ].map((field) => (
              <div key={field.label} className="flex justify-between py-2 border-b border-surface-700/30 last:border-0">
                <span className="text-sm text-surface-400">{field.label}</span>
                <span className="text-sm font-medium text-surface-200 font-mono">{field.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Insurance Providers */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-surface-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-400" />
              Obras Sociales Aceptadas
            </h3>
            <Button variant="secondary" size="sm" id="btn-add-insurance" onClick={() => alert('Agregar obras sociales próximamente disponible')}>
              <Plus className="w-4 h-4" />
              Agregar
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {insurances.map((ins: any) => (
              <Card key={ins.id} variant="bordered" padding="sm" hover>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-surface-200">{ins.insuranceProvider.name}</span>
                </div>
                <p className="text-xs text-surface-400">
                  Copago: <span className="text-surface-200 font-medium">${ins.copayAmount?.toLocaleString('es-AR') || '0'}</span>
                </p>
              </Card>
            ))}
            {insurances.length === 0 && <div className="text-sm text-surface-400">No hay obras sociales configuradas.</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
