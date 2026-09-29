import { useTranslation } from "react-i18next";
import { supabase } from "../supabase";

import type { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";

type SettingsModalProps = {
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
  onBack: () => void;
};

const SettingsModal = ({
  setLanguage,
  language,
  onBack,
}: SettingsModalProps) => {
  const { i18n, t } = useTranslation();

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    onBack();
  }

  return (
    <div className="fixed w-dvw h-dvh top-0 left-0 bg-black/75 flex justify-center items-center text-center z-[1001]">
      <div className="min-w-60 flex flex-col items-center justify-center gap-7 bg-[var(--card-bg)] text-[var(--text)] px-3 py-6 border border-gray-500 rounded-xl">
        <div className="w-full grid grid-cols-[1fr_auto_1fr] px-4">
          <button className="col-start-1" onClick={onBack}>
            <X />
          </button>
          <h1 className="col-start-2 text-xl font-bold w-full">Settings</h1>
        </div>
        <div className="flex flex-col gap-2">
          <p className="font-semibold">{t("language.title")}</p>
          <select
            value={language}
            onChange={(e) => {
              i18n.changeLanguage(e.target.value);
              setLanguage(e.target.value);
            }}
            className="border p-2 rounded-lg bg-[var(--input-bg)]"
            aria-label={t("language.title")}
          >
            <option value="en">{t("language.en")}</option>
            <option value="pl">{t("language.pl")}</option>
          </select>
        </div>
        <button
          className="text-sm px-4 py-2 border bg-[var(--back-btn-bg)] border border-[var(--delete-btn-bg)] border-2"
          onClick={handleLogout}
        >
          {t("auth.logout")}
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
