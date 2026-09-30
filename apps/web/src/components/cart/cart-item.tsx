'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, X } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { ROUTES } from '@/constants/routes';
import type { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onNavigate?: () => void;
}

export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  onNavigate,
}: CartItemProps) {
  const atMaxStock = item.quantity >= item.stock;

  return (
    <div className="flex gap-4 border-b border-forest-900/10 py-5 last:border-0">
      {/* Image */}
      <Link
        href={ROUTES.product(item.productSlug)}
        onClick={onNavigate}
        className="relative h-24 w-20 shrink-0 overflow-hidden bg-cream-200"
      >
        <Image
          src={item.image}
          alt={item.productName}
          fill
          sizes="80px"
          className="object-cover"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <Link
            href={ROUTES.product(item.productSlug)}
            onClick={onNavigate}
            className="font-serif text-sm text-forest-900 transition-colors hover:text-cream-600"
          >
            {item.productName}
          </Link>

          <p className="mt-1 text-xs text-ink-muted">{item.variantLabel}</p>

          {item.issues && item.issues.length > 0 && (
            <p className="mt-1 text-xs text-red-600">{item.issues[0]}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          {/* Quantity stepper */}
          <div className="flex items-center border border-forest-900/20">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </button>

            <span className="min-w-6 text-center text-xs">
              {item.quantity}
            </span>

            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              disabled={atMaxStock}
              className="flex h-7 w-7 items-center justify-center transition-colors hover:bg-cream-200 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          {/* Line total */}
          <span className="text-sm font-medium text-forest-900">
            {formatPrice(item.lineTotal)}
          </span>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={() => onRemove(item.id)}
        className="self-start text-ink-muted transition-colors hover:text-forest-900"
        aria-label="Remove item"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
