import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import TransactionForm from "../components/TransactionForm";
import InfoModal from "../components/InfoModal";
import LoadingScreen from "../components/LoadingScreen";

import type { TransactionErrors } from "../types/errors";
import type { Transaction } from "../types/transactions";
import type { CategoryDB } from "../types/categories";

import { getPersistedJSON, setPersistedJSON } from "../utils/storage";
import { checkTransaction } from "../utils/checkData";

import { createTransaction } from "../services/transactions";
import { getCategories } from "../services/categories";
import { updateAccount } from "../services/accounts";

import { useAccounts } from "../hooks/useAccounts";
import { useAsyncAction } from "../hooks/useAsyncAction";

type CreateTransactionType = {
  type: "income" | "expense";
};

const CreateTransaction = ({ type }: CreateTransactionType) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { run, state } = useAsyncAction();
  const queryClient = useQueryClient();

  const [loadingCategories, setLoadingCategories] = useState(true);
  const { data: accounts = null, isLoading: loadingAccounts } = useAccounts();
  const [categories, setCategories] = useState<CategoryDB[] | null>(null);
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
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
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
      <h1 className="text-2xl font-bold mb-10">
        {t(`transaction.type.${type}`)}
      </h1>
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
