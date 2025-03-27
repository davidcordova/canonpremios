import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Package, Edit, Trash2, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { ExportButtons } from '@/components/ExportButtons';
import { formatProductsForExcel } from '@/lib/export';
import { products as mockProducts } from '@/lib/mockData';

interface Product {
  id: string;
  code: string;
  model: string;
  type: string;
  points: number;
}

export default function Products() {
  const user = useAuthStore((state) => state.user);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  const [editProduct, setEditProduct] = useState({
    code: '',
    model: '',
    type: '',
    points: ''
  });
  const [newProduct, setNewProduct] = useState({
    code: '',
    model: '',
    type: '',
    points: ''
  });

  const handleNewProduct = () => {
    if (!newProduct.code || !newProduct.model || !newProduct.type) {
      return;
    }

    const product: Product = {
      id: (products.length + 1).toString(),
      code: newProduct.code,
      model: newProduct.model,
      type: newProduct.type,
      points: parseInt(newProduct.points) || 0
    };

    setProducts([...products, product]);
    setIsNewProductOpen(false);
    setNewProduct({
      code: '',
      model: '',
      type: '',
      points: ''
    });
  };

  const handleEditProduct = () => {
    if (!selectedProduct || !editProduct.code || !editProduct.model || !editProduct.type) {
      return;
    }

    setProducts(products.map(product => 
      product.id === selectedProduct.id
        ? {
            ...product,
            code: editProduct.code,
            model: editProduct.model,
            type: editProduct.type,
            points: parseInt(editProduct.points) || 0
          }
        : product
    ));

    setIsEditProductOpen(false);
    setSelectedProduct(null);
  };

  const openEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setEditProduct({
      code: product.code,
      model: product.model,
      type: product.type,
      points: product.points.toString()
    });
    setIsEditProductOpen(true);
  };

  const openDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    
    setProducts(products.filter(product => product.id !== selectedProduct.id));
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product =>
    product.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona el catálogo de productos y sus puntos
          </p>
        </div>
        <Button onClick={() => setIsNewProductOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <ExportButtons
          data={products}
          recordsFilename="productos"
          formatForExcel={formatProductsForExcel}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Puntos
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{product.model}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                  {product.points}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteProduct(product)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para nuevo producto */}
      <Dialog.Root open={isNewProductOpen} onOpenChange={setIsNewProductOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Nuevo Producto
            </Dialog.Title>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  value={newProduct.code}
                  onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                  placeholder="Ej: G2160"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo</Label>
                <Input
                  id="model"
                  value={newProduct.model}
                  onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                  placeholder="Ej: Canon G2160"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Input
                  id="type"
                  value={newProduct.type}
                  onChange={(e) => setNewProduct({ ...newProduct, type: e.target.value })}
                  placeholder="Ej: Impresora"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="points">Puntos</Label>
                <Input
                  id="points"
                  type="number"
                  value={newProduct.points}
                  onChange={(e) => setNewProduct({ ...newProduct, points: e.target.value })}
                  placeholder="Ej: 10"
                  min="0"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewProductOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleNewProduct}
                  disabled={!newProduct.code || !newProduct.model || !newProduct.type}
                >
                  Crear Producto
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal para editar producto */}
      <Dialog.Root open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <Dialog.Title className="text-lg font-semibold mb-4">
              Editar Producto
            </Dialog.Title>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Código</Label>
                <Input
                  id="edit-code"
                  value={editProduct.code}
                  onChange={(e) => setEditProduct({ ...editProduct, code: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-model">Modelo</Label>
                <Input
                  id="edit-model"
                  value={editProduct.model}
                  onChange={(e) => setEditProduct({ ...editProduct, model: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-type">Tipo</Label>
                <Input
                  id="edit-type"
                  value={editProduct.type}
                  onChange={(e) => setEditProduct({ ...editProduct, type: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-points">Puntos</Label>
                <Input
                  id="edit-points"
                  type="number"
                  value={editProduct.points}
                  onChange={(e) => setEditProduct({ ...editProduct, points: e.target.value })}
                  min="0"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsEditProductOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleEditProduct}
                  disabled={!editProduct.code || !editProduct.model || !editProduct.type}
                >
                  Guardar Cambios
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/50" />
          <AlertDialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <AlertDialog.Title className="text-lg font-semibold mb-4">
              Confirmar Eliminación
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-gray-500 mb-4">
              ¿Estás seguro que deseas eliminar el producto "{selectedProduct?.model}"? Esta acción no se puede deshacer.
            </AlertDialog.Description>
            <div className="flex justify-end gap-2">
              <AlertDialog.Cancel asChild>
                <Button variant="outline">Cancelar</Button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <Button variant="destructive" onClick={handleDeleteProduct}>
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