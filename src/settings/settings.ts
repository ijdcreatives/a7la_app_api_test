import { DataType, SettingDomain } from '@prisma/client';

export type Setting = {
  setting: string;
  domain: SettingDomain;
  value: string;
  type: DataType;
  enum?: object;
};

export const settingTypes = [
  // BUSINESS
  {
    setting: 'generalCopyRightText',
    domain: SettingDomain.BUSINESS,
    value: '1',
    type: DataType.STRING,
  },
  {
    setting: 'businessOrderCommissionRate',
    domain: SettingDomain.BUSINESS,
    value: '0.000000000000000000000000000000',
    type: DataType.NUMBER,
  },
  {
    setting: 'businessDeliveryCommissionRate',
    domain: SettingDomain.BUSINESS,
    value: '0.000000000000000000000000000000',
    type: DataType.NUMBER,
  },
  {
    setting: 'StoreConfirmOrder',
    domain: SettingDomain.BUSINESS,
    value: '1',
    type: DataType.BOOLEAN,
  },
  {
    setting: 'businessFreeDeliveryOver',
    domain: SettingDomain.BUSINESS,
    value: '4999.000000000000000000000000000000',
    type: DataType.NUMBER,
  },
  {
    setting: 'shippingMinimumCharge',
    domain: SettingDomain.BUSINESS,
    value: '2.000000000000000000000000000000',
    type: DataType.NUMBER,
  },
  {
    setting: 'shippingKMCharge',
    domain: SettingDomain.BUSINESS,
    value: '2.000000000000000000000000000000',
    type: DataType.NUMBER,
  },
  {
    setting: 'shippingMaximumCharge',
    domain: SettingDomain.BUSINESS,
    value: '1',
    type: DataType.NUMBER,
  },
  // {
  //   setting: 'maintenance',
  //   domain: SettingDomain.BUSINESS,
  //   value: '0',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'companyName',
  //   domain: SettingDomain.BUSINESS,
  //   value: 'DeliverUS',
  //   type: DataType.STRING,
  // },
  // {
  //   setting: 'companyEmail',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.STRING,
  // },
  // {
  //   setting: 'companyPhone',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.STRING,
  // },
  // {
  //   setting: 'companyCountry',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.STRING,
  // },
  // {
  //   setting: 'companyAddress',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.STRING,
  // },
  // {
  //   setting: 'companyLatitude',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.LATITUDE,
  // },
  // {
  //   setting: 'companyLongitude',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.LONGITUDE,
  // },
  // {
  //   setting: 'companyLogo',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.FILE,
  // },
  // {
  //   setting: 'companyIcon',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.FILE,
  // },
  // {
  //   setting: 'generalTimeZone',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.STRING,
  // },
  // {
  //   setting: 'generalTimeFormat',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.ENUM,
  //   enum: ['12HOUR', '24HOUR'],
  // },
  // {
  //   setting: 'generalCurrencySymbol',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.STRING,
  // },
  // {
  //   setting: 'generalCurrencyPosition',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.ENUM,
  //   enum: ['LEFT', 'RIGHT'],
  // },
  // {
  //   setting: 'generalDigitsAfterDecimalPoint',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.STRING,
  // },

  // {
  //   setting: 'generalCookiesText',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.STRING,
  // },

  // {
  //   setting: 'businessIncludeTaxAmount',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'businessCustomerFoodPreference',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'businessOrderNotificationForAdmin',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'businessOrderNotificationType',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.ENUM,
  //   enum: ['FIREBASE', 'EMAIL'],
  // },

  // {
  //   setting: 'businessGuestCheckout',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'businessCountryPicker',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'additionalChargeName',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.STRING,
  // },
  // {
  //   setting: 'additionalCharge',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'additionChargeAmount',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.NUMBER,
  // },
  // {
  //   setting: 'paymentPartialPayment',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'paymentPartialPaymentMethod',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.ENUM,
  //   enum: ['CASH', 'CARD', 'PAYMENT'],
  // },

  // {
  //   setting: 'planSubscription',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'planCommission',
  //   domain: SettingDomain.BUSINESS,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },

  // ORDER

  {
    setting: 'orderHomeDelivery',
    domain: SettingDomain.ORDER,
    value: '1',
    type: DataType.BOOLEAN,
  },
  {
    setting: 'orderTakeaway',
    domain: SettingDomain.ORDER,
    value: '1',
    type: DataType.BOOLEAN,
  },
  {
    setting: 'orderCarDelivery',
    domain: SettingDomain.ORDER,
    value: '1',
    type: DataType.BOOLEAN,
  },
  // {
  //   setting: 'orderDeliveryVerification',
  //   domain: SettingDomain.ORDER,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'orderPlaceOrderPrescription',
  //   domain: SettingDomain.ORDER,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },

  // {
  //   setting: 'orderScheduleOrder',
  //   domain: SettingDomain.ORDER,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'orderTimeIntervalByMin',
  //   domain: SettingDomain.ORDER,
  //   value: '1',
  //   type: DataType.NUMBER,
  // },

  // REFUND
  {
    setting: 'refundRequest',
    domain: SettingDomain.REFUND,
    value: '1',
    type: DataType.BOOLEAN,
  },

  // STORE
  {
    setting: 'storeCanCancelOrder',
    domain: SettingDomain.STORE,
    value: '1',
    type: DataType.BOOLEAN,
  },
  {
    setting: 'storeSelfRegister',
    domain: SettingDomain.STORE,
    value: '1',
    type: DataType.BOOLEAN,
  },
  // {
  //   setting: 'storeProductGallery',
  //   domain: SettingDomain.STORE,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'storeAccessAllProducts',
  //   domain: SettingDomain.STORE,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  {
    setting: 'storeNeedApprovalForProducts',
    domain: SettingDomain.STORE,
    value: '1',
    type: DataType.BOOLEAN,
  },
  // {
  //   setting: 'storeCanReplyReview',
  //   domain: SettingDomain.STORE,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  {
    setting: 'storeNearestByKM',
    domain: SettingDomain.STORE,
    value: '10000',
    type: DataType.NUMBER,
  },

  // DELIVERY
  // {
  //   setting: 'deliveryAllowTips',
  //   domain: SettingDomain.DELIVERY,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  {
    setting: 'deliverySelfRegister',
    domain: SettingDomain.DELIVERY,
    value: '1',
    type: DataType.BOOLEAN,
  },
  // {
  //   setting: 'deliveryCanShowEarningsInApp',
  //   domain: SettingDomain.DELIVERY,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'deliveryMaximumAssignedOrderLimit',
  //   domain: SettingDomain.DELIVERY,
  //   value: '1',
  //   type: DataType.NUMBER,
  // },
  // {
  //   setting: 'deliveryCanCancelOrder',
  //   domain: SettingDomain.DELIVERY,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'deliveryTakePicForCompletingDelivery',
  //   domain: SettingDomain.DELIVERY,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'deliveryCashOverflow',
  //   domain: SettingDomain.DELIVERY,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'deliveryCashOverflowMax',
  //   domain: SettingDomain.DELIVERY,
  //   value: '1',
  //   type: DataType.NUMBER,
  // },
  // {
  //   setting: 'deliveryMinAmountToPay',
  //   domain: SettingDomain.DELIVERY,
  //   value: '1',
  //   type: DataType.NUMBER,
  // },

  // CUSTOMER
  // {
  //   setting: 'customerWallet',
  //   domain: SettingDomain.CUSTOMER,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  {
    setting: 'customerLoyaltyPoints',
    domain: SettingDomain.CUSTOMER,
    value: '1',
    type: DataType.BOOLEAN,
  },
  {
    setting: 'verifyHomeDeliveryToCustomer',
    domain: SettingDomain.CUSTOMER,
    value: '1',
    type: DataType.NUMBER,
  },
  // {
  //   setting: 'customerRefundToWallet',
  //   domain: SettingDomain.CUSTOMER,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  // {
  //   setting: 'customerReplaceLoyaltyPoint',
  //   domain: SettingDomain.CUSTOMER,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
  {
    setting: 'customer1PoundPoints',
    domain: SettingDomain.CUSTOMER,
    value: '1.000000000000000000000000000000',
    type: DataType.NUMBER,
  },
  {
    setting: 'customerOrderPoints',
    domain: SettingDomain.CUSTOMER,
    value: '2.000000000000000000000000000000',
    type: DataType.NUMBER,
  },
  {
    setting: 'customerMinPointsConvert',
    domain: SettingDomain.CUSTOMER,
    value: '2.000000000000000000000000000000',
    type: DataType.NUMBER,
  },

  // DISBURSEMENT
  // {
  //   setting: 'disbursement',
  //   domain: SettingDomain.DISBURSEMENT,
  //   value: '1',
  //   type: DataType.BOOLEAN,
  // },
] as const satisfies readonly Setting[];

export const SettingKeys = settingTypes.map((s) => s.setting);

export type SettingKey = (typeof SettingKeys)[number];
