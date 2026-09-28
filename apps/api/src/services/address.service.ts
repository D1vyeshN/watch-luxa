import { User, ISavedAddress } from '@models/user.model';
import { Types } from 'mongoose';
import { NotFoundError } from '@utils/AppError';

export class AddressService {
  async list(userId: string): Promise<ISavedAddress[]> {
    const user = await User.findById(userId).select('addresses').lean();
    if (!user) throw new NotFoundError('User not found');
    return (user.addresses as unknown as ISavedAddress[]) || [];
  }

  async add(userId: string, data: Partial<ISavedAddress>): Promise<ISavedAddress[]> {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    // If this is the first address or marked default, clear other defaults
    const shouldBeDefault =
      data.isDefault || user.addresses.length === 0;

    if (shouldBeDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    user.addresses.push({
      _id: new Types.ObjectId(),
      label: data.label || 'Home',
      fullName: data.fullName!,
      phone: data.phone!,
      line1: data.line1!,
      line2: data.line2,
      city: data.city!,
      state: data.state!,
      postalCode: data.postalCode!,
      country: data.country || 'India',
      isDefault: shouldBeDefault,
    });

    await user.save();
    return user.addresses;
  }

  async update(
    userId: string,
    addressId: string,
    data: Partial<ISavedAddress>
  ): Promise<ISavedAddress[]> {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const address = user.addresses.find(
      (a) => a._id.toString() === addressId
    );
    if (!address) throw new NotFoundError('Address not found');

    // If marking as default, clear others
    if (data.isDefault) {
      user.addresses.forEach((a) => (a.isDefault = false));
    }

    Object.assign(address, data);
    await user.save();
    return user.addresses;
  }

  async remove(
    userId: string,
    addressId: string
  ): Promise<ISavedAddress[]> {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const index = user.addresses.findIndex(
      (a) => a._id.toString() === addressId
    );
    if (index === -1) throw new NotFoundError('Address not found');

    const wasDefault = user.addresses[index].isDefault;
    user.addresses.splice(index, 1);

    // Promote another address if default was removed
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return user.addresses;
  }

  async setDefault(
    userId: string,
    addressId: string
  ): Promise<ISavedAddress[]> {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const address = user.addresses.find(
      (a) => a._id.toString() === addressId
    );
    if (!address) throw new NotFoundError('Address not found');

    user.addresses.forEach((a) => (a.isDefault = false));
    address.isDefault = true;

    await user.save();
    return user.addresses;
  }
}

export const addressService = new AddressService();
