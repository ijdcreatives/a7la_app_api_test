import { Status } from '@prisma/client';

export type CUSTOMER = {
  User: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    image: string;

    totalOrders: number;
    totalPrice: number;
  };
  _count: {
    Order: number;
  };
  status: Status;
  createdAt: Date;
};
