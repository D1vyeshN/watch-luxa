import { Order } from '@models/order.model';
import { Product } from '@models/product.model';
import { User } from '@models/user.model';
import { Return } from '@models/return.model';
import { DateRange, toDateKey, percentChange } from '@utils/dateRange';
import { cacheGet, cacheSet } from '@utils/cache';

export class AnalyticsService {
  // ─────────────────────────────────────────────────────────
  // DASHBOARD (main aggregate)
  // ─────────────────────────────────────────────────────────
  async getDashboard(range: DateRange) {
    // Skip caching in development to avoid Redis dependency
    const [current, previous, growth, salesTrend, orderStatus] =
      await Promise.all([
        this.getStats(range.from, range.to),
        this.getStats(range.previousFrom, range.previousTo),
        this.getGrowthStats(),
        this.getSalesTrend(range),
        this.getOrderStatusBreakdown(range),
      ]);

    const result = {
      range: {
        from: range.from,
        to: range.to,
        preset: range.preset,
      },
      current,
      previous,
      comparison: {
        revenue: percentChange(current.revenue, previous.revenue),
        orders: percentChange(current.orders, previous.orders),
        customers: percentChange(current.customers, previous.customers),
        averageOrderValue: percentChange(
          current.averageOrderValue,
          previous.averageOrderValue
        ),
      },
      growth,
      salesTrend,
      orderStatus,
    };

    return result;
  }

  // ─────────────────────────────────────────────────────────
  // STATS for a given period
  // ─────────────────────────────────────────────────────────
  private async getStats(from: Date, to: Date) {
    const match = {
      createdAt: { $gte: from, $lte: to },
      paymentStatus: 'paid' as const,
    };

    const [result] = await Order.aggregate([
      { $match: match },
      {
        $facet: {
          revenue: [
            {
              $group: {
                _id: null,
                total: { $sum: '$total' },
                count: { $sum: 1 },
                average: { $avg: '$total' },
              },
            },
          ],
          uniqueCustomers: [
            { $group: { _id: '$userId' } },
            { $match: { _id: { $ne: null } } },
            { $count: 'count' },
          ],
          guestOrders: [{ $match: { userId: null } }, { $count: 'count' }],
        },
      },
    ]);

    const revenue = result?.revenue?.[0]?.total || 0;
    const orders = result?.revenue?.[0]?.count || 0;
    const averageOrderValue = Math.round(result?.revenue?.[0]?.average || 0);
    const registeredCustomers = result?.uniqueCustomers?.[0]?.count || 0;
    const guestOrders = result?.guestOrders?.[0]?.count || 0;

    return {
      revenue,
      orders,
      averageOrderValue,
      customers: registeredCustomers + guestOrders,
      registeredCustomers,
      guestOrders,
    };
  }

  // ─────────────────────────────────────────────────────────
  // GROWTH (current totals — not period-bound)
  // ─────────────────────────────────────────────────────────
  private async getGrowthStats() {
    const [totalProducts, activeProducts, totalCustomers, lowStock, pendingReturns] =
      await Promise.all([
        Product.countDocuments({ status: { $ne: 'archived' } }),
        Product.countDocuments({ status: 'active' }),
        User.countDocuments({ isActive: true, role: 'user' }),
        Product.aggregate([
          { $match: { status: 'active' } },
          { $unwind: '$variants' },
          {
            $match: {
              'variants.isActive': true,
              'variants.stock': { $gt: 0 },
              $expr: {
                $lte: ['$variants.stock', '$variants.lowStockThreshold'],
              },
            },
          },
          { $count: 'count' },
        ]),
        Return.countDocuments({ status: 'pending' }),
      ]);

    return {
      totalProducts,
      activeProducts,
      totalCustomers,
      lowStockVariants: lowStock?.[0]?.count || 0,
      pendingReturns,
    };
  }

  // ─────────────────────────────────────────────────────────
  // SALES TREND (bucketed by day)
  // ─────────────────────────────────────────────────────────
  private async getSalesTrend(range: DateRange) {
    const match = {
      createdAt: { $gte: range.from, $lte: range.to },
      paymentStatus: 'paid' as const,
    };

    const data = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Kolkata',
            },
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill missing days with zero
    const buckets: Record<string, { revenue: number; orders: number }> = {};
    const cursor = new Date(range.from);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(range.to);
    end.setHours(23, 59, 59, 999);

    while (cursor <= end) {
      buckets[toDateKey(cursor)] = { revenue: 0, orders: 0 };
      cursor.setDate(cursor.getDate() + 1);
    }

    data.forEach((d) => {
      if (buckets[d._id]) {
        buckets[d._id] = { revenue: d.revenue, orders: d.orders };
      }
    });

