import { View } from 'react-native';
import { FileText, Presentation, Sheet } from 'lucide-react-native';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { exportPPT, exportPDF, exportExcel } from '@/lib/export';
import type { Counsellor, Feedback } from '@/types';

export function ExportToolbar({ items, counsellor }: { items: Feedback[]; counsellor?: Counsellor }) {
  return (
    <View className="flex-row flex-wrap gap-2">
      <Button variant="outline" size="sm" className="flex-row items-center gap-2" onPress={() => exportPPT(items, counsellor)}>
        <Presentation size={16} className="text-primary" />
        <Text>PPT</Text>
      </Button>
      <Button variant="outline" size="sm" className="flex-row items-center gap-2" onPress={() => exportPDF(items, counsellor)}>
        <FileText size={16} className="text-primary" />
        <Text>PDF</Text>
      </Button>
      <Button variant="outline" size="sm" className="flex-row items-center gap-2" onPress={() => exportExcel(items, counsellor)}>
        <Sheet size={16} className="text-primary" />
        <Text>Excel</Text>
      </Button>
    </View>
  );
}
