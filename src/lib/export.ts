import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { format, getWeek, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

export async function exportChartToPDF(chartRef: HTMLElement, title: string) {
  const canvas = await html2canvas(chartRef);
  const imgData = canvas.toDataURL('image/png');
  
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const imgWidth = 280;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  pdf.setFont("helvetica");
  pdf.text(title, 15, 15);
  pdf.addImage(imgData, 'PNG', 15, 25, imgWidth, imgHeight);
  pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
}

export function exportToExcel<T>(data: T[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function formatSalesForExcel(sales: any[], dateRange?: { from?: Date; to?: Date }) {
  // Filtrar registros por rango de fechas si está definido
  const filteredSales = dateRange?.from || dateRange?.to 
    ? sales.filter(sale => {
        const saleDate = new Date(sale.date);
        // Normalizar fechas (ignorar horas/minutos/segundos)
        const normalizedSaleDate = new Date(
          saleDate.getFullYear(),
          saleDate.getMonth(),
          saleDate.getDate()
        );
        const normalizedFrom = dateRange.from 
          ? new Date(
              dateRange.from.getFullYear(),
              dateRange.from.getMonth(),
              dateRange.from.getDate()
            )
          : null;
        const normalizedTo = dateRange.to
          ? new Date(
              dateRange.to.getFullYear(),
              dateRange.to.getMonth(),
              dateRange.to.getDate()
            )
          : null;
        
        const fromValid = !normalizedFrom || normalizedSaleDate >= normalizedFrom;
        const toValid = !normalizedTo || normalizedSaleDate <= normalizedTo;
        return fromValid && toValid;
      })
    : sales;

  // Obtener lista única de empresas
  const companies = Array.from(new Set(filteredSales.map(sale => sale.seller?.company))).filter(Boolean);
  
  // Obtener lista única de productos
  const products = Array.from(new Set(filteredSales.flatMap(sale => 
    sale.products.map((p: {model: string}) => p.model)
  ))).sort();

  // Crear matriz de datos
  const data = companies.map(company => {
    // Inicializar objeto con empresa
    const row: any = {
      'EMPRESA': company,
      'VENDEDOR': sales.find(s => s.seller?.company === company)?.seller?.name || '',
      'FECHA': '',
      'HORA': ''
    };

    // Agregar columnas para cada producto, inicializadas en 0
    products.forEach(product => {
      row[product] = 0;
    });

    // Sumar cantidades de productos para esta empresa
    filteredSales.forEach(sale => {
      if (sale.seller?.company === company) {
        sale.products.forEach((product: {model: string, quantity: number}) => {
          row[product.model] = (row[product.model] || 0) + product.quantity;
        });
      }
    });

    return row;
  });

  return data;
}

export function formatPurchasesForExcel(purchases: any[], dateRange?: { from?: Date; to?: Date }) {
  // Filtrar registros por rango de fechas si está definido
  const filteredPurchases = dateRange?.from || dateRange?.to 
    ? purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.date);
        // Normalizar fechas (ignorar horas/minutos/segundos)
        const normalizedPurchaseDate = new Date(
          purchaseDate.getFullYear(),
          purchaseDate.getMonth(),
          purchaseDate.getDate()
        );
        const normalizedFrom = dateRange.from 
          ? new Date(
              dateRange.from.getFullYear(),
              dateRange.from.getMonth(),
              dateRange.from.getDate()
            )
          : null;
        const normalizedTo = dateRange.to
          ? new Date(
              dateRange.to.getFullYear(),
              dateRange.to.getMonth(),
              dateRange.to.getDate()
            )
          : null;
        
        const fromValid = !normalizedFrom || normalizedPurchaseDate >= normalizedFrom;
        const toValid = !normalizedTo || normalizedPurchaseDate <= normalizedTo;
        return fromValid && toValid;
      })
    : purchases;

  return filteredPurchases.map(purchase => {
    const date = new Date(purchase.date);
    const weekNumber = getWeek(date);
    const monthName = format(date, 'MMMM', { locale: es });
    
    return {
      'Fecha': new Date(purchase.date).toLocaleDateString('es-ES'),
      'Hora': purchase.time,
      'Semana': `Semana ${weekNumber}`,
      'Mes': monthName.charAt(0).toUpperCase() + monthName.slice(1),
      'Año': date.getFullYear(),
      'Vendedor': purchase.seller?.name || '-',
      'Empresa': purchase.seller?.company || '-',
      'Tipo': purchase.documentType === 'factura' ? 'Factura' : 'Boleta',
      'Número': purchase.documentNumber,
      'Mayorista': purchase.wholesaler,
      'Cantidad': purchase.products.reduce((sum: number, p: any) => sum + p.quantity, 0),
      'Puntos': purchase.totalPoints,
      'Estado': purchase.status === 'approved' ? 'Aprobada' : 
                purchase.status === 'rejected' ? 'Rechazada' : 'Pendiente'
    };
  });
}

export function formatProductsForExcel(products: any[]) {
  return products.map(product => ({
    'Código': product.code,
    'Modelo': product.model,
    'Tipo': product.type,
    'Puntos': product.points
  }));
}

