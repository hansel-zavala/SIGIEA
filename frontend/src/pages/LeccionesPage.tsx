// frontend/src/pages/LeccionesPage.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import leccionService from "../services/leccionService";
import Badge from "../components/ui/Badge"; // Importamos el Badge
import { FaBook } from "react-icons/fa"; // Importamos un ícono
import { FaPencilAlt, FaTrash, FaPlus } from "react-icons/fa";

interface Leccion {
  id: number;
  title: string;
  objective: string;
  category: string | null;
}

function LeccionesPage() {
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLecciones = async () => {
      try {
        const data = await leccionService.getAllLecciones();
        setLecciones(data);
      } catch (err) {
        setError("No se pudo cargar la lista de lecciones.");
      } finally {
        setLoading(false);
      }
    };
    fetchLecciones();
  }, []);

  const handleDelete = async (leccionId: number) => {
    if (window.confirm("¿Seguro que quieres desactivar esta lección?")) {
      try {
        await leccionService.deleteLeccion(leccionId);
        setLecciones(lecciones.filter((l) => l.id !== leccionId));
      } catch (err) {
        setError("No se pudo desactivar la lección.");
      }
    }
  };

  if (loading) return <p>Cargando lecciones...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Catálogo de Lecciones
        </h2>
        <Link to="/lecciones/new">
          <button className="min-w-[220px] py-3 px-8 text-white font-bold rounded-lg bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 transition-all duration-200 flex items-center justify-center gap-3 shadow-md">
            <FaPlus className="text-xl" />
            <span className="text-lg">Crear Nueva Lección</span>
          </button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">
                  Título
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">
                  Categoría
                </th>
                <th className="px-5 py-3 font-medium text-gray-500 text-left">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lecciones.map((leccion) => (
                <tr key={leccion.id}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">
                        <FaBook size={30} />
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800">
                          {leccion.title}
                        </span>
                        <span className="block text-gray-500 text-xs">
                          {leccion.objective}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge color={leccion.category ? "info" : "warning"}>
                      {leccion.category || "Sin categoría"}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-4">
                      <Link to={`/lecciones/edit/${leccion.id}`} title="Editar">
                        <FaPencilAlt className="text-blue-500 hover:text-blue-700 cursor-pointer" />
                      </Link>
                      <button
                        onClick={() => handleDelete(leccion.id)}
                        title="Desactivar"
                      >
                        <FaTrash className="text-red-500 hover:text-red-700 cursor-pointer" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default LeccionesPage;
