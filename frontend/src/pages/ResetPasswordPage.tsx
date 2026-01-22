import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { useToast } from '../context/ToastContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = { id: Date.now(), x, y, size };
    setRipples([...ripples, newRipple]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 1000);
  };

  React.useEffect(() => {
    if (step === 'code' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, step]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailError('');

    // Validación del cliente
    if (!email) {
      setEmailError('El correo electrónico es requerido');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('El formato del correo electrónico no es válido');
      setLoading(false);
      return;
    }

    try {
      await authService.forgotPassword(email);
      setStep('code');
      setTimeLeft(15 * 60);
      showToast({ message: 'Si existe una cuenta con ese correo, se ha enviado un código de recuperación.', type: 'success' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al enviar el código';
      showToast({ message: errorMessage, type: 'error' });
      setEmailError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCodeError('');

    // Validación del cliente
    if (!code) {
      setCodeError('El código es requerido');
      setLoading(false);
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setCodeError('El código debe tener 6 dígitos');
      setLoading(false);
      return;
    }

    try {
      await authService.verifyResetCode(email, code);
      setStep('password');
      showToast({ message: 'Código verificado, ingresa tu nueva contraseña', type: 'success' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Código incorrecto o expirado';
      showToast({ message: errorMessage, type: 'error' });
      setCodeError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError('');
    setConfirmPasswordError('');

    // Validaciones del cliente
    if (!newPassword) {
      setPasswordError('La nueva contraseña es requerida');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('La confirmación de contraseña es requerida');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(email, code, newPassword);
      showToast({ message: 'Contraseña actualizada exitosamente', type: 'success' });
      navigate('/login', {
        state: {
          message: 'Contraseña actualizada exitosamente. Puedes iniciar sesión con tu nueva contraseña.'
        }
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al actualizar la contraseña';
      showToast({ message: errorMessage, type: 'error' });
      if (error.response?.data?.field === 'newPassword') {
        setPasswordError(errorMessage);
      } else {
        setCodeError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);

    // Validación del cliente
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast({ message: 'El formato del correo electrónico no es válido', type: 'error' });
      setEmailError('El formato del correo electrónico no es válido');
      setLoading(false);
      return;
    }

    try {
      await authService.resendResetCode(email);
      setTimeLeft(15 * 60);
      showToast({ message: 'Si existe una cuenta con ese correo, se ha enviado un nuevo código de recuperación.', type: 'success' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Error al reenviar el código';
      showToast({ message: errorMessage, type: 'error' });
      setEmailError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-2">
          Recuperar Contraseña
        </h2>
        <p className="opacity-80">
          Ingresa tu correo electrónico para recibir un código de recuperación
        </p>
      </div>

      <form onSubmit={handleSendResetCode} className="space-y-4">
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
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(''); // Limpiar error al escribir
              }}
              className={`bg-white/10 border ${emailError ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:ring-white/30'
                } w-full py-3 pl-10 pr-4 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 transition-all`}
              placeholder="tu@ejemplo.com"
              required
            />
          </div>
          {emailError && (
            <p className="text-red-400 text-sm mt-1 animate-fade-in">
              {emailError}
            </p>
          )}
        </div>

        <button
          type="submit"
          onClick={createRipple}
          className="relative overflow-hidden bg-gradient-to-r from-[#006764] to-[#29A690] w-full py-3 px-4 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Código'}
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
      </form>
    </div>
  );

  const renderCodeStep = () => (
    <div className="space-y-6">
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-2">
          Verificar Código
        </h2>
        <p className="opacity-80">
          Hemos enviado un código a <strong>{email}</strong>
        </p>
        {timeLeft > 0 && (
          <p className="text-sm opacity-70 mt-2">
            Código expira en: <strong>{formatTime(timeLeft)}</strong>
          </p>
        )}
      </div>

      <form onSubmit={handleVerifyCode} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium mb-1">Código de Verificación</label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              setCodeError(''); // Limpiar error al escribir
            }}
            placeholder="Ingresa el código de 6 dígitos"
            maxLength={6}
            className={`bg-white/10 border ${codeError ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:ring-white/30'
              } w-full py-3 px-4 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 transition-all text-center text-lg tracking-widest`}
            required
          />
          {codeError && (
            <p className="text-red-400 text-sm mt-1 animate-fade-in">
              {codeError}
            </p>
          )}
        </div>

        <button
          type="submit"
          onClick={createRipple}
          className="relative overflow-hidden bg-gradient-to-r from-[#006764] to-[#29A690] w-full py-3 px-4 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          disabled={loading}
        >
          {loading ? 'Verificando...' : 'Verificar Código'}
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
      </form>

      <div className="text-center space-y-3">
        <button
          onClick={handleResendCode}
          disabled={loading || timeLeft > 60}
          className="bg-white/20 border border-white/30 w-full py-2 px-4 rounded-lg font-medium text-white hover:bg-white/30 transition-all duration-300 disabled:opacity-50"
        >
          {loading ? 'Reenviando...' : 'Reenviar Código'}
        </button>

        <button
          onClick={() => setStep('email')}
          className="text-sm font-medium hover:underline text-left w-full"
        >
          Cambiar Correo Electrónico
        </button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-6">
      <div className="text-center animate-fade-in">
        <h2 className="text-2xl font-bold mb-2">
          Nueva Contraseña
        </h2>
        <p className="opacity-80">
          Ingresa tu nueva contraseña
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium mb-1">Nueva Contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="opacity-70" />
            </div>
            <input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setPasswordError(''); // Limpiar error al escribir
              }}
              placeholder="••••••••"
              className={`bg-white/10 border ${passwordError ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:ring-white/30'
                } w-full py-3 pl-10 pr-10 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 transition-all`}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? (
                <FaEyeSlash className={`opacity-70 hover:opacity-100 transition ${passwordError ? 'text-red-400' : ''}`} />
              ) : (
                <FaEye className={`opacity-70 hover:opacity-100 transition ${passwordError ? 'text-red-400' : ''}`} />
              )}
            </button>
          </div>
          {passwordError && (
            <p className="text-red-400 text-sm mt-1 animate-fade-in">
              {passwordError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">Confirmar Nueva Contraseña</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaLock className="opacity-70" />
            </div>
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError(''); // Limpiar error al escribir
              }}
              placeholder="••••••••"
              className={`bg-white/10 border ${confirmPasswordError ? 'border-red-400 focus:ring-red-400' : 'border-white/20 focus:ring-white/30'
                } w-full py-3 pl-10 pr-10 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 transition-all`}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <FaEyeSlash className={`opacity-70 hover:opacity-100 transition ${confirmPasswordError ? 'text-red-400' : ''}`} />
              ) : (
                <FaEye className={`opacity-70 hover:opacity-100 transition ${confirmPasswordError ? 'text-red-400' : ''}`} />
              )}
            </button>
          </div>
          {confirmPasswordError && (
            <p className="text-red-400 text-sm mt-1 animate-fade-in">
              {confirmPasswordError}
            </p>
          )}
        </div>

        <button
          type="submit"
          onClick={createRipple}
          className="relative overflow-hidden bg-gradient-to-r from-[#006764] to-[#29A690] w-full py-3 px-4 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          disabled={loading}
        >
          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
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
      </form>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative bg-gradient-to-br from-[#003057] to-[#006764] font-['Poppins']">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-64 h-64 rounded-full bg-[#008E83] opacity-20 -top-32 -left-32 animate-float"></div>
        <div className="absolute w-96 h-96 rounded-full bg-[#29A690] opacity-20 -bottom-48 -right-48 animate-float animation-delay-1000"></div>
        <div className="absolute w-80 h-80 rounded-full bg-[#006764] opacity-20 top-1/3 -right-20 animate-float animation-delay-1500"></div>
        <div className="absolute w-72 h-72 rounded-full bg-[#008E83] opacity-20 bottom-1/4 left-20 animate-float"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-lg bg-white/15 rounded-2xl border border-white/20 shadow-xl p-8 text-white">
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaKey className="text-3xl" />
            </div>
            <h1 className="text-3xl font-bold mb-2">SIGIEA</h1>
            <p className="opacity-80">Recuperar Contraseña</p>
          </div>

          {step === 'email' && renderEmailStep()}
          {step === 'code' && renderCodeStep()}
          {step === 'password' && renderPasswordStep()}
        </div>
        <div className="mt-6 text-center text-white/70 text-xs">
          <p>¿Ya tienes cuenta? <button onClick={() => navigate('/login')} className="hover:underline">Inicia sesión</button></p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;