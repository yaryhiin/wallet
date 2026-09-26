import i18n from "../i18n";

const locales = {
  en: "en-CA",
  uk: "uk-UA",
  ru: "ru-RU",
  es: "es-ES",
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString(
    locales[i18n.language as keyof typeof locales] ?? "en-CA",
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
};

export const getFormattedLocalDateTime = (dateStr: string) => {
  const date = new Date(dateStr);

  // Create a small helper function that makes a string at least 2 characters long
  // otherwise add "0" before it
  const pad = (num: number) => num.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
