import { supabase } from "../supabase";
import type {
  TransactionDB,
  TransactionToPaste,
  Range,
} from "../types/transactions";
import { getCurrentUserId } from "./auth";

export async function getTransactions(range: Range): Promise<TransactionDB[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .range(range.from, range.to);

  if (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }

  return data || [];
}

export async function getLatestTransactions(
  limit: number,
): Promise<TransactionDB[]> {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }

  return data || [];
}

export async function getTransactionById(
  transationId: string,
): Promise<TransactionDB> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .eq("id", transationId)
    .single();

  if (error) throw error;

  return data;
}

export async function createTransaction(
  transaction: TransactionToPaste,
): Promise<TransactionDB> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("transactions")
    .insert({ ...transaction, user_id: userId })
    .select()
    .single();

  if (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }

  return data;
}

export async function updateTransaction(
  transaction: TransactionToPaste,
  transactionId: string,
): Promise<TransactionDB> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from("transactions")
    .update(transaction)
    .eq("id", transactionId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating transaction:`, error.message);
    throw error;
  }

  return data;
}

export async function deleteTransaction(
  transactionId: string,
): Promise<boolean> {
  const userId = await getCurrentUserId();

  const { error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", transactionId)
    .eq("user_id", userId);

  if (error) {
    console.error(`Error deleting transaction:`, error.message);
    return false;
  }

  return true;
}
