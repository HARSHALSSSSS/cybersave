import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ApplyActionBarProps = {
  onPrevious?: () => void;
  onSaveDraft?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  previousLabel?: string;
  loading?: boolean;
  showPrevious?: boolean;
  showSaveDraft?: boolean;
  showNext?: boolean;
};

export function ApplyActionBar({
  onPrevious,
  onSaveDraft,
  onNext,
  nextLabel = 'Next Step',
  previousLabel = 'Previous Step',
  loading = false,
  showPrevious = true,
  showSaveDraft = true,
  showNext = true,
}: ApplyActionBarProps) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E7EB] pt-6">
      <div className="flex flex-wrap gap-3">
        {showPrevious && onPrevious ? (
          <Button type="button" variant="outline" onClick={onPrevious} disabled={loading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {previousLabel}
          </Button>
        ) : (
          <div />
        )}
        {showSaveDraft && onSaveDraft ? (
          <Button type="button" variant="outline" className="border-[#2563EB] text-[#2563EB]" onClick={onSaveDraft} disabled={loading}>
            Save as Draft
          </Button>
        ) : null}
      </div>
      {showNext && onNext ? (
        <Button type="button" onClick={onNext} disabled={loading}>
          {loading ? 'Please wait…' : nextLabel}
          {!loading ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
        </Button>
      ) : null}
    </div>
  );
}
