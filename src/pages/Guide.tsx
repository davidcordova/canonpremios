import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, ChevronDown, ChevronUp, BookOpen, HelpCircle, Star, MessageCircle, Plus, Edit, Trash2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface GuideSection {
  id: string;
  title: string;
  content: string;
  category: 'tutorial' | 'faq';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  likes: number;
  views: number;
}

const mockGuides: GuideSection[] = [
  {
    id: '1',
    title: 'Cómo registrar una nueva venta',
    content: `
      1. Accede a la sección "Ventas" desde el menú lateral
      2. Haz clic en el botón "Nueva Venta"
      3. Completa los datos del cliente
      4. Selecciona los productos vendidos
      5. Verifica el total y finaliza la venta
      
      Recuerda: Es importante verificar el stock disponible antes de registrar la venta.
    `,
    category: 'tutorial',
    difficulty: 'basic',
    likes: 45,
    views: 120
  },
  {
    id: '2',
    title: 'Proceso de garantía para impresoras PIXMA',
    content: `
      Para gestionar una garantía de impresoras PIXMA:
      
      1. Verifica que el producto esté dentro del período de garantía
      2. Solicita la factura original de compra
      3. Documenta el problema técnico
      4. Registra el caso en el sistema
      5. Coordina con el servicio técnico
      
      Tiempo estimado de proceso: 3-5 días hábiles
    `,
    category: 'tutorial',
    difficulty: 'intermediate',
    likes: 32,
    views: 95
  },
  {
    id: '3',
    title: '¿Cómo acumulo puntos en el programa de recompensas?',
    content: `
      Los puntos se acumulan de la siguiente manera:
      
      - Ventas de productos: 1-20 puntos según el modelo
      - Capacitaciones completadas: 5-15 puntos
      - Evaluaciones aprobadas: 10 puntos
      - Metas mensuales alcanzadas: 50 puntos extra
      
      Los puntos se actualizan automáticamente en tu perfil.
    `,
    category: 'faq',
    difficulty: 'basic',
    likes: 67,
    views: 200
  },
  {
    id: '4',
    title: 'Configuración avanzada de Maxify GX Series',
    content: `
      Guía de configuración avanzada:
      
      1. Acceso al panel de administración
      2. Configuración de red empresarial
      3. Gestión de perfiles de impresión
      4. Monitoreo de consumo de tinta
      5. Programación de mantenimiento
      
      Importante: Esta configuración requiere permisos de administrador.
    `,
    category: 'tutorial',
    difficulty: 'advanced',
    likes: 28,
    views: 75
  }
];

