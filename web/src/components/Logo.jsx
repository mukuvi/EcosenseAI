import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Logo({ className, tone = 'dark', compact = false }) {
  return (
    <Link to="/" className={cn('group inline-flex items-center gap-2.5', className)} aria-label="EcoSense AI home">
      <span
        className={cn(
          'grid h-8 w-8 place-items-center rounded-md transition-transform duration-200 group-hover:-rotate-3',
          tone === 'light' ? 'bg-white' : 'bg-ink'
        )}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M19 5c0 8.5-5.2 13-11.4 13H5c0-7.6 4.8-13 11.4-13H19Z"
            className={tone === 'light' ? 'fill-ink' : 'fill-white'}
          />
          <path
            d="M4.5 19.5C8 14.7 11.4 11.9 16 10"
            stroke={tone === 'light' ? '#C4EF5E' : '#C4EF5E'}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {!compact && (
        <span
          className={cn(
            'text-[15px] font-semibold tracking-[-0.01em]',
            tone === 'light' ? 'text-white' : 'text-ink'
          )}
        >
          EcoSense<span className={tone === 'light' ? 'text-white/50' : 'text-ink-muted'}> AI</span>
        </span>
      )}
    </Link>
  );
}
