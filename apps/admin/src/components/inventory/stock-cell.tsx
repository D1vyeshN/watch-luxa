'use client';

import { useState, useEffect, useRef } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/format/currency';

interface StockCellProps {
  stock: number;
  lowStockThreshold: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  isSaving: boolean;
  onSave: (newStock: number) => Promise<void>;
}

export function StockCell({
  stock,
  isLowStock,
  isOutOfStock,
  isSaving,
  onSave,
}: StockCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(stock));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(String(stock));
  }, [stock]);

  // Enter, blur and the check button can all fire save — only the first counts.
  // Also stops a blur during Escape/unmount from saving a cancelled edit.
  const busyRef = useRef(false);

  const handleStartEdit = () => {
    busyRef.current = false;
    setIsEditing(true);
    setEditValue(String(stock));
  };

  const handleSave = async () => {
    if (busyRef.current) return;
    busyRef.current = true;

    const parsed = parseInt(editValue, 10);
    if (isNaN(parsed) || parsed < 0 || parsed === stock) {
      setIsEditing(false);
      return;
    }
    try {
      await onSave(parsed);
      setIsEditing(false);
    } catch {
      // Parent already toasted the error — stay in edit mode so the user can retry
      busyRef.current = false;
      inputRef.current?.focus();
    }
  };

  const handleCancel = () => {
    busyRef.current = true;
    setIsEditing(false);
    setEditValue(String(stock));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // ─── Editing state ───
  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          className="h-7 w-16 rounded border border-primary bg-background px-2 text-sm tabular-nums outline-none"
        />
        {isSaving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        ) : (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleSave}
            className="text-green-600"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  }

  // ─── Display state ───
  return (
    <button
      type="button"
      onClick={handleStartEdit}
      className={cn(
        'flex items-center gap-2 rounded px-2 py-1 text-sm tabular-nums transition-colors hover:bg-muted',
        isOutOfStock && 'text-red-600 dark:text-red-400',
        isLowStock && 'text-amber-700 dark:text-amber-400'
      )}
      title="Click to edit stock"
    >
      <span>{formatNumber(stock)}</span>
      {isOutOfStock && (
        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-800 dark:bg-red-950 dark:text-red-400">
          Out
        </span>
      )}
      {isLowStock && !isOutOfStock && (
        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-400">
          Low
        </span>
      )}
    </button>
  );
}