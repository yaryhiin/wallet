import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

import type { Currency, Account } from "../types/accounts";
import type { AccountErrors } from "../types/errors";

import AccountForm from "../components/AccountForm";
import InfoModal from "../components/InfoModal";
import LoadingScreen from "../components/LoadingScreen";
import ExecuteModal from "../components/ExecuteModal";

import { useAsyncAction } from "../hooks/useAsyncAction";

import {
  deleteAccount,
  getAccountById,
  updateAccount,
} from "../services/accounts";
import { getPersistedJSON, setPersistedJSON } from "../utils/storage";
import { fetchCurrencies } from "../services/currencies";
import { checkAccount } from "../utils/checkData";

const EditAccount = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { run, state } = useAsyncAction();
  const { accountId } = useParams();
  const queryClient = useQueryClient();

  const accountKey = `account-${accountId}`;

  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[] | null>(null);
  const [account, setAccount] = useState<Account>(
    getPersistedJSON(accountKey, {
      name: "",
      balance: "",
      currency: "",
      icon: "",
    }),
  );
  const [errors, setErrors] = useState<AccountErrors>({
    name: false,
    balance: false,
    currency: false,
    icon: false,
  });

  useEffect(() => {
    async function loadAccount() {
      const savedAccount = localStorage.getItem(accountKey);
      if (savedAccount || !accountId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const accountData = await getAccountById(accountId);
        if (accountData) {
          setAccount({
            name: accountData.name,
            balance: String(accountData.balance),
            currency: accountData.currency,
            icon: accountData.icon,
          });
        }
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAccount();
  }, [accountId, accountKey]);

  useEffect(() => {
    async function loadCurrencies() {
      try {
        const currencies = await fetchCurrencies();
        setCurrencies(currencies);
      } catch (error) {
        console.error(error);
      }
    }
    loadCurrencies();
  }, []);

  useEffect(() => {
    if (loading || !account) return;
    setPersistedJSON(accountKey, account);
  }, [account, accountKey, loading]);

  async function handleUpdateAccount() {
    if (!accountId) return;

    const { formattedAccount, newErrors } = checkAccount(account);

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    const success = await run("saving", async () => {
      await updateAccount(formattedAccount, accountId);
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    });
    if (success) {
      setTimeout(() => {
        navigate("/");
        localStorage.removeItem(accountKey);
      }, 1000);
    }
  }

  async function handleDeleteAccount() {
    if (!accountId) return;
    setShowDeleteModal(false);
    const success = await run("deleting", async () => {
      await deleteAccount(accountId);
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    });

    if (success) {
      setTimeout(() => {
        navigate("/");
        localStorage.removeItem(accountKey);
      }, 1000);
    }
  }

  function onBack() {
    navigate("/");
    localStorage.removeItem(accountKey);
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-2xl font-bold mb-10">{t("account.changeAcc")}</h1>
      <AccountForm
        account={account}
        setAccount={setAccount}
        currencies={currencies}
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
          onClick={handleUpdateAccount}
        >
          {t("common.save")}
        </button>
      </div>
      <InfoModal state={state} />
      {showDeleteModal && (
        <ExecuteModal
          text={`${t("modal.account.part1")} ${account.balance} ${account.currency}${t("modal.account.part2")}`}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteAccount}
        />
      )}
    </div>
  );
};

export default EditAccount;
