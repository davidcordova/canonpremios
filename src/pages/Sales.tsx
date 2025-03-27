import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Package, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { ExportButtons } from '@/components/ExportButtons';
import { formatSalesForExcel } from '@/lib/export';
import { generateMockSales, products as mockProducts } from '@/lib/mockData';

interface SaleProduct {
  productId: string;
  model: string;
  quantity: number;
  points: number;
}

interface Sale {
  id: string;
  date: string;
  time: string;
  seller?: {
    id: string;
    name: string;
    email: string;
  };
  products: SaleProduct[];
  points: number;
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export default function Sales() {
  const user = useAuthStore((state) => state.user);
  const [sales, setSales] = useState<Sale[]>(generateMockSales());
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [newSale, setNewSale] = useState({
    products: [] as SaleProduct[]
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');

  const handleNewSale = () => {
    if (!newSale.products.length) {
      return;
    }

    const points = newSale.products.reduce((sum, p) => sum + p.points, 0);

    const sale: Sale = {
      id: (sales.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      seller: {
        id: user!.id,
        name: user!.name,
        email: user!.email
      },
      products: newSale.products,
      points,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setSales([sale, ...sales]);
    setIsNewSaleOpen(false);
    setNewSale({
      products: []
    });
  };

  const handleAddProduct = () => {
    const product = mockProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    const qty = parseInt(quantity);
    const points = product.points * qty;

    setNewSale(prev => ({
      ...prev,
      products: [...prev.products, {
        productId: product.id,
        model: product.model,
        quantity: qty,
        points
      }]
    }));

    setSelectedProduct('');
    setQuantity('1');
  };

  const handleRemoveProduct = (index: number) => {
    setNewSale(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const calculatePoints = () => {
    return newSale.products.reduce((sum, p) => sum + p.points, 0);
  };

  const calculateTotalQuantity = () => {
    return newSale.products.reduce((sum, p) => sum + p.quantity, 0);
  };

  if (user?.role === 'seller') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Ventas</h1>
            <p className="text-sm text-gray-500 mt-1">
              Registra y gestiona tus ventas
            </p>
          </div>
          <Button onClick={() => setIsNewSaleOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Venta
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha y Hora
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales
                .filter(sale => sale.seller?.email === user.email)
                .map((sale) => (
                  <tr key={sale.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sale.date).toLocaleDateString('es-ES')} {sale.time}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {sale.products.map((product, index) => (
                          <div key={index}>
                            {product.quantity}x {product.model}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-primary">
                        {sale.points} pts
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Dialog.Root open={isNewSaleOpen} onOpenChange={setIsNewSaleOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-2xl">
              <div className="p-6">
                <Dialog.Title className="text-lg font-semibold mb-4">
                  Nueva Venta
                </Dialog.Title>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Productos</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <select
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="">Seleccionar producto</option>
                          {mockProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.model} ({product.points} pts)
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="w-24"
                        />
                        <Button type="button" onClick={handleAddProduct}>
                          Agregar
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {newSale.products.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{product.model}</span>
                            <span className="text-sm text-gray-500">x{product.quantity}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-primary">
                              {product.points} pts
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProduct(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {newSale.products.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Total Unidades:</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {calculateTotalQuantity()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-700">Puntos:</p>
                            <p className="text-2xl font-bold text-primary">
                              {calculatePoints()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleNewSale}
                      className="w-full"
                      disabled={!newSale.products.length}
                    >
                      Registrar Venta
                    </Button>
                  </div>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    );
  }

  // Vista del administrador
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Ventas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra las ventas registradas por los vendedores
          </p>
        </div>
        <ExportButtons
          data={sales}
          recordsFilename="ventas"
          formatForExcel={formatSalesForExcel}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vendedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha y Hora
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {sale.seller?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {sale.seller?.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {sale.products.map((product, index) => (
                      <div key={index}>
                        {product.quantity}x {product.model}
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(sale.date).toLocaleDateString('es-ES')} {sale.time}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}