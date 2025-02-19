import { Status } from '@prisma/client';

export type UserWithFullName = {
  firstName: string;
  lastName: string;
  fullName: string; // Adding the virtual field manually
  id: number;
  phone: string;
  email: string;
  status: Status;
  image: string;
};
