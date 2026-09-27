import { useQuery } from "@tanstack/react-query";

import { getAccounts } from "../services/accounts";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: getAccounts,
    staleTime: 1000 * 60 * 5,
  });
}
