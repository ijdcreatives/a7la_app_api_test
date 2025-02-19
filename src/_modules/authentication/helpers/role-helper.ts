import { Roles } from '@prisma/client';

export const userJoinedRole = (role: Roles) => {
  const model = role?.at(0) + role?.slice(1)?.toLowerCase();
  return model;
};

export const rolePrismaModel = (role: Roles) => {
  const model = role?.toLocaleLowerCase();
  return model;
};
