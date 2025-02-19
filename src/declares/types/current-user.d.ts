declare global {
  interface CurrentUser {
    id: Id;
    jti: string;
    role: Id;
    baseRole: Roles;
    storeId?: Id;
    mainStoreId?: Id;
    permissions?: string[];
  }
}

declare module 'express' {
  interface User extends CurrentUser {}
}

export {};
