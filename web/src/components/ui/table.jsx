import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Table = forwardRef(({ className, ...props }, ref) => (
  <div className="w-full overflow-x-auto">
    <table ref={ref} className={cn('w-full min-w-[720px] caption-bottom text-left text-sm', className)} {...props} />
  </div>
));

const TableHeader = forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('border-b border-ink/10 bg-ink/[0.02]', className)} {...props} />
));

const TableBody = forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn('divide-y divide-ink/[0.06]', className)} {...props} />
));

const TableRow = forwardRef(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn('transition-colors hover:bg-primary-50/40', className)} {...props} />
));

const TableHead = forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn('h-11 whitespace-nowrap px-5 text-[12px] font-semibold uppercase tracking-wide text-ink-muted', className)}
    {...props}
  />
));

const TableCell = forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn('px-5 py-4 align-middle', className)} {...props} />
));

Table.displayName = 'Table';
TableHeader.displayName = 'TableHeader';
TableBody.displayName = 'TableBody';
TableRow.displayName = 'TableRow';
TableHead.displayName = 'TableHead';
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
