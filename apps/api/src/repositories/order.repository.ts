import { Order, IOrder, OrderStatus } from '@models/order.model';
import { ClientSession, SortOrder } from 'mongoose';

type FilterQuery = any;

export interface FindManyOptions {
  skip: number;
  limit: number;
  sort?: Record<string, SortOrder>;
}

export class OrderRepository {
  async findMany(
    filter: FilterQuery,
    options: FindManyOptions
  ): Promise<{ data: IOrder[]; total: number }> {
    const [data, total] = await Promise.all([
      Order.find(filter)
        .skip(options.skip)
        .limit(options.limit)
        .sort(options.sort || { createdAt: -1 })
        .lean(),
      Order.countDocuments(filter),
    ]);
    return { data: data as unknown as IOrder[], total };
  }

  async findById(id: string): Promise<IOrder | null> {
    return Order.findById(id).exec();
  }

  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return Order.findOne({ orderNumber: orderNumber.toUpperCase() }).exec();
  }

  async findByUserId(
    userId: string,
    options: FindManyOptions
  ): Promise<{ data: IOrder[]; total: number }> {
    return this.findMany({ userId } as any, options);
  }

  async create(
    data: Partial<IOrder>,
    session?: any
  ): Promise<IOrder> {
    if (session) {
      const [order] = await Order.create([data], { session });
      return order;
    }
    return Order.create(data);
  }

  async update(
    id: string,
    data: Partial<IOrder>
  ): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
    additional?: Partial<IOrder>,
    options: { note?: string; session?: ClientSession } = {}
  ): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      id,
      {
        $set: { orderStatus: status, ...additional },
        $push: {
          timeline: { status, note: options.note, at: new Date(), by: 'admin' },
        },
      },
      { new: true, session: options.session }
    );
  }
}

export const orderRepository = new OrderRepository();
