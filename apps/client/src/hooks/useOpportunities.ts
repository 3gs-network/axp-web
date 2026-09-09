import { useQuery } from "@tanstack/react-query";
import { fetchOpportunities, type MappedOpportunity } from "@/lib/listings";

export function useOpportunities() {
  return useQuery<MappedOpportunity[]>({
    queryKey: ["opportunities"],
    queryFn: ({ signal }) => fetchOpportunities(signal),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
