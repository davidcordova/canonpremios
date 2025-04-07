import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Trophy,
  Star,
  Plus,
  Filter,
  Edit, // Add Edit icon
  Trash2, // Add Trash icon
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog'; // Keep for delete confirmation
import { DateRange } from 'react-day-picker';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { ExportButtons } from '@/components/ExportButtons';
import { formatWinnersForExcel } from '@/lib/export';
import { getWinners, sellers, rewards } from '@/lib/mockData'; // Import sellers and rewards
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import '../components/responsive-table.css'; // Import responsive table CSS

// Keep local Winner interface definition
interface Winner {
  id: string;
  name: string;
  avatar: string;
  store: string;
  photo: string;
  reward: {
    name: string;
    points: number;
    date: string;
  };
  review: string;
}

export default function Winners() {
  const user = useAuthStore((state) => state.user);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [showHistory, setShowHistory] = useState(false); // State for history toggle

  // Date filter state for export
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>();
  const [isNewWinnerOpen, setIsNewWinnerOpen] = useState(false); // Control modal visibility
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [selectedRewardName, setSelectedRewardName] = useState<string>(''); // State for selected reward
  const [winnerComments, setWinnerComments] = useState<string>(''); // State for comments
  const [winnerPhotoFile, setWinnerPhotoFile] = useState<File | null>(null);
  const [isEditWinnerOpen, setIsEditWinnerOpen] = useState(false); // State for edit modal
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // State for delete confirm
  const [winnerToModify, setWinnerToModify] = useState<Winner | null>(null); // State for winner being edited/deleted
  // State for Edit Form
  const [editSellerId, setEditSellerId] = useState<string>(''); // Add state for seller ID in edit form
  const [editRewardName, setEditRewardName] = useState<string>('');
  const [editComments, setEditComments] = useState<string>('');
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);


  const selectedSeller = sellers.find(s => s.id === selectedSellerId);
  const selectedReward = rewards.find(r => r.name === selectedRewardName);

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const fetchedWinners = await getWinners(); 
        setWinners(fetchedWinners);
      } catch (error) {
        console.error("Error fetching winners:", error);
      }
    };
    fetchWinners();
  }, []); 

  // --- Filtering Logic ---

  // 1. Filter for Export (based on date range picker)
  const filteredWinnersForExport = winners.filter(winner => {
    if (!appliedDateRange?.from || !appliedDateRange?.to) {
      return true; // No filter applied yet or incomplete range
    }
    const winnerDate = new Date(winner.reward.date);
    // Compare directly with the range, handleFilterClick already sets 'to' date to end of day
    return winnerDate >= appliedDateRange.from && winnerDate <= appliedDateRange.to;
  });

  // 2. Filter for Display (Current Month vs. History)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthWinners = winners.filter(winner => {
    const winnerDate = new Date(winner.reward.date);
    return winnerDate.getMonth() === currentMonth && winnerDate.getFullYear() === currentYear;
  });

  const historicalWinners = winners.filter(winner => {
    const winnerDate = new Date(winner.reward.date);
    return winnerDate.getFullYear() < currentYear || (winnerDate.getFullYear() === currentYear && winnerDate.getMonth() < currentMonth);
  });
  
  // Group historical winners by month/year
  const groupedHistoricalWinners = historicalWinners.reduce((acc, winner) => {
    const winnerDate = new Date(winner.reward.date);
    // Use a consistent format like 'yyyy-MM' for reliable sorting
    const monthYearKey = format(winnerDate, 'yyyy-MM'); 
    if (!acc[monthYearKey]) {
      acc[monthYearKey] = {
        display: format(winnerDate, 'MMMM yyyy', { locale: es }), // For display
        winners: []
      };
    }
    acc[monthYearKey].winners.push(winner);
    return acc;
  }, {} as Record<string, { display: string; winners: Winner[] }>);

  // Sort the grouped historical winners by key (yyyy-MM) descending
  const sortedHistoricalGroups = Object.entries(groupedHistoricalWinners)
    .sort(([keyA], [keyB]) => keyB.localeCompare(keyA)); 


  // --- Event Handlers ---
  const handleFilterClick = () => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from <= to) {
        to.setHours(23, 59, 59, 999);
        setAppliedDateRange({ from, to });
      } else {
        console.error("Invalid date range selected");
        setAppliedDateRange(undefined);
      }
    } else {
      setAppliedDateRange(undefined);
    }
  };

  // --- Handlers for Edit/Delete ---
  const handleOpenEdit = (winner: Winner) => {
    // Find the original seller ID based on name/store (assuming name+store is unique for mock data)
    const originalSeller = sellers.find(s => s.name === winner.name && s.store === winner.store);
    setWinnerToModify(winner);
    // Pre-fill edit form state
    setEditSellerId(originalSeller?.id || ''); // Set the seller ID
    setEditRewardName(winner.reward.name);
    setEditComments(winner.review);
    setEditPhotoPreview(winner.photo); // Show current photo initially
    setEditPhotoFile(null); // Clear any previously selected file
    setIsEditWinnerOpen(true);
  };

  const handleOpenDeleteConfirm = (winner: Winner) => {
    setWinnerToModify(winner);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteWinner = () => {
    if (!winnerToModify) return;
    // TODO: Implement actual delete logic (e.g., API call)
    setWinners(winners.filter(w => w.id !== winnerToModify.id));
    setIsDeleteConfirmOpen(false);
    setWinnerToModify(null);
  };

  const handleEditWinner = () => {
    if (!winnerToModify || !editSellerId) return; // Ensure seller is selected

    const newSeller = sellers.find(s => s.id === editSellerId);
    if (!newSeller) {
      alert("Vendedor seleccionado no válido.");
      return;
    }

    const updatedWinner: Winner = {
      ...winnerToModify,
      // Update seller details based on editSellerId
      name: newSeller.name,
      avatar: newSeller.avatar || '',
      store: newSeller.store,
      reward: {
        ...winnerToModify.reward, // Keep original date unless changed
        name: editRewardName,
        // Find points for the selected reward name
        points: rewards.find(r => r.name === editRewardName)?.points || winnerToModify.reward.points,
      },
      review: editComments,
      // Use new photo if uploaded, otherwise keep the old one
      photo: editPhotoFile ? URL.createObjectURL(editPhotoFile) : winnerToModify.photo,
    };

    // TODO: Implement actual update logic (e.g., API call)
    setWinners(winners.map(w => w.id === updatedWinner.id ? updatedWinner : w));

    setIsEditWinnerOpen(false);
    setWinnerToModify(null);
    // Reset edit form state
    setEditSellerId(''); // Reset seller ID
    setEditRewardName('');
    setEditComments('');
    setEditPhotoFile(null);
    setEditPhotoPreview(null);
  };

   const handleEditPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhotoPreview(reader.result as string); // Update preview with new photo
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Render ---
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4"> {/* Allow wrapping */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Galería de Premios Entregados
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Conoce los premios que han canjeado tus compañeros
          </p>
        </div>
        {/* Admin Filter/Export Section */}
        {user?.role === 'admin' && (
          <div className="flex items-end gap-2 flex-wrap"> {/* Allow wrapping */}
            <div className="grid gap-1.5">
              <Label htmlFor="fromDate">Desde (Exportar)</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="toDate">Hasta (Exportar)</Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <Button onClick={handleFilterClick} disabled={!fromDate || !toDate}>
              <Filter className="mr-2 h-4 w-4" />
              Aplicar Filtro (Exportar)
            </Button>
            <ExportButtons
              data={filteredWinnersForExport} // Use date-filtered data for export
              recordsFilename="ganadores"
              formatForExcel={formatWinnersForExcel}
              dateRange={appliedDateRange} // Pass applied range to formatter
            />
             {/* Add Winner Modal */}
             <Dialog.Root open={isNewWinnerOpen} onOpenChange={setIsNewWinnerOpen}>
              <Dialog.Trigger asChild>
                <Button className="flex items-center gap-2" onClick={() => setIsNewWinnerOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Nuevo Ganador
                </Button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/50" />
                <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none">
                  <Dialog.Title className="mb-4 text-xl font-medium">
                    Registrar Nuevo Ganador
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-500 mb-4"> {/* Reduced bottom margin */}
                    Selecciona el vendedor y sube la foto del premio entregado.
                  </Dialog.Description>
                  {/* Scrollable Form Area */}
                  <div className="overflow-y-auto pr-2 max-h-[calc(85vh-200px)]"> {/* Add scroll, padding-right for scrollbar, and max-height calculation */}
                    {/* Responsive Form Grid */}
                    <div className="grid grid-cols-1 gap-4">
                      {/* Seller Selection */}
                      <div className="space-y-2">
                        <Label htmlFor="sellerSelect">Vendedor Ganador</Label>
                      <select
                        id="sellerSelect"
                        value={selectedSellerId}
                        onChange={(e) => setSelectedSellerId(e.target.value)}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">-- Seleccionar Vendedor --</option>
                        {sellers.map((seller) => (
                          <option key={seller.id} value={seller.id}>
                            {seller.name} ({seller.store})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Display Selected Seller Info (Read-only) */}
                    {selectedSeller && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-md border bg-gray-50 p-4">
                         <div className="space-y-1">
                           <Label className="text-xs text-gray-500">Nombre</Label>
                           <p className="text-sm">{selectedSeller.name}</p>
                         </div>
                         <div className="space-y-1">
                           <Label className="text-xs text-gray-500">Tienda</Label>
                           <p className="text-sm">{selectedSeller.store}</p>
                         </div>
                         {/* Add other relevant fields if needed */}
                      </div>
                    )}

                    {/* Reward Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="rewardSelect">Premio Reclamado</Label>
                      <select
                        id="rewardSelect"
                        value={selectedRewardName}
                        onChange={(e) => setSelectedRewardName(e.target.value)}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">-- Seleccionar Premio --</option>
                        {rewards.map((reward) => (
                          <option key={reward.name} value={reward.name}>
                            {reward.name} ({reward.points} pts)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Photo Upload */}
                    <div className="space-y-2">
                      <Label htmlFor="winnerPhoto">Foto del Ganador con Premio</Label>
                      <Input
                        id="winnerPhoto"
                        type="file"
                        accept="image/*"
                        onChange={(e) => setWinnerPhotoFile(e.target.files?.[0] || null)}
                      />
                       {winnerPhotoFile && (
                         <p className="text-xs text-gray-500">
                           Archivo: {winnerPhotoFile.name}
                         </p>
                       )}
                    </div>

                    {/* Comments */}
                    <div className="space-y-2">
                      <Label htmlFor="winnerComments">Comentarios / Reseña</Label>
                      <Textarea
                        id="winnerComments"
                        value={winnerComments}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setWinnerComments(e.target.value)}
                        placeholder="Añade un comentario o reseña sobre la entrega del premio..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div> {/* End Responsive Form Grid */}
                </div> {/* End Scrollable Form Area */}

                  {/* Modal Actions - Adjusted margin-top */}
                  <div className="mt-6 flex flex-col sm:flex-row w-full items-center justify-end gap-2 border-t pt-4"> {/* Add border and padding */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsNewWinnerOpen(false);
                        setSelectedSellerId('');
                        setSelectedRewardName('');
                        setWinnerComments('');
                        setWinnerPhotoFile(null);
                      }}
                      className="w-full sm:w-auto"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      onClick={() => {
                        // TODO: Implement actual save logic (upload photo, create winner object)
                        if (selectedSeller && selectedReward && winnerPhotoFile) {
                          console.log("Saving Winner:", selectedSeller.name, selectedReward.name, winnerPhotoFile.name, winnerComments);
                          // Simulate adding to state (replace with actual logic)
                           const newWinnerEntry: Winner = {
                             id: `w-${Date.now()}`, // Temporary ID
                             name: selectedSeller.name,
                             avatar: selectedSeller.avatar || '',
                             store: selectedSeller.store,
                             photo: URL.createObjectURL(winnerPhotoFile), // Use object URL for preview
                             reward: {
                               name: selectedReward.name,
                               points: selectedReward.points,
                               date: new Date().toISOString().split('T')[0],
                             },
                             review: winnerComments || `¡Felicidades a ${selectedSeller.name}!`, // Use comment or default
                           };
                           setWinners(prev => [newWinnerEntry, ...prev]);
                           setIsNewWinnerOpen(false);
                           setSelectedSellerId('');
                           setSelectedRewardName('');
                           setWinnerComments('');
                           setWinnerPhotoFile(null);
                        } else {
                          alert("Por favor selecciona un vendedor, un premio y sube una foto.");
                        }
                      }}
                      disabled={!selectedSellerId || !selectedRewardName || !winnerPhotoFile} // Update disabled check
                      className="w-full sm:w-auto"
                    >
                      Guardar Ganador
                    </Button>
                  </div>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </div>
        )}
      </div>

      {/* Current Month Winners Section */}
      <div className="space-y-4">
         <h2 className="text-xl font-semibold text-gray-900 capitalize"> {/* Capitalize month */}
           Ganadores de {format(now, 'MMMM yyyy', { locale: es })}
         </h2>
        {currentMonthWinners.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay ganadores registrados este mes.</p>
          </div>
        ) : (
          // Use a grid layout for current month winners
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMonthWinners.map((winner) => (
              <div key={winner.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="relative aspect-[4/3]"> {/* Aspect ratio for image */}
                  <img
                    src={winner.photo}
                    alt={`${winner.name} recibiendo ${winner.reward.name}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div> {/* Gradient overlay */}
                   <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                     <div className="flex items-center gap-3 mb-2">
                       <img
                         src={winner.avatar}
                         alt={winner.name}
                         className="h-10 w-10 rounded-full border-2 border-white"
                       />
                       <div>
                         <h3 className="font-semibold">{winner.name}</h3>
                         <p className="text-sm opacity-90">{winner.store}</p>
                       </div>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-lg font-semibold">
                         {winner.reward.name}
                       </span>
                       <span className="flex items-center gap-1 text-sm">
                         <Star className="h-4 w-4" />
                         {winner.reward.points} pts
                       </span>
                     </div>
                   </div>
                </div>
                 <div className="p-4 space-y-2"> {/* Added space-y-2 */}
                   <p className="text-sm text-gray-600 italic">"{winner.review}"</p>
                   <div className="flex justify-between items-center"> {/* Container for date and buttons */}
                     <p className="text-xs text-gray-400">
                       {format(new Date(winner.reward.date), 'dd MMM yyyy', { locale: es })}
                     </p>
                     {/* Admin Edit/Delete Buttons for Grid */}
                     {user?.role === 'admin' && (
                       <div className="flex gap-1">
                         <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleOpenEdit(winner)}>
                           <Edit className="h-4 w-4" />
                         </Button>
                         <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600 hover:text-red-700" onClick={() => handleOpenDeleteConfirm(winner)}>
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </div>
                     )}
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical Winners Section */}
      <div className="space-y-4 pt-8">
         <div className="flex justify-between items-center">
           <h2 className="text-xl font-semibold text-gray-900">Historial de Ganadores</h2>
           <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
             {showHistory ? 'Ocultar Historial' : 'Ver Historial'}
           </Button>
         </div>

        {showHistory && (
          historicalWinners.length === 0 ? (
             <div className="bg-gray-50 rounded-lg p-8 text-center">
               <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
               <p className="text-gray-600">No hay ganadores en el historial.</p>
             </div>
           ) : (
             <div className="space-y-6">
              {/* Use sortedHistoricalGroups */}
              {sortedHistoricalGroups.map(([key, groupData]) => ( 
                <div key={key}>
                  <h3 className="text-lg font-medium text-gray-700 mb-2 capitalize">{groupData.display}</h3>
                  <div className="responsive-table overflow-x-auto">
                     <table className="min-w-full">
                       <thead> {/* Keep thead for structure, hide visually if needed */}
                         <tr className="border-b">
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ganador</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tienda</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Premio</th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntos</th>
                           {user?.role === 'admin' && (
                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                           )}
                         </tr>
                       </thead>
                       <tbody className="bg-white divide-y divide-gray-200">
                         {/* Map over groupData.winners */}
                         {groupData.winners.map((winner) => ( 
                           <tr key={winner.id} className="border-b last:border-b-0">
                             <td className="px-6 py-4 whitespace-nowrap align-top" data-label="Ganador">
                               <div className="relative w-[300px] h-[200px]">
                                 <img
                                   src={winner.photo}
                                   alt={`${winner.name} recibiendo ${winner.reward.name}`}
                                   className="w-full h-full object-cover"
                                 />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0">
                                   <div className="absolute bottom-4 left-4 right-4">
                                     <div className="flex items-center gap-3 mb-2">
                                       <img
                                         src={winner.avatar}
                                         alt={winner.name}
                                         className="h-12 w-12 rounded-full border-2 border-white"
                                       />
                                       <div className="text-white">
                                         <h3 className="font-semibold">{winner.name}</h3>
                                         <p className="text-sm opacity-90">{winner.store}</p>
                                       </div>
                                     </div>
                                     <div className="flex items-center justify-between text-white">
                                       <span className="text-lg font-semibold">
                                         {winner.reward.name}
                                       </span>
                                       <span className="flex items-center gap-1"></span>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap align-top" data-label="Tienda">
                               {winner.store}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap align-top" data-label="Premio">
                               {winner.reward.name}
                               <div className="text-xs text-gray-500 mt-1">
                                 {format(new Date(winner.reward.date), 'dd MMM yyyy', { locale: es })}
                               </div>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap align-top" data-label="Puntos">
                               <span className="flex items-center gap-1">
                                 <Star className="h-4 w-4" />
                                 {winner.reward.points} pts
                               </span>
                             </td>
                             {/* Admin Actions Column for Table */}
                             {user?.role === 'admin' && (
                               <td className="px-6 py-4 whitespace-nowrap text-right">
                                 <div className="flex justify-end gap-1">
                                   <Button variant="outline" size="sm" className="h-8" onClick={() => handleOpenEdit(winner)}>
                                     <Edit className="h-4 w-4" />
                                   </Button>
                                   <Button variant="outline" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleOpenDeleteConfirm(winner)}>
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                                 </div>
                               </td>
                             )}
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 </div>
               ))}
             </div>
           )
        )}
      </div>

      {/* Edit Winner Modal */}
      <Dialog.Root open={isEditWinnerOpen} onOpenChange={setIsEditWinnerOpen}>
        <Dialog.Portal>
           <Dialog.Overlay className="fixed inset-0 bg-black/50" />
           <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none">
             <Dialog.Title className="mb-4 text-xl font-medium">
               Editar Ganador
             </Dialog.Title>
             <Dialog.Description className="text-sm text-gray-500 mb-4">
               Modifica los detalles del premio entregado.
             </Dialog.Description>
             {/* Scrollable Edit Form Area */}
             <div className="overflow-y-auto pr-2 max-h-[calc(85vh-220px)]"> {/* Adjusted max-height */}
               {winnerToModify && (
                 <div className="grid grid-cols-1 gap-4">
                   {/* Edit Seller Selection */}
                   <div className="space-y-2">
                     <Label htmlFor="editSellerSelect">Vendedor Ganador</Label>
                     <select
                       id="editSellerSelect"
                       value={editSellerId}
                       onChange={(e) => setEditSellerId(e.target.value)}
                       className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                     >
                       <option value="">-- Seleccionar Vendedor --</option>
                       {sellers.map((seller) => (
                         <option key={seller.id} value={seller.id}>
                           {seller.name} ({seller.store})
                         </option>
                       ))}
                     </select>
                     </div>
                   {/* Edit Reward */}
                   <div className="space-y-2">
                     <Label htmlFor="editRewardSelect">Premio Reclamado</Label>
                     <select
                       id="editRewardSelect"
                       value={editRewardName}
                       onChange={(e) => setEditRewardName(e.target.value)}
                       className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                     >
                       <option value="">-- Seleccionar Premio --</option>
                       {rewards.map((reward) => (
                         <option key={reward.name} value={reward.name}>
                           {reward.name} ({reward.points} pts)
                         </option>
                       ))}
                     </select>
                   </div>

                   {/* Edit Photo */}
                   <div className="space-y-2">
                     <Label htmlFor="editWinnerPhoto">Cambiar Foto (Opcional)</Label>
                     {editPhotoPreview && (
                       <img src={editPhotoPreview} alt="Vista previa" className="mt-2 h-32 w-auto rounded-md object-contain border" />
                     )}
                     <Input
                       id="editWinnerPhoto"
                       type="file"
                       accept="image/*"
                       onChange={handleEditPhotoChange} // Use specific handler
                     />
                   </div>

                   {/* Edit Comments */}
                   <div className="space-y-2">
                     <Label htmlFor="editWinnerComments">Comentarios / Reseña</Label>
                     <Textarea
                       id="editWinnerComments"
                       value={editComments}
                       onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditComments(e.target.value)}
                       placeholder="Añade un comentario o reseña..."
                       className="min-h-[80px]"
                     />
                   </div>
                 </div>
               )}
             </div>
             {/* Edit Modal Actions */}
             <div className="mt-6 flex flex-col sm:flex-row w-full items-center justify-end gap-2 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditWinnerOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={handleEditWinner}
                  disabled={!editSellerId || !editRewardName} // Update validation
                  className="w-full sm:w-auto"
                >
                  Guardar Cambios
                </Button>
             </div>
           </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Modal */}
      <AlertDialog.Root open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none">
            <AlertDialog.Title className="mb-2 text-lg font-medium">
              Confirmar Eliminación
            </AlertDialog.Title>
            <AlertDialog.Description className="mb-6 text-sm text-gray-600">
              ¿Estás seguro de que deseas eliminar el registro del ganador "{winnerToModify?.name}"? Esta acción no se puede deshacer.
            </AlertDialog.Description>
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">Cancelar</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={handleDeleteWinner}>Eliminar</Button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

    </div>
  );
}
