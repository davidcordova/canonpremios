import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Plus, X, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { generateMockStockRecords, products as mockProducts } from '@/lib/mockData';
import { ExportButtons } from '@/components/ExportButtons';
import { formatStockForExcel } from '@/lib/export';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

interface StockProduct {
  productId: string;
  model: string;
  previousStock: number;
  currentStock: number;
  difference: number;
}

interface StockRecord {
  id: string;
  date: string;
  time: string;
  seller: {
    id: string;
    name: string;
    email: string;
    avatar: string;
  };
  products: StockProduct[];
  createdAt: string;
  updatedAt: string;
  weekNumber: number;
}

export default function Stock() {
  const user = useAuthStore((state) => state.user);
  const [stockRecords, setStockRecords] = useState(generateMockStockRecords());
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [currentStock, setCurrentStock] = useState('');
  const [newRecord, setNewRecord] = useState({
    products: [] as StockProduct[]
  });

  // Obtener la semana actual
  const currentDate = new Date();
  const currentWeek = format(currentDate, 'w');
  const weekStart = format(startOfWeek(currentDate, { locale: es }), 'dd/MM/yyyy');
  const weekEnd = format(endOfWeek(currentDate, { locale: es }), 'dd/MM/yyyy');

  // Verificar si ya existe un registro para la semana actual
  const hasCurrentWeekRecord = stockRecords.some(record => {
    const recordDate = new Date(record.date);
    return format(recordDate, 'w') === currentWeek && record.seller.email === user?.email;
  });

  const handleAddProduct = () => {
    const product = mockProducts.find(p => p.id === selectedProduct);
    if (!product || !currentStock) return;

    const stockValue = parseInt(currentStock);
    const difference = stockValue - product.stock;

    setNewRecord(prev => ({
      ...prev,
      products: [...prev.products, {
        productId: product.id,
        model: product.model,
        previousStock: product.stock,
        currentStock: stockValue,
        difference
      }]
    }));

    setSelectedProduct('');
    setCurrentStock('');
  };

  const handleRemoveProduct = (index: number) => {
    setNewRecord(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleNewRecord = () => {
    if (!newRecord.products.length) return;

    const record: StockRecord = {
      id: `${stockRecords.length + 1}`,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      seller: {
        id: user!.id,
        name: user!.name,
        email: user!.email,
        avatar: user!.avatar || ''
      },
      products: newRecord.products,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      weekNumber: parseInt(currentWeek)
    };

    setStockRecords([record, ...stockRecords]);
    setIsNewRecordOpen(false);
    setNewRecord({
      products: []
    });
  };

  if (user?.role === 'seller') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Registro de Stock</h1>
            <p className="text-sm text-gray-500 mt-1">
              Registra el stock actual de los productos (Semana {currentWeek}: {weekStart} - {weekEnd})
            </p>
          </div>
          <Button 
            onClick={() => setIsNewRecordOpen(true)} 
            className="flex items-center gap-2"
            disabled={hasCurrentWeekRecord}
          >
            <Plus className="h-4 w-4" />
            Nuevo Registro
          </Button>
        </div>

        {hasCurrentWeekRecord && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800">Registro semanal ya realizado</p>
                <p className="text-sm text-yellow-600">Ya has registrado el stock para la semana actual. El próximo registro estará disponible la siguiente semana.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semana
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stockRecords
                .filter(record => record.seller.email === user?.email)
                .map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Semana {format(new Date(record.date), 'w')}
                      <div className="text-xs text-gray-400">
                        {new Date(record.date).toLocaleDateString('es-ES')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.products.map((product: any, index: number) => (
                          <div key={index}>
                            {product.model}: {product.currentStock} ({product.difference > 0 ? '+' : ''}{product.difference})
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <Dialog.Root open={isNewRecordOpen} onOpenChange={setIsNewRecordOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Nuevo Registro de Stock - Semana {currentWeek}
              </Dialog.Title>
              <div className="space-y-4">
                <div className="space-y-4">
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
                            {product.model} (Stock actual: {product.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={currentStock}
                        onChange={(e) => setCurrentStock(e.target.value)}
                        placeholder="Stock"
                        className="w-24"
                      />
                      <Button type="button" onClick={handleAddProduct}>
                        Agregar
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {newRecord.products.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{product.model}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-500">
                            Stock anterior: {product.previousStock}
                          </span>
                          <span className="text-sm font-medium">
                            Stock actual: {product.currentStock}
                          </span>
                          <span className={`text-sm font-medium ${
                            product.difference > 0 ? 'text-green-600' : 
                            product.difference < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            ({product.difference > 0 ? '+' : ''}{product.difference})
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
                </div>

                <div className="pt-4 border-t flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsNewRecordOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleNewRecord}
                    disabled={!newRecord.products.length}
                  >
                    Guardar Registro
                  </Button>
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
          <h1 className="text-2xl font-bold text-gray-900">Revisión de Stock</h1>
          <p className="text-sm text-gray-500 mt-1">
            Revisa los registros de stock enviados por los vendedores
          </p>
        </div>
        <ExportButtons
          data={stockRecords}
          recordsFilename="registros-stock"
          formatForExcel={formatStockForExcel}
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
                Semana
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stockRecords.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={record.seller.avatar}
                      alt={record.seller.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.seller.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.seller.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Semana {format(new Date(record.date), 'w')}
                  <div className="text-xs text-gray-400">
                    {new Date(record.date).toLocaleDateString('es-ES')}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {record.products.map((product: any, index: number) => (
                      <div key={index}>
                        {product.model}: {product.currentStock} ({product.difference > 0 ? '+' : ''}{product.difference})
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}