export function formatWinnersForExcel(winners: any[], dateRange?: { from?: Date; to?: Date }) {
  // Filtrar registros por rango de fechas si está definido
  const filteredWinners = dateRange?.from || dateRange?.to 
    ? winners.filter(winner => {
        const winnerDate = new Date(winner.reward.date);
        // Normalizar fechas (ignorar horas/minutos/segundos)
        const normalizedWinnerDate = new Date(
          winnerDate.getFullYear(),
          winnerDate.getMonth(),
          winnerDate.getDate()
        );
        const normalizedFrom = dateRange.from 
          ? new Date(
              dateRange.from.getFullYear(),
              dateRange.from.getMonth(),
              dateRange.from.getDate()
            )
          : null;
        const normalizedTo = dateRange.to
          ? new Date(
              dateRange.to.getFullYear(),
              dateRange.to.getMonth(),
              dateRange.to.getDate()
            )
          : null;
        
        const fromValid = !normalizedFrom || normalizedWinnerDate >= normalizedFrom;
        const toValid = !normalizedTo || normalizedWinnerDate <= normalizedTo;
        return fromValid && toValid;
      })
    : winners;

  return filteredWinners.map(winner => {
    const date = new Date(winner.reward.date);
    const weekNumber = getWeek(date);
    const monthName = format(date, 'MMMM', { locale: es });
    
    return {
      'Fecha': new Date(winner.reward.date).toLocaleDateString('es-ES'),
      'Semana': `Semana ${weekNumber}`,
      'Mes': monthName.charAt(0).toUpperCase() + monthName.slice(1),
      'Año': date.getFullYear(),
      'Vendedor': winner.name,
      'Empresa': winner.store,
      'Premio': winner.reward.name,
      'Puntos': winner.reward.points,
      'Stock': winner.reward.stock,
      'Comentarios': winner.review
    };
  });
}

export function formatStockForExcel(records: any[], dateRange?: { from?: Date; to?: Date }) {
  // Filtrar registros por rango de fechas si está definido
  const filteredRecords = dateRange?.from || dateRange?.to 
    ? records.filter(record => {
        const recordDate = new Date(record.date);
        // Normalizar fechas (ignorar horas/minutos/segundos)
        const normalizedRecordDate = new Date(
          recordDate.getFullYear(),
          recordDate.getMonth(),
          recordDate.getDate()
        );
        const normalizedFrom = dateRange.from 
          ? new Date(
              dateRange.from.getFullYear(),
              dateRange.from.getMonth(),
              dateRange.from.getDate()
            )
          : null;
        const normalizedTo = dateRange.to
          ? new Date(
              dateRange.to.getFullYear(),
              dateRange.to.getMonth(),
              dateRange.to.getDate()
            )
          : null;
        
        const fromValid = !normalizedFrom || normalizedRecordDate >= normalizedFrom;
        const toValid = !normalizedTo || normalizedRecordDate <= normalizedTo;
        return fromValid && toValid;
      })
    : records;

  // Obtener lista única de productos
  const products = Array.from(new Set(filteredRecords.flatMap(record => 
    record.products.map((p: {model: string}) => p.model)
  ))).sort();

  // Crear matriz de datos con todos los registros filtrados
  const data = filteredRecords.map(record => {
    const date = new Date(record.date);
    const weekNumber = getWeek(date);
    const monthName = format(date, 'MMMM', { locale: es });
    
    // Inicializar objeto con datos básicos
    const row: any = {
      'Fecha': new Date(record.date).toLocaleDateString('es-ES'),
      'Hora': record.time,
      'Semana': `Semana ${weekNumber}`,
      'Mes': monthName.charAt(0).toUpperCase() + monthName.slice(1),
      'Año': date.getFullYear(),
      'Vendedor': record.seller?.name || '',
      'Empresa': record.seller?.company || ''
    };

    // Agregar columnas para cada producto con el stock actual
    products.forEach((product: string) => {
      const productData = record.products.find((p: {model: string}) => p.model === product);
      if (productData) {
        row[product] = productData.currentStock;
        row[`${product} (Diferencia)`] = productData.difference;
      } else {
        row[product] = 0;
        row[`${product} (Diferencia)`] = 0;
      }
    });

    return row;
  });

  // Ordenar por fecha descendente
  data.sort((a, b) => new Date(b.Fecha).getTime() - new Date(a.Fecha).getTime());

  return data;
}

export function formatRewardRequestsForExcel(requests: any[], dateRange?: { from?: Date; to?: Date }) {
  // Filtrar registros por rango de fechas si está definido
  const filteredRequests = dateRange?.from || dateRange?.to 
    ? requests.filter(request => {
        const requestDate = new Date(request.requestDate);
        // Normalizar fechas (ignorar horas/minutos/segundos)
        const normalizedRequestDate = new Date(
          requestDate.getFullYear(),
          requestDate.getMonth(),
          requestDate.getDate()
        );
        const normalizedFrom = dateRange.from 
          ? new Date(
              dateRange.from.getFullYear(),
              dateRange.from.getMonth(),
              dateRange.from.getDate()
            )
          : null;
        const normalizedTo = dateRange.to
          ? new Date(
              dateRange.to.getFullYear(),
              dateRange.to.getMonth(),
              dateRange.to.getDate()
            )
          : null;
        
        const fromValid = !normalizedFrom || normalizedRequestDate >= normalizedFrom;
        const toValid = !normalizedTo || normalizedRequestDate <= normalizedTo;
        return fromValid && toValid;
      })
    : requests;

  return filteredRequests.map(request => {
    const date = new Date(request.requestDate);
    const weekNumber = getWeek(date);
    const monthName = format(date, 'MMMM', { locale: es });
    
    return {
      'Fecha': new Date(request.requestDate).toLocaleDateString('es-ES'),
      'Semana': `Semana ${weekNumber}`,
      'Mes': monthName.charAt(0).toUpperCase() + monthName.slice(1),
      'Año': date.getFullYear(),
      'Vendedor': request.userName,
      'Tienda': request.userStore,
      'Premio': request.rewardName,
      'Puntos': request.points,
      'Stock': request.stock,
      'Estado': request.status === 'approved' ? 'Aprobado' : 
                request.status === 'rejected' ? 'Rechazado' : 'Pendiente',
      'Comentarios': request.comments || '-'
    };
  });
}
