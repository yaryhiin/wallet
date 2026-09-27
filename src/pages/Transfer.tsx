import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";

import type { TransactionToPaste, Transfer } from "../types/transactions";
import type { TransferErrors } from "../types/errors";

import InfoModal from "../components/InfoModal";
import LoadingScreen from "../components/LoadingScreen";

import { getPersistedJSON } from "../utils/storage";
import { checkTransfer } from "../utils/checkData";
import { getFormattedLocalDateTime } from "../utils/utils";

import { fetchRate } from "../services/currencies";
import { updateAccount } from "../services/accounts";
import { createTransaction } from "../services/transactions";

import { useAsyncAction } from "../hooks/useAsyncAction";
import { useAccounts } from "../hooks/useAccounts";

const Transfer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, run } = useAsyncAction();
  const queryClient = useQueryClient();

  const { data: accounts = null, isLoading: loadingAccounts } = useAccounts();

  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [transfer, setTransfer] = useState<Transfer>(
    getPersistedJSON("transfer", {
      amount: "",
      exchangeRate: "",
      fromId: "",
      toId: "",
      date: getFormattedLocalDateTime(new Date().toISOString()),
      isFlipped: false,
    }),
  );
  const [errors, setErrors] = useState<TransferErrors>({
    amount: false,
    fromId: false,
    toId: false,
    exchangeRate: false,
    date: false,
  });

  useEffect(() => {
    if (!accounts || (transfer.fromId && transfer.toId)) return;

    setTransfer((prev) => ({
      ...prev,
      fromId: accounts[0].id,
      toId: accounts[0].id,
    }));
  }, [accounts, transfer.fromId, transfer.toId]);

  useEffect(() => {
    if (transfer) localStorage.setItem("transfer", JSON.stringify(transfer));
  }, [transfer]);

  useEffect(() => {
    async function loadRate() {
      if (!fromCurrency || !toCurrency) return;

      const fetchedRate = await fetchRate(fromCurrency, toCurrency);

      if (fetchedRate) {
        setTransfer((prev) => ({
          ...prev,
          exchangeRate: String(Math.round(Number(fetchedRate) * 1000) / 1000),
        }));
      }
    }

    loadRate();
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (!accounts || !transfer.fromId || !transfer.toId) return;
    setFromCurrency(
      accounts.find((acc) => acc.id === transfer.fromId)?.currency ??
        accounts[0].id,
    );
    setToCurrency(
      accounts.find((acc) => acc.id === transfer.toId)?.currency ??
        accounts[0].id,
    );
  }, [transfer.fromId, transfer.toId, accounts]);

  async function handleTransfer() {
    if (!accounts) return;
    const { newErrors, numericRate } = checkTransfer(transfer);

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }
    const success = await run("saving", async () => {
      const adjustedExchangeRate = transfer.isFlipped
        ? 1 / numericRate
        : numericRate;

      const transactionFrom: TransactionToPaste = {
        account_id: transfer.fromId,
        type: "expense",
        category: t(`transaction.type.transfer`),
        amount: Number(transfer.amount),
        currency: fromCurrency,
        date: transfer.date,
      };

      const transactionTo: TransactionToPaste = {
        account_id: transfer.toId,
        type: "income",
        category: t(`transaction.type.transfer`),
        amount: Number(transfer.amount) * adjustedExchangeRate,
        currency: toCurrency,
        date: transfer.date,
      };

      await createTransaction(transactionFrom);
      await createTransaction(transactionTo);

      const changedAccountFrom = accounts.find(
        (acc) => acc.id === transactionFrom.account_id,
      );
      if (!changedAccountFrom) return;
      await updateAccount(
        {
          ...changedAccountFrom,
          balance: changedAccountFrom.balance - transactionFrom.amount,
        },
        changedAccountFrom.id,
      );

      const changedAccountTo = accounts.find(
        (acc) => acc.id === transactionTo.account_id,
      );
      if (!changedAccountTo) return;
      await updateAccount(
        {
          ...changedAccountTo,
          balance: changedAccountTo.balance + transactionTo.amount,
        },
        changedAccountTo.id,
      );
      await queryClient.invalidateQueries({
        queryKey: ["accounts"],
      });
    });
    if (success) {
      setTimeout(() => {
        localStorage.removeItem("transfer");
        navigate("/");
      }, 1000);
    }
  }

  function onBack() {
    localStorage.removeItem("transfer");
    navigate("/");
  }

  function handleSwap() {
    if (!fromCurrency || !toCurrency) return;
    const newFrom = toCurrency;
    const newTo = fromCurrency;
    setTransfer((prev) => ({
      ...prev,
      isFlipped: !prev.isFlipped,
    }));
    setFromCurrency(newFrom);
    setToCurrency(newTo);
  }

  if (loadingAccounts) return <LoadingScreen />;

  return (
    <div className="flex flex-col items-center p-5">
      <h1 className="text-2xl font-bold mb-10">
        {t(`transaction.type.transfer`)}
      </h1>
      <div className="flex flex-col items-center gap-4">
        <div>
          <p>{t("transaction.amount.title")}</p>
          <input
            className={`${errors.amount ? "border-[var(--error-border)]" : "border-[var(--input-border)]"} border max-w-45`}
            value={transfer.amount}
            placeholder={t("transaction.amount.placeHolder")}
            type="number"
            required
            onChange={(e) => {
              setTransfer((prev) => ({ ...prev, amount: e.target.value }));
            }}
          />
        </div>

        <div>
          <p>{t("transaction.from")}</p>
          <select
            className={`${errors.fromId ? "border-[var(--error-border)]" : "border-[var(--input-border)]"} border w-45`}
            value={transfer.fromId}
            required
            onChange={(e) =>
              setTransfer((prev) => ({ ...prev, fromId: e.target.value }))
            }
          >
            {accounts &&
              accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <p>{t("transaction.to")}</p>
          <select
            className={`${errors.toId ? "border-[var(--error-border)]" : "border-[var(--input-border)]"} border w-45`}
            value={transfer.toId}
            required
            onChange={(e) =>
              setTransfer((prev) => ({ ...prev, toId: e.target.value }))
            }
          >
            {accounts &&
              accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <p>{t("transaction.rate.title")}</p>
          <div className="w-45">
            1 {fromCurrency} =
            <input
              className={`${errors.exchangeRate ? "border-[var(--error-border)]" : "border-[var(--input-border)]"} border max-w-12`}
              value={transfer.exchangeRate}
              placeholder={t("transaction.rate.placeHolder")}
              type="number"
              required
              onChange={(e) => {
                setTransfer((prev) => ({
                  ...prev,
                  exchangeRate: e.target.value,
                }));
              }}
            />{" "}
            {toCurrency}
            <button
              className="w-7 h-7 bg-[var(--back-btn-bg)] ml-1 border border-[var(--input-border)]"
              onClick={handleSwap}
            >
              🔄
            </button>
          </div>
        </div>

        <div>
          <p>{t("transaction.date")}</p>
          <input
            type="datetime-local"
            className={`${errors.date ? "border-[var(--error-border)]" : "border-[var(--input-border)]"} border max-w-45`}
            value={transfer.date}
            required
            onChange={(e) =>
              setTransfer((prev) => ({
                ...prev,
                date: getFormattedLocalDateTime(e.target.value),
              }))
            }
          />
        </div>
      </div>
      <div className="flex flex-row justify-center gap-5 mt-10">
        <button
          className="px-5 py-2 border bg-[var(--back-btn-bg)]"
          onClick={onBack}
        >
          {t("common.back")}
        </button>
        <button
          className="px-5 py-2 border bg-[var(--save-btn-bg)]"
          onClick={handleTransfer}
        >
          {t("common.save")}
        </button>
      </div>
      <InfoModal state={state} />
    </div>
  );
};

export default Transfer;
