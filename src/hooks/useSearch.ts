import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useRef } from "react";
import { SearchParams, SearchResponse } from "../types/search";

// Mock data for development
const MOCK_DATA: SearchResponse = {
  pagination: {
    total: 152,
    pageSize: 10,
    currentOffset: 0,
    nextOffset: 10,
    previousOffset: null,
    hasMore: true,
    totalPages: 16,
    currentPage: 1,
  },
  results: [
    {
      id: "doc-123",
      sourceSystem: "ebao",
      contentType: "application/pdf",
      filename: "annual_report_2023.pdf",
      createdAt: "2024-01-15T09:30:00Z",
    },
    {
      id: "doc-456",
      sourceSystem: "ebao",
      contentType: "text/plain",
      filename: "meeting_notes.txt",
      createdAt: "2024-01-14T14:25:00Z",
    },
    {
      id: "doc-789",
      sourceSystem: "ebao",
      contentType: "application/msword",
      filename: "contract_draft.docx",
      createdAt: "2024-01-13T11:20:00Z",
    },
    {
      id: "doc-101",
      sourceSystem: "ebao",
      contentType: "image/jpeg",
      filename: "company_photo.jpg",
      createdAt: "2024-01-12T16:45:00Z",
    },
    {
      id: "doc-102",
      sourceSystem: "ebao",
      contentType: "application/vnd.ms-excel",
      filename: "financial_report.xlsx",
      createdAt: "2024-01-11T13:15:00Z",
    },
  ],
};

export function useSearch(initialParams: SearchParams) {
  const [params, setParams] = useState<SearchParams>(initialParams);
  const [enabled, setEnabled] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const fetchSearch = useCallback(
    async ({ signal }: { signal?: AbortSignal }) => {
      // In development, return mock data
      // if (import.meta.env.DEV) {
      //   await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      //   return {
      //     ...MOCK_DATA,
      //     results: MOCK_DATA.results.slice(
      //       params.offset,
      //       params.offset + params.count
      //     ),
      //     pagination: {
      //       ...MOCK_DATA.pagination,
      //       currentOffset: params.offset,
      //       nextOffset: params.offset + params.count < MOCK_DATA.pagination.total
      //         ? params.offset + params.count
      //         : null,
      //       previousOffset: params.offset > 0 ? params.offset - params.count : null,
      //       currentPage: Math.floor(params.offset / params.count) + 1
      //     }
      //   };
      // }

      const response = await fetch(
        `https://api.alliedworld.dev/api/v1/docsville/search `,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
          signal,
        }
      );

      if (!response.ok) {
        throw new Error("Search request failed");
      }

      return response.json() as Promise<SearchResponse>;
    },
    [params]
  );

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["search", params],
    queryFn: ({ signal }) => fetchSearch({ signal }),
    enabled: enabled, // Only run the query when enabled is true
    staleTime: 30000, // Consider data fresh for 30 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
  });

  const updateParams = useCallback((newParams: Partial<SearchParams>) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  const executeSearch = useCallback(() => {
    setEnabled(true);
  }, []);

  const prefetchNextPage = useCallback(() => {
    if (data?.pagination.hasMore) {
      const nextPageParams = {
        ...params,
        offset: data.pagination.nextOffset!,
      };

      queryClient.prefetchQuery({
        queryKey: ["search", nextPageParams],
        queryFn: ({ signal }) => fetchSearch({ signal }),
        enabled: enabled,
      });
    }
  }, [data, params, queryClient, fetchSearch, enabled]);

  return {
    data,
    error,
    isLoading,
    isFetching,
    updateParams,
    executeSearch,
    prefetchNextPage,
    currentParams: params,
  };
}
