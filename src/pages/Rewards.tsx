import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DialogDescription } from '@radix-ui/react-dialog';
import { Gift, Star, Plus, Edit, Trash2, AlertCircle, ImageIcon } from 'lucide-react'; // Removed Filter, CalendarIcon, Upload
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
// Removed DateRange import
import { ExportButtons } from '@/components/ExportButtons';
// Import both formatters
import { formatRewardRequestsForExcel, formatRewardsForExcel } from '@/lib/export'; 

interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  stock: number;
  image: string;
  category: 'tecnología' | 'vales' | 'merchandising';
}

interface RewardRequest {
  id: string;
  userId: string;
  userName: string;
  userStore: string;
  rewardId: string;
  rewardName: string;
  points: number;
  stock: number; // Stock requested (usually 1)
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
}

const mockRewards: Reward[] = [
  {
    id: '1',
    name: 'iPad Pro 11"',
    description: 'iPad Pro 11" con chip M2, perfecto para trabajo y entretenimiento.',
    points: 5000,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=1200&h=800',
    category: 'tecnología'
  },
  {
    id: '2',
    name: 'Vale de Compra S/500',
    description: 'Vale de compra por S/500 para usar en tiendas seleccionadas.',
    points: 2000,
    stock: 10,
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200&h=800',
    category: 'vales'
  },
  {
    id: '3',
    name: 'Smartwatch Galaxy Watch 6',
    description: 'Smartwatch Samsung Galaxy Watch 6 con todas las funciones premium.',
    points: 3500,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=1200&h=800',
    category: 'tecnología'
  },
  {
    id: '4',
    name: 'Pack Merchandising Premium',
    description: 'Pack completo de merchandising Canon de alta calidad.',
    points: 1500,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=1200&h=800',
    category: 'merchandising'
  }
];

const mockRequests: RewardRequest[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Juan Pérez',
    userStore: 'Canon Store Central',
    rewardId: '1',
    rewardName: 'iPad Pro 11"',
    points: 5000,
    stock: 1,
    requestDate: '2024-03-15',
    status: 'pending'
  },
  {
    id: '2',
    userId: '2',
    userName: 'María García',
    userStore: 'Canon Store Norte',
    rewardId: '2',
    rewardName: 'Vale de Compra S/500',
    points: 2000,
    stock: 1,
    requestDate: '2024-03-14',
    status: 'approved'
  }
];

const categoryColors = {
  tecnología: 'bg-blue-100 text-blue-800',
  vales: 'bg-green-100 text-green-800',
  merchandising: 'bg-purple-100 text-purple-800'
};

const categoryNames = {
  tecnología: 'Tecnología',
  vales: 'Vales',
  merchandising: 'Merchandising'
};

