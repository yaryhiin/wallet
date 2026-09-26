import { Outlet } from "react-router-dom";

import type { Dispatch, SetStateAction } from "react";

import Footer from "./Footer";
import Header from "./Header";

type LayoutProps = {
  toggleTheme: () => void;
  theme: string;
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
};

export default function Layout({
  toggleTheme,
  theme,
  language,
  setLanguage,
}: LayoutProps) {
  return (
    <>
      <div className="max-w-110 w-full min-h-dvh flex flex-col items-center mx-auto min-[450px]:border-x min-[450px]:border-[var(--border)]">
        <Header
          toggleTheme={toggleTheme}
          theme={theme}
          language={language}
          setLanguage={setLanguage}
        />

        <main className="mb-15 w-full flex flex-col items-center p-4">
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  );
}