const difficultyColors = {
  basic: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

const difficultyNames = {
  basic: 'Básico',
  intermediate: 'Intermedio',
  advanced: 'Avanzado'
};

export default function Guide() {
  const user = useAuthStore((state) => state.user);
  const [guides, setGuides] = useState<GuideSection[]>(mockGuides);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'tutorial' | 'faq'>('all');
  const [expandedGuide, setExpandedGuide] = useState<string | null>(null);
  const [isNewGuideOpen, setIsNewGuideOpen] = useState(false);
  const [isEditGuideOpen, setIsEditGuideOpen] = useState(false);
  const [isDeleteGuideOpen, setIsDeleteGuideOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<GuideSection | null>(null);
  const [newGuide, setNewGuide] = useState<Omit<GuideSection, 'id' | 'likes' | 'views'>>({
    title: '',
    content: '',
    category: 'tutorial',
    difficulty: 'basic'
  });

  const filteredGuides = guides.filter(guide => {
    const matchesSearch = guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guide.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleGuide = (id: string) => {
    setExpandedGuide(expandedGuide === id ? null : id);
  };

  const handleAddGuide = () => {
    if (!newGuide.title || !newGuide.content) return;

    const guide: GuideSection = {
      id: (guides.length + 1).toString(),
      ...newGuide,
      likes: 0,
      views: 0
    };

    setGuides([guide, ...guides]);
    setIsNewGuideOpen(false);
    setNewGuide({
      title: '',
      content: '',
      category: 'tutorial',
      difficulty: 'basic'
    });
  };

  const handleEditGuide = () => {
    if (!selectedGuide || !newGuide.title || !newGuide.content) return;

    setGuides(guides.map(guide => 
      guide.id === selectedGuide.id
        ? {
            ...guide,
            title: newGuide.title,
            content: newGuide.content,
            category: newGuide.category,
            difficulty: newGuide.difficulty
          }
        : guide
    ));

    setIsEditGuideOpen(false);
    setSelectedGuide(null);
  };

  const openEditGuide = (guide: GuideSection) => {
    setSelectedGuide(guide);
    setNewGuide({
      title: guide.title,
      content: guide.content,
      category: guide.category,
      difficulty: guide.difficulty
    });
    setIsEditGuideOpen(true);
  };

  const openDeleteGuide = (guide: GuideSection) => {
    setSelectedGuide(guide);
    setIsDeleteGuideOpen(true);
  };

  const handleDeleteGuide = () => {
    if (!selectedGuide) return;
    
    setGuides(guides.filter(guide => guide.id !== selectedGuide.id));
    setIsDeleteGuideOpen(false);
    setSelectedGuide(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Guía de Usuario</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tutoriales y preguntas frecuentes para ayudarte en tu día a día
          </p>
        </div>
        {user?.role === 'admin' && (
          <Button onClick={() => setIsNewGuideOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Guía
          </Button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar guías y tutoriales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('all')}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            Todos
          </Button>
          <Button
            variant={selectedCategory === 'tutorial' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('tutorial')}
            className="flex items-center gap-2"
          >
             <BookOpen className="h-4 w-4" />
            Tutoriales
          </Button>
          <Button
            variant={selectedCategory === 'faq' ? 'default' : 'outline'}
            onClick={() => setSelectedCategory('faq')}
            className="flex items-center gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            FAQ
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredGuides.map((guide) => (
          <div key={guide.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleGuide(guide.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  {guide.category === 'tutorial' ? (
                    <BookOpen className="h-5 w-5 text-primary mt-1" />
                  ) : (
                    <HelpCircle className="h-5 w-5 text-primary mt-1" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{guide.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[guide.difficulty]}`}>
                        {difficultyNames[guide.difficulty]}
                      </span>
                      {/* Removed Likes Span */}
                      {/* Removed Views Span */}
                    </div>
                  </div>
                </div>
                {expandedGuide === guide.id ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            
            {expandedGuide === guide.id && (
              <div className="px-4 pb-4">
                <div className="mt-2 pt-4 border-t">
                  <div className="prose prose-sm max-w-none">
                    {guide.content.split('\n').map((line, index) => (
                      <p key={index} className="mb-2 text-gray-600">
                        {line}
                      </p>
                    ))}
                  </div>
                  {user?.role === 'admin' && (
                    <div className="mt-4 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditGuide(guide);
                        }}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteGuide(guide);
                        }}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal para nueva guía */}
      <Dialog.Root open={isNewGuideOpen} onOpenChange={setIsNewGuideOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Crear Nueva Guía
            </Dialog.Title>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newGuide.title}
                  onChange={(e) => setNewGuide({ ...newGuide, title: e.target.value })}
                  placeholder="Ej: Cómo registrar una nueva venta"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <select
                    id="category"
                    value={newGuide.category}
                    onChange={(e) => setNewGuide({ ...newGuide, category: e.target.value as 'tutorial' | 'faq' })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="tutorial">Tutorial</option>
                    <option value="faq">Pregunta Frecuente</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Dificultad</Label>
                  <select
                    id="difficulty"
                    value={newGuide.difficulty}
                    onChange={(e) => setNewGuide({ ...newGuide, difficulty: e.target.value as 'basic' | 'intermediate' | 'advanced' })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="basic">Básico</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Contenido</Label>
                <textarea
                  id="content"
                  value={newGuide.content}
                  onChange={(e) => setNewGuide({ ...newGuide, content: e.target.value })}
                  placeholder="Escribe el contenido de la guía aquí..."
                  rows={10}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <p className="text-xs text-gray-500">
                  Usa saltos de línea para separar párrafos. Puedes usar listas numeradas o con viñetas.
                </p>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewGuideOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddGuide}
                  disabled={!newGuide.title || !newGuide.content}
                >
                  Crear Guía
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal para editar guía */}
      <Dialog.Root open={isEditGuideOpen} onOpenChange={setIsEditGuideOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Editar Guía
            </Dialog.Title>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={newGuide.title}
                  onChange={(e) => setNewGuide({ ...newGuide, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Categoría</Label>
                  <select
                    id="edit-category"
                    value={newGuide.category}
                    onChange={(e) => setNewGuide({ ...newGuide, category: e.target.value as 'tutorial' | 'faq' })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="tutorial">Tutorial</option>
                    <option value="faq">Pregunta Frecuente</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-difficulty">Dificultad</Label>
                  <select
                    id="edit-difficulty"
                    value={newGuide.difficulty}
                    onChange={(e) => setNewGuide({ ...newGuide, difficulty: e.target.value as 'basic' | 'intermediate' | 'advanced' })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="basic">Básico</option>
                    <option value="intermediate">Intermedio</option>
                    <option value="advanced">Avanzado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-content">Contenido</Label>
                <textarea
                  id="edit-content"
                  value={newGuide.content}
                  onChange={(e) => setNewGuide({ ...newGuide, content: e.target.value })}
                  rows={10}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditGuideOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditGuide}
                  disabled={!newGuide.title || !newGuide.content}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog.Root open={isDeleteGuideOpen} onOpenChange={setIsDeleteGuideOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <AlertDialog.Title className="text-lg font-semibold mb-4">
              Confirmar Eliminación
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-500 mb-4">
              ¿Estás seguro que deseas eliminar la guía "{selectedGuide?.title}"? Esta acción no se puede deshacer.
            </AlertDialog.Description>
            <div className="flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">Cancelar</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={handleDeleteGuide}>
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
