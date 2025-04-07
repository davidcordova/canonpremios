import { useState } from 'react';
import { DateRange } from 'react-day-picker'; // Keep for appliedDateRange type
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Package, X, Upload, CheckCircle, XCircle, Eye, AlertCircle, Filter } from 'lucide-react'; // Added Filter
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { ExportButtons } from '@/components/ExportButtons';
import { formatPurchasesForExcel } from '@/lib/export';
import { generateMockPurchases, products as mockProducts, wholesalers } from '@/lib/mockData';

interface PurchaseProduct {
  productId: string;
  model: string;
  quantity: number;
  points: number;
}

interface Purchase {
  id: string;
  date: string;
  time: string;
  seller: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    store: string;
  };
  documentType: 'factura' | 'boleta';
  documentNumber: string;
  wholesaler: string;
  document: string;
  products: PurchaseProduct[];
  totalPoints: number;
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  createdAt: string;
  updatedAt: string;
}

export default function Purchases() {
  const user = useAuthStore((state) => state.user);
  const [purchases, setPurchases] = useState<Purchase[]>(generateMockPurchases());
  const [isNewPurchaseOpen, setIsNewPurchaseOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [reviewData, setReviewData] = useState({
    status: 'approved' as 'approved' | 'rejected',
    comments: ''
  });
  const [newPurchase, setNewPurchase] = useState({
    documentType: 'factura' as 'factura' | 'boleta',
    documentNumber: '',
    wholesaler: '',
    document: null as File | null,
    products: [] as PurchaseProduct[]
  });
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [currentStock, setCurrentStock] = useState('');
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState<string>(''); // State for "Desde" date string
  const [toDate, setToDate] = useState<string>(''); // State for "Hasta" date string
  const [appliedDateRange, setAppliedDateRange] = useState<DateRange | undefined>(undefined); // State for applied filter

  const handleNewPurchase = () => {
    if (!newPurchase.documentNumber || !newPurchase.wholesaler || !newPurchase.document || !newPurchase.products.length) {
      return;
    }

    const isDuplicate = purchases.some(purchase =>
      purchase.documentNumber === newPurchase.documentNumber &&
      purchase.wholesaler === newPurchase.wholesaler
    );

    if (isDuplicate) {
      setError(`Ya existe una compra registrada con el número de documento ${newPurchase.documentNumber} para el mayorista ${newPurchase.wholesaler}`);
      return;
    }

    const purchase: Purchase = {
      id: (purchases.length + 1).toString(),
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      seller: {
        id: user!.id,
        name: user?.name || '',
        email: user?.email || '',
        avatar: user?.avatar || '',
        store: user?.store || ''
      },
      documentType: newPurchase.documentType,
      documentNumber: newPurchase.documentNumber,
      wholesaler: newPurchase.wholesaler,
      document: URL.createObjectURL(newPurchase.document),
      products: newPurchase.products,
      totalPoints: newPurchase.products.reduce((sum, p) => sum + p.points, 0),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPurchases([purchase, ...purchases]);
    setIsNewPurchaseOpen(false);
    setNewPurchase({
      documentType: 'factura',
      documentNumber: '',
      wholesaler: '',
      document: null,
      products: []
    });
    setError('');
  };

  const handleAddProduct = () => {
    const product = mockProducts.find(p => p.id === selectedProduct);
    if (!product) return;

    const qty = parseInt(quantity) || 1;
    const points = product.points * qty;

    setNewPurchase(prev => ({
      ...prev,
      products: [...prev.products, {
        productId: product.id,
        model: product.model,
        quantity: qty,
        points: points
      }]
    }));

    setSelectedProduct('');
    setQuantity('1');
  };

  const handleRemoveProduct = (index: number) => {
    setNewPurchase(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleReview = () => {
    if (!selectedPurchase) return;

    setPurchases(purchases.map(purchase =>
      purchase.id === selectedPurchase.id
        ? {
            ...purchase,
            status: reviewData.status,
            comments: reviewData.comments,
            updatedAt: new Date().toISOString()
          }
        : purchase
    ));

    setIsReviewOpen(false);
    setSelectedPurchase(null);
    setReviewData({
      status: 'approved',
      comments: ''
    });
  };

  const openReview = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setReviewData({
      status: 'approved',
      comments: ''
    });
    setIsReviewOpen(true);
  };

  const openPreview = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsPreviewOpen(true);
  };

  // Filter logic for admin view
  const handleFilterClick = () => {
    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      if (!isNaN(from.getTime()) && !isNaN(to.getTime()) && from <= to) {
        to.setHours(23, 59, 59, 999); // Include end date
        setAppliedDateRange({ from, to });
      } else {
        console.error("Invalid date range selected");
        setAppliedDateRange(undefined);
      }
    } else {
      setAppliedDateRange(undefined);
    }
  };

  const dateFilteredPurchases = purchases.filter(purchase => {
    if (!appliedDateRange?.from || !appliedDateRange?.to) {
      return true; // No filter applied
    }
    const purchaseDate = new Date(purchase.date);
    const normalizedPurchaseDate = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate());
    const normalizedFrom = new Date(appliedDateRange.from.getFullYear(), appliedDateRange.from.getMonth(), appliedDateRange.from.getDate());
    const normalizedTo = new Date(appliedDateRange.to.getFullYear(), appliedDateRange.to.getMonth(), appliedDateRange.to.getDate());
    return normalizedPurchaseDate >= normalizedFrom && normalizedPurchaseDate <= normalizedTo;
  });

  const pendingFilteredPurchases = dateFilteredPurchases.filter(purchase => purchase.status === 'pending');


  if (user?.role === 'seller') {
    // Seller View remains unchanged
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mis Compras</h1>
            <p className="text-sm text-gray-500 mt-1">
              Registra tus compras de productos Canon y acumula puntos
            </p>
          </div>
          <Button onClick={() => setIsNewPurchaseOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nueva Compra
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 responsive-table">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Documento
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mayorista
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Puntos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchases
                .filter(purchase => purchase.seller.email === user.email)
                .map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-6 py-4 whitespace-nowrap" data-label="Documento">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openPreview(purchase)}
                          className="flex items-center gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Ver
                        </Button>
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {purchase.documentType}
                          </div>
                          <div className="text-sm text-gray-500">
                            {purchase.documentNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-label="Mayorista">
                      <div className="text-sm text-gray-900">{purchase.wholesaler}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-label="Fecha">
                      <div className="text-sm text-gray-500">
                        {new Date(purchase.date).toLocaleDateString('es-ES')} {purchase.time}
                      </div>
                    </td>
                    <td className="px-6 py-4" data-label="Productos">
                    <div className="text-sm text-gray-900">
                      {purchase.products.map((product: any, index: number) => (
                        <div key={index}>
                          {product.quantity}x {product.model}
                        </div>
                      ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-label="Puntos">
                      <div className="text-sm font-medium text-primary">
                        {purchase.totalPoints} pts
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-label="Columna">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        purchase.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : purchase.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {purchase.status === 'approved' ? 'Aprobada' :
                         purchase.status === 'rejected' ? 'Rechazada' : 'Pendiente'}
                      </span>
                        <p className="mt-1 text-sm text-gray-500">{purchase.comments}</p>

                    </td>
                   </tr>
                  ))}
            </tbody>
            </table>
          </div>
        </div>

        {/* New Purchase Modal (Seller) */}
        <Dialog.Root open={isNewPurchaseOpen} onOpenChange={setIsNewPurchaseOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg w-full max-w-2xl">
              <div className="p-6">
                <Dialog.Title className="text-lg font-semibold mb-4">
                  Nueva Compra
                </Dialog.Title>
                <div className="space-y-6 w-full">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="documentType">Tipo de Documento</Label>
                      <select
                        id="documentType"
                        value={newPurchase.documentType}
                        onChange={(e) => {
                          setNewPurchase({ ...newPurchase, documentType: e.target.value as 'factura' | 'boleta' });
                          setError('');
                        }}
                        className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="factura">Factura</option>
                        <option value="boleta">Boleta</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documentNumber">Número de Documento</Label>
                      <Input
                        id="documentNumber"
                        value={newPurchase.documentNumber}
                        onChange={(e) => {
                          setNewPurchase({ ...newPurchase, documentNumber: e.target.value });
                          setError('');
                        }}
                        placeholder="Ej: F001-00125"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wholesaler">Mayorista</Label>
                    <select
                      id="wholesaler"
                      value={newPurchase.wholesaler}
                      onChange={(e) => {
                        setNewPurchase({ ...newPurchase, wholesaler: e.target.value });
                        setError('');
                      }}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Seleccionar mayorista</option>
                      {wholesalers.map((wholesaler) => (
                        <option key={wholesaler} value={wholesaler}>
                          {wholesaler}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Error de validación</p>
                          <p className="text-sm text-red-600">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="document">Comprobante Digital</Label>
                    <Input
                      id="document"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewPurchase({ ...newPurchase, document: file });
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500">
                      Formatos permitidos: PDF, JPG, JPEG, PNG
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Productos</h3>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="md:col-span-2">
                        <select
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        >
                          <option value="">Seleccionar producto</option>
                          {mockProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.model} - {product.points} pts
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-col gap-2 md:flex-row">
                        <Input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          className="w-full md:w-24"
                        />
                        <Button type="button" onClick={handleAddProduct}>
                          Agregar
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {newPurchase.products.map((product, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-2 rounded"
                        >
                          <div className="flex flex-1 items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{product.model}</span>
                            <span className="text-sm text-gray-500">x{product.quantity}</span>
                          </div>
                          <div className="flex w-max items-center gap-4">
                            <span className="text-sm font-medium text-primary text-nowrap">
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

                    {newPurchase.products.length > 0 && (
                      <div className="pt-4 border-t">
                        <div className="flex justify-end">
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-700">Puntos Totales:</p>
                            <p className="text-2xl font-bold text-primary">
                              {newPurchase.products.reduce((sum, p) => sum + p.points, 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <Button
                      onClick={handleNewPurchase}
                      className="w-full"
                      disabled={!newPurchase.documentNumber || !newPurchase.wholesaler || !newPurchase.document || !newPurchase.products.length}
                    >
                      Registrar Compra
                    </Button>
                  </div>
                </div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Preview Modal (Seller) */}
        <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Vista Previa del Documento
              </Dialog.Title>
              {selectedPurchase && (
                <div className="space-y-4">
                  <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={selectedPurchase.document}
                      className="w-full h-full"
                      title="Vista previa del documento"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsPreviewOpen(false)}
                    >
                      Cerrar
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

  // Vista del administrador
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        {/* Left side: Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Compras</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra las compras registradas por los vendedores
          </p>
        </div>
        {/* Right side: Filter and Export */}
        <div className="flex items-end gap-2">
           {/* "Desde" Date Input */}
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
          {/* "Hasta" Date Input */}
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
          {/* Filter Button */}
          <Button onClick={handleFilterClick} disabled={!fromDate || !toDate}>
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
           {/* Ensure ExportButtons are part of the flex layout */}
          <div className="md:ml-auto"> {/* Push export buttons to the right on medium+ screens */}
            <ExportButtons
              data={dateFilteredPurchases} // Export date-filtered purchases
              recordsFilename="compras"
              formatForExcel={formatPurchasesForExcel}
              dateRange={appliedDateRange} // Pass applied range
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 responsive-table">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Vendedor
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Documento
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Mayorista
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Fecha
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Puntos
                </th>
                <th
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Map over pendingFilteredPurchases */}
              {pendingFilteredPurchases.map((purchase) => (
                  <tr key={purchase.id}>
                    <td className="px-6 py-4 whitespace-nowrap" data-label="Vendedor">
                      <div className="flex items-center">
                        <img
                          src={purchase.seller.avatar}
                          alt={purchase.seller.name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {purchase.seller.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {purchase.seller.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-label="Documento">
                     <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openPreview(purchase)}
                        className="flex items-center gap-2 px-0 text-left"
                      >
                        <Eye className="h-4 w-4" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {purchase.documentType}
                          </div>
                          <div className="text-sm text-gray-500">
                            {purchase.documentNumber}
                          </div>
                        </div>
                      </Button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-label="Mayorista">
                      <div className="text-sm text-gray-900">{purchase.wholesaler}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-label="Fecha">
                      <div className="text-sm text-gray-500">
                        {new Date(purchase.date).toLocaleDateString('es-ES')} {purchase.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" data-label="Estado">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          purchase.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : purchase.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {purchase.status === "approved"
                          ? "Aprobada"
                          : purchase.status === "rejected"
                          ? "Rechazada"
                          : "Pendiente"}
                      </span>
                       {purchase.comments && (
                        <p className="mt-1 text-sm text-gray-500">{purchase.comments}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-primary" data-label="Puntos">
                      {purchase.totalPoints} pts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReview(purchase)}
                        className="flex items-center gap-2"
                      >
                        Revisar
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
            </table>
          </div>

        {/* Preview Modal (Admin) */}
        <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Vista Previa del Documento
              </Dialog.Title>
              {selectedPurchase && (
                <div className="space-y-4">
                  <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
                    <iframe
                      src={selectedPurchase.document}
                      className="w-full h-full"
                      title="Vista previa del documento"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setIsPreviewOpen(false)}
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        {/* Review Modal (Admin) */}
         <Dialog.Root open={isReviewOpen} onOpenChange={setIsReviewOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50" />
            <Dialog.Content className="dialog-content fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Revisar Compra
              </Dialog.Title>
              {selectedPurchase && (
                <div className="space-y-4">
                  <div>
                    <Label>Vendedor</Label>
                    <p className="text-sm text-gray-900">{selectedPurchase.seller.name}</p>
                    <p className="text-sm text-gray-500">{selectedPurchase.seller.store}</p>
                  </div>
                  <div>
                    <Label>Documento</Label>
                    <p className="text-sm text-gray-900 capitalize">{selectedPurchase.documentType} - {selectedPurchase.documentNumber}</p>
                  </div>
                   <div>
                    <Label>Mayorista</Label>
                    <p className="text-sm text-gray-900">{selectedPurchase.wholesaler}</p>
                  </div>
                  <div>
                    <Label>Fecha</Label>
                     <p className="text-sm text-gray-900">
                      {new Date(selectedPurchase.date).toLocaleDateString('es-ES')} {selectedPurchase.time}
                    </p>
                  </div>
                   <div>
                    <Label>Productos</Label>
                     <ul className="list-disc list-inside text-sm text-gray-700">
                      {selectedPurchase.products.map((p, i) => <li key={i}>{p.quantity}x {p.model} ({p.points} pts)</li>)}
                    </ul>
                     <p className="text-sm font-medium text-primary mt-1">Total: {selectedPurchase.totalPoints} pts</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comments">Comentarios</Label>
                    <Input
                      id="comments"
                      value={reviewData.comments}
                      onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                      placeholder="Agregar comentarios (opcional)..."
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
                      <XCircle className="h-4 w-4" /> Rechazar
                    </Button>
                    <Button
                      onClick={() => {
                        setReviewData({ ...reviewData, status: 'approved' });
                        handleReview();
                      }}
                      className="flex items-center gap-2"
                    >
                       <CheckCircle className="h-4 w-4" /> Aprobar
                    </Button>
                  </div>
                </div>
              )}
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}
