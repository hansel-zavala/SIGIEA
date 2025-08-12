import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import { FaUserShield, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaApple, FaFacebookF } from "react-icons/fa";

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const data = await authService.login(email, password);
      login(data.token);
      console.log("Login exitoso desde la web!");
    } catch (err) {
      setError("Credenciales inválidas o error de conexión.");
    }
  };

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size
    };

    setRipples([...ripples, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative bg-gradient-to-br from-indigo-700 to-bg-blue-800 font-['Poppins']">
      {/* Background elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0">
        
        <div className="absolute w-64 h-64 rounded-full bg-blue-300 opacity-20 -top-32 -left-32 animate-float"></div>

        <div className="absolute w-96 h-96 rounded-full bg-indigo-300 opacity-20 -bottom-48 -right-48 animate-float animation-delay-1000"></div>
        <div className="absolute w-80 h-80 rounded-full bg-pink-300 opacity-20 top-1/3 -right-20 animate-float animation-delay-1500"></div>
        <div className="absolute w-72 h-72 rounded-full bg-blue-200 opacity-20 bottom-1/4 left-20 animate-float"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-lg bg-white/15 rounded-2xl border border-white/20 shadow-xl p-8 text-white">
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaUserShield className="text-3xl" />
            </div>
            <h1 className="text-3xl font-bold mb-2">SIGIEA</h1>
            <p className="opacity-80">Inicia sesión para acceder a tu cuenta</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Correo electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="opacity-70" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border border-white/20 w-full py-3 pl-10 pr-4 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    placeholder="tu@ejemplo.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="opacity-70" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/10 border border-white/20 w-full py-3 pl-10 pr-10 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FaEyeSlash className="opacity-70 hover:opacity-100 transition" />
                    ) : (
                      <FaEye className="opacity-70 hover:opacity-100 transition" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded bg-white/20 border-white/30 focus:ring-white/30"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm">Recuérdame</label>
                </div>
                <a href="#" className="text-sm font-medium hover:underline">¿Olvidaste tu contraseña?</a>
              </div>
            </div>
            
            <button
              type="submit"
              onClick={createRipple}
              className="relative overflow-hidden bg-gradient-to-r from-indigo-500 to-purple-600 w-full py-3 px-4 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
            >
              Iniciar Sesión
              {ripples.map((ripple) => (
                <span
                  key={ripple.id}
                  className="absolute rounded-full bg-white/40 animate-ripple"
                  style={{
                    left: `${ripple.x}px`,
                    top: `${ripple.y}px`,
                    width: `${ripple.size}px`,
                    height: `${ripple.size}px`,
                  }}
                />
              ))}
            </button>
            
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-white/30"></div>
              <span className="flex-shrink mx-4 text-sm opacity-70">O CONTINÚA CON</span>
              <div className="flex-grow border-t border-white/30"></div>
            </div>
            
            <div className="flex justify-center space-x-6">
              <a href="#" className="social-icon w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110">
                <FaGoogle className="text-xl" />
              </a>
              <a href="#" className="social-icon w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110">
                <FaApple className="text-xl" />
              </a>
              <a href="#" className="social-icon w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110">
                <FaFacebookF className="text-xl" />
              </a>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <p>¿No tienes una cuenta? <a href="#" className="font-medium hover:underline">Regístrate</a></p>
          </div>
        </div>
        
        <div className="mt-6 text-center text-white/70 text-xs">
          <p>Al continuar, aceptas nuestros <a href="#" className="hover:underline">Términos de Servicio</a> y <a href="#" className="hover:underline">Política de Privacidad</a>.</p>
        </div>
      </div>

      {/* Mover las animaciones CSS a un archivo global */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0px); }
        }
        @keyframes ripple {
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        .animate-ripple {
          animation: ripple 1s linear;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default LoginPage;