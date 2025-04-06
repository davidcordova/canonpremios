import { useState, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, UserPlus, Mail, Building2, Phone, MapPin, Star, Edit, Trash2, AlertCircle, Camera, Upload, Calendar, Key } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { companies } from '@/lib/mockData';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'seller' | 'admin';
  company: string;
  phone: string;
  address: string;
  points: number;
  category: 'bronce' | 'plata' | 'oro' | 'diamante';
  status: 'active' | 'inactive';
  avatar: string;
  joinedAt: string;
  birthDate?: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@canon.com',
    role: 'seller',
    company: 'Canon Store Central S.A.C',
    phone: '987654321',
    address: 'Av. Principal 123',
    points: 1250,
    category: 'plata',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    joinedAt: '2024-01-15',
    birthDate: '1990-05-15'
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria.garcia@canon.com',
    role: 'seller',
    company: 'Canon Store Norte S.A.C',
    phone: '987654322',
    address: 'Av. Secundaria 456',
    points: 980,
    category: 'bronce',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    joinedAt: '2024-02-01',
    birthDate: '1992-08-20'
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@canon.com',
    role: 'seller',
    company: 'Canon Store Sur S.A.C',
    phone: '987654323',
    address: 'Av. Terciaria 789',
    points: 750,
    category: 'bronce',
    status: 'inactive',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    joinedAt: '2024-02-15',
    birthDate: '1988-12-10'
  },
  {
    id: '4',
    name: 'Ana Martínez',
    email: 'ana.martinez@canon.com',
    role: 'seller',
    company: 'Canon Store Este S.A.C',
    phone: '987654324',
    address: 'Av. Principal 456',
    points: 2500,
    category: 'oro',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    joinedAt: '2023-11-10',
    birthDate: '1995-03-25'
  },
  {
    id: '5',
    name: 'Pedro López',
    email: 'pedro.lopez@canon.com',
    role: 'admin',
    company: 'Canon Oficina Central',
    phone: '987654325',
    address: 'Av. Central 789',
    points: 0,
    category: 'diamante',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    joinedAt: '2023-10-05',
    birthDate: '1985-07-30'
  }
];

const categoryColors = {
  bronce: 'bg-amber-100 text-amber-800',
  plata: 'bg-gray-100 text-gray-800',
  oro: 'bg-yellow-100 text-yellow-800',
  diamante: 'bg-blue-100 text-blue-800'
};

const categoryNames = {
  bronce: 'Bronce',
  plata: 'Plata',
  oro: 'Oro',
  diamante: 'Diamante'
};

