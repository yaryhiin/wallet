import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import AccountForm from "../components/AccountForm";
import InfoModal from "../components/InfoModal";
import LoadingScreen from "../components/LoadingScreen";

import type { AccountErrors } from "../types/errors";
import type { Account, Currency } from "../types/accounts";

import { fetchCurrencies } from "../services/currencies";
import { getPersistedJSON, setPersistedJSON } from "../utils/storage";
import { checkAccount } from "../utils/checkData";
import { createAccount } from "../services/accounts";

import { useAsyncAction } from "../hooks/useAsyncAction";

const CreateAccount = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { run, state } = useAsyncAction();
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [currencies, setCurrencies] = useState<Currency[] | null>(null);
  const [account, setAccount] = useState<Account>(
    getPersistedJSON("account", {
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
    async function loadCurrencies() {
      setLoading(true);
      try {
        const currencies = await fetchCurrencies();
        setCurrencies(currencies);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadCurrencies();
  }, []);

  useEffect(() => {
    setPersistedJSON("account", account);
  }, [account]);

  async function handleCreateAccount() {
    const { formattedAccount, newErrors } = checkAccount(account);

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    const success = await run("saving", async () => {
      await createAccount(formattedAccount);
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    });
    if (success) {
      setTimeout(() => {
        navigate("/");
        localStorage.removeItem("account");
      }, 1000);
    }
  }

  function onBack() {
    navigate("/");
    localStorage.removeItem("account");
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-2xl font-bold mb-10">{t("account.addAcc")}</h1>
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
          className="px-5 py-2 border bg-[var(--save-btn-bg)]"
          onClick={handleCreateAccount}
        >
          {t("common.save")}
        </button>
      </div>
      <InfoModal state={state} />
    </div>
  );
};

export default CreateAccount;
