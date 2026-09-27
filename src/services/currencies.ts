import type { Currency } from "../types/accounts";

export async function fetchCurrencies(): Promise<Currency[] | null> {
  try {
    const res = await fetch(`https://api.frankfurter.dev/v2/currencies`);
    const data = await res.json();
    if (!data.length || data === undefined) {
      return null;
    }
    return data;
  } catch (error) {
    console.error("Failed to fetch currencies:", error);
    return null;
  }
}

export async function fetchRate(
  fromCurrency: string,
  toCurrency: string,
): Promise<string | null> {
  if (fromCurrency === toCurrency) return "1";

  try {
    const res = await fetch(
      `https://api.frankfurter.dev/v2/rate/${fromCurrency}/${toCurrency}`,
    );
    const data = await res.json();
    if (!data.rate) {
      return null;
    }
    return data.rate;
  } catch (error) {
    console.error("Failed to fetch exchange rate:", error);
    return null;
  }
}
