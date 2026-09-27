import type { Account, AccountToPaste } from "../types/accounts";
import type { Category } from "../types/categories";
import type {
  TransactionErrors,
  AccountErrors,
  CategoryErrors,
  TransferErrors,
} from "../types/errors";
import type {
  Transaction,
  TransactionToPaste,
  Transfer,
} from "../types/transactions";

export function checkTransaction(transaction: Transaction) {
  const newErrors: TransactionErrors = {
    account_id: false,
    amount: false,
    category: false,
    date: false,
  };
  const formattedTransaction: TransactionToPaste = {
    ...transaction,
    amount: transaction.amount ? Number(transaction.amount) : 0,
  };
  if (!transaction.account_id) newErrors.account_id = true;
  if (
    !formattedTransaction.amount ||
    formattedTransaction.amount < -999999999 ||
    formattedTransaction.amount > 999999999
  )
    newErrors.amount = true;
  if (!transaction.category) newErrors.category = true;
  if (!transaction.date) newErrors.date = true;

  return { formattedTransaction, newErrors };
}

export function checkAccount(account: Account) {
  const newErrors: AccountErrors = {
    name: false,
    balance: false,
    currency: false,
    icon: false,
  };
  const formattedAccount: AccountToPaste = {
    ...account,
    balance: account.balance ? Number(account.balance) : 0,
  };
  if (!account.name) newErrors.name = true;
  if (
    !formattedAccount.balance ||
    formattedAccount.balance < -999999999 ||
    formattedAccount.balance > 999999999
  )
    newErrors.balance = true;
  if (!account.currency) newErrors.currency = true;
  if (!account.icon) newErrors.icon = true;

  return { formattedAccount, newErrors };
}

export function checkCategory(category: Category) {
  const newErrors: CategoryErrors = {
    name: false,
    type: false,
  };
  if (!category.name.trim()) {
    newErrors.name = true;
  }
  if (category.type !== "income" && category.type !== "expense") {
    newErrors.type = true;
  }

  return newErrors;
}

export function checkTransfer(transfer: Transfer): {
  newErrors: TransferErrors;
  numericRate: number;
} {
  const newErrors: TransferErrors = {
    amount: false,
    fromId: false,
    toId: false,
    exchangeRate: false,
    date: false,
  };
  const numericAmount = transfer.amount === "" ? 0 : Number(transfer.amount);
  const numericRate =
    transfer.exchangeRate === "" ? 0 : Number(transfer.exchangeRate);
  if (!numericAmount || numericAmount <= 0) newErrors.amount = true;
  if (!numericRate) newErrors.exchangeRate = true;
  if (!transfer.fromId) newErrors.fromId = true;
  if (!transfer.toId) newErrors.toId = true;
  if (!transfer.date) newErrors.date = true;
  if (transfer.fromId === transfer.toId) {
    newErrors.toId = true;
    newErrors.fromId = true;
  }

  return { newErrors, numericRate };
}
