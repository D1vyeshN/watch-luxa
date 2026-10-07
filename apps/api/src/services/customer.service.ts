import { PipelineStage, Types } from 'mongoose';
import { Order } from '@models/order.model';
import { NotFoundError } from '@utils/AppError';
import { escapeRegex } from '@utils/regex';

// Customers aren't a collection — they're derived from orders. A registered
// customer is keyed by userId; a guest by their (lowercased) email.
// Only orders that were actually paid (incl. later refunded) count as activity,
// so abandoned checkouts don't create "customers".
const PAID_STATUSES = ['paid', 'refunded'];

export const CUSTOMER_SORT_FIELDS = [
  'totalSpend',
  'orderCount',
  'lastOrderAt',
  'firstOrderAt',
  'name',
] as const;
export type CustomerSortField = (typeof CUSTOMER_SORT_FIELDS)[number];

const OBJECT_ID = /^[a-f\d]{24}$/i;

// `$userId` may be missing entirely on guest orders. `$toString` of a missing
// field is null, so `$ifNull` falls through to the email.
const CUSTOMER_KEY = {
  $ifNull: [
    { $toString: '$userId' },
    { $toLower: { $ifNull: ['$guestEmail', '$shippingAddress.email'] } },
  ],
};

export class CustomerService {
  async list(options: {
    skip: number;
    limit: number;
    sortBy: CustomerSortField;
    sortOrder: 1 | -1;
    search?: string;
  }) {
    const match: Record<string, unknown> = {
      paymentStatus: { $in: PAID_STATUSES },
    };

    if (options.search) {
      const regex = new RegExp(escapeRegex(options.search), 'i');
      match.$or = [
        { guestEmail: regex },
        { 'shippingAddress.email': regex },
        { 'shippingAddress.fullName': regex },
      ];
    }

    const pipeline: PipelineStage[] = [
      { $match: match },
      // Oldest first, so $last picks the most recent name/address
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: CUSTOMER_KEY,
          userId: { $first: '$userId' },
          name: { $last: '$shippingAddress.fullName' },
          email: { $last: { $ifNull: ['$guestEmail', '$shippingAddress.email'] } },
          phone: { $last: '$shippingAddress.phone' },
          city: { $last: '$shippingAddress.city' },
          country: { $last: '$shippingAddress.country' },
          orderCount: { $sum: 1 },
          // Refunded money isn't spend
          totalSpend: {
            $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0] },
          },
          lastOrderAt: { $max: '$createdAt' },
          firstOrderAt: { $min: '$createdAt' },
        },
      },
      // _id tiebreaker keeps pagination stable when sort values are equal
      { $sort: { [options.sortBy]: options.sortOrder, _id: 1 } },
      {
        $facet: {
          data: [{ $skip: options.skip }, { $limit: options.limit }],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await Order.aggregate(pipeline);

    const data = (result?.data ?? []).map((c: Record<string, unknown>) => ({
      id: c._id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      city: c.city,
      country: c.country,
      orderCount: c.orderCount,
      totalSpend: c.totalSpend,
      lastOrderAt: c.lastOrderAt,
      firstOrderAt: c.firstOrderAt,
      isGuest: !c.userId,
    }));

    return { data, total: result?.total?.[0]?.count ?? 0 };
  }

  /**
   * One customer by userId or guest email. Stats cover paid orders; the
   * history lists every order (incl. unpaid) since support needs to see those.
   */
  async getOne(customerId: string) {
    const match = OBJECT_ID.test(customerId)
      ? { userId: new Types.ObjectId(customerId) }
      : {
          userId: { $exists: false },
          $or: [
            { guestEmail: customerId.toLowerCase() },
            { guestEmail: { $exists: false }, 'shippingAddress.email': customerId.toLowerCase() },
          ],
        };

    const orders = await Order.find(match)
      .sort({ createdAt: -1 })
      .select('orderNumber orderStatus paymentStatus total createdAt shippingAddress guestEmail userId items')
      .lean();

    const paid = orders.filter((o) => PAID_STATUSES.includes(o.paymentStatus));
    if (paid.length === 0) throw new NotFoundError('Customer not found');

    const latest = paid[0];

    return {
      id: customerId,
      name: latest.shippingAddress.fullName,
      email: latest.guestEmail || latest.shippingAddress.email,
      phone: latest.shippingAddress.phone,
      city: latest.shippingAddress.city,
      country: latest.shippingAddress.country,
      orderCount: paid.length,
      totalSpend: paid
        .filter((o) => o.paymentStatus === 'paid')
        .reduce((sum, o) => sum + o.total, 0),
      lastOrderAt: latest.createdAt,
      firstOrderAt: paid[paid.length - 1].createdAt,
      isGuest: !latest.userId,
      orders: orders.map((o) => ({
        id: o._id,
        orderNumber: o.orderNumber,
        orderStatus: o.orderStatus,
        paymentStatus: o.paymentStatus,
        total: o.total,
        itemCount: o.items.length,
        createdAt: o.createdAt,
      })),
    };
  }
}

export const customerService = new CustomerService();
