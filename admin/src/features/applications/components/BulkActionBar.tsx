import { AnimatePresence, motion } from 'framer-motion';
import { CheckCheck, TrendingUp, UserCog, X } from 'lucide-react';
import { Button } from '@/components/ui';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onBatchAssign: () => void;
  onEscalate: () => void;
  onBulkApprove: () => void;
}

export function BulkActionBar({ selectedCount, onClear, onBatchAssign, onEscalate, onBulkApprove }: BulkActionBarProps) {
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
            <Button variant="outline" size="sm" onClick={onBatchAssign} className="gap-1.5">
              <UserCog className="h-4 w-4" />
              Batch Assign
            </Button>
            <Button variant="outline" size="sm" onClick={onEscalate} className="gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Escalate
            </Button>
            <Button size="sm" onClick={onBulkApprove} className="gap-1.5 bg-[#2563EB] hover:bg-blue-700">
              <CheckCheck className="h-4 w-4" />
              Bulk Approve
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
