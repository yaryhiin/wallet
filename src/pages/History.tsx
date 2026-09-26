import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";

import type { TransactionDB, Range, SortConfig } from "../types/transactions";
import type { AccountDB } from "../types/accounts";

import LoadingScreen from "../components/LoadingScreen";

import { formatDate } from "../utils/utils";
import { getAccounts } from "../services/accounts";
import { getTransactions } from "../services/transactions";

const step = 10;

const History = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<TransactionDB[] | null>(
    null,
  );
  const [accounts, setAccounts] = useState<AccountDB[] | null>(null);
  const [range, setRange] = useState<Range>({ from: 0, to: 10 });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "date",
    direction: "desc",
  });
  const [hasMore, setHasMore] = useState(false);
  const arrow = sortConfig.direction === "asc" ? "▴" : "▾";
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    async function loadAccounts() {
      setLoadingAccounts(true);
      try {
        const accountsData = await getAccounts();
        if (accountsData) setAccounts(accountsData);
      } catch (error) {
        console.error("Error fetching accounts", error);
      } finally {
        setLoadingAccounts(false);
      }
    }

    loadAccounts();
  }, []);

  useEffect(() => {
    async function loadInitialTransactions() {
    setLoadingTransactions(true);
    try {
      const transactionsData = await getTransactions({from: 0, to: 10});
      if (transactionsData) {
        if(transactionsData.length === 11) setHasMore(true);
        setTransactions(transactionsData.slice(0, 10)
        );
      }
    } catch (error) {
      console.error("Error fetching transactions", error);
    } finally {
      setLoadingTransactions(false);
    }
  }

    loadInitialTransactions();
  }, []);

  const sortedTransactions = useMemo<TransactionDB[] | null>(() => {
    if (!transactions || !accounts) return null;
    return [...transactions].sort((a: TransactionDB, b: TransactionDB) => {
      const { key, direction } = sortConfig;
      let aValue: Date | number | string = a[key];
      let bValue: Date | number | string = b[key];

      if (key === "date") {
        aValue = new Date(a.date);
        bValue = new Date(b.date);
      } else if (key === "amount") {
        aValue = Number(a.amount);
        bValue = Number(b.amount);
      } else if (key === "account_id") {
        aValue =
          accounts.find((acc) => String(acc.id) === String(a.account_id))
            ?.name || "";
        bValue =
          accounts.find((acc) => String(acc.id) === String(b.account_id))
            ?.name || "";
      }

      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      if (aValue < bValue) return direction === "asc" ? -1 : 1;

      return 0;
    });
  }, [sortConfig, transactions, accounts]);

  async function loadTransactions(newRange: Range) {
    setLoadingTransactions(true);
    try {
      const transactionsData = await getTransactions(newRange);
      if (transactionsData) {
        setHasMore(transactionsData.length === 11);
        setTransactions((prev) =>
          prev ? [...prev, ...transactionsData.slice(0, 10)] : transactionsData,
        );
      }
    } catch (error) {
      console.error("Error fetching transactions", error);
    } finally {
      setLoadingTransactions(false);
    }
  }

  function handleSort(key: keyof TransactionDB) {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }

  function onBack() {
    navigate("/");
  }

  if (loadingAccounts || loadingTransactions) return <LoadingScreen />;

  return (
    <div className="w-full flex flex-col gap-5 items-center">
      <div className="w-full grid grid-cols-[1fr_auto_1fr] px-4 py-2">
        <button className="col-start-1" onClick={onBack}>
          <ArrowLeft onClick={() => navigate("/")} />
        </button>
        <h1 className="col-start-2 text-lg font-semibold w-full">{t("transaction.all")}</h1>
      </div>
      {sortedTransactions && transactions ? (
        <div className="flex flex-col gap-4 items-center">
          <table className="border border-[var(--input-border)] ">
            <thead>
              <tr className="border-b-3 border-[var(--input-border)]">
                <th onClick={() => handleSort("category")}>
                  {t("transaction.category")}
                  {sortConfig.key === "category" && arrow}
                </th>
                <th onClick={() => handleSort("amount")}>
                  {t("transaction.amount.title")}
                  {sortConfig.key === "amount" && arrow}
                </th>
                <th onClick={() => handleSort("currency")}>
                  {t("transaction.cur")}
                  {sortConfig.key === "currency" && arrow}
                </th>
                <th onClick={() => handleSort("account_id")}>
                  {t("transaction.method")}
                  {sortConfig.key === "account_id" && arrow}
                </th>
                <th onClick={() => handleSort("date")}>
                  {t("transaction.date")}
                  {sortConfig.key === "date" && arrow}
                </th>
              </tr>
            </thead>

            <tbody>
              {sortedTransactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border border-[var(--input-border)]"
                  onClick={() =>
                    navigate(`/transaction/edit/${transaction.id}`, {
                      state: { from: "/transactions" },
                    })
                  }
                >
                  <td className="">{transaction.category}</td>
                  {transaction.type === "income" ? (
                    <td className="">{transaction.amount}</td>
                  ) : (
                    <td className="">-{transaction.amount}</td>
                  )}
                  <td className="">{transaction.currency}</td>
                  <td>
                    {(accounts &&
                      accounts.find(
                        (account) =>
                          String(account.id) === String(transaction.account_id),
                      )?.name) ||
                      "Unknown Account"}
                  </td>
                  <td>{formatDate(transaction.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {hasMore && <button
            className="border border-[var(--button-border)] px-4 py-2"
            onClick={() => {
              const newRange = {from: range.from + step, to: range.to + step}
              setRange(newRange);
              loadTransactions(newRange)
            }}
          >
            Load More
          </button>}
        </div>
      ) : (
        <h3 className="text-lg text-[var(--text-secondary)]">{t("transaction.emptyState.title")}</h3>
      )}
    </div>
  );
};

export default History;
