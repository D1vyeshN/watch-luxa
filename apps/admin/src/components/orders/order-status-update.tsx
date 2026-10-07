'use client';

import { useState } from 'react';
import { useCustomMutation, useInvalidate } from '@refinedev/core';
import { toast } from 'sonner';
import { Loader2, Truck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ORDER_TRANSITIONS, type Order, type OrderStatus } from '@/types/order';

interface OrderStatusUpdateProps {
  order: Order;
}

// Irreversible and they touch stock / money — ask first
const CONFIRM_COPY: Partial<Record<OrderStatus, { title: string; body: string }>> = {
  cancelled: {
    title: 'Cancel this order?',
    body: 'Stock for every item goes back to inventory. This cannot be undone.',
  },
  refunded: {
    title: 'Mark this order as refunded?',
    body:
      'This records the refund only — it does not move money. Issue the refund in your Stripe / Razorpay dashboard first. If the order has not shipped, stock goes back to inventory.',
  },
};

export function OrderStatusUpdate({ order }: OrderStatusUpdateProps) {
  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber ?? '');
  const [carrier, setCarrier] = useState(order.carrier ?? '');
  const [note, setNote] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  // dataProvider.update would PUT /admin/orders/:id, which doesn't exist —
  // status changes go through the dedicated PATCH /:id/status endpoint
  const { mutateAsync, mutation } = useCustomMutation<Order>();
  const invalidate = useInvalidate();

  const isPending = mutation.isPending;
  const allowedStatuses = ORDER_TRANSITIONS[order.orderStatus] ?? [];

  const submit = async () => {
    if (!newStatus) return;
    setConfirmOpen(false);

    const values: Record<string, string> = { status: newStatus };
    if (note.trim()) values.note = note.trim();
    if (newStatus === 'shipped') {
      values.trackingNumber = trackingNumber.trim();
      if (carrier.trim()) values.carrier = carrier.trim();
    }

    try {
      await mutateAsync({
        url: `/admin/orders/${order._id}/status`,
        method: 'patch',
        values,
        errorNotification: false,
      });
      toast.success(`Order marked as ${newStatus}`);
      setNewStatus('');
      setNote('');
      // Custom mutations don't invalidate by themselves
      await invalidate({
        resource: 'orders',
        id: order._id,
        invalidates: ['list', 'detail'],
      });
    } catch (err) {
      toast.error((err as Error)?.message || 'Failed to update order status');
    }
  };

  const handleUpdate = () => {
    if (!newStatus) return;
    if (newStatus === 'shipped' && !trackingNumber.trim()) {
      toast.error('Tracking number is required to mark as shipped');
      return;
    }
    if (CONFIRM_COPY[newStatus]) {
      setConfirmOpen(true);
      return;
    }
    submit();
  };

  if (allowedStatuses.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        This order is {order.orderStatus}. No further status changes are possible.
      </div>
    );
  }

  const confirm = newStatus ? CONFIRM_COPY[newStatus] : undefined;

  return (
    <div className="space-y-4">
      {/* ─── Status picker ─── */}
      <div>
        <Label className="mb-2 block text-xs uppercase tracking-[0.14em]">
          Update Status
        </Label>
        <Select
          value={newStatus}
          onValueChange={(v) => setNewStatus(v as OrderStatus)}
        >
          <SelectTrigger className="w-full capitalize">
            <SelectValue placeholder="Select new status" />
          </SelectTrigger>
          <SelectContent>
            {allowedStatuses.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ─── Tracking fields (shown when shipping) ─── */}
      {newStatus === 'shipped' && (
        <div className="space-y-3 rounded-md border border-border bg-muted/20 p-4">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Truck className="h-3.5 w-3.5" />
            Shipping Details
          </div>
          <div>
            <Label htmlFor="trackingNumber" className="mb-1.5 block text-xs">
              Tracking Number *
            </Label>
            <Input
              id="trackingNumber"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="BLR123456789"
              maxLength={50}
              className="h-9"
            />
          </div>
          <div>
            <Label htmlFor="carrier" className="mb-1.5 block text-xs">
              Carrier
            </Label>
            <Input
              id="carrier"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="BlueDart"
              maxLength={50}
              className="h-9"
            />
          </div>
        </div>
      )}

      {/* ─── Optional note (shown on the timeline) ─── */}
      {newStatus && (
        <div>
          <Label htmlFor="statusNote" className="mb-1.5 block text-xs">
            Note <span className="text-muted-foreground">(optional, shown in activity)</span>
          </Label>
          <Textarea
            id="statusNote"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={2}
            className="text-sm"
          />
        </div>
      )}

      {/* ─── Submit ─── */}
      <Button
        onClick={handleUpdate}
        disabled={!newStatus || isPending}
        className="w-full"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Update Status
      </Button>

      {/* ─── Confirm destructive transitions ─── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirm?.title}</DialogTitle>
            <DialogDescription>{confirm?.body}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Keep order
            </Button>
            <Button variant="destructive" onClick={submit}>
              {newStatus === 'cancelled' ? 'Cancel order' : 'Mark refunded'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
