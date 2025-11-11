import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import authService from '../services/authService';
import { useToast } from '../context/ToastContext';

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
  const [emailSent, setEmailSent] = useState(false);

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

    try {
      await authService.forgotPassword(email);
      setEmailSent(true);
      setStep('code');
      setTimeLeft(15 * 60);
      showToast({ message: 'Código enviado a tu correo electrónico', type: 'success' });
    } catch (error: any) {
      showToast({ message: error.message || 'Error al enviar el código', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.verifyResetCode(email, code);
      setStep('password');
      showToast({ message: 'Código verificado, ingresa tu nueva contraseña', type: 'success' });
    } catch (error: any) {
      showToast({ message: error.message || 'Código incorrecto o expirado', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.resetPassword(email, code, newPassword);
      showToast({ message: 'Contraseña actualizada exitosamente', type: 'success' });
      navigate('/login', {
        state: {
          message: 'Contraseña actualizada exitosamente. Puedes iniciar sesión con tu nueva contraseña.'
        }
      });
    } catch (error: any) {
      showToast({ message: error.message || 'Error al actualizar la contraseña', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);

    try {
      const response = await authService.resendResetCode(email);
      setTimeLeft(15 * 60);
      showToast({ message: 'Código reenviado a tu correo electrónico', type: 'success' });
    } catch (error: any) {
      showToast({ message: error.message || 'Error al reenviar el código', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Recuperar Contraseña
        </h2>
        <p className="text-gray-600">
          Ingresa tu correo electrónico para recibir un código de recuperación
        </p>
      </div>

      <form onSubmit={handleSendResetCode} className="space-y-4">
        <div>
          <Label htmlFor="email">Correo Electrónico</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="tu@correo.com"
            required
            className="w-full"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Enviando...' : 'Enviar Código'}
        </Button>
      </form>
    </div>
  );

  const renderCodeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Verificar Código
        </h2>
        <p className="text-gray-600">
          Hemos enviado un código a <strong>{email}</strong>
        </p>
        {timeLeft > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Código expira en: <strong>{formatTime(timeLeft)}</strong>
          </p>
        )}
      </div>

      <form onSubmit={handleVerifyCode} className="space-y-4">
        <div>
          <Label htmlFor="code">Código de Verificación</Label>
          <Input
            id="code"
            type="text"
            value={code}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Ingresa el código de 6 dígitos"
            maxLength={6}
            className="w-full text-center text-2xl font-mono tracking-widest"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Verificando...' : 'Verificar Código'}
        </Button>
      </form>

      <div className="text-center space-y-2">
        <Button
          variant="outline"
          onClick={handleResendCode}
          disabled={loading || timeLeft > 60} // Only allow resend after 1 minute
          className="w-full"
        >
          {loading ? 'Reenviando...' : 'Reenviar Código'}
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => setStep('email')}
          className="w-full"
        >
          Cambiar Correo Electrónico
        </Button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nueva Contraseña
        </h2>
        <p className="text-gray-600">
          Ingresa tu nueva contraseña
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-4">
        <div>
          <Label htmlFor="newPassword">Nueva Contraseña</Label>
          <Input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            className="w-full"
            required
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            placeholder="Repite la contraseña"
            className="w-full"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </Button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {step === 'email' && renderEmailStep()}
          {step === 'code' && renderCodeStep()}
          {step === 'password' && renderPasswordStep()}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;