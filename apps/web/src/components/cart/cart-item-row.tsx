'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/format/price';
import { ROUTES } from '@/constants/routes';
import type { CartItem as CartItemType } from '@/types/cart';

interface CartItemRowProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  isUpdating?: boolean;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  isUpdating = false,
}: CartItemRowProps) {
  const atMaxStock = item.quantity >= item.stock;

  return (
    <div
      className={cn(
        'grid grid-cols-[80px_1fr] gap-4 border-b border-forest-900/10 py-6 md:grid-cols-[120px_1fr_auto] md:gap-6',
        isUpdating && 'opacity-60'
      )}
    >
      {/* Image */}
      <Link
        href={ROUTES.product(item.productSlug)}
        className="relative aspect-square overflow-hidden bg-cream-200"
      >
        <Image
          src={item.image}
          alt={item.productName}
          fill
          sizes="120px"
          className="object-cover"
        />
      </Link>

      {/* Details */}
      <div className="flex flex-col justify-between">
        <div>
          <Link
            href={ROUTES.product(item.productSlug)}
            className="heading-luxe text-lg transition-colors hover:text-cream-700 md:text-xl"
          >
            {item.productName}
          </Link>

          <p className="mt-1 text-xs text-ink-muted">{item.variantLabel}</p>

          <p className="mt-1 text-xs text-ink-muted">
            SKU: <span className="text-forest-900">{item.sku}</span>
          </p>

          {item.issues && item.issues.length > 0 && (
            <div className="mt-2 border border-amber-300 bg-amber-50 px-2 py-1">
              <p className="text-xs text-amber-900">{item.issues[0]}</p>
            </div>
          )}

          {item.priceChanged && (
            <p className="mt-2 text-xs text-amber-700">
              Price has changed from {formatPrice(item.priceAtAdd)} to{' '}
              {formatPrice(item.price)}
            </p>
          )}
        </div>

        {/* Mobile: quantity + price stacked below */}
        <div className="mt-4 flex items-center justify-between md:hidden">
          <QuantityStepper
            quantity={item.quantity}
            max={item.stock}
            onUpdate={(q) => onUpdateQuantity(item.id, q)}
            disabled={isUpdating}
          />
          <span className="font-medium text-forest-900">
            {formatPrice(item.lineTotal)}
          </span>
        </div>
      </div>

      {/* Desktop: quantity + line total + remove */}
      <div className="hidden flex-col items-end justify-between md:flex">
        <div className="flex items-center gap-6">
          <QuantityStepper
            quantity={item.quantity}
            max={item.stock}
            onUpdate={(q) => onUpdateQuantity(item.id, q)}
            disabled={isUpdating}
          />

          <span className="min-w-[100px] text-right font-medium text-forest-900">
            {formatPrice(item.lineTotal)}
          </span>

          <button
            onClick={() => onRemove(item.id)}
            disabled={isUpdating}
            className="text-ink-muted transition-colors hover:text-forest-900 disabled:opacity-50"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile-visible remove on desktop too */}
        <div className="mt-6">
          <p className="text-xs text-ink-muted">
            {formatPrice(item.price)} each
          </p>
        </div>
      </div>
    </div>
  );
}

function QuantityStepper({
  quantity,
  max,
  onUpdate,
  disabled,
}: {
  quantity: number;
  max: number;
  onUpdate: (q: number) => void;
  disabled?: boolean;
}) {
  const atMax = quantity >= max;
  const atMin = quantity <= 1;

  return (
    <div className="flex items-center border border-forest-900/20">
      <button
        onClick={() => !atMin && !disabled && onUpdate(quantity - 1)}
        disabled={atMin || disabled}
        className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3 w-3" />
      </button>

      <span className="min-w-8 text-center text-sm font-medium">
        {quantity}
      </span>

      <button
        onClick={() => !atMax && !disabled && onUpdate(quantity + 1)}
        disabled={atMax || disabled}
        className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Increase quantity"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}
