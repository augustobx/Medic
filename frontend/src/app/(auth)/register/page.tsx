'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { api } from '@/lib/api';
import { Mail, Lock, User, Phone, Building2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'PROFESSIONAL',
    tenantName: '',
    tenantId: '',
  });
  const [tenants, setTenants] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load available professionals for patient registration
    api.get('/tenants/public')
      .then((list) => setTenants(list))
      .catch(console.error);
  }, []);

  const update = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = { ...formData };
      if (payload.role === 'PROFESSIONAL' && !payload.tenantName) {
        payload.tenantName = `${payload.firstName} ${payload.lastName}`;
      }
      // Remove unused fields
      if (payload.role === 'PROFESSIONAL') delete payload.tenantId;
      if (payload.role === 'PATIENT') delete payload.tenantName;

      if (payload.role === 'PATIENT' && !payload.tenantId) {
        setError('Seleccioná un consultorio para registrarte');
        setLoading(false);
        return;
      }

      const data = await api.post('/auth/register', payload);
      localStorage.setItem('token', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      if (data.user.role === 'PATIENT') {
        router.push('/onboarding');
      } else {
        router.push('/calendar');
      }
    } catch (err: any) {
      setError(err.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-950 px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-accent-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4 shadow-glow-primary">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-surface-100">Crear Cuenta</h1>
          <p className="text-surface-400 mt-1">Comenzá a gestionar tu consultorio</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm animate-fade-in">
                {error}
              </div>
            )}

            <Select
              label="Tipo de cuenta"
              options={[
                { value: 'PROFESSIONAL', label: 'Profesional' },
                { value: 'PATIENT', label: 'Paciente' },
              ]}
              value={formData.role}
              onChange={(e) => update('role', e.target.value)}
              id="select-role"
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Nombre"
                placeholder="Juan"
                value={formData.firstName}
                onChange={(e) => update('firstName', e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
                id="input-firstname"
              />
              <Input
                label="Apellido"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={(e) => update('lastName', e.target.value)}
                required
                id="input-lastname"
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              value={formData.email}
              onChange={(e) => update('email', e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
              id="input-email"
            />

            <Input
              label="Teléfono"
              type="tel"
              placeholder="+54 11 1234-5678"
              value={formData.phone}
              onChange={(e) => update('phone', e.target.value)}
              icon={<Phone className="w-4 h-4" />}
              id="input-phone"
            />

            {formData.role === 'PROFESSIONAL' && (
              <Input
                label="Nombre del consultorio"
                placeholder="Consultorio Pérez"
                value={formData.tenantName}
                onChange={(e) => update('tenantName', e.target.value)}
                icon={<Building2 className="w-4 h-4" />}
                hint="Se usará como nombre del consultorio"
                id="input-tenant"
              />
            )}

            {formData.role === 'PATIENT' && (
              <Select
                label="Consultorio / Profesional"
                options={[
                  { value: '', label: 'Seleccioná un consultorio...' },
                  ...tenants.map((t) => ({ value: t.id, label: t.name })),
                ]}
                value={formData.tenantId}
                onChange={(e) => update('tenantId', e.target.value)}
                id="select-tenant"
              />
            )}

            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => update('password', e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              required
              id="input-password"
            />

            <Button type="submit" fullWidth size="lg" loading={loading} id="btn-register">
              Crear Cuenta
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-surface-400">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                Iniciá sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
