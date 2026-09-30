import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { TransactionDB } from "../types/transactions";

import LoadingScreen from "../components/LoadingScreen";
import AccountCard from "../components/AccountCard";
import TransactionCard from "../components/TransactionCard";

import { getLatestTransactions } from "../services/transactions";

import { useAccounts } from "../hooks/useAccounts";

const Home = () => {
  const { t } = useTranslation();
  const { data: accounts = null, isLoading: loadingAccounts } = useAccounts();

  const [transactions, setTransactions] = useState<TransactionDB[] | null>(
    null,
  );
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const totalsByCurrency = useMemo(() => {
    if (!accounts) return {};
    return accounts.reduce(
      (acc: Record<string, number>, account) => {
        const currency = account.currency;
        const balance = Number(account.balance) || 0;

        acc[currency] = (acc[currency] || 0) + balance;

        return acc;
      },
      {} as Record<string, number>,
    );
  }, [accounts]);

  useEffect(() => {
    async function loadTransactions() {
      setLoadingTransactions(true);
      try {
        const transactionsData = await getLatestTransactions(4);
        if (transactionsData) setTransactions(transactionsData);
      } catch (error) {
        console.error("Error fetching transactions", error);
      } finally {
        setLoadingTransactions(false);
      }
    }

    loadTransactions();
  }, []);

  if (loadingAccounts || loadingTransactions) return <LoadingScreen />;

  return (
    <div className="flex flex-col w-full gap-5 items-center">
      <div className="flex flex-col gap-4 items-center">
        <h1 className="text-2xl font-bold">{t("account.accounts")}</h1>
        <div className="flex flex-col gap-1 items-center">
          <p className="text-lg">{t("account.totalBal")}</p>
          <div className="flex flex-row gap-2">
            {Object.keys(totalsByCurrency).length > 0 &&
              Object.entries(totalsByCurrency).map(([currency, total]) => (
                <p key={currency}>
                  {total} {currency}
                </p>
              ))}
          </div>
        </div>
      </div>
      <div className="grid w-fit grid-cols-2 gap-4 p-4 max-[450px]:px-1">
        {accounts &&
          accounts.map((acc) => <AccountCard key={acc.id} account={acc} />)}
        {((accounts && accounts.length < 4) || !accounts) && (
          <Link
            to="/account/new"
            aria-label="Create new account"
            className="flex w-35 h-35 p-2 border border-[var(--card-border)] rounded-md bg-[var(--card-bg)] text-[var(--text)] items-center justify-center"
          >
            <Plus size={60} />
          </Link>
        )}
      </div>
      {transactions ? (
        <div className="w-full flex flex-col items-center gap-4 mb-4">
          <div className="w-[90%] flex flex-col items-center gap-4">
            {accounts &&
              transactions
                .slice(0, 3)
                .map((trans) => (
                  <TransactionCard
                    key={trans.id}
                    transaction={trans}
                    accounts={accounts}
                  />
                ))}
          </div>
          {transactions.length > 3 && (
            <Link to="/history">{t("transaction.viewAll")}</Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 mb-8 mt-4">
          <h3 className="text-xl font-semibold">
            {t("transaction.emptyState.title")}
          </h3>
          <p className="text-[var(--text-muted)]">
            {t("transaction.emptyState.text")}
          </p>
        </div>
      )}
      <div className="flex flex-row gap-7 max-[450px]:gap-3">
        <Link
          to="/transaction/new/income"
          aria-label="Create new income"
          className="w-fit h-fit border border-[var(--save-btn-bg)] bg-[var(--back-btn-bg)] rounded-lg px-4 py-3 max-[450px]:text-sm max-[450px]:px-3 max-[450px]:py-3"
        >
          + {t("transaction.type.income")}
        </Link>
        <Link
          to="/transaction/new/expense"
          aria-label="Create new expense"
          className="w-fit h-fit border border-[var(--delete-btn-bg)] bg-[var(--back-btn-bg)] rounded-lg px-4 py-3 max-[450px]:text-sm max-[450px]:px-3 max-[450px]:py-3"
        >
          - {t("transaction.type.expense")}
        </Link>
        <Link
          to="/transaction/new/transfer"
          aria-label="Create new transfer"
          className="w-fit h-fit border border-[var(--transfer-btn-bg)] bg-[var(--back-btn-bg)] rounded-lg px-4 py-3 max-[450px]:text-sm max-[450px]:px-3 max-[450px]:py-3"
        >
          ⇄ {t("transaction.type.transfer")}
        </Link>
      </div>
    </div>
  );
};

export default Home;
