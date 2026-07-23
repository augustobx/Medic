'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { DEFAULT_ANAMNESIS_SECTIONS } from '@/lib/anamnesis';


export default function OnboardingPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(0);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [template, setTemplate] = useState<any[]>(DEFAULT_ANAMNESIS_SECTIONS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/profile')
      .then((data) => {
        if (data.tenant?.anamnesisTemplate) {
          setTemplate(data.tenant.anamnesisTemplate);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const section = template[currentSection];

  const update = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    // Validate required fields
    for (const sec of template) {
      for (const field of sec.fields) {
        if (field.required && !formData[field.key]) {
          alert(`El campo "${field.label}" en "${sec.title}" es obligatorio.`);
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      await api.post('/auth/anamnesis', formData);
      setSubmitted(true);
    } catch (e: any) {
      alert(e.message || 'Error al enviar la anamnesis');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-20 animate-pulse text-surface-400">Cargando formulario...</div>;
  }



  if (submitted) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-success-500/20 border border-success-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-success-400" />
        </div>
        <h1 className="text-2xl font-bold text-surface-100">¡Anamnesis Completada!</h1>
        <p className="text-surface-400 mt-2 max-w-md mx-auto">
          Gracias por completar el formulario. Tu profesional revisará la información antes de tu primera sesión.
        </p>
        <Button className="mt-6" onClick={() => window.location.href = '/booking'}>
          Reservar Turno
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-surface-100">Anamnesis</h1>
        <p className="text-surface-400 mt-1">
          Completá este formulario antes de tu primera sesión
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {template.map((_, i) => (
          <div
            key={i}
            className={clsx(
              'h-1.5 flex-1 rounded-full transition-colors',
              i <= currentSection ? 'bg-primary-500' : 'bg-surface-700',
            )}
          />
        ))}
      </div>

      <Card variant="glass" padding="lg">
        <h2 className="text-lg font-semibold text-surface-200 mb-4">
          {section?.title}
          <span className="text-sm text-surface-500 font-normal ml-2">
            ({currentSection + 1}/{template.length})
          </span>
        </h2>

        <div className="space-y-4">
          {section?.fields.map((field: any) => {
            const labelComponent = (
              <span className="flex items-center justify-between w-full">
                <span>
                  {field.label} {field.required && <span className="text-danger-500">*</span>}
                </span>
                {!field.required && <span className="text-xs font-normal text-surface-500">(opcional)</span>}
              </span>
            );
            if (field.type === 'textarea') {
              return (
                <div key={field.key} className="space-y-1.5 w-full">
                  <label className={clsx("block text-sm font-medium", field.required && !formData[field.key] ? "text-danger-400" : "text-surface-300")}>
                    {labelComponent}
                  </label>
                  <textarea
                    value={formData[field.key] || ''}
                    onChange={(e) => update(field.key, e.target.value)}
                    required={field.required}
                    rows={3}
                    className={clsx(
                      "w-full bg-surface-800 border rounded-xl px-4 py-2.5 text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 transition-all duration-200 resize-none",
                      field.required && !formData[field.key] ? "border-danger-500/50 focus:ring-danger-500/50 focus:border-danger-500" : "border-surface-600 focus:ring-primary-500/50 focus:border-primary-500"
                    )}
                  />
                </div>
              );
            }

            if (field.type === 'select' && field.options) {
              return (
                <div key={field.key} className="w-full space-y-1.5">
                  <label className={clsx("block text-sm font-medium mb-1", field.required && !formData[field.key] ? "text-danger-400" : "text-surface-300")}>
                    {labelComponent}
                  </label>
                  <Select
                    options={field.options.map((o: string) => ({ value: o, label: o }))}
                    value={formData[field.key] || ''}
                    onChange={(e) => update(field.key, e.target.value)}
                    placeholder="Seleccionar..."
                  />
                </div>
              );
            }

            return (
              <div key={field.key} className="w-full space-y-1.5">
                <label className={clsx("block text-sm font-medium mb-1", field.required && !formData[field.key] ? "text-danger-400" : "text-surface-300")}>
                  {labelComponent}
                </label>
                <Input
                  type={field.type}
                  value={formData[field.key] || ''}
                  onChange={(e) => update(field.key, e.target.value)}
                  className={clsx(field.required && !formData[field.key] && "border-danger-500/50 focus:ring-danger-500/50")}
                  required={field.required}
                />
              </div>
            );
          })}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-surface-700/50">
          <Button
            variant="ghost"
            onClick={() => setCurrentSection((prev) => prev - 1)}
            disabled={currentSection === 0}
          >
            <ArrowLeft className="w-4 h-4" />
            Anterior
          </Button>

          {currentSection < template.length - 1 ? (
            <Button onClick={() => setCurrentSection((prev) => prev + 1)}>
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} id="btn-submit-anamnesis" disabled={isSaving}>
              {isSaving ? 'Enviando...' : 'Enviar Anamnesis'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
