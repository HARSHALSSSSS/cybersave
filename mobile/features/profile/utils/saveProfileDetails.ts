import {
  CitizenAddress,
  CreateAddressPayload,
  profileApi,
} from '@services/api';
import { saveProfileExtras } from '@utils/profileExtras';
import {
  parseFullName,
  validateProfileName,
} from '@features/profile/utils/profileSync';

export type ProfileDetailsInput = {
  fullName: string;
  email?: string;
  fatherOrGuardianName?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
};

export type SaveProfileDetailsOptions = {
  citizenId: string;
  existingAddress?: CitizenAddress | null;
  saveProfile: (payload: {
    firstName: string;
    lastName?: string;
    email?: string;
  }) => Promise<{ justCompleted: boolean }>;
};

export async function saveProfileDetails(
  input: ProfileDetailsInput,
  options: SaveProfileDetailsOptions,
): Promise<{ justCompleted: boolean }> {
  const nameError = validateProfileName(input.fullName);
  if (nameError) {
    throw new Error(nameError);
  }

  const address = input.address;
  if (address?.line1?.trim()) {
    if (!address.city?.trim() || !address.state?.trim()) {
      throw new Error('City and state are required for your address.');
    }
    if (!/^\d{6}$/.test(String(address.pincode ?? '').trim())) {
      throw new Error('Enter a valid 6-digit PIN code.');
    }
  }

  const parsed = parseFullName(input.fullName);
  const result = await options.saveProfile({
    ...parsed,
    email: input.email?.trim() || undefined,
  });

  saveProfileExtras(options.citizenId, {
    gender: input.gender,
    dateOfBirth: input.dateOfBirth,
    fatherOrGuardianName: input.fatherOrGuardianName,
  });

  if (address?.line1?.trim()) {
    const payload: CreateAddressPayload = {
      label: options.existingAddress?.label || 'Home',
      line1: address.line1.trim(),
      line2: address.line2?.trim() || undefined,
      city: address.city.trim(),
      state: address.state.trim(),
      pincode: address.pincode.trim(),
      isDefault: true,
    };
    if (options.existingAddress?.id) {
      await profileApi.updateAddress(options.existingAddress.id, payload);
    } else {
      await profileApi.createAddress(payload);
    }
  }

  return result;
}
