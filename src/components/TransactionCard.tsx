import { Link } from "react-router-dom";
import type { AccountDB } from "../types/accounts";
import type { TransactionDB } from "../types/transactions";

import { getFormattedLocalDateTime } from "../utils/utils";

type TransactionCardProps = {
  transaction: TransactionDB;
  accounts: AccountDB[];
};

const TransactionCard = ({ transaction, accounts }: TransactionCardProps) => {
  return (
    <Link
      to={`/transaction/edit/${transaction.id}`}
      className="w-full flex flex-row items-center justify-between p-4 border border-[var(--card-border)] rounded-lg bg-[var(--card-bg)]"
    >
      <div>
        <p className="text-lg font-semibold">{transaction.category}</p>
        <p className="text-[var(--text-muted)]">
          {accounts.find((acc) => acc.id === transaction.account_id)?.name}
        </p>
      </div>
      <div>
        <div className="flex flex-row justify-end gap-1">
          <span
            className={`${
              transaction.type === "expense"
                ? "text-[var(--error-bg)]"
                : "text-[var(--save-btn-bg)]"
            } 
                font-semibold`}
          >
            {transaction.type === "expense" && "-"}
            {transaction.amount}
          </span>
          {transaction.currency}
        </div>
        <p className="text-[var(--text-muted)] text-end">
          {getFormattedLocalDateTime(transaction.date)}
        </p>
      </div>
    </Link>
  );
};

export default TransactionCard;
