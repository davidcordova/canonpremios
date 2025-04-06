import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Trophy,
  // Calendar as CalendarIcon, // Removed unused
  Star, // Keep Star
  Plus, // Keep Plus
  // Upload, // Removed unused
  // Edit, // Removed unused
  // Trash2, // Removed unused
  // AlertCircle, // Removed unused
  Filter,
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog'; // Keep Dialog
import * as AlertDialog from '@radix-ui/react-alert-dialog'; // Keep AlertDialog
// import { DateRangePicker } from '@/components/ui/date-range-picker'; // Removed
import { DateRange } from 'react-day-picker'; // Keep for appliedDateRange type
import { ExportButtons } from '@/components/ExportButtons';
import { formatWinnersForExcel } from '@/lib/export';
// Input is already imported above, removing duplicate
import { getWinners } from '@/lib/mockData'; // Removed Winner import
import { format } from 'date-fns';
// import { useToast } from '@/components/ui/use-toast'; // Removed
import { es } from 'date-fns/locale'; // Keep locale
// import { formatWinnersForExportButtons } from '@/lib/utils'; // Removed

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
  // const { toast } = useToast(); // Removed
  // const [showHistory, setShowHistory] = useState(false); // Removed

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>();

  // Removed old filtering/grouping logic (currentMonth, currentYear, currentMonthWinners, historicalWinners)

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

  const filteredWinners = winners.filter(winner => {
    if (!appliedDateRange?.from || !appliedDateRange?.to) {
      return true; // No filter applied yet or incomplete range
    }
    const winnerDate = new Date(winner.reward.date);
    // Compare directly with the range, handleFilterClick already sets 'to' date to end of day
    return winnerDate >= appliedDateRange.from && winnerDate <= appliedDateRange.to;
  });

  useEffect(() => {
    const fetchWinners = async () => {
      try {
        const fetchedWinners = await getWinners(); // Ensure await is used
        setWinners(fetchedWinners);
      } catch (error) {
        console.error("Error fetching winners:", error);
        // Optionally: set an error state here to display a message to the user
      }
    };
    fetchWinners();
  }, []); // Added empty dependency array

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
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
          <div className="flex items-end gap-2">
            <div className="grid gap-1.5">
              <Label htmlFor="fromDate">Desde</Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-auto"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="toDate">Hasta</Label>
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
              Filtrar
            </Button>
            <ExportButtons
              data={filteredWinners}
              recordsFilename="ganadores"
              formatForExcel={formatWinnersForExcel}
              dateRange={appliedDateRange}
            />
          </div>
        )}
        {/* Admin "Nuevo Ganador" Button */}
        {user?.role === 'admin' && (
          <Dialog.Root>
            <Dialog.Trigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Ganador
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50" />
              <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg focus:outline-none">
                <Dialog.Title className="mb-4 text-xl font-medium">
                  Nuevo Ganador
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-500">
                  Registra los datos del nuevo ganador.
                </Dialog.Description>
                <div className="mt-6 space-y-4">
                  {/* Form fields... */}
                  <div className="grid w-full items-center gap-4">
                    <Label htmlFor="code">Nombre</Label>
                    <Input id="code" type="text" />
                  </div>
                  <div className="grid w-full items-center gap-4">
                    <Label htmlFor="name">Avatar</Label>
                    <Input id="name" type="text" />
                  </div>
                  <div className="grid w-full items-center gap-4">
                    <Label htmlFor="type">Tienda</Label>
                    <Input id="type" type="text" />
                  </div>
                  <div className="grid w-full items-center gap-4">
                    <Label htmlFor="points">Foto</Label>
                    <Input id="points" type="text" />
                  </div>
                  <div className="grid w-full items-center gap-4">
                    <Label htmlFor="type">Nombre del Premio</Label>
                    <Input id="type" type="text" />
                  </div>
                  <div className="grid w-full items-center gap-4">
                    <Label htmlFor="points">Puntos</Label>
                    <Input id="points" type="text" />
                  </div>
                  <div className="grid w-full items-center gap-4">
                    <Label htmlFor="date">Fecha</Label>
                    <Input id="date" type="date" />
                  </div>
                  <div className="grid w-full items-center gap-4">
                    <Label htmlFor="review">Reseña</Label>
                    <Input id="review" type="text" />
                  </div>
                </div>
                <div className="mt-8 flex w-full items-center justify-end gap-2">
                  <Dialog.Close asChild>
                    <Button type="button" variant="secondary">
                      Cancelar
                    </Button>
                  </Dialog.Close>
                  <Dialog.Close asChild>
                    <Button type="button"> {/* Removed commented onClick */}
                      Guardar
                    </Button>
                  </Dialog.Close>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </div>

      {/* Combined Winners Section */}
      <div className="space-y-4">
        {filteredWinners.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay ganadores registrados para el filtro seleccionado.</p>
          </div>
        ) : (
          <div className="responsive-table overflow-x-auto">
            <table className="min-w-full">
              {/* Keep thead outside the conditional check */}
              <thead className="sr-only">
                <tr>
                  <th>Detalles Ganador</th>
                  <th>Tienda</th>
                  <th>Premio</th>
                  <th>Puntos</th>
                </tr>
              </thead>
              {/* Conditionally render tbody content */}
              <tbody>
                {filteredWinners.map((winner) => (
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Removed Historical Section and related button/logic */}
    </div>
  );
}
