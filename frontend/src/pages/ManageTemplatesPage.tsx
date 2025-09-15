// frontend/src/pages/ManageTemplatesPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import reportTemplateService from '../services/reportTemplateService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';

type ItemKind = 'level' | 'long_text';

interface ItemState {
  // Para ambos tipos solo pedimos un título/etiqueta simple
  label: string;
  kind: ItemKind; // 'level' (completación) o 'long_text' (texto normal)
}

interface SectionState {
  title: string;
  description?: string;
  items: ItemState[];
}

function ManageTemplatesPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<SectionState[]>([]);
  const [publish, setPublish] = useState(false);
  const [error, setError] = useState('');

  const addSection = () => {
    setSections([...sections, { title: '', description: '', items: [] }]);
  };

  const removeSection = (sectionIndex: number) => {
    setSections(sections.filter((_, i) => i !== sectionIndex));
  };

  const handleSectionChange = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].title = value;
    setSections(newSections);
  };

  const addLevelItem = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items.push({ label: '', kind: 'level' });
    setSections(newSections);
  };

  const addTextItem = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items.push({ label: '', kind: 'long_text' });
    setSections(newSections);
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex);
    setSections(newSections);
  };

  const handleItemLabelChange = (sectionIndex: number, itemIndex: number, value: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].items[itemIndex].label = value;
    setSections(newSections);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || sections.some(s => !s.title || s.items.some(i => !i.label))) {
        setError("El título, los títulos de sección y las etiquetas de ítems son obligatorios.");
        return;
    }
    setError('');

    const templateData = {
        title,
        description,
        publish,
        sections: sections.map((section, sectionIndex) => ({
            title: section.title,
            description: section.description || undefined,
            order: sectionIndex + 1,
            items: section.items.map((item, itemIndex) => ({
                label: item.label,
                type: item.kind, // 'level' o 'long_text'
                width: 'FULL',
                order: itemIndex + 1,
            }))
        }))
    };
    
    try {
        await reportTemplateService.createTemplate(templateData);
        alert('¡Plantilla creada exitosamente!');
        navigate('/');
    } catch (err) {
        setError('No se pudo crear la plantilla. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Constructor de Plantillas de Reporte</h2>
        <button
          type="button"
          onClick={() => navigate('/templates?status=draft')}
          className="py-2 px-4 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
        >Ver borradores</button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <div className="p-4 border rounded-lg space-y-4">
            <Label htmlFor="title">Título de la Plantilla (ej. Informe Semestral 2025)</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título principal del reporte" />

            <Label htmlFor="description">Texto de Introducción / Observaciones Generales</Label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-lg p-2" placeholder="A continuación, se presenta el informe..."></textarea>
            <label className="inline-flex items-center gap-2 mt-2">
              <input type="checkbox" className="h-4 w-4 accent-violet-600" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
              <span className="text-sm text-gray-700">Publicar al guardar</span>
            </label>
        </div>

        {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="p-4 border-2 border-dashed rounded-lg space-y-4 relative">
                 <button type="button" onClick={() => removeSection(sectionIndex)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"><FaTrash /></button>
                <Label htmlFor={`section-title-${sectionIndex}`}>Título de la Sección</Label>
                <Input id={`section-title-${sectionIndex}`} value={section.title} onChange={(e) => handleSectionChange(sectionIndex, e.target.value)} placeholder="Ej: Socialización, Comunicación y Lenguaje" />
                <Label className="mt-2">Descripción (opcional)</Label>
                <textarea value={section.description || ''} onChange={(e) => { const s=[...sections]; s[sectionIndex].description = e.target.value; setSections(s); }} rows={3} className="block w-full rounded-md border-gray-300 shadow-sm p-2" />

                <h4 className="font-semibold pt-4">Campos de la sección</h4>
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-center gap-3 p-3 border rounded-md mb-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-violet-100 text-violet-700">
                      {item.kind === 'level' ? 'Completación' : 'Texto'}
                    </span>
                    <Input
                      className="flex-grow"
                      value={item.label}
                      onChange={(e) => handleItemLabelChange(sectionIndex, itemIndex, e.target.value)}
                      placeholder={item.kind === 'level' ? 'Ej: Saluda y se despide de su terapeuta' : 'Título del campo de texto'}
                    />
                    <button type="button" onClick={() => removeItem(sectionIndex, itemIndex)} className="text-red-500 hover:text-red-700 p-2"><FaTrash /></button>
                  </div>
                ))}
                <div className="flex gap-3 mt-2">
                  <button type="button" onClick={() => addLevelItem(sectionIndex)} className="text-sm text-violet-600 hover:underline flex items-center gap-1"><FaPlus /> Agregar ítem de completación</button>
                  <button type="button" onClick={() => addTextItem(sectionIndex)} className="text-sm text-violet-600 hover:underline flex items-center gap-1"><FaPlus /> Agregar campo de texto</button>
                </div>
            </div>
        ))}

        <div className="flex justify-between items-center">
            <button type="button" onClick={addSection} className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 transition-all duration-200 flex items-center gap-2">
                <FaPlus /> Añadir Sección
            </button>
            <button type="submit" className="py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200">
                Guardar Plantilla Completa
            </button>
        </div>
      </form>
    </div>
  );
}

export default ManageTemplatesPage;
