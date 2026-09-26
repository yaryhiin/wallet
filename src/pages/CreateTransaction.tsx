import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import TransactionForm from "../components/TransactionForm";
import InfoModal from "../components/InfoModal";
import LoadingScreen from "../components/LoadingScreen";

import type { TransactionErrors } from "../types/errors";
import type { Transaction } from "../types/transactions";
import type {
  // Category,
  CategoryDB,
} from "../types/categories";
import type { AccountDB } from "../types/accounts";

import { getPersistedJSON, setPersistedJSON } from "../utils/storage";
import { checkTransaction } from "../utils/checkData";
import { createTransaction } from "../services/transactions";
import {
  // createCategory,
  getCategories,
} from "../services/categories";

import { useAsyncAction } from "../hooks/useAsyncAction";
import { getAccounts, updateAccount } from "../services/accounts";

type CreateTransactionType = {
  type: "income" | "expense";
};

const CreateTransaction = ({ type }: CreateTransactionType) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { run, state } = useAsyncAction();

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [categories, setCategories] = useState<CategoryDB[] | null>(null);
  const [accounts, setAccounts] = useState<AccountDB[] | null>(null);
  const [transaction, setTransaction] = useState<Transaction>(
    getPersistedJSON("transaction", {
      account_id: "",
      type,
      amount: "",
      category: "",
      date: new Date(
        new Date().getTime() - new Date().getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16),
      currency: "",
    }),
  );
  const [errors, setErrors] = useState<TransactionErrors>({
    account_id: false,
    amount: false,
    category: false,
    date: false,
  });

  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const categoriesData = await getCategories();
        if (categoriesData) setCategories(categoriesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

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
    setPersistedJSON("transaction", transaction);
  }, [transaction]);

  async function handleCreateTransaction() {
    const { formattedTransaction, newErrors } = checkTransaction(transaction);

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    const success = await run("saving", async () => {
      if (!accounts) return;
      const newTransaction = await createTransaction(formattedTransaction);
      if (!newTransaction) return;
      const changedAccount = accounts.find(
        (acc) => acc.id === newTransaction.account_id,
      );
      if (!changedAccount) return;
      const changedAmount =
        newTransaction.type === "expense"
          ? newTransaction.amount * -1
          : newTransaction.amount;
      await updateAccount(
        {
          ...changedAccount,
          balance: changedAccount.balance + changedAmount,
        },
        changedAccount.id,
      );
    });
    if (success) {
      setTimeout(() => {
        navigate("/");
        localStorage.removeItem("transaction");
      }, 1000);
    }
  }

  function onBack() {
    navigate("/");
    localStorage.removeItem("transaction");
  }

  if (loadingAccounts || loadingCategories) return <LoadingScreen />;

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-2xl font-bold mb-10">{t(`transaction.type.${type}`)}</h1>
      <TransactionForm
        pageType="create"
        transaction={transaction}
        setTransaction={setTransaction}
        accounts={accounts}
        categories={
          categories?.filter((category) => category.type === type) ?? null
        }
        setCategories={setCategories}
        errors={errors}
      />
      <div className="flex flex-row justify-center gap-5 mt-10">
        <button
          className="px-5 py-2 border bg-[var(--back-btn-bg)]"
          onClick={onBack}
        >
          {t("common.back")}
        </button>
        <button
          className="px-5 py-2 border bg-[var(--save-btn-bg)]"
          onClick={handleCreateTransaction}
        >
          {t("common.save")}
        </button>
      </div>
      <InfoModal state={state} />
    </div>
  );
};

export default CreateTransaction;
