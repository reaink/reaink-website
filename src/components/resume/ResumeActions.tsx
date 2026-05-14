import { useEffect, useState } from 'react';
import { LoaderCircle, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ResumeActionState = 'idle' | 'printing';

interface ResumeActionsProps {
  targetId?: string;
}
export default function ResumeActions({ targetId }: ResumeActionsProps) {
  const [actionState, setActionState] = useState<ResumeActionState>('idle');

  useEffect(() => {
    const handleAfterPrint = () => {
      setActionState('idle');
    };

    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const handlePrint = () => {
    setActionState('printing');
    window.print();
  };

  const isBusy = actionState !== 'idle';

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={handlePrint} disabled={isBusy}>
          {actionState === 'printing' ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <Printer className="h-4 w-4" />
          )}
          打印 / 另存为 PDF
        </Button>
      </div>
    </div>
  );
}