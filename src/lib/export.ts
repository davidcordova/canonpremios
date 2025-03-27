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

export function formatSalesForExcel(sales: any[]) {
  // Obtener lista única de empresas
  const companies = Array.from(new Set(sales.map(sale => sale.seller?.company))).filter(Boolean);
  
  // Obtener lista única de productos
  const products = Array.from(new Set(sales.flatMap(sale => 
    sale.products.map(p => p.model)
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
    sales.forEach(sale => {
      if (sale.seller?.company === company) {
        sale.products.forEach(product => {
          row[product.model] = (row[product.model] || 0) + product.quantity;
        });
      }
    });

    return row;
  });

  return data;
}

export function formatPurchasesForExcel(purchases: any[]) {
  return purchases.map(purchase => {
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

export function formatWinnersForExcel(winners: any[]) {
  return winners.map(winner => {
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

export function formatStockForExcel(records: any[]) {
  // Obtener lista única de empresas
  const companies = Array.from(new Set(records.map(record => record.seller?.company))).filter(Boolean);
  
  // Obtener lista única de productos
  const products = Array.from(new Set(records.flatMap(record => 
    record.products.map(p => p.model)
  ))).sort();

  // Crear matriz de datos
  const data = companies.map(company => {
    // Inicializar objeto con empresa
    const row: any = {
      'EMPRESA': company,
      'VENDEDOR': records.find(r => r.seller?.company === company)?.seller?.name || '',
      'FECHA': records.find(r => r.seller?.company === company)?.date || '',
      'HORA': records.find(r => r.seller?.company === company)?.time || ''
    };

    // Agregar columnas para cada producto, inicializadas en 0
    products.forEach(product => {
      row[product] = 0;
    });

    // Obtener el registro más reciente para esta empresa
    const latestRecord = records
      .filter(r => r.seller?.company === company)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (latestRecord) {
      latestRecord.products.forEach(product => {
        row[product.model] = product.currentStock;
      });
    }

    return row;
  });

  return data;
}

export function formatRewardRequestsForExcel(requests: any[]) {
  return requests.map(request => {
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