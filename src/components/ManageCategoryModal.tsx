import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Category } from "../types/categories";
import type { CategoryErrors } from "../types/errors";

import { checkCategory } from "../utils/checkData";

type ManageCategoryModalProps = {
  category?: Category;
  onClose: () => void;
  onAddCategory: (newCategory: Category) => void;
};

const ManageCategoryModal = ({
  category,
  onClose,
  onAddCategory,
}: ManageCategoryModalProps) => {
  const { t } = useTranslation();
  const [newCategory, setNewCategory] = useState<Category>(
    category ?? {
      name: "",
      type: "",
    },
  );
  const [errors, setErrors] = useState<CategoryErrors>({
    name: false,
    type: false,
  });

  function handleSubmit() {
    const newErrors = checkCategory(newCategory);
    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }

    onAddCategory(newCategory);
  }

  return (
    <div className="fixed w-dvw h-dvh top-0 left-0 bg-black/75 flex justify-center items-center text-center z-[1001]">
      <div className="flex flex-col items-center justify-center gap-6 bg-[var(--card-bg)] text-[var(--text)] px-8 py-6 border border-gray-500 rounded-xl">
        <h2 className="text-xl font-semibold">
          {t("transaction.addNewCategory.title")}
        </h2>
        <input
          className={`${errors.name ? "border-[var(--error-border)]" : "border-[var(--input-border)]"} border max-w-45`}
          type="text"
          value={newCategory.name}
          onChange={(e) =>
            setNewCategory((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder={t("transaction.addNewCategory.placeHolder")}
        />
        <select
          value={newCategory.type}
          className={`${errors.type ? "border-[var(--error-border)]" : "border-[var(--input-border)]"} border max-w-45`}
          required
          onChange={(e) =>
            setNewCategory((prev) => ({
              ...prev,
              type: e.target.value === "income" ? "income" : "expense",
            }))
          }
        >
          <option value="" className="text-[var(--text-muted)]" disabled>
            {t("transaction.type.select")}
          </option>
          <option value="income">{t("transaction.type.income")}</option>
          <option value="expense">{t("transaction.type.expense")}</option>
        </select>
        <div className="flex flex-row justify-center gap-5 mt-3">
          <button
            className="px-5 py-2 border bg-[var(--back-btn-bg)]"
            onClick={handleSubmit}
          >
            {t("common.add")}
          </button>
          <button
            className="px-5 py-2 border bg-[var(--save-btn-bg)]"
            onClick={onClose}
          >
            {t("common.back")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageCategoryModal;