export default function Users() {
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'seller' as 'seller' | 'admin',
    company: '',
    phone: '',
    address: '',
    category: 'bronce' as 'bronce' | 'plata' | 'oro' | 'diamante',
    points: '0',
    avatar: null as File | null,
    birthDate: ''
  });
  
  const [editUser, setEditUser] = useState({
    name: '',
    email: '',
    role: 'seller' as 'seller' | 'admin',
    company: '',
    phone: '',
    address: '',
    category: 'bronce' as 'bronce' | 'plata' | 'oro' | 'diamante',
    points: '0',
    status: 'active' as 'active' | 'inactive',
    birthDate: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Acceso Denegado</h2>
          <p className="mt-2 text-sm text-gray-500">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewUser = () => {
    if (!newUser.name || !newUser.email || !newUser.company || !newUser.phone || !newUser.address || !newUser.password || !newUser.confirmPassword) {
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    const avatarUrl = newUser.avatar 
      ? URL.createObjectURL(newUser.avatar)
      : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
    
    const user: User = {
      id: (users.length + 1).toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      company: newUser.company,
      phone: newUser.phone,
      address: newUser.address,
      points: parseInt(newUser.points),
      category: newUser.category,
      status: 'active',
      avatar: avatarUrl,
      joinedAt: new Date().toISOString().split('T')[0],
      birthDate: newUser.birthDate
    };

    setUsers([...users, user]);
    setIsNewUserOpen(false);
    setNewUser({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'seller',
      company: '',
      phone: '',
      address: '',
      category: 'bronce',
      points: '0',
      avatar: null,
      birthDate: ''
    });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    
    if (!editUser.name || !editUser.email || !editUser.company || !editUser.phone || !editUser.address) {
      return;
    }

    setUsers(users.map(u => 
      u.id === selectedUser.id
        ? {
            ...u,
            name: editUser.name,
            email: editUser.email,
            role: editUser.role,
            company: editUser.company,
            phone: editUser.phone,
            address: editUser.address,
            category: editUser.category,
            points: parseInt(editUser.points),
            status: editUser.status,
            birthDate: editUser.birthDate
          }
        : u
    ));
    
    setIsEditUserOpen(false);
    setSelectedUser(null);
  };

  const handleChangePassword = () => {
    if (!selectedUser) return;

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    // Aquí iría la lógica para cambiar la contraseña en el backend
    setIsChangePasswordOpen(false);
    setSelectedUser(null);
    setPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
  };

  const openEditUser = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      phone: user.phone,
      address: user.address,
      category: user.category,
      points: user.points.toString(),
      status: user.status,
      birthDate: user.birthDate || ''
    });
    setIsEditUserOpen(true);
  };

  const openChangePassword = (user: User) => {
    setSelectedUser(user);
    setPasswordData({
      newPassword: '',
      confirmPassword: ''
    });
    setIsChangePasswordOpen(true);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter(u => u.id !== selectedUser.id));
    }
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const confirmDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openAvatarDialog = (user: User) => {
    setSelectedUser(user);
    setAvatarPreview(null);
    setAvatarFile(null);
    setIsAvatarDialogOpen(true);
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
    if (selectedUser && avatarPreview) {
      setUsers(users.map(u => 
        u.id === selectedUser.id
          ? { ...u, avatar: avatarPreview }
          : u
      ));
      
      setIsAvatarDialogOpen(false);
      setAvatarPreview(null);
      setAvatarFile(null);
      setSelectedUser(null);
    }
  };

  const handleNewUserAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewUser({ ...newUser, avatar: file });
    }
  };

  // Filtrar solo empresas activas
  const activeCompanies = companies.filter(company => company.status === 'active');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los vendedores y sus permisos en el sistema
          </p>
        </div>
        <Button onClick={() => setIsNewUserOpen(true)} className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar usuarios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <Button
                    variant="secondary"
                    className="absolute -bottom-1 -right-1 rounded-full w-6 h-6 p-0"
                    onClick={() => openAvatarDialog(user)}
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'Administrador' : 'Vendedor'}
                    </span>
                    {user.role === 'seller' && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[user.category]}`}>
                        {categoryNames[user.category]}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Building2 className="h-4 w-4" />
                  <span>{user.company}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{user.address}</span>
                </div>

                {user.birthDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(user.birthDate).toLocaleDateString('es-ES')}</span>
                  </div>
                )}

                {user.role === 'seller' && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Star className="h-4 w-4" />
                    <span>{user.points} puntos</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t flex justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2"
                    onClick={() => openEditUser(user)}
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openChangePassword(user)}
                    className="flex items-center gap-2"
                  >
                    <Key className="h-4 w-4" />
                    Contraseña
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  onClick={() => confirmDelete(user)}
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla para vista movil */}
      <div className="overflow-x-auto w-full mt-6">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400 border-separate border-spacing-0">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Nombre</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Empresa</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="bg-white dark:bg-gray-800">
                <td data-label="Nombre" className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td data-label="Email" className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td data-label="Empresa" className="px-6 py-4 whitespace-nowrap">{user.company}</td>
                <td data-label="Acciones" className="px-6 py-4 whitespace-nowrap">
                  <Button variant="outline" size="sm" className="mr-2" onClick={() => openEditUser(user)}><Edit className="h-4 w-4" /></Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    onClick={() => confirmDelete(user)}><Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para nuevo usuario */}
      <Dialog.Root open={isNewUserOpen} onOpenChange={setIsNewUserOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[90%] md:w-full md:max-w-md">
            <div className="p-6">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Agregar Nuevo Usuario
              </Dialog.Title>
              <div className="space-y-4">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <img
                      src={newUser.avatar ? URL.createObjectURL(newUser.avatar) : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                      alt="Avatar"
                      className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <Button
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                      onClick={() => document.getElementById('new-user-avatar')?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                    <input
                      id="new-user-avatar"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleNewUserAvatarChange}
                    />
                  </div>
                </div>                
                
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>                

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </div>                

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={newUser.confirmPassword}
                    onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                  />
                </div>                

                <div className="space-y-2">
                  <Label htmlFor="role">Perfil</Label>
                  <select
                    id="role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'seller' | 'admin' })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="seller">Vendedor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <select
                    id="company"
                    value={newUser.company}
                    onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Seleccionar empresa</option>
                    {activeCompanies.map((company) => (
                      <option key={company.id} value={company.name}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    value={newUser.address}
                    onChange={(e) => setNewUser({ ...newUser, address: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={newUser.birthDate}
                    onChange={(e) => setNewUser({ ...newUser, birthDate: e.target.value })}
                  />
                </div>                

                {newUser.role === 'seller' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <select
                        id="category"
                        value={newUser.category}
                        onChange={(e) => setNewUser({ ...newUser, category: e.target.value as 'bronce' | 'plata' | 'oro' | 'diamante' })}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="bronce">Bronce</option>
                        <option value="plata">Plata</option>
                        <option value="oro">Oro</option>
                        <option value="diamante">Diamante</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="points">Puntos Iniciales</Label>
                      <Input
                        id="points"
                        type="number"
                        min="0"
                        value={newUser.points}
                        onChange={(e) => setNewUser({ ...newUser, points: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <div className="pt-4 border-t mt-4">
                  <Button
                    onClick={handleNewUser}
                    className="w-full"
                    disabled={!newUser.name || !newUser.email || !newUser.company || !newUser.phone || !newUser.address || !newUser.password || !newUser.confirmPassword}
                  >
                    Crear Usuario
                  </Button>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal para editar usuario */}
      <Dialog.Root open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-[90%] md:w-full md:max-w-md">
            <div className="p-6">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Editar Usuario
              </Dialog.Title>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nombre Completo</Label>
                  <Input
                    id="edit-name"
                    value={editUser.name}
                    onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Correo Electrónico</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editUser.email}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  />
                </div>                

                <div className="space-y-2">
                  <Label htmlFor="edit-role">Perfil</Label>
                  <select
                    id="edit-role"
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value as 'seller' | 'admin' })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="seller">Vendedor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-company">Empresa</Label>
                  <select
                    id="edit-company"
                    value={editUser.company}
                    onChange={(e) => setEditUser({ ...editUser, company: e.target.value })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {activeCompanies.map((company) => (
                      <option key={company.id} value={company.name}>
                        {company.name}
                      </option>
                
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Teléfono</Label>
                  <Input
                    id="edit-phone"
                    value={editUser.phone}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-address">Dirección</Label>
                  <Input
                    id="edit-address"
                    value={editUser.address}
                    onChange={(e) => setEditUser({ ...editUser, address: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-birthDate">Fecha de Nacimiento</Label>
                  <Input
                    id="edit-birthDate"
                    type="date"
                    value={editUser.birthDate}
                    onChange={(e) => setEditUser({ ...editUser, birthDate: e.target.value })}
                  />
                </div>                

                {editUser.role === 'seller' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category">Categoría</Label>
                      <select
                        id="edit-category"
                        value={editUser.category}
                        onChange={(e) => setEditUser({ ...editUser, category: e.target.value as 'bronce' | 'plata' | 'oro' | 'diamante' })}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="bronce">Bronce</option>
                        <option value="plata">Plata</option>
                        <option value="oro">Oro</option>
                        <option value="diamante">Diamante</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-points">Puntos</Label>
                      <Input
                        id="edit-points"
                        type="number"
                        min="0"
                        value={editUser.points}
                        onChange={(e) => setEditUser({ ...editUser, points: e.target.value })}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <select
                    id="edit-status"
                    value={editUser.status}
                    onChange={(e) => setEditUser({ ...editUser, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
                
                <div className="pt-4 border-t flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditUserOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleEditUser}
                    disabled={!editUser.name || !editUser.email || !editUser.company || !editUser.phone || !editUser.address}
                  >
                    Guardar Cambios
                  </Button>
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de confirmación para eliminar usuario */}
      <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <AlertDialog.Title className="text-lg font-semibold text-gray-900">
              ¿Eliminar usuario?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-gray-500">
              Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.
            </AlertDialog.Description>
            <div className="mt-4 flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">
                  Cancelar
                </Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={handleDeleteUser}>
                  Eliminar
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* Modal para cambiar avatar */}
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
                    src={avatarPreview || selectedUser?.avatar}
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
      <Dialog.Root open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Cambiar Contraseña de Usuario
            </Dialog.Title>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-4">
                  Cambiando contraseña para: <span className="font-medium text-gray-900">{selectedUser?.name}</span>
                </p>
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
                    setIsChangePasswordOpen(false);
                    setPasswordData({
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleChangePassword}
                  disabled={!passwordData.newPassword || !passwordData.confirmPassword}
                >
                  Guardar Contraseña
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}