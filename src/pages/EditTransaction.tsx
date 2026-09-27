import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import TransactionForm from "../components/TransactionForm";
import InfoModal from "../components/InfoModal";
import LoadingScreen from "../components/LoadingScreen";
import ExecuteModal from "../components/ExecuteModal";

import type { TransactionErrors } from "../types/errors";
import type { TransactionDB, Transaction } from "../types/transactions";
import type { CategoryDB } from "../types/categories";

import { getPersistedJSON, setPersistedJSON } from "../utils/storage";
import { checkTransaction } from "../utils/checkData";

import {
  deleteTransaction,
  getTransactionById,
  updateTransaction,
} from "../services/transactions";
import { getCategories } from "../services/categories";
import { updateAccount } from "../services/accounts";

import { useAsyncAction } from "../hooks/useAsyncAction";
import { useAccounts } from "../hooks/useAccounts";
const EditTransaction = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { run, state } = useAsyncAction();
  const { transactionId } = useParams();
  const queryClient = useQueryClient();

  const { data: accounts = null, isLoading: loadingAccounts } = useAccounts();

  const transactionKey = `transaction-${transactionId}`;
  const initialTransactionKey = `initialTransaction-${transactionId}`;

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<CategoryDB[] | null>(null);
  const [transaction, setTransaction] = useState<Transaction>(
    getPersistedJSON(transactionKey, {
      account_id: "",
      type: "income",
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
  const [initialTransaction, setInitialTransaction] = useState<TransactionDB>(
    getPersistedJSON(initialTransactionKey, {
      id: "",
      user_id: "",
      account_id: "",
      type: "income",
      amount: 0,
      category: "",
      date: "",
      currency: "",
      created_at: "",
    }),
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errors, setErrors] = useState<TransactionErrors>({
    account_id: false,
    amount: false,
    category: false,
    date: false,
  });

  useEffect(() => {
    async function loadTransaction() {
      const savedTransaction = localStorage.getItem(transactionKey);
      if (savedTransaction || !transactionId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const transactionData = await getTransactionById(transactionId);
        if (transactionData) {
          setTransaction({
            amount: String(transactionData.amount),
            type: transactionData.type,
            category: transactionData.category,
            account_id: transactionData.account_id,
            currency: transactionData.currency,
            date: transactionData.date,
          });
          setInitialTransaction(transactionData);
        }
      } catch (error) {
        console.error("Error fetching transaction data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTransaction();
  }, [transactionId, transactionKey]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const categoriesData = await getCategories();
        if (categoriesData) setCategories(categoriesData);
      } catch (error) {
        console.error(error);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    if (loading || !transaction) return;
    setPersistedJSON(transactionKey, transaction);
  }, [transaction, transactionKey, loading]);

  useEffect(() => {
    if (loading || !initialTransaction) return;
    setPersistedJSON(initialTransactionKey, initialTransaction);
  }, [initialTransaction, initialTransactionKey, loading]);

  async function handleUpdateTransaction() {
    if (!accounts || !transactionId) return;
    const { formattedTransaction, newErrors } = checkTransaction(transaction);

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    const success = await run("saving", async () => {
      const accountOld = accounts.find(
        (a) => a.id === initialTransaction.account_id,
      );
      const accountNew = accounts.find(
        (a) => a.id === formattedTransaction.account_id,
      );
      if (!accountOld || !accountNew) return;
      accountOld.balance =
        initialTransaction.type === "income"
          ? accountOld.balance - initialTransaction.amount
          : accountOld.balance + initialTransaction.amount;
      accountNew.balance =
        transaction.type === "income"
          ? accountNew.balance + formattedTransaction.amount
          : accountNew.balance - formattedTransaction.amount;
      const updatedAccountOld = await updateAccount(
        {
          name: accountOld.name,
          balance: accountOld.balance,
          currency: accountOld.currency,
          icon: accountOld.icon,
        },
        accountOld.id,
      );
      if (!updatedAccountOld) return;
      const updatedAccountNew = await updateAccount(
        {
          name: accountNew.name,
          balance: accountNew.balance,
          currency: accountNew.currency,
          icon: accountNew.icon,
        },
        accountNew.id,
      );
      if (!updatedAccountNew) return;
      const newTransaction = await updateTransaction(
        formattedTransaction,
        transactionId,
      );
      if (!newTransaction) return;
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    });
    if (success) {
      setTimeout(() => {
        navigate("/");
        localStorage.removeItem(transactionKey);
        localStorage.removeItem(initialTransactionKey);
      }, 1000);
    }
  }

  async function handleDeleteTransaction() {
    if (!transactionId || !accounts) return;
    setShowDeleteModal(false);
    const success = await run("deleting", async () => {
      const changedAccount = accounts.find(
        (acc) => acc.id === initialTransaction.account_id,
      );
      if (!changedAccount) return;
      const changedAmount =
        initialTransaction.type === "expense"
          ? initialTransaction.amount
          : initialTransaction.amount * -1;
      await updateAccount(
        {
          ...changedAccount,
          balance: changedAccount.balance + changedAmount,
        },
        changedAccount.id,
      );
      await deleteTransaction(transactionId);
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    });
    if (success) {
      setTimeout(() => {
        navigate("/");
        localStorage.removeItem(transactionKey);
        localStorage.removeItem(initialTransactionKey);
      }, 1000);
    }
  }

  function onBack() {
    navigate("/");
    localStorage.removeItem(transactionKey);
    localStorage.removeItem(initialTransactionKey);
  }

  if (loading || loadingAccounts) return <LoadingScreen />;

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-2xl font-bold mb-10">
        {t("transaction.changeTrans")}
      </h1>
      <TransactionForm
        pageType="edit"
        transaction={transaction}
        setTransaction={setTransaction}
        accounts={accounts}
        categories={categories}
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
          className="px-5 py-2 border border-[var(--delete-btn-bg)] border-2 bg-[var(--back-btn-bg)]"
          onClick={() => setShowDeleteModal(true)}
        >
          {t("common.delete")}
        </button>
        <button
          className="px-5 py-2 border bg-[var(--save-btn-bg)]"
          onClick={handleUpdateTransaction}
        >
          {t("common.save")}
        </button>
      </div>
      <InfoModal state={state} />
      {showDeleteModal && (
        <ExecuteModal
          text={t("modal.transaction")}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteTransaction}
        />
      )}
    </div>
  );
};

export default EditTransaction;
