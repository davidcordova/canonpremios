import { useState, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Save, Camera, Upload, Calendar } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { companies } from '@/lib/mockData';

interface UserProfile {
  name: string;
  documentId: string;
  address: string;
  position: string;
  corporateEmail: string;
  phone: string;
  company: string;
  birthDate?: string;
}

const mockProfile: UserProfile = {
  name: 'Juan Pérez',
  documentId: '12345678',
  address: 'Av. Principal 123',
  position: 'Vendedor Senior',
  corporateEmail: 'juan.perez@canon.com',
  phone: '987654321',
  company: 'Canon Store Central S.A.C',
  birthDate: '1990-05-15'
};

export default function Profile() {
  const { user, updateUserAvatar } = useAuthStore((state) => state);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtrar solo empresas activas para el select
  const activeCompanies = companies.filter(company => company.status === 'active');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsEditing(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    // Aquí iría la lógica para cambiar la contraseña
    setIsPasswordDialogOpen(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      setIsAvatarDialogOpen(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const saveAvatar = () => {
    if (avatarPreview) {
      updateUserAvatar(avatarPreview);
      setIsAvatarDialogOpen(false);
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          {/* Make header flex column on small screens, row on medium+ */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Perfil de Usuario</h1>
            {/* Make button group flex column on small screens, row on medium+ */}
            <div className="flex flex-col sm:flex-row gap-2">
              {isEditing ? (
                <Button
                  variant="outline"
                  onClick={() => handleSubmit()}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Guardar
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsPasswordDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    Cambiar Contraseña
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar Perfil
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Make avatar/name section stack vertically on small screens */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
            <div className="relative">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                alt="Profile"
                /* Smaller avatar on mobile, larger on sm+ */
                className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={handleAvatarClick}
              />
              {isEditing && (
                <Button
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  onClick={handleAvatarClick}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Center text on mobile when stacked, left-align on sm+ */}
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
              <p className="text-gray-500">{profile.position}</p>
              {/* Center badges on mobile */}
              <div className="mt-2 flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  {user?.role === 'admin' ? 'Administrador' : 'Vendedor'}
                </span>
                {user?.role === 'seller' && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    1,250 puntos
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombres y Apellidos</Label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="documentId">Documento de Identidad</Label>
                <Input
                  id="documentId"
                  name="documentId"
                  value={profile.documentId}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Cargo</Label>
                <Input
                  id="position"
                  name="position"
                  value={profile.position}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="corporateEmail">Correo Corporativo</Label>
                <Input
                  id="corporateEmail"
                  name="corporateEmail"
                  type="email"
                  value={profile.corporateEmail}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                <Input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={profile.birthDate}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                {isEditing ? (
                  <select
                    id="company"
                    name="company"
                    value={profile.company}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {activeCompanies.map((company) => (
                      <option key={company.id} value={company.name}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id="company"
                    name="company"
                    value={profile.company}
                    disabled
                  />
                )}
              </div>
            </div>
          </form>

          {user?.role === 'seller' && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Actividades Recientes</h3>
              <div className="space-y-4">
                {[
                  { id: 1, type: 'purchase', description: 'Compra de Canon G3160', date: '15 Mar 2024' },
                  { id: 2, type: 'sale', description: 'Venta de Canon Maxifi GX7010', date: '14 Mar 2024' },
                   { id: 3, type: 'training', description: 'Capacitación de Productos', date: '13 Mar 2024' },
                 ].map((activity) => (
                   /* Stack activity details vertically on small screens */
                   <div key={activity.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-1 sm:gap-4">
                     <div>
                       <p className="font-medium text-gray-900">{activity.description}</p>
                       <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para cambiar la foto de perfil */}
      <Dialog.Root open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Cambiar Foto de Perfil
            </Dialog.Title>
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={avatarPreview || user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                    alt="Avatar Preview"
                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Seleccionar Imagen</Label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={triggerFileInput}
                    className="w-full flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Seleccionar Archivo
                  </Button>
                </div>
                {avatarFile && (
                  <p className="text-xs text-gray-500">
                    Archivo seleccionado: {avatarFile.name}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAvatarDialogOpen(false);
                    setAvatarPreview(null);
                    setAvatarFile(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveAvatar}
                  disabled={!avatarPreview}
                >
                  Guardar Imagen
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal para cambiar contraseña */}
      <Dialog.Root open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Cambiar Contraseña
            </Dialog.Title>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPasswordDialogOpen(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                >
                  Cambiar Contraseña
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
