'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { clsx } from 'clsx';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { api } from '@/lib/api';
import {
  ArrowLeft, User, Phone, Mail, Shield, Calendar,
  FileText, Upload, Clock, PenLine, File, Image,
  Plus, Heart, MapPin, Edit2, Save, X
} from 'lucide-react';
import Link from 'next/link';
import { DEFAULT_ANAMNESIS_SECTIONS } from '@/lib/anamnesis';

type TabKey = 'timeline' | 'info' | 'anamnesis' | 'documents';

export default function PatientRecordPage() {
  const params = useParams();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('timeline');
  const [showEvolutionEditor, setShowEvolutionEditor] = useState(false);
  const [evolutionTitle, setEvolutionTitle] = useState('');
  const [evolutionContent, setEvolutionContent] = useState('');
  const [savingEvolution, setSavingEvolution] = useState(false);
  const [tenant, setTenant] = useState<any>(null);
  const [editingAnamnesis, setEditingAnamnesis] = useState<string | null>(null);
  const [anamnesisFormData, setAnamnesisFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    loadPatient();
    loadTimeline();
    loadTenant();
  }, [patientId]);

  const loadTenant = async () => {
    try {
      const res = await api.get('/tenants/me');
      setTenant(res);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPatient = async () => {
    try {
      const data = await api.get(`/patients/${patientId}`);
      setPatient(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTimeline = async () => {
    try {
      const data = await api.get(`/patients/${patientId}/timeline`);
      setTimeline(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEvolution = async () => {
    if (!evolutionContent.trim()) return;
    setSavingEvolution(true);
    try {
      await api.post(`/patients/${patientId}/evolutions`, {
        title: evolutionTitle || undefined,
        content: evolutionContent,
      });
      setEvolutionTitle('');
      setEvolutionContent('');
      setShowEvolutionEditor(false);
      loadTimeline();
    } catch (e: any) {
      alert(e.message || 'Error al guardar evolución');
    } finally {
      setSavingEvolution(false);
    }
  };

  const handleEditAnamnesis = (a: any) => {
    setEditingAnamnesis(a.id);
    setAnamnesisFormData(a.data || {});
  };

  const handleSaveAnamnesis = async (a: any) => {
    try {
      await api.patch(`/patients/${patientId}/anamnesis/${a.id}`, { data: anamnesisFormData });
      setEditingAnamnesis(null);
      loadPatient();
    } catch (e: any) {
      alert(e.message || 'Error al guardar la anamnesis');
    }
  };

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: 'timeline', label: 'Timeline', icon: Clock },
    { key: 'info', label: 'Datos', icon: User },
    { key: 'anamnesis', label: 'Anamnesis', icon: FileText },
    { key: 'documents', label: 'Documentos', icon: File },
  ];

  if (isLoading) {
    return <div className="text-center py-20 animate-pulse text-surface-400">Cargando ficha del paciente...</div>;
  }

  if (!patient) {
    return <div className="text-center py-20 text-danger-400">No se encontró al paciente.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/patients"
          className="mt-1 p-2 rounded-xl text-surface-400 hover:bg-surface-800 hover:text-surface-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 border border-surface-600 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-400">
                {patient.firstName[0]}{patient.lastName[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-100">
                {patient.lastName}, {patient.firstName}
              </h1>
              <div className="flex items-center gap-3 mt-0.5">
                {patient.insuranceProvider && (
                  <Badge variant="primary">{patient.insuranceProvider.name}</Badge>
                )}
                {patient.dni && <span className="text-sm text-surface-400">DNI {patient.dni}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Phone, label: 'Teléfono', value: patient.phone || 'Sin dato' },
          { icon: Mail, label: 'Email', value: patient.email || 'Sin dato' },
          { icon: Calendar, label: 'Nacimiento', value: patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('es-AR') : 'Sin dato' },
          { icon: Shield, label: 'O.S. N°', value: patient.insuranceNumber || 'Sin dato' },
        ].map((item) => (
          <Card key={item.label} padding="sm" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0">
              <item.icon className="w-4 h-4 text-primary-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-surface-400">{item.label}</p>
              <p className="text-sm font-medium text-surface-200 truncate">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-800/60 p-1 rounded-xl border border-surface-700/50">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 justify-center',
              activeTab === tab.key
                ? 'bg-primary-500 text-white shadow-glow-primary'
                : 'text-surface-400 hover:text-surface-200 hover:bg-surface-700/50',
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          {/* New Evolution Button */}
          <Button
            onClick={() => setShowEvolutionEditor(!showEvolutionEditor)}
            variant="secondary"
            fullWidth
            id="btn-new-evolution"
          >
            <Plus className="w-4 h-4" />
            Nueva Nota de Evolución
          </Button>

          {/* Evolution Editor */}
          {showEvolutionEditor && (
            <Card variant="bordered" className="animate-slide-up">
              <h3 className="text-sm font-semibold text-surface-200 mb-3">Nueva Evolución</h3>
              <Input
                placeholder="Título (opcional)"
                className="mb-3"
                value={evolutionTitle}
                onChange={(e) => setEvolutionTitle(e.target.value)}
                id="input-evolution-title"
              />
              <textarea
                value={evolutionContent}
                onChange={(e) => setEvolutionContent(e.target.value)}
                placeholder="Escribí tus notas de la sesión..."
                rows={5}
                className="w-full bg-surface-800 border border-surface-600 rounded-xl px-4 py-3 text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all duration-200 resize-none"
                id="textarea-evolution"
              />
              <div className="flex justify-end gap-2 mt-3">
                <Button variant="ghost" size="sm" onClick={() => setShowEvolutionEditor(false)}>
                  Cancelar
                </Button>
                <Button size="sm" id="btn-save-evolution" onClick={handleSaveEvolution} disabled={savingEvolution || !evolutionContent.trim()}>
                  {savingEvolution ? 'Guardando...' : 'Guardar Evolución'}
                </Button>
              </div>
            </Card>
          )}

          {/* Timeline Items */}
          {timeline.length === 0 ? (
            <div className="text-center py-12 bg-surface-900/50 rounded-xl border border-dashed border-surface-700">
              <Clock className="w-10 h-10 text-surface-600 mx-auto mb-3" />
              <p className="text-sm text-surface-400">No hay eventos en la línea de tiempo.</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-px bg-surface-700/50" />
              <div className="space-y-4">
                {timeline.map((item, i) => (
                  <div key={i} className="relative flex gap-4 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className={clsx(
                      'flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center z-10',
                      item.type === 'evolution' && 'bg-accent-500/20 border border-accent-500/30',
                      item.type === 'booking' && 'bg-primary-500/20 border border-primary-500/30',
                      item.type === 'document' && 'bg-warning-500/20 border border-warning-500/30',
                    )}>
                      {item.type === 'evolution' && <PenLine className="w-5 h-5 text-accent-400" />}
                      {item.type === 'booking' && <Calendar className="w-5 h-5 text-primary-400" />}
                      {item.type === 'document' && <File className="w-5 h-5 text-warning-400" />}
                    </div>

                    <Card className="flex-1" padding="sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-surface-400">
                          {new Date(item.date).toLocaleDateString('es-AR', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                          })}
                        </span>
                        {item.type === 'evolution' && <Badge variant="accent">Evolución</Badge>}
                        {item.type === 'booking' && (
                          <Badge variant={item.data.status === 'ATTENDED' ? 'success' : 'primary'} dot>
                            {item.data.status === 'ATTENDED' ? 'Asistió' : item.data.status === 'CANCELLED' ? 'Cancelado' : 'Turno'}
                          </Badge>
                        )}
                        {item.type === 'document' && <Badge variant="warning">Documento</Badge>}
                      </div>

                      {item.type === 'evolution' && (
                        <>
                          {item.data.title && <h4 className="text-sm font-semibold text-surface-200">{item.data.title}</h4>}
                          <p className="text-sm text-surface-400 mt-1 leading-relaxed">{item.data.content}</p>
                        </>
                      )}

                      {item.type === 'booking' && (
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-surface-200">{item.data.sessionType?.name || 'Turno'}</span>
                          <span className="text-xs text-surface-500">{item.data.startTime} - {item.data.endTime}</span>
                        </div>
                      )}

                      {item.type === 'document' && (
                        <div className="flex items-center gap-3">
                          {item.data.mimeType?.includes('image') ? (
                            <Image className="w-4 h-4 text-warning-400" />
                          ) : (
                            <FileText className="w-4 h-4 text-warning-400" />
                          )}
                          <span className="text-sm font-medium text-surface-200">{item.data.originalName}</span>
                          <span className="text-xs text-surface-500">{(item.data.sizeBytes / 1024).toFixed(0)} KB</span>
                        </div>
                      )}
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Tab */}
      {activeTab === 'info' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h3 className="text-sm font-semibold text-surface-200 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary-400" />
              Datos Personales
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Nombre completo', value: `${patient.firstName} ${patient.lastName}` },
                { label: 'DNI', value: patient.dni || 'Sin dato' },
                { label: 'Fecha de nacimiento', value: patient.birthDate ? new Date(patient.birthDate).toLocaleDateString('es-AR') : 'Sin dato' },
                { label: 'Género', value: patient.gender || 'Sin dato' },
                { label: 'Ocupación', value: patient.occupation || 'Sin dato' },
                { label: 'Derivado por', value: patient.referredBy || 'Sin dato' },
              ].map((field) => (
                <div key={field.label} className="flex justify-between py-2 border-b border-surface-700/30 last:border-0">
                  <span className="text-sm text-surface-400">{field.label}</span>
                  <span className="text-sm font-medium text-surface-200">{field.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-surface-200 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-400" />
              Contacto y Ubicación
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Teléfono', value: patient.phone || 'Sin dato' },
                { label: 'Email', value: patient.email || 'Sin dato' },
                { label: 'Dirección', value: patient.address || 'Sin dato' },
                { label: 'Ciudad', value: patient.city || 'Sin dato' },
                { label: 'Provincia', value: patient.province || 'Sin dato' },
              ].map((field) => (
                <div key={field.label} className="flex justify-between py-2 border-b border-surface-700/30 last:border-0">
                  <span className="text-sm text-surface-400">{field.label}</span>
                  <span className="text-sm font-medium text-surface-200">{field.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {patient.legalGuardians?.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-surface-200 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent-400" />
                Tutores Legales
              </h3>
              {patient.legalGuardians.map((g: any) => (
                <div key={g.id} className="space-y-3 mb-4 last:mb-0">
                  {[
                    { label: 'Nombre', value: `${g.firstName} ${g.lastName}` },
                    { label: 'Relación', value: g.relationship },
                    { label: 'Teléfono', value: g.phone || 'Sin dato' },
                  ].map((field) => (
                    <div key={field.label} className="flex justify-between py-2 border-b border-surface-700/30 last:border-0">
                      <span className="text-sm text-surface-400">{field.label}</span>
                      <span className="text-sm font-medium text-surface-200">{field.value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </Card>
          )}

          <Card>
            <h3 className="text-sm font-semibold text-surface-200 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary-400" />
              Obra Social
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Obra Social', value: patient.insuranceProvider?.name || 'No registrada' },
                { label: 'N° de Afiliado', value: patient.insuranceNumber || 'Sin dato' },
              ].map((field) => (
                <div key={field.label} className="flex justify-between py-2 border-b border-surface-700/30 last:border-0">
                  <span className="text-sm text-surface-400">{field.label}</span>
                  <span className="text-sm font-medium text-surface-200">{field.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Anamnesis Tab */}
      {activeTab === 'anamnesis' && (
        <Card>
          {patient.anamneses?.length > 0 ? (
            <div className="space-y-6">
              {patient.anamneses.map((a: any) => {
                const template = tenant?.anamnesisTemplate || DEFAULT_ANAMNESIS_SECTIONS;
                const isEditing = editingAnamnesis === a.id;
                
                return (
                  <div key={a.id}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-surface-200">Anamnesis — {a.formType}</h3>
                        <span className="text-xs text-surface-400">
                          {new Date(a.createdAt).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setEditingAnamnesis(null)}>
                            <X className="w-4 h-4" /> Cancelar
                          </Button>
                          <Button size="sm" onClick={() => handleSaveAnamnesis(a)}>
                            <Save className="w-4 h-4" /> Guardar
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => handleEditAnamnesis(a)}>
                          <Edit2 className="w-4 h-4" /> Editar
                        </Button>
                      )}
                    </div>
                    
                    <div className="bg-surface-900 rounded-xl border border-surface-800 p-4 space-y-6">
                      {template.map((section: any, sIdx: number) => (
                        <div key={sIdx} className="space-y-2">
                          <h4 className="text-sm font-medium text-surface-300 border-b border-surface-700 pb-1 mb-2">
                            {section.title}
                          </h4>
                          {section.fields.map((field: any) => {
                            const value = isEditing ? anamnesisFormData[field.key] : a.data[field.key];
                            
                            return (
                              <div key={field.key} className={clsx("flex justify-between py-1.5 border-b border-surface-700/20 last:border-0", isEditing ? "items-center" : "items-start")}>
                                <span className="text-sm text-surface-400 w-1/3">
                                  {field.label} {field.required && <span className="text-danger-500">*</span>}
                                </span>
                                
                                <div className="w-2/3 text-right">
                                  {isEditing ? (
                                    field.type === 'textarea' ? (
                                      <textarea
                                        value={value || ''}
                                        onChange={(e) => setAnamnesisFormData({ ...anamnesisFormData, [field.key]: e.target.value })}
                                        className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100"
                                        rows={2}
                                      />
                                    ) : field.type === 'select' ? (
                                      <select
                                        value={value || ''}
                                        onChange={(e) => setAnamnesisFormData({ ...anamnesisFormData, [field.key]: e.target.value })}
                                        className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100"
                                      >
                                        <option value="">Seleccionar...</option>
                                        {field.options?.map((o: string) => (
                                          <option key={o} value={o}>{o}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      <input
                                        type={field.type}
                                        value={value || ''}
                                        onChange={(e) => setAnamnesisFormData({ ...anamnesisFormData, [field.key]: e.target.value })}
                                        className="w-full bg-surface-800 border border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-100"
                                      />
                                    )
                                  ) : (
                                    <span className="text-sm text-surface-200">{value || '—'}</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-surface-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-surface-300">Sin Anamnesis</h3>
              <p className="text-surface-500 mt-1 mb-6">Este paciente aún no ha completado la anamnesis</p>
            </div>
          )}
        </Card>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-surface-200">Documentos del Paciente</h3>
            <Button size="sm" id="btn-upload-document">
              <Upload className="w-4 h-4" />
              Subir Archivo
            </Button>
          </div>

          {timeline.filter(t => t.type === 'document').length === 0 ? (
            <div className="text-center py-12 bg-surface-900/50 rounded-xl border border-dashed border-surface-700">
              <File className="w-10 h-10 text-surface-600 mx-auto mb-3" />
              <p className="text-sm text-surface-400">No hay documentos subidos.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {timeline.filter(t => t.type === 'document').map((item) => (
                <Card key={item.data.id} hover className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-warning-500/10 border border-warning-500/20 flex items-center justify-center flex-shrink-0">
                    {item.data.mimeType?.includes('image') ? (
                      <Image className="w-5 h-5 text-warning-400" />
                    ) : (
                      <FileText className="w-5 h-5 text-warning-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-200 truncate">{item.data.originalName}</p>
                    <p className="text-xs text-surface-500">
                      {(item.data.sizeBytes / 1024).toFixed(0)} KB • {new Date(item.data.createdAt).toLocaleDateString('es-AR')}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