export default function Rewards() {
  const user = useAuthStore((state) => state.user);
  const [rewards, setRewards] = useState<Reward[]>(mockRewards);
  const [requests, setRequests] = useState<RewardRequest[]>(mockRequests);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'tecnología' | 'vales' | 'merchandising'>('all');
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  // Removed date filter states
  const [isNewRewardOpen, setIsNewRewardOpen] = useState(false);
  const [isEditRewardOpen, setIsEditRewardOpen] = useState(false);
  const [isDeleteRewardOpen, setIsDeleteRewardOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<RewardRequest | null>(null);
  const [reviewData, setReviewData] = useState({
    status: 'approved' as 'approved' | 'rejected',
    comments: ''
  });

  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    points: '',
    stock: '',
    image: '',
    category: 'tecnología' as 'tecnología' | 'vales' | 'merchandising'
  });

  const handleRequestReward = (reward: Reward) => {
    if (!user) return;

    const request: RewardRequest = {
      id: (requests.length + 1).toString(),
      userId: user.id,
      userName: user.name,
      userStore: user.store || '',
      rewardId: reward.id,
      rewardName: reward.name,
      points: reward.points,
      stock: 1, // Assuming requesting 1 item
      requestDate: new Date().toISOString().split('T')[0],
      status: 'pending'
    };

    setRequests([request, ...requests]);
    setIsRequestDialogOpen(false);
    setSelectedReward(null);
  };

  const handleReviewRequest = () => {
    if (!selectedRequest) return;

    setRequests(requests.map(request => 
      request.id === selectedRequest.id
        ? {
            ...request,
            status: reviewData.status,
            comments: reviewData.comments
          }
        : request
    ));

    setIsReviewDialogOpen(false);
    setSelectedRequest(null);
    setReviewData({
      status: 'approved',
      comments: ''
    });
  };

  const handleAddReward = () => {
    if (!newReward.name || !newReward.description || !newReward.points || !newReward.stock || !newReward.image) {
      return;
    }

    const reward: Reward = {
      id: (rewards.length + 1).toString(),
      name: newReward.name,
      description: newReward.description,
      points: parseInt(newReward.points),
      stock: parseInt(newReward.stock),
      image: newReward.image,
      category: newReward.category
    };

    setRewards([...rewards, reward]);
    setIsNewRewardOpen(false);
    setNewReward({
      name: '',
      description: '',
      points: '',
      stock: '',
      image: '',
      category: 'tecnología'
    });
  };

  const handleEditReward = () => {
    if (!selectedReward || !newReward.name || !newReward.description || !newReward.points || !newReward.stock || !newReward.image) {
      return;
    }

    setRewards(rewards.map(reward => 
      reward.id === selectedReward.id
        ? {
            ...reward,
            name: newReward.name,
            description: newReward.description,
            points: parseInt(newReward.points),
            stock: parseInt(newReward.stock),
            image: newReward.image,
            category: newReward.category
          }
        : reward
    ));

    setIsEditRewardOpen(false);
    setSelectedReward(null);
  };

  const handleDeleteReward = () => {
    if (!selectedReward) return;
    
    setRewards(rewards.filter(reward => reward.id !== selectedReward.id));
    setIsDeleteRewardOpen(false);
    setSelectedReward(null);
  };

  const openRequestDialog = (reward: Reward) => {
    setSelectedReward(reward);
    setIsRequestDialogOpen(true);
  };

  const openReviewDialog = (request: RewardRequest) => {
    setSelectedRequest(request);
    setReviewData({
      status: 'approved',
      comments: ''
    });
    setIsReviewDialogOpen(true);
  };

  const openEditReward = (reward: Reward) => {
    setSelectedReward(reward);
    setNewReward({
      name: reward.name,
      description: reward.description,
      points: reward.points.toString(),
      stock: reward.stock.toString(),
      image: reward.image,
      category: reward.category
    });
    setIsEditRewardOpen(true);
  };

  const openDeleteReward = (reward: Reward) => {
    setSelectedReward(reward);
    setIsDeleteRewardOpen(true);
  };

  const filteredRewards = rewards.filter(reward =>
    selectedCategory === 'all' || reward.category === selectedCategory
  );

  // Removed handleFilterClick function
  // Removed dateFilteredRequests variable

  // Filter pending requests directly from all requests
  const pendingRequests = requests.filter(request => request.status === 'pending'); 

  if (user?.role === 'seller') {
    // --- Seller View ---
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Premios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Canjea tus puntos por increíbles premios
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            Todos
          </Button>
          <Button
            variant={selectedCategory === 'tecnología' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('tecnología')}
          >
            Tecnología
          </Button>
          <Button
            variant={selectedCategory === 'vales' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('vales')}
          >
            Vales
          </Button>
          <Button
            variant={selectedCategory === 'merchandising' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('merchandising')}
          >
            Merchandising
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={reward.image}
                  alt={reward.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{reward.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[reward.category]}`}>
                        {categoryNames[reward.category]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {reward.points} pts
                      </span>
                      <span className="text-sm">Stock: {reward.stock}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                <Button
                  onClick={() => openRequestDialog(reward)}
                  className="w-full"
                  disabled={reward.stock === 0 || (user?.points || 0) < reward.points}
                >
                  {reward.stock === 0 ? 'Sin Stock' :
                   (user?.points || 0) < reward.points ? 'Puntos Insuficientes' :
                   'Canjear Premio'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Historial de solicitudes (Seller view) */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Solicitudes</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 responsive-table">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Premio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Puntos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests
                  .filter(request => request.userId === user.id)
                  .map((request) => (
                    <tr key={request.id} >
                      <td className="px-6 py-4 whitespace-nowrap" data-label="Premio">
                        <div className="text-sm font-medium text-gray-900">
                          {request.rewardName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-label="Fecha">
                        {new Date(request.requestDate).toLocaleDateString('es-ES')}
                      </td>  
                      <td className="px-6 py-4 whitespace-nowrap" data-label="Estado">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status === 'approved' ? 'Aprobado' :
                           request.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </span>
                        {request.comments && (
                          <p className="mt-1 text-sm text-gray-500">{request.comments}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right" data-label="Puntos">
                        <div className="text-sm font-medium text-primary">
                          {request.points} pts
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de confirmación de canje */}
        <Dialog.Root open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Confirmar Canje de Premio
              </Dialog.Title>
              <DialogDescription className="text-sm text-gray-500 mb-4">
                Confirma el canje del premio seleccionado. Revisa los puntos disponibles y los requeridos para realizar la operación.
              </DialogDescription>
              {selectedReward && (
                <div className="space-y-4">
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={selectedReward.image}
                      alt={selectedReward.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedReward.name}</h3>
                    <p className="text-sm text-gray-500">{selectedReward.description}</p>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">Tus puntos actuales:</span>
                      <span className="font-semibold text-gray-900">{user.points} pts</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-500">Puntos requeridos:</span>
                      <span className="font-semibold text-primary">{selectedReward.points} pts</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Puntos restantes:</span>
                      <span className="font-semibold text-gray-900">
                        {(user.points || 0) - selectedReward.points} pts
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsRequestDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => handleRequestReward(selectedReward)}
                      disabled={(user?.points || 0) < selectedReward.points}
                    >
                      Confirmar Canje
                    </Button>
                  </div>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );
  }

  // --- Admin View ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Premios</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los premios y solicitudes de canje
          </p>
        </div>
        <div className="flex gap-2">
          {/* ExportButtons removed from here */}
          <Button onClick={() => setIsNewRewardOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Premio
          </Button>
        </div>
      </div>

      {/* Catálogo de Premios */}
      <div className="space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-4"> {/* Wrap title and buttons */}
          <h2 className="text-xl font-semibold text-gray-900">Catálogo de Premios</h2>
          {/* Moved ExportButtons here */}
          <ExportButtons
            data={filteredRewards} // Export rewards filtered by category
            recordsFilename="catalogo-premios" // Updated filename
            formatForExcel={formatRewardsForExcel} // Use the new formatter
            // dateRange prop is removed as it's not needed
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
          >
            Todos
          </Button>
          <Button
            variant={selectedCategory === 'tecnología' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('tecnología')}
          >
            Tecnología
          </Button>
          <Button
            variant={selectedCategory === 'vales' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('vales')}
          >
            Vales
          </Button>
          <Button
            variant={selectedCategory === 'merchandising' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('merchandising')}
          >
            Merchandising
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => (
            <div key={reward.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video relative">
                <img
                  src={reward.image}
                  alt={reward.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{reward.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[reward.category]}`}>
                        {categoryNames[reward.category]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-white">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {reward.points} pts
                      </span>
                      <span className="text-sm">Stock: {reward.stock}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditReward(reward)}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openDeleteReward(reward)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Solicitudes Pendientes */}
      <div className="space-y-4">
        {/* Removed filter controls from here */}
        <h2 className="text-xl font-semibold text-gray-900">Solicitudes Pendientes</h2>
        
        {/* Table for Pending Requests (uses pendingRequests) */}
        <table className="bg-white rounded-lg shadow-sm overflow-hidden min-w-full divide-y divide-gray-200 responsive-table">
            {/* ... thead and tbody for pending requests ... */}
            <thead className="bg-gray-50">
              <tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premio</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado</th><th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones</th><th scope="col" className="relative py-3 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Map over pendingRequests */}
              {pendingRequests.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">No hay solicitudes pendientes.</td></tr>
              ) : (
                pendingRequests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap" data-label="Vendedor">
                        <div className="text-sm font-medium text-gray-900">
                          {request.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.userStore}
                        </div>
                      </td> 
                      <td className="px-6 py-4 whitespace-nowrap" data-label="Premio">
                        <div className="text-sm font-medium text-gray-900">
                          {request.rewardName}
                        </div>
                        <div className="text-sm text-primary">
                          {request.points} pts
                        </div>
                      </td>   
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.requestDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status === 'approved' ? 'Aprobado' :
                           request.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </span>
                        {request.comments && (
                          <p className="mt-1 text-sm text-gray-500">{request.comments}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openReviewDialog(request)}
                          className="flex items-center gap-2"
                        >
                          Revisar
                        </Button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
        </table>
      </div>

      {/* Historial de Solicitudes */}
      <div className="space-y-4 pt-8"> {/* Added padding-top */}
        <h2 className="text-xl font-semibold text-gray-900">Historial de Solicitudes</h2>
        {/* Removed filter controls and export buttons from here */}

        {/* Table for History (uses all requests) */}
        <table className="bg-white rounded-lg shadow-sm overflow-hidden min-w-full divide-y divide-gray-200 responsive-table">
            <thead className="bg-gray-50">
              <tr><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Premio</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado</th><th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comentarios</th> {/* Added Comments column */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Map over all requests */}
              {requests.length === 0 ? (
                 <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">No hay solicitudes en el historial.</td></tr>
              ) : (
                requests.map((request) => (
                    <tr key={request.id}>
                      <td className="px-6 py-4 whitespace-nowrap" data-label="Vendedor">
                        <div className="text-sm font-medium text-gray-900">
                          {request.userName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.userStore}
                        </div>
                      </td> 
                      <td className="px-6 py-4 whitespace-nowrap" data-label="Premio">
                        <div className="text-sm font-medium text-gray-900">
                          {request.rewardName}
                        </div>
                        <div className="text-sm text-primary">
                          {request.points} pts
                        </div>
                      </td>   
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.requestDate).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status === 'approved' ? 'Aprobado' :
                           request.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </span>
                      </td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" data-label="Comentarios">
                        {request.comments || '-'} {/* Display comments or dash */}
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
        </table>
      </div>


      {/* Modal para nuevo premio */}
      <Dialog.Root open={isNewRewardOpen} onOpenChange={setIsNewRewardOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Nuevo Premio
            </Dialog.Title>
            <DialogDescription className="text-sm text-gray-500 mb-4">
              Ingresa los datos del nuevo premio para agregarlo al catálogo.
            </DialogDescription>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Premio</Label>
                <Input
                  id="name"
                  value={newReward.name}
                  onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                  placeholder="Ej: iPad Pro 11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input className="w-full"
                  id="description"
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  placeholder="Describe el premio..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="points">Puntos</Label>
                  <Input className="w-full"
                    id="points"
                    type="number"
                    value={newReward.points}
                    onChange={(e) => setNewReward({ ...newReward, points: e.target.value })}
                    placeholder="Ej: 5000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input className="w-full"
                    id="stock"
                    type="number"
                    value={newReward.stock}
                    onChange={(e) => setNewReward({ ...newReward, stock: e.target.value })}
                    placeholder="Ej: 10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  value={newReward.category}
                  onChange={(e) => setNewReward({ ...newReward, category: e.target.value as 'tecnología' | 'vales' | 'merchandising' })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-full"
                >
                  <option value="tecnología">Tecnología</option>
                  <option value="vales">Vales</option>
                  <option value="merchandising">Merchandising</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">URL de la Imagen</Label>
                <Input className="w-full"
                  id="image"
                  value={newReward.image}
                  onChange={(e) => setNewReward({ ...newReward, image: e.target.value })}
                  placeholder="https://..."
                />
                <p className="text-xs text-gray-500">
                  Ingresa la URL de una imagen para el premio
                </p>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button className="w-full"
                  variant="outline"
                  onClick={() => setIsNewRewardOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddReward}
                  disabled={!newReward.name || !newReward.description || !newReward.points || !newReward.stock || !newReward.image}
                >
                  Crear Premio
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal para editar premio */}
      <Dialog.Root open={isEditRewardOpen} onOpenChange={setIsEditRewardOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md space-y-4">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Editar Premio
            </Dialog.Title>
            <DialogDescription className="text-sm text-gray-500 mb-4">
              Edita los datos del premio seleccionado para actualizar el catálogo.
            </DialogDescription>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nombre del Premio</Label>
                <Input
                className="w-full" id="edit-name"
                  value={newReward.name}
                  onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Input className="w-full"
                  id="edit-description"
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-points">Puntos</Label>
                  <Input
                  className="w-full"  id="edit-points"
                    type="number"
                    value={newReward.points}
                    onChange={(e) => setNewReward({ ...newReward, points: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-stock">Stock</Label>
                  <Input
                className="w-full"    id="edit-stock"
                    type="number"
                    value={newReward.stock}
                    onChange={(e) => setNewReward({ ...newReward, stock: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoría</Label>
                <select
                  id="edit-category"
                  value={newReward.category}
                  onChange={(e) => setNewReward({ ...newReward, category: e.target.value as 'tecnología' | 'vales' | 'merchandising' })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring w-full"
                >
                  <option value="tecnología">Tecnología</option>
                  <option value="vales">Vales</option>
                  <option value="merchandising">Merchandising</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-image">URL de la Imagen</Label>
                <Input className="w-full"
                  id="edit-image"
                  value={newReward.image}
                  onChange={(e) => setNewReward({ ...newReward, image: e.target.value })}
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button className="w-full"
                  variant="outline"
                  onClick={() => setIsEditRewardOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditReward}
                  disabled={!newReward.name || !newReward.description || !newReward.points || !newReward.stock || !newReward.image}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog.Root open={isDeleteRewardOpen} onOpenChange={setIsDeleteRewardOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <AlertDialog.Title className="text-lg font-semibold mb-4 w-full">
              Confirmar Eliminación
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-500 mb-4 w-full">
              ¿Estás seguro que deseas eliminar el premio "{selectedReward?.name}"? Esta acción no se puede deshacer.
            </AlertDialog.Description>
            <div className="flex justify-end gap-2 w-full">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">Cancelar</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={handleDeleteReward}>
                  Eliminar
                </Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      {/* Modal de revisión */}
      <Dialog.Root open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Revisar Solicitud de Premio
            </Dialog.Title>
             <DialogDescription className="text-sm text-gray-500 mb-4">
              Revisa la solicitud de premio seleccionada y decide si la apruebas o la rechazas.
            </DialogDescription>
            {selectedRequest && (
              <div className="space-y-4">
                <div>
                  <Label>Vendedor</Label>
                  <p className="text-sm text-gray-900">{selectedRequest.userName}</p>
                  <p className="text-sm text-gray-500">{selectedRequest.userStore}</p>
                </div>

                <div>
                  <Label>Premio</Label>
                  <p className="text-sm text-gray-900">{selectedRequest.rewardName}</p>
                  <p className="text-sm text-primary">{selectedRequest.points} pts</p>
                </div>

                <div>
                  <Label>Fecha de Solicitud</Label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedRequest.requestDate).toLocaleDateString('es-ES')}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comments">Comentarios</Label>
                  <Input
                    id="comments"
                    value={reviewData.comments}
                    onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                    placeholder="Agregar comentarios..."
                  />
                </div>

                <div className="pt-4 border-t flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReviewData({ ...reviewData, status: 'rejected' });
                      handleReviewRequest();
                    }}
                    className="flex items-center gap-2"
                  >
                    Rechazar
                  </Button>
                  <Button
                    onClick={() => {
                      setReviewData({ ...reviewData, status: 'approved' });
                      handleReviewRequest();
                    }}
                    className="flex items-center gap-2"
                  >
                    Aprobar
                  </Button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
