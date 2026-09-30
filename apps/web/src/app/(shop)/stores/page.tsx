import type { Metadata } from 'next';
import { Container } from '@/components/shared/container';
import { PageHero } from '@/components/content';

export const metadata: Metadata = {
  title: 'Stores',
  description: 'Visit a LUXE studio.',
};

const STORES = [
  {
    city: 'Bangalore',
    address: '42 MG Road, Bangalore 560001',
    phone: '+91 80 4000 1234',
    hours: 'Mon–Sat, 10am–8pm',
    isFlagship: true,
  },
  {
    city: 'Mumbai',
    address: 'Level 2, Palladium Mall, Lower Parel, Mumbai 400013',
    phone: '+91 22 4000 5678',
    hours: 'Mon–Sun, 11am–9pm',
  },
  {
    city: 'Delhi',
    address: 'The Chanakya, Chanakyapuri, New Delhi 110021',
    phone: '+91 11 4000 9012',
    hours: 'Mon–Sun, 11am–9pm',
  },
];

export default function StoresPage() {
  return (
    <>
      <PageHero
        overline="Visit Us"
        title="Our Studios"
        subtitle="Three locations across India. Every visit is by appointment to ensure a private, unhurried experience."
      />

      <Container className="py-12 md:py-20">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {STORES.map((store) => (
            <div
              key={store.city}
              className="border border-forest-900/10 bg-cream-100 p-6"
            >
              {store.isFlagship && (
                <span className="inline-block rounded-sm bg-cream-600 px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-forest-900">
                  Flagship
                </span>
              )}

              <h2 className="heading-luxe mt-4 text-2xl">
                {store.city}
              </h2>

              <dl className="mt-6 space-y-3 text-sm">
                <div>
                  <dt className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                    Address
                  </dt>
                  <dd className="mt-1 text-ink-soft">{store.address}</dd>
                </div>

                <div>
                  <dt className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                    Hours
                  </dt>
                  <dd className="mt-1 text-ink-soft">{store.hours}</dd>
                </div>

                <div>
                  <dt className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                    Phone
                  </dt>
                  <dd className="mt-1 text-ink-soft">{store.phone}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </Container>
    </>
  );
}
