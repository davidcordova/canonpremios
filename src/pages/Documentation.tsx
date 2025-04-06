import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Download, Search, Plus, Upload, Edit, Trash2, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

interface Document {
  id: string;
  title: string;
  description: string;
  category: 'manual' | 'guide' | 'policy' | 'technical';
  type: 'pdf' | 'doc' | 'ppt';
  size: string;
  updatedAt: string;
  url: string;
}

const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Manual de Producto - PIXMA Series 2024',
    description: 'Especificaciones técnicas y características de la línea PIXMA.',
    category: 'manual',
    type: 'pdf',
    size: '2.5 MB',
    updatedAt: '2024-03-15',
    url: '#'
  },
  {
    id: '2',
    title: 'Guía de Ventas - Maxify GX Series',
    description: 'Estrategias y argumentos de venta para la línea Maxify GX.',
    category: 'guide',
    type: 'ppt',
    size: '5.8 MB',
    updatedAt: '2024-03-10',
    url: '#'
  }
];

const categoryNames = {
  manual: 'Manuales',
  guide: 'Guías',
  policy: 'Políticas',
  technical: 'Técnicos'
};

export default function Documentation() {
  const user = useAuthStore((state) => state.user);
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [isNewDocumentOpen, setIsNewDocumentOpen] = useState(false);
  const [isEditDocumentOpen, setIsEditDocumentOpen] = useState(false);
  const [isDeleteDocumentOpen, setIsDeleteDocumentOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newDocument, setNewDocument] = useState({
    title: '',
    description: '',
    category: 'manual' as Document['category'],
    file: null as File | null
  });
  const [editDocument, setEditDocument] = useState({
    title: '',
    description: '',
    category: 'manual' as Document['category']
  });

  const handleNewDocument = () => {
    if (!newDocument.file || !newDocument.title || !newDocument.description || !newDocument.category) {
      return;
    }

    const fileType = newDocument.file.name.split('.').pop()?.toLowerCase() as 'pdf' | 'doc' | 'ppt';
    const fileSize = (newDocument.file.size / (1024 * 1024)).toFixed(1) + ' MB';

    const doc: Document = {
      id: (documents.length + 1).toString(),
      title: newDocument.title,
      description: newDocument.description,
      category: newDocument.category,
      type: fileType,
      size: fileSize,
      updatedAt: new Date().toISOString().split('T')[0],
      url: URL.createObjectURL(newDocument.file)
    };

    setDocuments([doc, ...documents]);
    setIsNewDocumentOpen(false);
    setNewDocument({
      title: '',
      description: '',
      category: 'manual',
      file: null
    });
  };

  const handleEditDocument = () => {
    if (!selectedDocument || !editDocument.title || !editDocument.description) {
      return;
    }

    setDocuments(documents.map(doc => 
      doc.id === selectedDocument.id
        ? {
            ...doc,
            title: editDocument.title,
            description: editDocument.description,
            category: editDocument.category,
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : doc
    ));

    setIsEditDocumentOpen(false);
    setSelectedDocument(null);
  };

  const openEditDocument = (document: Document) => {
    setSelectedDocument(document);
    setEditDocument({
      title: document.title,
      description: document.description,
      category: document.category
    });
    setIsEditDocumentOpen(true);
  };

  const openDeleteDocument = (document: Document) => {
    setSelectedDocument(document);
    setIsDeleteDocumentOpen(true);
  };

  const handleDeleteDocument = () => {
    if (!selectedDocument) return;
    
    setDocuments(documents.filter(doc => doc.id !== selectedDocument.id));
    setIsDeleteDocumentOpen(false);
    setSelectedDocument(null);
  };

  if (user?.role === 'seller') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documentación</h1>
          <p className="text-sm text-gray-500 mt-1">
            Accede a manuales, guías y documentos importantes
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar documentos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents
            .filter(doc => 
              doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              doc.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((doc) => (
              <div key={doc.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">
                      {doc.type === 'pdf' ? '📄' : doc.type === 'doc' ? '📝' : '📊'}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Tamaño: {doc.size}</span>
                      <span>Actualizado: {new Date(doc.updatedAt).toLocaleDateString('es-ES')}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {categoryNames[doc.category]}
                      </span>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-gray-200 text-sm font-medium hover:bg-gray-50"
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Documentación</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los documentos y recursos disponibles
          </p>
        </div>
        <Button onClick={() => setIsNewDocumentOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Documento
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Buscar documentos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Wrap the table in a div with overflow-x-auto for horizontal scrolling on small screens */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Documento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tamaño
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actualizado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents
              .filter(doc => 
                doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((doc) => (
                <tr key={doc.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">
                        {doc.type === 'pdf' ? '📄' : doc.type === 'doc' ? '📝' : '📊'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                        <div className="text-sm text-gray-500">{doc.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      {categoryNames[doc.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
                    {doc.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {doc.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doc.updatedAt).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openEditDocument(doc)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openDeleteDocument(doc)}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Dialog.Root open={isNewDocumentOpen} onOpenChange={setIsNewDocumentOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Subir Nuevo Documento
            </Dialog.Title>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título del Documento</Label>
                <Input
                  id="title"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({ ...newDocument, title: e.target.value })}
                  placeholder="Ej: Manual de Usuario PIXMA G3160"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({ ...newDocument, description: e.target.value })}
                  placeholder="Breve descripción del documento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría</Label>
                <select
                  id="category"
                  value={newDocument.category}
                  onChange={(e) => setNewDocument({ ...newDocument, category: e.target.value as Document['category'] })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                >
                  {Object.entries(categoryNames).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Documento</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewDocument({ ...newDocument, file });
                      }
                    }}
                  />
                  <Button type="button" size="icon" variant="outline">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Formatos permitidos: PDF, DOC, DOCX, PPT, PPTX
                </p>
              </div>

              <div className="pt-4 border-t mt-4">
                <Button
                  onClick={handleNewDocument}
                  className="w-full"
                  disabled={!newDocument.file || !newDocument.title || !newDocument.description}
                >
                  Subir Documento
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal para editar documento */}
      <Dialog.Root open={isEditDocumentOpen} onOpenChange={setIsEditDocumentOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Editar Documento
            </Dialog.Title>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título del Documento</Label>
                <Input
                  id="edit-title"
                  value={editDocument.title}
                  onChange={(e) => setEditDocument({ ...editDocument, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Input
                  id="edit-description"
                  value={editDocument.description}
                  onChange={(e) => setEditDocument({ ...editDocument, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-category">Categoría</Label>
                <select
                  id="edit-category"
                  value={editDocument.category}
                  onChange={(e) => setEditDocument({ ...editDocument, category: e.target.value as Document['category'] })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:ring-1 focus:ring-ring"
                >
                  {Object.entries(categoryNames).map(([key, name]) => (
                    <option key={key} value={key}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label>Archivo Actual</Label>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>{selectedDocument?.type.toUpperCase()} - {selectedDocument?.size}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Para reemplazar el archivo, sube un nuevo documento.
                </p>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDocumentOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditDocument}
                  disabled={!editDocument.title || !editDocument.description}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog.Root open={isDeleteDocumentOpen} onOpenChange={setIsDeleteDocumentOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <AlertDialog.Title className="text-lg font-semibold mb-4">
              Confirmar Eliminación
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-500 mb-4">
              ¿Estás seguro que deseas eliminar el documento "{selectedDocument?.title}"? Esta acción no se puede deshacer.
            </AlertDialog.Description>
            <div className="flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">Cancelar</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={handleDeleteDocument}>
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
