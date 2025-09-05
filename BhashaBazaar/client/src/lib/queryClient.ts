import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Ensure the URL starts with proper API path
      const url = queryKey.join("/").startsWith('/api') 
        ? queryKey.join("/") 
        : `/api/${queryKey.join("/")}`;
      
      const res = await fetch(url as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error) {
      // If network fails and we're offline, let TanStack Query handle cached data
      if (!navigator.onLine) {
        console.log('Offline - will attempt to serve from cache');
        throw new Error('Offline - no network connection');
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes - allow some staleness for offline
      gcTime: 24 * 60 * 60 * 1000, // 24 hours - keep data longer for offline use
      retry: (failureCount, error) => {
        // Don't retry if offline
        if (!navigator.onLine) {
          return false;
        }
        // Don't retry for most errors
        return failureCount < 1;
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations if offline
        if (!navigator.onLine) {
          return false;
        }
        return false;
      },
    },
  },
});
