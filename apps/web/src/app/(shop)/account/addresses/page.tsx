'use client';

import { useState } from 'react';
import { Plus, Trash2, MapPin, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, type AddressFormValues } from '@/lib/validation/checkout';
import { toast } from '@/hooks/useToast';
import {
  useGetAddressesQuery,
  useAddAddressMutation,
  useRemoveAddressMutation,
  useSetDefaultAddressMutation,
} from '@/store/api/endpoints/addresses';

export default function AddressesPage() {
  const { data, isLoading } = useGetAddressesQuery();
  const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
  const [removeAddress] = useRemoveAddressMutation();
  const [setDefault] = useSetDefaultAddressMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const addresses = data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'India',
      fullName: '',
      phone: '',
      email: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
    },
  });

  const onSubmit = async (values: AddressFormValues) => {
    try {
      await addAddress({
        label: 'Home',
        ...values,
      }).unwrap();

      toast.success('Address added');
      setIsDialogOpen(false);
      reset();
    } catch (err: unknown) {
      const message =
        (err as { data?: { message?: string } })?.data?.message ||
        'Could not save address';
      toast.error(message);
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm('Delete this address?')) return;
    try {
      await removeAddress(id).unwrap();
      toast.success('Address deleted');
    } catch {
      toast.error('Could not delete address');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefault(id).unwrap();
      toast.success('Default address updated');
    } catch {
      toast.error('Could not set default');
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="heading-luxe text-2xl">Addresses</h2>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="h-10 rounded-sm bg-forest-900 px-5 text-[10px] uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800"
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Add New
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full bg-cream-200" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && addresses.length === 0 && (
        <div className="border border-forest-900/10 bg-cream-100 p-12 text-center">
          <MapPin className="mx-auto h-10 w-10 text-ink-light" strokeWidth={1} />
          <h3 className="heading-luxe mt-6 text-xl">No addresses yet</h3>
          <p className="mt-3 text-sm text-ink-soft">
            Save your shipping address for faster checkout.
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="mt-8 rounded-sm bg-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800"
          >
            Add Address
          </Button>
        </div>
      )}

      {/* Grid */}
      {!isLoading && addresses.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`relative border p-5 transition-colors ${
                addr.isDefault
                  ? 'border-forest-900 bg-cream-100'
                  : 'border-forest-900/10 bg-cream-50'
              }`}
            >
              {addr.isDefault && (
                <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-sm bg-forest-900 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-cream-100">
                  <Check className="h-2.5 w-2.5" />
                  Default
                </span>
              )}

              <p className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                {addr.label}
              </p>

              <p className="mt-2 font-medium text-forest-900">
                {addr.fullName}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{addr.phone}</p>

              <div className="mt-3 text-sm text-ink-soft">
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>
                  {addr.city}, {addr.state} {addr.postalCode}
                </p>
                <p>{addr.country}</p>
              </div>

              <div className="mt-5 flex items-center gap-3 border-t border-forest-900/10 pt-4">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr._id)}
                    className="text-[10px] uppercase tracking-[0.14em] text-forest-900 underline-offset-4 hover:underline"
                  >
                    Set as Default
                  </button>
                )}

                <button
                  onClick={() => handleRemove(addr._id)}
                  className="ml-auto text-ink-muted transition-colors hover:text-red-600"
                  aria-label="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg rounded-sm border-forest-900/10 bg-cream-100 p-0">
          <DialogHeader className="border-b border-forest-900/10 px-6 py-5">
            <DialogTitle className="heading-luxe text-xl">
              Add Address
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-h-[70vh] overflow-y-auto px-6 py-6"
          >
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em]">
                  Full Name
                </Label>
                <Input
                  {...register('fullName')}
                  className="h-11 rounded-sm border-forest-900/20 bg-cream-50"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em]">
                    Phone
                  </Label>
                  <Input
                    {...register('phone')}
                    className="h-11 rounded-sm border-forest-900/20 bg-cream-50"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em]">
                    Email
                  </Label>
                  <Input
                    {...register('email')}
                    className="h-11 rounded-sm border-forest-900/20 bg-cream-50"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em]">
                  Address Line 1
                </Label>
                <Input
                  {...register('line1')}
                  className="h-11 rounded-sm border-forest-900/20 bg-cream-50"
                />
                {errors.line1 && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.line1.message}
                  </p>
                )}
              </div>

              <div>
                <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em]">
                  Address Line 2 (optional)
                </Label>
                <Input
                  {...register('line2')}
                  className="h-11 rounded-sm border-forest-900/20 bg-cream-50"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em]">
                    City
                  </Label>
                  <Input
                    {...register('city')}
                    className="h-11 rounded-sm border-forest-900/20 bg-cream-50"
                  />
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em]">
                    State
                  </Label>
                  <Input
                    {...register('state')}
                    className="h-11 rounded-sm border-forest-900/20 bg-cream-50"
                  />
                  {errors.state && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.state.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em]">
                    Postal Code
                  </Label>
                  <Input
                    {...register('postalCode')}
                    className="h-11 rounded-sm border-forest-900/20 bg-cream-50"
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.postalCode.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-[10px] uppercase tracking-[0.14em]">
                  Country
                </Label>
                <Input
                  {...register('country')}
                  className="h-11 rounded-sm border-forest-900/20 bg-cream-50"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="h-12 flex-1 rounded-sm border-forest-900/20 text-xs uppercase tracking-[0.18em]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="h-12 flex-1 rounded-sm bg-forest-900 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800 disabled:opacity-50"
              >
                {isAdding ? 'Saving…' : 'Save Address'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
