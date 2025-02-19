import { PermissionsType } from '@prisma/client';

export const Permissions = [
  {
    review: 'Review',
    reviewAr: 'التقييمات',
    permissionType: PermissionsType.ADMIN,
  },
  {
    order: 'Order',
    orderAr: 'الطلبات',
    permissionType: PermissionsType.GLOBAL,
  },
  {
    order: 'Marketing',
    orderAr: 'التسويق',
    permissionType: PermissionsType.VENDOR,
  },
  {
    order: 'Marketing',
    orderAr: 'التسويق',
    permissionType: PermissionsType.VENDOR,
  },
  {
    order: 'Withdraw',
    orderAr: 'السخب',
    permissionType: PermissionsType.VENDOR,
  },
  {
    order: 'Plan',
    orderAr: 'الاشتراكات',
    permissionType: PermissionsType.VENDOR,
  },
  {
    order: 'Advertisement',
    orderAr: 'الإعلانات',
    permissionType: PermissionsType.VENDOR,
  },
  {
    order: 'Business',
    orderAr: 'الأعمال',
    permissionType: PermissionsType.GLOBAL,
  },
  {
    order: 'Expense Report',
    orderAr: 'التقارير',
    permissionType: PermissionsType.GLOBAL,
  },

  {
    order: 'Branches',
    orderAr: 'الفروع',
    permissionType: PermissionsType.VENDOR,
  },
  {
    order: 'Schedule',
    orderAr: 'الجدوله',
    permissionType: PermissionsType.ADMIN,
  },
  {
    order: 'Schedule',
    orderAr: 'الجدوله',
    permissionType: PermissionsType.VENDOR,
  },
  {
    order: 'Dashboard',
    orderAr: 'لوحة التحكم',
    permissionType: PermissionsType.STORE,
  },
  {
    store: 'Store',
    storeAr: 'المتاجر',
    permissionType: PermissionsType.ADMIN,
  },
  {
    store: 'Store',
    storeAr: 'المتاجر',
    permissionType: PermissionsType.VENDOR,
  },

  {
    employee: 'Employee',
    employeeAr: 'الموظفين',
    permissionType: PermissionsType.GLOBAL,
  },
  {
    product: 'Product',
    productAr: 'المنتجات',
    permissionType: PermissionsType.ADMIN,
  },
  {
    product: 'Product',
    productAr: 'المنتجات',
    permissionType: PermissionsType.VENDOR,
  },
  {
    promotion: 'Promotion',
    promotionAr: 'العروض',
    permissionType: PermissionsType.ADMIN,
  },
  {
    deliveryman: 'Deliveryman',
    deliverymanAr: 'مندوبي التوصيل',
    permissionType: PermissionsType.ADMIN,
  },
  {
    customer: 'Customer',
    customerAr: 'العملاء',
    permissionType: PermissionsType.ADMIN,
  },
  {
    system: 'System',
    systemAr: 'النظام',
    permissionType: PermissionsType.ADMIN,
  },
  {
    dispatch: 'Dispatch',
    dispatchAr: 'الإرسال',
    permissionType: PermissionsType.ADMIN,
  },
  {
    modules: 'Modules',
    modulesAr: 'الوحدات',
    permissionType: PermissionsType.ADMIN,
  },
] as const; // Use 'as const' to infer literal types

const PermissionsValues = Permissions.map((e) => Object.values(e)[0]);

export type PermissionValue = (typeof PermissionsValues)[number];
