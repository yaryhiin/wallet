import { useTranslation } from "react-i18next";
import { useState, useRef } from "react";
import { Pencil, Trash2, EllipsisVertical } from "lucide-react";

import type { Dispatch, SetStateAction } from "react";

import type { Transaction } from "../types/transactions";
import type { TransactionErrors } from "../types/errors";
import type { Category, CategoryDB } from "../types/categories";
import type { AccountDB } from "../types/accounts";

import ManageCategoryModal from "./ManageCategoryModal";
import InfoModal from "./InfoModal";
import ExecuteModal from "./ExecuteModal";

import { getFormattedLocalDateTime } from "../utils/utils";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categories";

import { useAsyncAction } from "../hooks/useAsyncAction";
import { useOutsideClick } from "../hooks/useOutsideClick";

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

  const [showOptions, setShowOptions] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [chosenCategory, setChosenCategory] = useState(transaction.category);

  const [showAddNewCategoryModal, setShowAddNewCategoryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useOutsideClick(menuRef, showOptions, () => setShowOptions(false));

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

  async function handleUpdateCategory(newCategory: Category) {
    if (!chosenCategory || !categories) return;
    const categoryId =
      categories.find((c) => c.name === chosenCategory)?.id ?? "";
    if (!categoryId) return;
    const success = await run("saving", async () => {
      const updatedCategory = await updateCategory(newCategory, categoryId);
      if (updatedCategory)
        setCategories((prev) =>
          prev
            ? prev.map((c) =>
                c.id === updatedCategory.id ? updatedCategory : c,
              )
            : [updatedCategory],
        );
      setChosenCategory(updatedCategory.name);
      setTransaction((prev) => ({ ...prev, category: updatedCategory.name }));
    });

    if (success) {
      setTimeout(() => {
        setShowEditModal(false);
      }, 1000);
    }
  }

  async function handleDeleteCategory() {
    if (!chosenCategory || !categories) return;
    const categoryId =
      categories.find((c) => c.name === chosenCategory)?.id ?? "";
    if (!categoryId) return;
    const success = await run("saving", async () => {
      const deletedCategory = await deleteCategory(categoryId);
      if (deletedCategory)
        setCategories((prev) =>
          prev ? prev.filter((c) => c.name !== chosenCategory) : prev,
        );
      setChosenCategory("");
      setTransaction((prev) => ({ ...prev, category: "" }));
    });

    if (success) {
      setTimeout(() => {
        setShowDeleteModal(false);
      }, 1000);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {pageType === "edit" && (
        <div>
          <p>{t("transaction.type.title")}</p>
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
        <p>{t("transaction.amount.title")}</p>
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
        <p>{t("transaction.category")}</p>
        <div className="flex flex-row items-center">
          <select
            className={`${errors.category ? "border-[var(--error-border)]" : "border-[var(--border)]"} border max-w-45`}
            value={transaction.category}
            required
            onChange={(e) => {
              if (e.target.value === "add_new_category") {
                setShowAddNewCategoryModal(true);
              } else {
                setTransaction((prev) => ({
                  ...prev,
                  category: e.target.value,
                }));
                setChosenCategory(e.target.value);
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
          <div className="relative justify-self-end w-full">
            {chosenCategory &&
              chosenCategory !== "add_new_category" &&
              (showOptions && chosenCategory === transaction.category ? (
                <div
                  ref={menuRef}
                  className="z-998 bg-[var(--back-btn-bg)] absolute right-0 flex flex-col items-center justify-center w-fit rounded-lg border border-[var(--input-border)]"
                >
                  <button
                    className="w-full py-2 px-4 flex flex-row gap-2 items-center"
                    onClick={() => {
                      setShowEditModal(true);
                    }}
                  >
                    <Pencil size={15} />
                    {t("common.edit")}
                  </button>
                  <button
                    className="w-full py-2 px-4 flex flex-row gap-2 items-center"
                    onClick={() => {
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 size={15} />
                    {t("common.delete")}
                  </button>
                </div>
              ) : (
                <button
                  className="absolute top-[calc(100%-21px)] w-5 h-11 p-0 left-1"
                  onClick={() => {
                    setShowOptions(true);
                    setChosenCategory(transaction.category);
                  }}
                  aria-label="Category options"
                >
                  <EllipsisVertical size={20} />
                </button>
              ))}
          </div>
        </div>
      </div>
      <div>
        <p>{t("transaction.method")}</p>
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
        <p>{t("transaction.date")}</p>
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
        <ManageCategoryModal
          onClose={() => setShowAddNewCategoryModal(false)}
          onAddCategory={handleAddNewCategory}
        />
      )}
      {showEditModal && chosenCategory && (
        <ManageCategoryModal
          category={{ name: chosenCategory, type: transaction.type }}
          onClose={() => setShowEditModal(false)}
          onAddCategory={handleUpdateCategory}
        />
      )}
      {showDeleteModal && (
        <ExecuteModal
          text={t("modal.category")}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteCategory}
        />
      )}
      <InfoModal state={state} />
    </div>
  );
};

export default TransactionForm;
