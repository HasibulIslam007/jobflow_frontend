'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BriefcaseIcon,
  BuildingIcon,
  SearchIcon,
  SparklesIcon,
  TagIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from 'cn';

type SearchScope = {
  id: 'jobs' | 'companies' | 'skills';
  label: string;
  hint: string;
  icon: typeof SearchIcon;
};

const SCOPES: SearchScope[] = [
  { id: 'jobs', label: 'Jobs', hint: 'Role, title or description', icon: BriefcaseIcon },
  { id: 'companies', label: 'Companies', hint: 'Employer name', icon: BuildingIcon },
  { id: 'skills', label: 'Skills', hint: 'Technology or keyword', icon: TagIcon },
];

/**
 * Global search — UI only.
 *
 * Deliberately does NOT query the API yet. It models the intended shape:
 * scope chips, a debounce-friendly input, and a result well ready to
 * receive real rows once the search endpoint lands. No mock results are
 * rendered — fabricated hits in a search box are actively harmful.
 */
function GlobalSearchDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<SearchScope['id']>('jobs');
  const inputRef = useRef<HTMLInputElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const trimmed = query.trim();

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-background/70 backdrop-blur-sm"
      />

      <motion.div
        className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border bg-popover shadow-pop"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <SearchIcon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search jobs, companies or skills…"
            aria-label="Search"
            className="w-full bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 text-micro text-muted-foreground sm:block">
            Esc
          </kbd>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-border px-4 py-2.5">
          {SCOPES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setScope(item.id)}
              aria-pressed={scope === item.id}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-caption font-medium transition-colors duration-200',
                scope === item.id
                  ? 'border-ai/30 bg-ai/10 text-ai'
                  : 'border-border text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <item.icon aria-hidden="true" className="size-3.5" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="px-4 py-8 text-center">
          <span
            aria-hidden="true"
            className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl border border-border bg-card text-muted-foreground"
          >
            <SparklesIcon className="size-4" />
          </span>
          <p className="text-sm font-medium text-foreground">
            {trimmed ? 'Search is not connected yet' : 'Search across your workspace'}
          </p>
          <p className="mt-1 text-caption text-muted-foreground">
            {trimmed
              ? 'Indexing is coming soon — your data is safe.'
              : SCOPES.find((item) => item.id === scope)?.hint}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Topbar search trigger + ⌘K / Ctrl+K dialog.
 */
function GlobalSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        aria-label="Search (Command K)"
        className="relative hidden gap-2 px-2.5 text-muted-foreground md:inline-flex"
      >
        <SearchIcon />
        <span className="pr-6">Search…</span>
        <kbd className="pointer-events-none absolute right-2 hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-micro text-muted-foreground lg:block">
          ⌘K
        </kbd>
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="md:hidden"
      >
        <SearchIcon />
      </Button>

      <AnimatePresence>
        {open ? <GlobalSearchDialog onClose={() => setOpen(false)} /> : null}
      </AnimatePresence>
    </>
  );
}

export { GlobalSearch, GlobalSearchDialog };

