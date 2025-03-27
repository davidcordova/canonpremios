import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, FileText, Calendar, Package, X, Upload, CheckCircle, XCircle, Eye, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { generateMockTrainings } from '@/lib/mockData';
import TrainingCalendar from '@/components/TrainingCalendar';

export default function Training() {
  const user = useAuthStore((state) => state.user);
  const [trainings, setTrainings] = useState(generateMockTrainings());
  const [isNewSessionOpen, setIsNewSessionOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [reviewData, setReviewData] = useState({
    status: 'approved' as 'approved' | 'rejected',
    meetingUrl: '',
    trainer: 'Juan Pérez',
    duration: '',
    comments: ''
  });
  const [newSession, setNewSession] = useState({
    date: '',
    time: '',
    topic: '',
    description: ''
  });

  const handleNewSession = () => {
    if (!newSession.date || !newSession.time || !newSession.topic || !newSession.description) {
      return;
    }

    const session = {
      id: `${trainings.length + 1}`,
      date: newSession.date,
      time: newSession.time,
      seller: {
        id: user!.id,
        name: user!.name,
        email: user!.email,
        avatar: user!.avatar
      },
      topic: newSession.topic,
      description: newSession.description,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTrainings([session, ...trainings]);
    setIsNewSessionOpen(false);
    setNewSession({
      date: '',
      time: '',
      topic: '',
      description: ''
    });
  };

  const handleReview = () => {
    if (!selectedSession) return;

    // Verificar si hay otra capacitación aprobada en el mismo horario
    const hasConflict = trainings.some(training => {
      // Solo verificar capacitaciones aprobadas y que no sean la misma
      if (training.id !== selectedSession.id && training.status === 'approved') {
        const existingDate = new Date(`${training.date}T${training.time}`);
        const newDate = new Date(`${selectedSession.date}T${selectedSession.time}`);
        
        // Considerar que cada capacitación dura 90 minutos
        const existingEnd = new Date(existingDate.getTime() + (90 * 60000));
        const newEnd = new Date(newDate.getTime() + (90 * 60000));

        // Verificar si hay superposición
        return (
          (newDate >= existingDate && newDate < existingEnd) ||
          (newEnd > existingDate && newEnd <= existingEnd) ||
          (newDate <= existingDate && newEnd >= existingEnd)
        );
      }
      return false;
    });

    if (hasConflict && reviewData.status === 'approved') {
      alert('No se puede aprobar esta capacitación porque ya existe otra en el mismo horario.');
      return;
    }

    setTrainings(trainings.map(session => 
      session.id === selectedSession.id
        ? {
            ...session,
            status: reviewData.status,
            trainer: reviewData.trainer,
            duration: reviewData.duration,
            meetingUrl: reviewData.meetingUrl,
            comments: reviewData.comments,
            updatedAt: new Date().toISOString()
          }
        : session
    ));

    setIsReviewOpen(false);
    setSelectedSession(null);
    setReviewData({
      status: 'approved',
      meetingUrl: '',
      trainer: 'Juan Pérez',
      duration: '',
      comments: ''
    });
  };

  const openReview = (session: any) => {
    setSelectedSession(session);
    setReviewData({
      status: 'approved',
      meetingUrl: '',
      trainer: 'Juan Pérez',
      duration: '1.5 horas',
      comments: ''
    });
    setIsReviewOpen(true);
  };

  const handleEventClick = (info: any) => {
    const session = trainings.find(t => t.id === info.event.id);
    if (session) {
      openReview(session);
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    const startDate = new Date(selectInfo.start);
    const hours = startDate.getHours().toString().padStart(2, '0');
    const minutes = startDate.getMinutes().toString().padStart(2, '0');

    setNewSession({
      ...newSession,
      date: selectInfo.startStr.split('T')[0],
      time: `${hours}:${minutes}`
    });
    setIsNewSessionOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Capacitaciones</h1>
          <p className="text-sm text-gray-500 mt-1">
            {user?.role === 'admin' 
              ? 'Gestiona las solicitudes de capacitación'
              : 'Solicita y gestiona tus capacitaciones'}
          </p>
        </div>
        {user?.role === 'seller' && (
          <Button onClick={() => setIsNewSessionOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Solicitud
          </Button>
        )}
      </div>

      <TrainingCalendar 
        trainings={trainings}
        onEventClick={handleEventClick}
        onDateSelect={user?.role === 'seller' ? handleDateSelect : undefined}
      />

      {/* Modal para nueva solicitud */}
      <Dialog.Root open={isNewSessionOpen} onOpenChange={setIsNewSessionOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Nueva Solicitud de Capacitación
            </Dialog.Title>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Hora</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newSession.time}
                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Tema</Label>
                <Input
                  id="topic"
                  value={newSession.topic}
                  onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                  placeholder="Ej: Capacitación PIXMA Series"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                  placeholder="Describe brevemente el motivo de la capacitación"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewSessionOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleNewSession}
                  disabled={!newSession.date || !newSession.time || !newSession.topic || !newSession.description}
                >
                  Solicitar
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de revisión */}
      <Dialog.Root open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content">
            <Dialog.Title className="text-lg font-semibold mb-4">
              {user?.role === 'admin' ? 'Revisar Solicitud' : 'Detalles de la Capacitación'}
            </Dialog.Title>
            {selectedSession && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fecha</Label>
                    <p className="text-sm text-gray-900">
                      {new Date(selectedSession.date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  <div>
                    <Label>Hora</Label>
                    <p className="text-sm text-gray-900">{selectedSession.time}</p>
                  </div>
                </div>

                <div>
                  <Label>Tema</Label>
                  <p className="text-sm text-gray-900">{selectedSession.topic}</p>
                </div>

                <div>
                  <Label>Descripción</Label>
                  <p className="text-sm text-gray-900">{selectedSession.description}</p>
                </div>

                {user?.role === 'admin' && selectedSession.status === 'pending' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="trainer">Capacitador</Label>
                      <Input
                        id="trainer"
                        value={reviewData.trainer}
                        onChange={(e) => setReviewData({ ...reviewData, trainer: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration">Duración</Label>
                      <Input
                        id="duration"
                        value={reviewData.duration}
                        onChange={(e) => setReviewData({ ...reviewData, duration: e.target.value })}
                        placeholder="Ej: 1.5 horas"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="meetingUrl">URL de la Reunión</Label>
                      <Input
                        id="meetingUrl"
                        value={reviewData.meetingUrl}
                        onChange={(e) => setReviewData({ ...reviewData, meetingUrl: e.target.value })}
                        placeholder="https://meet.google.com/..."
                      />
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
                          handleReview();
                        }}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Rechazar
                      </Button>
                      <Button
                        onClick={() => {
                          setReviewData({ ...reviewData, status: 'approved' });
                          handleReview();
                        }}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Aprobar
                      </Button>
                    </div>
                  </>
                )}

                {selectedSession.status === 'approved' && (
                  <div className="space-y-4 pt-4 border-t">
                    <div>
                      <Label>Capacitador</Label>
                      <p className="text-sm text-gray-900">{selectedSession.trainer}</p>
                    </div>
                    <div>
                      <Label>Duración</Label>
                      <p className="text-sm text-gray-900">{selectedSession.duration}</p>
                    </div>
                    {selectedSession.meetingUrl && (
                      <div>
                        <Label>URL de la Reunión</Label>
                        <a
                          href={selectedSession.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {selectedSession.meetingUrl}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {selectedSession.status === 'rejected' && selectedSession.comments && (
                  <div className="pt-4 border-t">
                    <Label>Motivo del Rechazo</Label>
                    <p className="text-sm text-red-600">{selectedSession.comments}</p>
                  </div>
                )}

                {user?.role === 'seller' && (
                  <div className="pt-4 border-t flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsReviewOpen(false)}
                    >
                      Cerrar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}