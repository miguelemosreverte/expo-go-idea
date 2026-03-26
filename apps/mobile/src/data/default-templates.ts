import type { Template } from '@gaucho/shared';

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'builtin-corregir-bug',
    name: 'Corregir bug',
    description: 'Plantilla para depuración y corrección de errores',
    prompt:
      'Encontré un bug en {{archivo}}. El comportamiento esperado es {{esperado}} pero en cambio ocurre {{actual}}. Por favor investigá la causa raíz y proponé una corrección.',
    tags: ['debug', 'bugfix'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'builtin-nuevo-feature',
    name: 'Nuevo feature',
    description: 'Plantilla para implementar una nueva funcionalidad',
    prompt:
      'Necesito implementar un nuevo feature: {{descripcion}}. Debe cumplir con estos requisitos: {{requisitos}}. Usá las mejores prácticas del proyecto.',
    tags: ['feature', 'nuevo'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'builtin-refactorizar',
    name: 'Refactorizar',
    description: 'Plantilla para refactorización de código',
    prompt:
      'Necesito refactorizar {{componente}}. El objetivo es {{objetivo}}. Mantené la misma funcionalidad pero mejorá {{aspecto}}.',
    tags: ['refactor'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'builtin-escribir-tests',
    name: 'Escribir tests',
    description: 'Plantilla para escribir tests unitarios o de integración',
    prompt:
      'Escribí tests para {{modulo}}. Cubrí los siguientes casos: {{casos}}. Usá el framework de testing del proyecto.',
    tags: ['testing'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'builtin-revisar-codigo',
    name: 'Revisar código',
    description: 'Plantilla para revisión de código',
    prompt:
      'Revisá el código en {{archivo}}. Enfocate en: legibilidad, rendimiento, manejo de errores y mejores prácticas. Listá los problemas encontrados y sugerencias de mejora.',
    tags: ['review'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'builtin-explicar-codigo',
    name: 'Explicar código',
    description: 'Plantilla para obtener explicación de código',
    prompt:
      'Explicá qué hace el código en {{archivo}}. Describí su propósito, cómo funciona paso a paso, y las decisiones de diseño involucradas.',
    tags: ['explain'],
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

export function isBuiltinTemplate(id: string): boolean {
  return id.startsWith('builtin-');
}
