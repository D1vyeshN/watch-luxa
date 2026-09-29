import { Return, IReturn, ReturnStatus } from '@models/return.model';
import { SortOrder } from 'mongoose';

export interface FindManyOptions {
  skip: number;
  limit: number;
  sort?: Record<string, SortOrder>;
}

export class ReturnRepository {
  async findMany(
    filter: any,
    options: FindManyOptions
  ): Promise<{ data: IReturn[]; total: number }> {
    const [data, total] = await Promise.all([
      Return.find(filter)
        .skip(options.skip)
        .limit(options.limit)
        .sort(options.sort || { createdAt: -1 })
        .lean(),
      Return.countDocuments(filter),
    ]);
    return { data: data as unknown as IReturn[], total };
  }

  async findById(id: string): Promise<IReturn | null> {
    return Return.findById(id).exec();
  }

  async findByReturnNumber(returnNumber: string): Promise<IReturn | null> {
    return Return.findOne({ returnNumber: returnNumber.toUpperCase() }).exec();
  }

  async findByOrderId(orderId: string): Promise<IReturn[]> {
    return Return.find({ orderId }).lean() as unknown as Promise<IReturn[]>;
  }

  async create(data: Partial<IReturn>): Promise<IReturn> {
    return Return.create(data);
  }

  async update(id: string, data: Partial<IReturn>): Promise<IReturn | null> {
    return Return.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async updateStatus(
    id: string,
    status: ReturnStatus,
    additional?: Partial<IReturn>,
    adminUserId?: string
  ): Promise<IReturn | null> {
    return Return.findByIdAndUpdate(
      id,
      {
        $set: { status, ...additional },
        $push: {
          timeline: {
            status,
            at: new Date(),
            by: adminUserId ? `admin:${adminUserId}` : 'admin',
            note: additional?.adminNote,
          },
        },
      },
      { new: true, runValidators: true }
    );
  }
}

export const returnRepository = new ReturnRepository();
