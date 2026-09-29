import { useTranslation } from "react-i18next";
import { Settings } from "lucide-react";
import { useState } from "react";

import type { Dispatch, SetStateAction } from "react";

import SettingsModal from "./SettingsModal";

type HeaderProps = {
  toggleTheme: () => void;
  theme: string;
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
  session: boolean;
};

const Header = ({
  toggleTheme,
  theme,
  language,
  setLanguage,
  session,
}: HeaderProps) => {
  const { t, i18n } = useTranslation();

  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="bg-[var(--header-bg)] border-b border-[var(--border)] w-full flex flex-row sticky top-0 z-1000 p-5 items-center justify-between">
      <div className="border bg-[var(--input-bg)] border-[var(--input-border)] px-3 py-2 flex rounded-xl ">
        <button
          onClick={toggleTheme}
          aria-pressed={theme === "dark"}
          aria-label="Toggle theme"
          title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        >
          {theme === "dark"
            ? `🌙 ${t("theme.dark")}`
            : `☀️ ${t("theme.light")}`}
        </button>
      </div>

      <h2 className="text-xl font-bold">Wallet</h2>
      {session ? (
        <button onClick={() => setShowSettings(true)}>
          <Settings size={30} />
        </button>
      ) : (
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
      )}
      {showSettings && (
        <SettingsModal
          setLanguage={setLanguage}
          language={language}
          onBack={() => setShowSettings(false)}
        />
      )}
    </header>
  );
};

export default Header;
