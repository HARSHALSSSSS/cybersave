import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCircle2, Download, ShieldOff, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onVerifyAll: () => void;
  onExportSelected: () => void;
  onSendNotification: () => void;
  onBlockSelected: () => void;
}

export function BulkActionBar({
  selectedCount,
  onClear,
  onVerifyAll,
  onExportSelected,
  onSendNotification,
  onBlockSelected,
}: BulkActionBarProps) {
  return (
    <AnimatePresence>
      {selectedCount > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4"
        >
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-3 shadow-xl shadow-gray-900/10">
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              <X className="h-3.5 w-3.5" />
              {selectedCount} selected
            </button>
            <div className="h-5 w-px bg-gray-200" />
            <Button variant="outline" size="sm" onClick={onVerifyAll} className="gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Verify All
            </Button>
            <Button variant="outline" size="sm" onClick={onExportSelected} className="gap-1.5">
              <Download className="h-4 w-4" />
              Export Selected
            </Button>
            <Button variant="outline" size="sm" onClick={onSendNotification} className="gap-1.5">
              <Bell className="h-4 w-4" />
              Send Notification
            </Button>
            <Button variant="destructive" size="sm" onClick={onBlockSelected} className="gap-1.5">
              <ShieldOff className="h-4 w-4" />
              Block Selected
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
