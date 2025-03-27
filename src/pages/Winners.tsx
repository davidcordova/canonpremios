import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trophy, Calendar, Star, Plus, Upload, Edit, Trash2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { ExportButtons } from '@/components/ExportButtons';
import { formatWinnersForExcel } from '@/lib/export';
import { generateMockWinners } from '@/lib/mockData';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  const [winners, setWinners] = useState<Winner[]>(generateMockWinners());
  const [showHistory, setShowHistory] = useState(false);
  
  // Obtener mes y año actual
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Filtrar ganadores del mes actual
  const currentMonthWinners = winners.filter(winner => {
    const winnerDate = new Date(winner.reward.date);
    return winnerDate.getMonth() === currentMonth && 
           winnerDate.getFullYear() === currentYear;
  });

  // Agrupar ganadores históricos por mes
  const historicalWinners = winners.filter(winner => {
    const winnerDate = new Date(winner.reward.date);
    return winnerDate.getMonth() !== currentMonth || 
           winnerDate.getFullYear() !== currentYear;
  }).reduce((groups: Record<string, Winner[]>, winner) => {
    const date = new Date(winner.reward.date);
    const monthYear = format(date, 'MMMM yyyy', { locale: es });
    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }
    groups[monthYear].push(winner);
    return groups;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galería de Premios Entregados</h1>
          <p className="text-sm text-gray-500 mt-1">
            Conoce los premios que han canjeado tus compañeros
          </p>
        </div>
        {user?.role === 'admin' && (
          <ExportButtons
            data={winners}
            recordsFilename="ganadores"
            formatForExcel={formatWinnersForExcel}
          />
        )}
      </div>

      {/* Sección del Mes Actual */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Ganadores de {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        
        {currentMonthWinners.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay ganadores registrados este mes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentMonthWinners.map((winner) => (
              <div key={winner.id} className="bg-white rounded-lg shadow-sm overflow-hidden border-2 border-primary/10">
                <div className="aspect-video relative">
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
                        <span className="text-lg font-semibold">{winner.reward.name}</span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          {winner.reward.points} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(winner.reward.date).toLocaleDateString('es-ES')}</span>
                  </div>
                  <p className="text-sm text-gray-600 italic">"{winner.review}"</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección Histórica */}
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-2"
        >
          {showHistory ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          Historial de Premios Entregados
        </Button>

        {showHistory && Object.entries(historicalWinners)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
          .map(([monthYear, monthWinners]) => (
            <div key={monthYear} className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                Ganadores de {monthYear}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthWinners.map((winner) => (
                  <div key={winner.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="aspect-video relative">
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
                            <span className="text-lg font-semibold">{winner.reward.name}</span>
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {winner.reward.points} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(winner.reward.date).toLocaleDateString('es-ES')}</span>
                      </div>
                      <p className="text-sm text-gray-600 italic">"{winner.review}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}