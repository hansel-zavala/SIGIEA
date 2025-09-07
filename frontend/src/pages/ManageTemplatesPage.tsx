// frontend/src/pages/ManageTemplatesPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import reportTemplateService from '../services/reportTemplateService';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface ItemState {
  description: string;
}

interface SectionState {
  title: string;
  items: ItemState[];
}

function ManageTemplatesPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sections, setSections] = useState<SectionState[]>([]);
  const [error, setError] = useState('');

  const addSection = () => {
    setSections([...sections, { title: '', items: [{ description: '' }] }]);
  };

  const removeSection = (sectionIndex: number) => {
    setSections(sections.filter((_, i) => i !== sectionIndex));
  };

  const handleSectionChange = (index: number, value: string) => {
    const newSections = [...sections];
    newSections[index].title = value;
    setSections(newSections);
  };

  const addItem = (sectionIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items.push({ description: '' });
    setSections(newSections);
  };

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const newSections = [...sections];
    newSections[sectionIndex].items = newSections[sectionIndex].items.filter((_, i) => i !== itemIndex);
    setSections(newSections);
  };

  const handleItemChange = (sectionIndex: number, itemIndex: number, value: string) => {
    const newSections = [...sections];
    newSections[sectionIndex].items[itemIndex].description = value;
    setSections(newSections);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || sections.some(s => !s.title || s.items.some(i => !i.description))) {
        setError("El título de la plantilla, los títulos de sección y las descripciones de ítems son obligatorios.");
        return;
    }
    setError('');

    const templateData = {
        title,
        description,
        sections: sections.map((section, sectionIndex) => ({
            title: section.title,
            order: sectionIndex + 1,
            items: section.items.map((item, itemIndex) => ({
                description: item.description,
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
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Constructor de Plantillas de Reporte</h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
        
        <div className="p-4 border rounded-lg space-y-4">
            <Label htmlFor="title">Título de la Plantilla (ej. Informe Semestral 2025)</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título principal del reporte" />

            <Label htmlFor="description">Texto de Introducción / Observaciones Generales</Label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500 sm:text-lg p-2" placeholder="A continuación, se presenta el informe..."></textarea>
        </div>

        {sections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="p-4 border-2 border-dashed rounded-lg space-y-4 relative">
                 <button type="button" onClick={() => removeSection(sectionIndex)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"><FaTrash /></button>
                <Label htmlFor={`section-title-${sectionIndex}`}>Título de la Sección</Label>
                <Input id={`section-title-${sectionIndex}`} value={section.title} onChange={(e) => handleSectionChange(sectionIndex, e.target.value)} placeholder="Ej: Socialización, Comunicación y Lenguaje" />

                <h4 className="font-semibold pt-4">Ítems a Evaluar en esta Sección:</h4>
                {section.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center gap-2">
                        <Input value={item.description} onChange={(e) => handleItemChange(sectionIndex, itemIndex, e.target.value)} placeholder="Ej: Saluda y se despide de su terapeuta" className="flex-grow" />
                        <button type="button" onClick={() => removeItem(sectionIndex, itemIndex)} className="text-red-500 hover:text-red-700 p-2"><FaTrash /></button>
                    </div>
                ))}
                 <button type="button" onClick={() => addItem(sectionIndex)} className="text-sm text-violet-600 hover:underline flex items-center gap-1"><FaPlus /> Añadir Ítem</button>
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