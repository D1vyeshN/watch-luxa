'use client';

import Link from 'next/link';
import { ArrowRight, Package, Heart, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice, formatDate } from '@/lib/format';
import { ROUTES } from '@/constants/routes';
import { useGetMyOrdersQuery } from '@/store/api/endpoints/orders';
import { useGetWishlistQuery } from '@/store/api/endpoints/wishlist';
import { useGetAddressesQuery } from '@/store/api/endpoints/addresses';

export default function AccountOverviewPage() {
  const { user } = useAuth();
  const { data: ordersData } = useGetMyOrdersQuery({ limit: 3 });
  const { data: wishlistData } = useGetWishlistQuery();
  const { data: addressData } = useGetAddressesQuery();

  const recentOrders = ordersData?.data ?? [];
  const wishlistCount = wishlistData?.data.count ?? 0;
  const addressCount = addressData?.data.length ?? 0;
  const totalOrders = ordersData?.pagination.total ?? 0;

  return (
    <div className="space-y-12">
      {/* Greeting */}
      <div>
        <h2 className="heading-luxe text-3xl">
          Welcome back, {user?.name?.split(' ')[0]}.
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Manage your orders, saved pieces, and preferences.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatTile
          icon={<Package className="h-5 w-5" />}
          label="Orders"
          value={totalOrders}
          href={ROUTES.accountOrders}
        />
        <StatTile
          icon={<Heart className="h-5 w-5" />}
          label="Wishlist"
          value={wishlistCount}
          href={ROUTES.wishlist}
        />
        <StatTile
          icon={<MapPin className="h-5 w-5" />}
          label="Addresses"
          value={addressCount}
          href={ROUTES.accountAddresses}
        />
      </div>

      {/* Recent orders */}
      <div>
        <div className="mb-6 flex items-end justify-between">
          <h3 className="heading-luxe text-xl">Recent Orders</h3>
          {recentOrders.length > 0 && (
            <Link
              href={ROUTES.accountOrders}
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-forest-900 underline-offset-4 hover:underline"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="border border-forest-900/10 bg-cream-100 p-10 text-center">
            <Package className="mx-auto h-8 w-8 text-ink-light" />
            <p className="mt-4 text-sm text-ink-soft">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href={ROUTES.shop}
              className="mt-6 inline-flex items-center justify-center rounded-sm bg-forest-900 px-6 py-3 text-xs uppercase tracking-[0.18em] text-cream-100 hover:bg-forest-800"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="border-t border-forest-900/10">
            {recentOrders.map((order) => (
              <Link
                key={order._id}
                href={ROUTES.accountOrder(order.orderNumber)}
                className="grid grid-cols-2 items-center gap-4 border-b border-forest-900/10 py-5 transition-colors hover:bg-cream-100 md:grid-cols-4"
              >
                <div className="col-span-2 md:col-span-1">
                  <p className="font-mono text-sm text-forest-900">
                    {order.orderNumber}
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {formatDate(order.createdAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                    Status
                  </p>
                  <p className="mt-0.5 text-sm capitalize text-forest-900">
                    {order.orderStatus}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                    Total
                  </p>
                  <p className="mt-0.5 text-sm text-forest-900">
                    {formatPrice(order.total)}
                  </p>
                </div>

                <div className="flex justify-end">
                  <ArrowRight className="h-4 w-4 text-ink-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group border border-forest-900/10 bg-cream-100 p-6 transition-all duration-300 hover:border-forest-900/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-900 text-cream-100">
          {icon}
        </div>
        <ArrowRight className="h-4 w-4 text-ink-muted transition-transform duration-300 group-hover:translate-x-1" />
      </div>
      <p className="mt-6 text-3xl font-serif text-forest-900">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
        {label}
      </p>
    </Link>
  );
}
