export const prepareVendorData = (
  storeId: number,
  idNumber: string,
  userId: number,
  password: string,
  roleId: Id,
  isDefault: boolean,
) => {
  return {
    Role: {
      connect: {
        id: roleId,
      },
    },
    idNumber,
    default: isDefault,
    User: {
      connect: {
        id: userId,
      },
    },
    ...(password ? { password } : undefined),
    Store: {
      connect: {
        id: storeId,
      },
    },
  };
};
