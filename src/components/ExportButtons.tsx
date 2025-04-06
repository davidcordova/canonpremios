import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { exportChartToPDF, exportToExcel } from '@/lib/export';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface ExportButtonsProps {
  chartRef?: React.RefObject<HTMLDivElement>;
  data: any[]; // Changed from { [key: string]: string }[] to any[]
  chartTitle?: string;
  recordsFilename: string;
  // Changed input type from { [key: string]: string }[] to any[]
  formatForExcel: (data: any[], dateRange?: DateRange) => { [key: string]: string }[]; 
  dateRange?: DateRange;
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
