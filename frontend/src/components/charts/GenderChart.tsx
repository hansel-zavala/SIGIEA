import { FaMale, FaFemale } from 'react-icons/fa';

interface GenderChartProps {
  maleCount: number;
  femaleCount: number;
  total: number;
}

function GenderChart({ maleCount, femaleCount, total }: GenderChartProps) {
  const malePercentage = total > 0 ? Math.round((maleCount / total) * 100) : 0;
  const femalePercentage = total > 0 ? Math.round((femaleCount / total) * 100) : 0;

  // El ángulo de rotación para la segunda mitad del anillo
  const femaleOffset = (malePercentage / 100) * 360;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Estudiantes por Género</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <div className="relative flex-grow flex items-center justify-center">
        {/* Anillo de fondo gris */}
        <svg className="w-48 h-48" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
        </svg>
        {/* Anillos de datos */}
        <svg className="absolute w-48 h-48" viewBox="0 0 120 120">
          {/* Anillo Masculino (Azul) */}
          <circle
            cx="60" cy="60" r="54" fill="none" stroke="#a0d2eb" strokeWidth="12"
            strokeDasharray={`${malePercentage * 3.3929} 999`} // 339.29 es la circunferencia
            transform="rotate(-90 60 60)"
          />
          {/* Anillo Femenino (Amarillo) */}
          <circle
            cx="60" cy="60" r="54" fill="none" stroke="#fde047" strokeWidth="12"
            strokeDasharray={`${femalePercentage * 3.3929} 999`}
            transform={`rotate(${femaleOffset - 90} 60 60)`}
          />
        </svg>

        {/* Iconos centrales */}
        <div className="absolute flex gap-2 text-3xl text-gray-500">
          <FaMale className="text-blue-400" />
          <FaFemale className="text-yellow-400" />
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="flex justify-around mt-4">
        <div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#a0d2eb]"></span>
            <span className="text-2xl font-bold text-gray-800">{maleCount.toLocaleString('es-HN')}</span>
          </div>
          <p className="text-sm text-gray-500">Masculino ({malePercentage}%)</p>
        </div>
        <div>
          <div className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#fde047]"></span>
            <span className="text-2xl font-bold text-gray-800">{femaleCount.toLocaleString('es-HN')}</span>
          </div>
          <p className="text-sm text-gray-500">Femenino ({femalePercentage}%)</p>
        </div>
      </div>
    </div>
  );
}

export default GenderChart;