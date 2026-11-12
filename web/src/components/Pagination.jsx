import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
      <p className="text-sm text-ink-muted">
        Page <span className="font-medium text-ink">{page}</span> of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}>
          <ChevronLeft className="h-3.5 w-3.5" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
