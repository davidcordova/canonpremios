import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { exportChartToPDF, exportToExcel } from '@/lib/export';

interface ExportButtonsProps {
  chartRef?: React.RefObject<HTMLDivElement>;
  data: any[];
  chartTitle?: string;
  recordsFilename: string;
  formatForExcel: (data: any[], dateRange?: { from?: Date; to?: Date }) => any[];
  dateRange?: { from?: Date; to?: Date };
}

export function ExportButtons({ 
  chartRef, 
  data, 
  chartTitle, 
  recordsFilename,
  formatForExcel,
  dateRange 
}: ExportButtonsProps) {
  const handleExportPDF = async () => {
    if (chartRef?.current) {
      await exportChartToPDF(chartRef.current, chartTitle || 'Gráfico');
    }
  };

  const handleExportExcel = () => {
    const formattedData = formatForExcel(data, dateRange);
    exportToExcel(formattedData, recordsFilename);
  };

  return (
    <div className="flex gap-2">
      {chartRef && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          className="flex items-center gap-2"
        >
          <FileDown className="h-4 w-4" />
          Exportar Gráfico (PDF)
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportExcel}
        className="flex items-center gap-2"
      >
        <FileDown className="h-4 w-4" />
        Exportar Registros (Excel)
      </Button>
    </div>
  );
}
