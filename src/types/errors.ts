export type AuthErrors = {
  confirmPassword: boolean;
  password: boolean;
  email: boolean;
};

export type AccountErrors = {
  name: boolean;
  balance: boolean;
  currency: boolean;
  icon: boolean;
};

export type TransactionErrors = {
  account_id: boolean;
  amount: boolean;
  category: boolean;
  date: boolean;
};

export type CategoryErrors = {
  name: boolean;
  type: boolean;
};

export type TransferErrors = {
  amount: boolean;
  fromId: boolean;
  toId: boolean;
  exchangeRate: boolean;
  date: boolean;
};
