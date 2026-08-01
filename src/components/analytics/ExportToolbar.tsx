import { Download, Presentation, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExportToolbarProps {
  onExport: (format: 'ppt' | 'pdf' | 'excel') => void;
}

export function ExportToolbar({ onExport }: ExportToolbarProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm shadow-black/5">
      <div className="flex items-center gap-2 px-1 text-sm font-semibold text-foreground">
        <Download className="h-4 w-4 text-accent" />
        Export Report
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={() => onExport('ppt')}
        >
          <Presentation className="h-4 w-4" />
          PPT
        </Button>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => onExport('pdf')}>
          <FileText className="h-4 w-4" />
          PDF
        </Button>
        <Button size="sm" variant="outline" className="gap-2" onClick={() => onExport('excel')}>
          <FileSpreadsheet className="h-4 w-4" />
          Excel
        </Button>
      </div>
    </div>
  );
}
