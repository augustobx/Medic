export const DEFAULT_ANAMNESIS_SECTIONS = [
  {
    title: 'Datos del Niño/a',
    fields: [
      { key: 'childFullName', label: 'Nombre completo', type: 'text', required: true },
      { key: 'childBirthDate', label: 'Fecha de nacimiento', type: 'date', required: true },
      { key: 'childSchool', label: 'Escuela', type: 'text', required: false },
      { key: 'childGrade', label: 'Grado/Año', type: 'text', required: false },
      { key: 'childShift', label: 'Turno', type: 'select', options: ['Mañana', 'Tarde', 'Doble'], required: false },
    ],
  },
  {
    title: 'Antecedentes Perinatales',
    fields: [
      { key: 'pregnancyType', label: 'Tipo de embarazo', type: 'select', options: ['Normal', 'De riesgo', 'Gemelar'], required: false },
      { key: 'gestationalWeeks', label: 'Semanas de gestación', type: 'text', required: false },
      { key: 'birthType', label: 'Tipo de parto', type: 'select', options: ['Natural', 'Cesárea', 'Inducido'], required: false },
      { key: 'birthWeight', label: 'Peso al nacer', type: 'text', required: false },
      { key: 'birthComplications', label: 'Complicaciones perinatales', type: 'textarea', required: false },
    ],
  },
  {
    title: 'Desarrollo Evolutivo',
    fields: [
      { key: 'walkAge', label: 'Edad al caminar', type: 'text', required: false },
      { key: 'firstWordsAge', label: 'Edad primeras palabras', type: 'text', required: false },
      { key: 'sphincterControl', label: 'Control de esfínteres', type: 'text', required: false },
      { key: 'motorDevelopment', label: 'Desarrollo motor', type: 'textarea', required: false },
      { key: 'languageDevelopment', label: 'Desarrollo del lenguaje', type: 'textarea', required: false },
    ],
  },
  {
    title: 'Escolaridad',
    fields: [
      { key: 'schoolStart', label: 'Inicio de escolaridad', type: 'text', required: false },
      { key: 'schoolAdaptation', label: 'Adaptación escolar', type: 'textarea', required: false },
      { key: 'learningDifficulties', label: 'Dificultades de aprendizaje observadas', type: 'textarea', required: false },
      { key: 'previousSupport', label: 'Apoyos previos (psicólogo, fono, etc.)', type: 'textarea', required: false },
      { key: 'repeatGrade', label: '¿Repitió algún grado?', type: 'select', options: ['No', 'Sí'], required: false },
    ],
  },
  {
    title: 'Motivo de Consulta',
    fields: [
      { key: 'mainConcern', label: 'Motivo principal de consulta', type: 'textarea', required: true },
      { key: 'referredBy', label: 'Derivado por', type: 'text', required: false },
      { key: 'expectations', label: 'Expectativas del tratamiento', type: 'textarea', required: false },
    ],
  },
];
