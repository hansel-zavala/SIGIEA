// frontend/src/components/reports/DynamicReportForm.tsx
import React, { useMemo, useState } from 'react';
import Label from '../../components/ui/Label';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import type { ReportTemplate, ReportItem, ReportItemType, ReportItemWidth } from '../../services/reportTemplateService';
import type { ReportAnswer, AcquisitionLevel } from '../../services/reportService';

type AnswersState = Record<number, any>;
type SelectOption = { value: string; label: string };

const acquisitionLevelOptions = [
  { value: 'CONSEGUIDO', label: 'Conseguido' },
  { value: 'CON_AYUDA_ORAL', label: 'Con Ayuda Oral' },
  { value: 'CON_AYUDA_GESTUAL', label: 'Con Ayuda Gestual' },
  { value: 'CON_AYUDA_FISICA', label: 'Con Ayuda Física' },
  { value: 'NO_CONSEGUIDO', label: 'No Conseguido' },
  { value: 'NO_TRABAJADO', label: 'No Trabajado' },
];

interface Props {
  template: ReportTemplate;
  initialAnswers?: { itemId: number; level?: AcquisitionLevel | null; value?: any }[];
  onSubmit: (answers: ReportAnswer[]) => Promise<void>;
}

const widthToColSpan: Record<ReportItemWidth, string> = {
  FULL: 'col-span-12',
  HALF: 'col-span-12 md:col-span-6',
  THIRD: 'col-span-12 md:col-span-4',
  TWO_THIRDS: 'col-span-12 md:col-span-8',
};

