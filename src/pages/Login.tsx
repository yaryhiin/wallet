import { supabase } from "../supabase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import type { AuthErrors } from "../types/errors";

const Login = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<AuthErrors>({
    confirmPassword: false,
    password: false,
    email: false,
  });
  const [authError, setAuthError] = useState("");

  async function handleLogin(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setAuthError("");
    setErrors({
      confirmPassword: false,
      password: false,
      email: false,
    });
    const newErrors: AuthErrors = {
      confirmPassword: false,
      password: false,
      email: false,
    };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = true;
    if (!password) newErrors.password = true;

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      setAuthError("Invalid email or password");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error logging in:", error);
      setAuthError(error.message.split(":")[0]);
      setErrors((prev) => ({ ...prev, password: true, email: true }));
      return;
    }

    setEmail("");
    setPassword("");
    navigate("/");
  }

  function onBack(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setEmail("");
    setPassword("");

    navigate("/");
  }

  return (
    <div className="flex flex-col items-center gap-5 p-5">
      <h1 className="text-2xl mb-7 font-bold">{t("auth.login")}</h1>
      <div className="flex flex-col gap-5 mb-8">
        <div>
          <p>{t("auth.email")}</p>
          <input
            className={
              errors.email
                ? "border border-[var(--error-border)]"
                : "border border-[var(--input-border)]"
            }
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((prev) => ({
                ...prev,
                email: false,
                password: false,
              }));
              setAuthError("");
            }}
          />
          {authError && <p className="text-[var(--error-bg)]">{authError}</p>}
        </div>
        <div>
          <p>{t("auth.password")}</p>
          <input
            className={
              errors.password
                ? "border border-[var(--error-border)]"
                : "border border-[var(--input-border)]"
            }
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrors((prev) => ({
                ...prev,
                email: false,
                password: false,
              }));
              setAuthError("");
            }}
          />
          {authError && <p className="text-[var(--error-bg)]">{authError}</p>}
        </div>
      </div>
      <div className="flex flex-row gap-8">
        <button
          className="min-w-20 border border-[var(--border)] px-5 py-2 bg-[var(--back-btn-bg)]"
          onClick={onBack}
        >
          {t("common.back")}
        </button>
        <button
          className="min-w-20 px-5 py-2 border border-[var(--border)] bg-[var(--save-btn-bg)]"
          onClick={handleLogin}
        >
          {t("auth.login")}
        </button>
      </div>
    </div>
  );
};

export default Login;
