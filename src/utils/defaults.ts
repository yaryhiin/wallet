import i18n from "../i18n";

export const icons = [
  { value: "card_blue", name: i18n.t("icons.card_blue") },
  { value: "card_pink", name: i18n.t("icons.card_pink") },
  { value: "cash", name: i18n.t("icons.cash") },
  { value: "crypto", name: i18n.t("icons.crypto") },
  { value: "bank", name: i18n.t("icons.bank") },
  { value: "euro", name: i18n.t("icons.euro") },
  { value: "usd", name: i18n.t("icons.usd") },
];

export const defaultCategories = [
  { name: "Food", type: "expense" },
  { name: "Rent", type: "expense" },
  { name: "Utilities", type: "expense" },
  { name: "Entertainment", type: "expense" },
  { name: "Transportation", type: "expense" },
  { name: "Healthcare", type: "expense" },
  { name: "Shopping", type: "expense" },
  { name: "Subscriptions", type: "expense" },
  { name: "Education", type: "expense" },
  { name: "Travel", type: "expense" },

  { name: "Salary", type: "income" },
  { name: "Crypto", type: "income" },
  { name: "Interests", type: "income" },
  { name: "Business", type: "income" },
  { name: "Gifts", type: "income" },
  { name: "Rewards", type: "income" },
  { name: "Side Hustle", type: "income" },
];
