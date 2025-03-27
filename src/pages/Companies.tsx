import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Plus, Search, Edit, Trash2, AlertCircle, Calendar, MapPin } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { companies as mockCompanies } from '@/lib/mockData';

interface Company {
  id: string;
  ruc: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  city: string;
  anniversaryDate: string;
}

export default function Companies() {
  const user = useAuthStore((state) => state.user);
  const [companies, setCompanies] = useState<Company[]>(mockCompanies.map(company => ({
    ...company,
    city: 'Lima',
    anniversaryDate: '2020-01-01'
  })));
  const [isNewCompanyOpen, setIsNewCompanyOpen] = useState(false);
  const [isEditCompanyOpen, setIsEditCompanyOpen] = useState(false);
  const [isDeleteCompanyOpen, setIsDeleteCompanyOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCompany, setNewCompany] = useState({
    ruc: '',
    name: '',
    city: '',
    anniversaryDate: ''
  });
  const [editCompany, setEditCompany] = useState({
    ruc: '',
    name: '',
    status: 'active' as 'active' | 'inactive',
    city: '',
    anniversaryDate: ''
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

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.ruc.includes(searchTerm)
  );

  const handleNewCompany = () => {
    if (!newCompany.ruc || !newCompany.name || !newCompany.city || !newCompany.anniversaryDate) {
      return;
    }

    const company: Company = {
      id: (companies.length + 1).toString(),
      ruc: newCompany.ruc,
      name: newCompany.name,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      city: newCompany.city,
      anniversaryDate: newCompany.anniversaryDate
    };

    setCompanies([...companies, company]);
    setIsNewCompanyOpen(false);
    setNewCompany({
      ruc: '',
      name: '',
      city: '',
      anniversaryDate: ''
    });
  };

  const handleEditCompany = () => {
    if (!selectedCompany || !editCompany.ruc || !editCompany.name || !editCompany.city || !editCompany.anniversaryDate) {
      return;
    }

    setCompanies(companies.map(company =>
      company.id === selectedCompany.id
        ? {
            ...company,
            ruc: editCompany.ruc,
            name: editCompany.name,
            status: editCompany.status,
            city: editCompany.city,
            anniversaryDate: editCompany.anniversaryDate
          }
        : company
    ));

    setIsEditCompanyOpen(false);
    setSelectedCompany(null);
  };

  const openEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setEditCompany({
      ruc: company.ruc,
      name: company.name,
      status: company.status,
      city: company.city,
      anniversaryDate: company.anniversaryDate
    });
    setIsEditCompanyOpen(true);
  };

  const openDeleteCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteCompanyOpen(true);
  };

  const handleDeleteCompany = () => {
    if (!selectedCompany) return;
    
    setCompanies(companies.filter(company => company.id !== selectedCompany.id));
    setIsDeleteCompanyOpen(false);
    setSelectedCompany(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Empresas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra las empresas registradas en el sistema
          </p>
        </div>
        <Button onClick={() => setIsNewCompanyOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Empresa
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar por RUC o razón social..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RUC
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Razón Social
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ciudad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aniversario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha de Registro
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCompanies.map((company) => (
              <tr key={company.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {company.ruc}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {company.city}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {new Date(company.anniversaryDate).toLocaleDateString('es-ES')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    company.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {company.status === 'active' ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(company.createdAt).toLocaleDateString('es-ES')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openEditCompany(company)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openDeleteCompany(company)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para nueva empresa */}
      <Dialog.Root open={isNewCompanyOpen} onOpenChange={setIsNewCompanyOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Nueva Empresa
            </Dialog.Title>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ruc">RUC</Label>
                <Input
                  id="ruc"
                  value={newCompany.ruc}
                  onChange={(e) => setNewCompany({ ...newCompany, ruc: e.target.value })}
                  placeholder="Ej: 20123456789"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Razón Social</Label>
                <Input
                  id="name"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  placeholder="Ej: Canon Store Central S.A.C"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={newCompany.city}
                  onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                  placeholder="Ej: Lima"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anniversaryDate">Fecha de Aniversario</Label>
                <Input
                  id="anniversaryDate"
                  type="date"
                  value={newCompany.anniversaryDate}
                  onChange={(e) => setNewCompany({ ...newCompany, anniversaryDate: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewCompanyOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleNewCompany}
                  disabled={!newCompany.ruc || !newCompany.name || !newCompany.city || !newCompany.anniversaryDate}
                >
                  Crear Empresa
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal para editar empresa */}
      <Dialog.Root open={isEditCompanyOpen} onOpenChange={setIsEditCompanyOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Editar Empresa
            </Dialog.Title>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-ruc">RUC</Label>
                <Input
                  id="edit-ruc"
                  value={editCompany.ruc}
                  onChange={(e) => setEditCompany({ ...editCompany, ruc: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Razón Social</Label>
                <Input
                  id="edit-name"
                  value={editCompany.name}
                  onChange={(e) => setEditCompany({ ...editCompany, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-city">Ciudad</Label>
                <Input
                  id="edit-city"
                  value={editCompany.city}
                  onChange={(e) => setEditCompany({ ...editCompany, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-anniversaryDate">Fecha de Aniversario</Label>
                <Input
                  id="edit-anniversaryDate"
                  type="date"
                  value={editCompany.anniversaryDate}
                  onChange={(e) => setEditCompany({ ...editCompany, anniversaryDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-status">Estado</Label>
                <select
                  id="edit-status"
                  value={editCompany.status}
                  onChange={(e) => setEditCompany({ ...editCompany, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="active">Activa</option>
                  <option value="inactive">Inactiva</option>
                </select>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditCompanyOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditCompany}
                  disabled={!editCompany.ruc || !editCompany.name || !editCompany.city || !editCompany.anniversaryDate}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog.Root open={isDeleteCompanyOpen} onOpenChange={setIsDeleteCompanyOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <AlertDialog.Title className="text-lg font-semibold mb-4">
              Confirmar Eliminación
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-500 mb-4">
              ¿Estás seguro que deseas eliminar la empresa "{selectedCompany?.name}"? Esta acción no se puede deshacer.
            </AlertDialog.Description>
            <div className="flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">Cancelar</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={handleDeleteCompany}>
                  Eliminar
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}