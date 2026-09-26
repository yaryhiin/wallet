import { useTranslation } from "react-i18next";
import { useState, type Dispatch, type SetStateAction } from "react";

import type { Transaction } from "../types/transactions";
import type { TransactionErrors } from "../types/errors";
import type { Category, CategoryDB } from "../types/categories";
import type { AccountDB } from "../types/accounts";

import AddNewCategoryModal from "./AddNewCategoryModal";
import InfoModal from "./InfoModal";

import { getFormattedLocalDateTime } from "../utils/utils";
import { createCategory } from "../services/categories";

import { useAsyncAction } from "../hooks/useAsyncAction";

type TransactionFormProps = {
  pageType: "edit" | "create";
  transaction: Transaction;
  setTransaction: Dispatch<SetStateAction<Transaction>>;
  accounts: AccountDB[] | null;
  categories: CategoryDB[] | null;
  setCategories: Dispatch<SetStateAction<CategoryDB[] | null>>;
  errors: TransactionErrors;
};

const TransactionForm = ({
  pageType,
  transaction,
  setTransaction,
  accounts,
  categories,
  setCategories,
  errors,
}: TransactionFormProps) => {
  const { t } = useTranslation();
  const { run, state } = useAsyncAction();

  const [showAddNewCategoryModal, setShowAddNewCategoryModal] = useState(false);

  async function handleAddNewCategory(newCategory: Category) {
    const success = await run("saving", async () => {
      const createdCategory = await createCategory(newCategory);
      if (createdCategory)
        setCategories((prev) =>
          prev ? [...prev, createdCategory] : [createdCategory],
        );
    });

    if (success) {
      setTimeout(() => {
        setShowAddNewCategoryModal(false);
      }, 1000);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {pageType === "edit" && (
        <div>
          <p className="">{t("transaction.type.title")}</p>
          <select
            value={transaction.type}
            className="border-[var(--input-border)] border w-45"
            required
            onChange={(e) =>
              setTransaction((prev) => ({
                ...prev,
                type: e.target.value === "income" ? "income" : "expense",
              }))
            }
          >
            <option value="income">{t("transaction.type.income")}</option>
            <option value="expense">{t("transaction.type.expense")}</option>
          </select>
        </div>
      )}
      <div>
        <p className="">{t("transaction.amount.title")}</p>
        <input
          type="number"
          value={!transaction.amount ? "" : transaction.amount}
          placeholder={t("transaction.amount.placeHolder")}
          className={`${errors.amount ? "border-[var(--error-border)]" : "border-[var(--input-border)]"} border max-w-45`}
          required
          onChange={(e) =>
            setTransaction((prev) => ({ ...prev, amount: e.target.value }))
          }
        />
      </div>

      <div>
        <p className="">{t("transaction.category")}</p>
        <select
          className={`${errors.category ? "border-[var(--error-border)]" : "border-[var(--border)]"} border max-w-45`}
          value={transaction.category}
          required
          onChange={(e) => {
            if (e.target.value === "add_new_category") {
              setShowAddNewCategoryModal(true);
            } else {
              setTransaction((prev) => ({ ...prev, category: e.target.value }));
            }
          }}
        >
          <option value="" disabled className="text-[var(--text-muted)]">
            {t("transaction.selectCategory")}
          </option>
          <option value="add_new_category">
            + {t("transaction.addNewCategory.title")}
          </option>
          {categories &&
            categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <p className="">{t("account.icon")}</p>
        <select
          className={`${errors.account_id ? "border-[var(--error-border)]" : "border-[var(--border)]"} border w-45`}
          value={transaction.account_id}
          required
          onChange={(e) =>
            setTransaction((prev) => ({
              ...prev,
              account_id: e.target.value,
              currency:
                accounts?.find((acc) => acc.id === e.target.value)?.currency ??
                "",
            }))
          }
        >
          <option value="" className="text-[var(--text-muted)]" disabled>
            {t("transaction.selectMethod")}
          </option>
          {accounts &&
            accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <p className="">{t("transaction.date")}</p>
        <input
          value={transaction.date}
          className={`${errors.date ? "border-[var(--error-border)]" : "border-[var(--border)]"} border w-45`}
          type="datetime-local"
          required
          onChange={(e) => {
            setTransaction((prev) => ({
              ...prev,
              date: getFormattedLocalDateTime(e.target.value),
            }));
          }}
        />
      </div>
      {showAddNewCategoryModal && (
        <AddNewCategoryModal
          onClose={() => setShowAddNewCategoryModal(false)}
          onAddCategory={handleAddNewCategory}
        />
      )}
      <InfoModal state={state} />
    </div>
  );
};

export default TransactionForm;
