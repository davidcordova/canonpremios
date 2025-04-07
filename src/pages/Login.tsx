import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'code' | 'newPassword'>('email');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState({
    password: '',
    confirmPassword: ''
  });
  const [recoverySuccess, setRecoverySuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas');
    }
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (recoveryStep === 'email') {
      // Aquí iría la lógica para enviar el código de recuperación
      // Por ahora simularemos que se envió correctamente
      setRecoveryStep('code');
    } else if (recoveryStep === 'code') {
      // Aquí iría la validación del código
      // Por ahora simularemos que el código es correcto
      setRecoveryStep('newPassword');
    } else if (recoveryStep === 'newPassword') {
      if (newPassword.password !== newPassword.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      // Aquí iría la lógica para cambiar la contraseña
      // Por ahora simularemos que se cambió correctamente
      setRecoverySuccess(true);
    }
  };

  const resetRecovery = () => {
    setRecoveryStep('email');
    setRecoveryEmail('');
    setRecoveryCode('');
    setNewPassword({
      password: '',
      confirmPassword: ''
    });
    setRecoverySuccess(false);
    setIsRecoveryOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-8">
          <img
            src="https://graffica.info/wp-content/uploads/2016/07/logo_01.jpg" // New logo URL
            alt="Canon Logo"
            className="h-12" // Keep existing height
          />
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <Button type="submit" className="w-full bg-[#D61F26] hover:bg-[#B01820]">
            Iniciar Sesión
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsRecoveryOpen(true)}
              className="text-sm text-primary hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Credenciales de prueba:</p>
          <p>Vendedor: vendedor@canon.com / vendedor123</p>
          <p>Admin: admin@canon.com / admin123</p>
        </div>
      </div>

      {/* Modal de recuperación de contraseña */}
      <Dialog.Root open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">
              {recoverySuccess ? 'Contraseña Actualizada' : 'Recuperar Contraseña'}
            </Dialog.Title>

            {recoverySuccess ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
                <div className="flex justify-end">
                  <Button onClick={resetRecovery}>
                    Volver al Login
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                {recoveryStep === 'email' && (
                  <>
                    <p className="text-sm text-gray-500 mb-4">
                      Ingresa tu correo electrónico y te enviaremos un código de verificación.
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="recovery-email">Correo Electrónico</Label>
                      <Input
                        id="recovery-email"
                        type="email"
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {recoveryStep === 'code' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setRecoveryStep('email')}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver
                    </button>
                    <p className="text-sm text-gray-500 mb-4">
                      Hemos enviado un código de verificación a <span className="font-medium">{recoveryEmail}</span>
                    </p>
                    <div className="space-y-2">
                      <Label htmlFor="recovery-code">Código de Verificación</Label>
                      <Input
                        id="recovery-code"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value)}
                        placeholder="Ingresa el código de 6 dígitos"
                        required
                      />
                    </div>
                  </>
                )}

                {recoveryStep === 'newPassword' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setRecoveryStep('code')}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Volver
                    </button>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Nueva Contraseña</Label>
                        <Input
                          id="new-password"
                          type="password"
                          value={newPassword.password}
                          onChange={(e) => setNewPassword({ ...newPassword, password: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          value={newPassword.confirmPassword}
                          onChange={(e) => setNewPassword({ ...newPassword, confirmPassword: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-4 border-t flex justify-end gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={resetRecovery}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {recoveryStep === 'email' ? 'Enviar Código' :
                     recoveryStep === 'code' ? 'Verificar Código' :
                     'Cambiar Contraseña'}
                  </Button>
                </div>
              </form>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