    return Object.entries(buckets).map(([date, stats]) => ({
      date,
      revenue: stats.revenue,
      orders: stats.orders,
    }));
  }

  // ─────────────────────────────────────────────────────────
  // ORDER STATUS BREAKDOWN
  // ─────────────────────────────────────────────────────────
  private async getOrderStatusBreakdown(range: DateRange) {
    const match = { createdAt: { $gte: range.from, $lte: range.to } };

    const [byOrderStatus, byPaymentStatus] = await Promise.all([
      Order.aggregate([
        { $match: match },
        { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: '$paymentStatus', count: { $sum: 1 } } },
      ]),
    ]);

    const orderStatus = {
      pending: 0,
      paid: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      refunded: 0,
    };
    byOrderStatus.forEach((s) => {
      if (s._id in orderStatus) {
        orderStatus[s._id as keyof typeof orderStatus] = s.count;
      }
    });

    const paymentStatus = {
      pending: 0,
      paid: 0,
      failed: 0,
      refunded: 0,
    };
    byPaymentStatus.forEach((s) => {
      if (s._id in paymentStatus) {
        paymentStatus[s._id as keyof typeof paymentStatus] = s.count;
      }
    });

    return { orderStatus, paymentStatus };
  }

  // ─────────────────────────────────────────────────────────
  // TOP PRODUCTS
  // ─────────────────────────────────────────────────────────
  async getTopProducts(range: DateRange, limit = 10) {
    const cacheKey = `analytics:top-products:${range.from.toISOString()}:${limit}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;

    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: range.from, $lte: range.to },
          paymentStatus: 'paid',
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          productName: { $first: '$items.productName' },
          productSlug: { $first: '$items.productSlug' },
          image: { $first: '$items.image' },
          unitsSold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.totalPrice' },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: limit },
    ]);

    await cacheSet(cacheKey, data, 120);
    return data;
  }

  // ─────────────────────────────────────────────────────────
  // TOP CUSTOMERS
  // ─────────────────────────────────────────────────────────
  async getTopCustomers(range: DateRange, limit = 10) {
    const cacheKey = `analytics:top-customers:${range.from.toISOString()}:${limit}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;

    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: range.from, $lte: range.to },
          paymentStatus: 'paid',
          userId: { $ne: null },
        },
      },
      {
        $group: {
          _id: '$userId',
          totalSpent: { $sum: '$total' },
          orderCount: { $sum: 1 },
          lastOrderAt: { $max: '$createdAt' },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          totalSpent: 1,
          orderCount: 1,
          lastOrderAt: 1,
          name: '$user.name',
          email: '$user.email',
        },
      },
    ]);

    await cacheSet(cacheKey, data, 120);
    return data;
  }

  // ─────────────────────────────────────────────────────────
  // LOW STOCK
  // ─────────────────────────────────────────────────────────
  async getLowStock(limit = 20) {
    const cacheKey = `analytics:low-stock:${limit}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;

    const data = await Product.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$variants' },
      {
        $match: {
          'variants.isActive': true,
          'variants.stock': { $gt: 0 },
          $expr: { $lte: ['$variants.stock', '$variants.lowStockThreshold'] },
        },
      },
      {
        $project: {
          _id: 0,
          productId: { $toString: '$_id' },
          productName: '$name',
          productSlug: '$slug',
          sku: '$variants.sku',
          dialColor: '$variants.dialColor',
          caseMaterial: '$variants.caseMaterial',
          caseSize: '$variants.caseSize',
          stock: '$variants.stock',
          lowStockThreshold: '$variants.lowStockThreshold',
        },
      },
      { $sort: { stock: 1 } },
      { $limit: limit },
    ]);

    await cacheSet(cacheKey, data, 60);
    return data;
  }

  // ─────────────────────────────────────────────────────────
  // RECENT ORDERS
  // ─────────────────────────────────────────────────────────
  async getRecentOrders(limit = 10) {
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(
        'orderNumber orderStatus paymentStatus total currency shippingAddress.fullName guestEmail userId createdAt'
      )
      .lean();

    return orders.map((o) => ({
      id: o._id.toString(),
      orderNumber: o.orderNumber,
      customerName: o.shippingAddress?.fullName || 'Guest',
      orderStatus: o.orderStatus,
      paymentStatus: o.paymentStatus,
      total: o.total,
      currency: o.currency,
      isGuest: !o.userId,
      createdAt: o.createdAt,
    }));
  }

  // ─────────────────────────────────────────────────────────
  // INVENTORY VALUE
  // ─────────────────────────────────────────────────────────
  async getInventoryValue() {
    const cacheKey = 'analytics:inventory-value';
    const cached = await cacheGet<{ value: number; units: number }>(cacheKey);
    if (cached) return cached;

    const [result] = await Product.aggregate([
      { $match: { status: 'active' } },
      { $unwind: '$variants' },
      { $match: { 'variants.isActive': true, 'variants.stock': { $gt: 0 } } },
      {
        $group: {
          _id: null,
          value: {
            $sum: { $multiply: ['$variants.price', '$variants.stock'] },
          },
          units: { $sum: '$variants.stock' },
        },
      },
    ]);

    const payload = {
      value: result?.value || 0,
      units: result?.units || 0,
    };

    await cacheSet(cacheKey, payload, 300);
    return payload;
  }

  // ─────────────────────────────────────────────────────────
  // REVENUE BY CATEGORY
  // ─────────────────────────────────────────────────────────
  async getRevenueByCategory(range: DateRange) {
    const cacheKey = `analytics:revenue-by-category:${range.from.toISOString()}`;
    const cached = await cacheGet<unknown>(cacheKey);
    if (cached) return cached;

    const data = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: range.from, $lte: range.to },
          paymentStatus: 'paid',
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          revenue: { $sum: '$items.totalPrice' },
          unitsSold: { $sum: '$items.quantity' },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    await cacheSet(cacheKey, data, 300);
    return data;
  }
}

export const analyticsService = new AnalyticsService();
