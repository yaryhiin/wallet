import { X } from "lucide-react";

import type { SortConfig } from "../types/transactions";
import type { Dispatch, SetStateAction } from "react";

import type { TransactionDB } from "../types/transactions";

type SortModalProps = {
  onBack: () => void;
  sortConfig: SortConfig;
  setSortConfig: Dispatch<SetStateAction<SortConfig>>;
};

const SortModal = ({ onBack, sortConfig, setSortConfig }: SortModalProps) => {
  const sortOptions: { key: keyof TransactionDB; name: string }[] = [
    { key: "date", name: "Date" },
    { key: "amount", name: "Amount" },
    { key: "category", name: "Category" },
    { key: "account_id", name: "Method" },
    { key: "currency", name: "Currency" },
  ];

  const orderOptions = [
    { direction: "asc", name: "Ascending" },
    { direction: "desc", name: "Descending" },
  ];

  return (
    <div className="fixed w-dvw h-dvh top-0 left-0 bg-black/75 flex justify-center items-center text-center z-[1001]">
      <div className="w-fit flex flex-col items-center justify-center gap-8 bg-[var(--card-bg)] text-[var(--text)] px-4 py-4 border border-gray-500 rounded-xl">
        <div className="w-full grid grid-cols-[1fr_auto_1fr]">
          <button className="col-start-1" onClick={onBack}>
            <X />
          </button>
          <h1 className="col-start-2 text-xl font-bold w-full">Sort</h1>
        </div>
        <div className="grid grid-cols-[auto_auto] gap-x-10 px-3">
          <div className="flex flex-col gap-1 text-left">
            <p className="mb-2 text-lg font-semibold">Sort By</p>
            {sortOptions.map((option) => (
              <label key={option.key}>
                <input
                  type="radio"
                  name="sort"
                  value={option.key}
                  checked={sortConfig.key === option.key}
                  onChange={() =>
                    setSortConfig((prev) => ({ ...prev, key: option.key }))
                  }
                />

                {option.name}
              </label>
            ))}
          </div>
          <div className="flex flex-col gap-1 text-left">
            <p className="mb-2 text-lg font-semibold">Order</p>
            {orderOptions.map((option) => (
              <label key={option.direction}>
                <input
                  type="radio"
                  name="order"
                  value={option.direction}
                  checked={sortConfig.direction === option.direction}
                  onChange={() =>
                    setSortConfig((prev) => ({
                      ...prev,
                      direction: option.direction,
                    }))
                  }
                />
                {option.name}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortModal;
