export type Transaction = {
  account_id: string;
  type: "income" | "expense";
  category: string;
  amount: string;
  currency: string;
  date: string;
};

export type TransactionToPaste = {
  account_id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  currency: string;
  date: string;
};

export type TransactionDB = {
  id: string;
  user_id: string;
  account_id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  currency: string;
  date: string;
  created_at: string;
};

export type Range = {
  from: number;
  to: number;
};

export type SortConfig = {
  key: keyof TransactionDB;
  direction: string;
};
