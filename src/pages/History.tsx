import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowUpDown } from "lucide-react";

import type { TransactionDB, Range, SortConfig } from "../types/transactions";

import LoadingScreen from "../components/LoadingScreen";

// import { formatDate } from "../utils/utils";

import { getTransactions } from "../services/transactions";

import { useAccounts } from "../hooks/useAccounts";
import TransactionCard from "../components/TransactionCard";
import SortModal from "../components/SortModal";

const step = 10;

const History = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: accounts = null, isLoading: loadingAccounts } = useAccounts();

  const [transactions, setTransactions] = useState<TransactionDB[] | null>(
    null,
  );
  const [range, setRange] = useState<Range>({ from: 0, to: 10 });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "date",
    direction: "desc",
  });
  const [hasMore, setHasMore] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(true);

  useEffect(() => {
    async function loadInitialTransactions() {
      setLoadingTransactions(true);
      try {
        const transactionsData = await getTransactions({ from: 0, to: 10 });
        if (transactionsData) {
          if (transactionsData.length === 11) setHasMore(true);
          setTransactions(transactionsData.slice(0, 10));
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
        aValue = a.type === "income" ? Number(a.amount) : Number(a.amount) * -1;
        bValue = b.type === "income" ? Number(b.amount) : Number(b.amount) * -1;
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
        <h1 className="col-start-2 text-lg font-semibold w-full">
          {t("transaction.all")}
        </h1>
        <ArrowUpDown
          onClick={() => {
            setShowSortModal(true);
          }}
          className="col-start-3 flex justify-self-end"
        />
      </div>
      {accounts && sortedTransactions ? (
        <div className="flex flex-col gap-4 items-center">
          {sortedTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              accounts={accounts}
            />
          ))}
          {hasMore && (
            <button
              className="border border-[var(--button-border)] px-4 py-2"
              onClick={() => {
                const newRange = {
                  from: range.from + step,
                  to: range.to + step,
                };
                setRange(newRange);
                loadTransactions(newRange);
              }}
            >
              Load More
            </button>
          )}
        </div>
      ) : (
        <h3 className="text-lg text-[var(--text-secondary)]">
          {t("transaction.emptyState.title")}
        </h3>
      )}
      {showSortModal && (
        <SortModal
          onBack={() => setShowSortModal(false)}
          sortConfig={sortConfig}
          setSortConfig={setSortConfig}
        />
      )}
    </div>
  );
};

export default History;
