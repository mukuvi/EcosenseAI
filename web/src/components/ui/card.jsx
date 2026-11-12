import { forwardRef } from 'react';
import { cn } from '../../lib/utils';

const Card = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('rounded-xl border border-line bg-white', className)} {...props} />
));

const CardHeader = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex flex-col gap-1 p-5 sm:p-6', className)} {...props} />
));

const CardTitle = forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn('text-[15px] font-semibold tracking-tight', className)} {...props} />
));

const CardDescription = forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm leading-relaxed text-ink-muted', className)} {...props} />
));

const CardContent = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props} />
));

const CardFooter = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center p-5 pt-0 sm:p-6 sm:pt-0', className)} {...props} />
));

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardTitle.displayName = 'CardTitle';
CardDescription.displayName = 'CardDescription';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
