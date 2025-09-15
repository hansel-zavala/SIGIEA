import { useAuth } from '../context/AuthContext';

function ProfilePage() {
  const { user } = useAuth();

  if (!user) return <div>No se encontró información del usuario.</div>;

  return (
    <section className="max-w-3xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm ring-1 ring-gray-100 dark:ring-gray-700 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-violet-200 dark:bg-violet-900/40 grid place-items-center text-violet-700 dark:text-violet-300 text-xl font-bold">
            {user.name?.charAt(0) ?? 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rol: {user.role}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">ID: {user.id}</p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-violet-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300">Nombre</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div className="p-4 bg-violet-50 dark:bg-gray-900 rounded-lg">
            <p className="text-gray-600 dark:text-gray-300">Rol</p>
            <p className="font-medium">{user.role}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;

