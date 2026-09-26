import { useState, useEffect, lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import type { Session, Subscription } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";

import Layout from "./components/Layout";
import LoadingScreen from "./components/LoadingScreen";
import WelcomeScreen from "./pages/WelcomeScreen";

const Home = lazy(() => import("./pages/Home"));
const SignUp = lazy(() => import("./pages/SignUp"));
const Login = lazy(() => import("./pages/Login"));
const CreateAccount = lazy(() => import("./pages/CreateAccount"));
const EditAccount = lazy(() => import("./pages/EditAccount"));
const CreateTransaction = lazy(() => import("./pages/CreateTransaction"));
const EditTransaction = lazy(() => import("./pages/EditTransaction"));
const History = lazy(() => import("./pages/History"));

function App() {
  const { i18n } = useTranslation();
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved) return saved;
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("language");
    if (saved) return saved;
    return "en";
  });

  useEffect(() => {
    if (language) {
      localStorage.setItem("language", language);
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let subscription: Subscription;

    async function loadSession() {
      const { supabase } = await import("./supabase");

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.log("Error fetching session:", error);
      }
      setSession(data.session);
      setAuthLoading(false);

      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setAuthLoading(false);
      });

      subscription = authSubscription;
    }

    loadSession();

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  if (authLoading) return <LoadingScreen />;
  return (
    <>
      <Router>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {!session ? (
              <Route
                element={
                  <Layout
                    toggleTheme={toggleTheme}
                    theme={theme}
                    language={language}
                    setLanguage={setLanguage}
                  />
                }
              >
                <Route path="/" element={<WelcomeScreen />} />

                <Route path="/signup" element={<SignUp />} />

                <Route path="/login" element={<Login />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            ) : (
              <Route
                element={
                  <Layout
                    toggleTheme={toggleTheme}
                    theme={theme}
                    language={language}
                    setLanguage={setLanguage}
                  />
                }
              >
                <Route path="/" element={<Home />} />

                <Route path="/account/new" element={<CreateAccount />} />
                <Route path="/account/:accountId" element={<EditAccount />} />

                <Route
                  path="/transaction/new/income"
                  element={<CreateTransaction type="income" />}
                />
                <Route
                  path="/transaction/new/expense"
                  element={<CreateTransaction type="expense" />}
                />
                <Route
                  path="/transaction/edit/:transactionId"
                  element={<EditTransaction />}
                />

                <Route path="/history" element={<History />} />
              </Route>
            )}
          </Routes>
        </Suspense>
      </Router>
    </>
  );
}

export default App;