export default function DynamicReportForm({ template, initialAnswers = [], onSubmit }: Props) {
  const initial: AnswersState = useMemo(() => {
    const map: AnswersState = {};
    initialAnswers.forEach(a => {
      map[a.itemId] = a.value !== undefined ? a.value : a.level ?? null;
    });
    return map;
  }, [initialAnswers]);

  const [answers, setAnswers] = useState<AnswersState>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (item: ReportItem, value: any) => {
    setAnswers(prev => ({ ...prev, [item.id]: value }));
  };

  const renderItem = (item: ReportItem) => {
    const common = (
      <div className={`flex flex-col gap-1 ${widthToColSpan[item.width]}`}>
        <Label>{item.label}{item.required ? ' *' : ''}</Label>
        {item.description && <p className="text-xs text-gray-500">{item.description}</p>}
      </div>
    );
    const value = answers[item.id];

    switch (item.type as ReportItemType) {
      case 'level':
        return (
          <div className={widthToColSpan[item.width]} key={item.id}>
            <Label>{item.label}{item.required ? ' *' : ''}</Label>
            <Select
              instanceId={`item-${item.id}-level`}
              options={acquisitionLevelOptions}
              value={acquisitionLevelOptions.find(o => o.value === value) || null}
              onChange={(opt) => handleChange(item, opt?.value || null)}
              placeholder={item.placeholder || 'Selecciona un nivel'}
            />
            {item.helpText && <p className="text-xs text-gray-500 mt-1">{item.helpText}</p>}
          </div>
        );
      case 'short_text':
        return (
          <div className={widthToColSpan[item.width]} key={item.id}>
            <Label>{item.label}{item.required ? ' *' : ''}</Label>
            <Input
              value={value ?? ''}
              onChange={(e) => handleChange(item, e.target.value)}
              placeholder={item.placeholder || ''}
              maxLength={item.maxLength || undefined}
            />
            {item.helpText && <p className="text-xs text-gray-500 mt-1">{item.helpText}</p>}
          </div>
        );
      case 'long_text':
      case 'rich_text':
        return (
          <div className={widthToColSpan[item.width]} key={item.id}>
            <Label>{item.label}{item.required ? ' *' : ''}</Label>
            <textarea
              value={value ?? ''}
              onChange={(e) => handleChange(item, e.target.value)}
              placeholder={item.placeholder || ''}
              rows={5}
              className="block w-full rounded-md border-gray-300 shadow-sm p-2"
            />
            {item.helpText && <p className="text-xs text-gray-500 mt-1">{item.helpText}</p>}
          </div>
        );
      case 'number':
        return (
          <div className={widthToColSpan[item.width]} key={item.id}>
            <Label>{item.label}{item.required ? ' *' : ''}</Label>
            <Input
              type="number"
              value={value ?? ''}
              onChange={(e) => handleChange(item, e.target.value === '' ? null : Number(e.target.value))}
              placeholder={item.placeholder || ''}
            />
            {item.helpText && <p className="text-xs text-gray-500 mt-1">{item.helpText}</p>}
          </div>
        );
      case 'date':
        return (
          <div className={widthToColSpan[item.width]} key={item.id}>
            <Label>{item.label}{item.required ? ' *' : ''}</Label>
            <Input
              type="date"
              value={value ? String(value).slice(0, 10) : ''}
              onChange={(e) => handleChange(item, e.target.value || null)}
            />
            {item.helpText && <p className="text-xs text-gray-500 mt-1">{item.helpText}</p>}
          </div>
        );
      case 'select': {
        const opts = Array.isArray(item.options)
          ? item.options
          : (item.options?.options || []);
        const sel: SelectOption[] = opts.map((o: any) => ({ value: String(o.value ?? o), label: String(o.label ?? o) }));
        return (
          <div className={widthToColSpan[item.width]} key={item.id}>
            <Label>{item.label}{item.required ? ' *' : ''}</Label>
            <Select
              instanceId={`item-${item.id}-select`}
              options={sel}
              value={sel.find((o: SelectOption) => o.value === value) || null}
              onChange={(opt) => handleChange(item, opt?.value || null)}
              placeholder={item.placeholder || 'Selecciona una opción'}
            />
            {item.helpText && <p className="text-xs text-gray-500 mt-1">{item.helpText}</p>}
          </div>
        );
      }
      case 'multiselect': {
        const opts = Array.isArray(item.options)
          ? item.options
          : (item.options?.options || []);
        const values: any[] = Array.isArray(value) ? value : [];
        return (
          <div className={widthToColSpan[item.width]} key={item.id}>
            <Label>{item.label}{item.required ? ' *' : ''}</Label>
            <div className="flex flex-wrap gap-3 p-2 border rounded-md">
              {opts.map((o: any, idx: number) => {
                const optVal = String(o.value ?? o);
                const optLabel = String(o.label ?? o);
                const checked = values.includes(optVal);
                return (
                  <label key={idx} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-violet-600"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(values);
                        if (e.target.checked) next.add(optVal); else next.delete(optVal);
                        handleChange(item, Array.from(next));
                      }}
                    />
                    <span className="text-sm text-gray-700">{optLabel}</span>
                  </label>
                );
              })}
            </div>
            {item.helpText && <p className="text-xs text-gray-500 mt-1">{item.helpText}</p>}
          </div>
        );
      }
      case 'checkbox':
        return (
          <div className={widthToColSpan[item.width]} key={item.id}>
            <label className="inline-flex items-center gap-2 mt-6">
              <input
                type="checkbox"
                className="h-4 w-4 accent-violet-600"
                checked={!!value}
                onChange={(e) => handleChange(item, e.target.checked)}
              />
              <span className="text-sm text-gray-700">{item.label}</span>
            </label>
            {item.helpText && <p className="text-xs text-gray-500 mt-1">{item.helpText}</p>}
          </div>
        );
      default:
        return (
          <div className={widthToColSpan[item.width]} key={item.id}>
            {common}
            <p className="text-xs text-gray-500">Tipo no soportado: {item.type}</p>
          </div>
        );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const payload: ReportAnswer[] = [];
      template.sections.forEach(sec => {
        sec.items.forEach(item => {
          const val = answers[item.id];
          if (item.type === 'level') {
            payload.push({ itemId: item.id, level: val ?? null });
          } else {
            payload.push({ itemId: item.id, value: val });
          }
        });
      });
      await onSubmit(payload);
    } catch (err) {
      setError('No se pudo guardar el reporte.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
      {template.sections.map(section => (
        <div key={section.id} className="border-t pt-4">
          <h4 className="text-lg font-semibold text-violet-700 mb-1">{section.title}</h4>
          {section.description && <p className="text-sm text-gray-600 mb-4">{section.description}</p>}
          <div className="grid grid-cols-12 gap-4">
            {section.items.map(renderItem)}
          </div>
        </div>
      ))}

      <div className="text-right">
        <button disabled={submitting} type="submit" className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 disabled:opacity-50">
          {submitting ? 'Guardando...' : 'Guardar Reporte'}
        </button>
      </div>
    </form>
  );
}
