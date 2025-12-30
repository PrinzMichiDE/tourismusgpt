import { useState, useCallback, useEffect, useRef } from 'react';

interface AsyncState<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

interface UseAsyncOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T;
  immediate?: boolean;
}

/**
 * Hook for handling async operations with loading and error states
 */
export function useAsync<T, TArgs extends unknown[] = []>(
  asyncFunction: (...args: TArgs) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { onSuccess, onError, initialData = null, immediate = false } = options;
  const mountedRef = useRef(true);
  const callIdRef = useRef(0);

  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const execute = useCallback(
    async (...args: TArgs) => {
      const callId = ++callIdRef.current;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        isError: false,
        error: null,
      }));

      try {
        const result = await asyncFunction(...args);

        // Only update state if this is the most recent call and component is mounted
        if (mountedRef.current && callId === callIdRef.current) {
          setState({
            data: result,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
          onSuccess?.(result);
        }

        return result;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));

        if (mountedRef.current && callId === callIdRef.current) {
          setState({
            data: null,
            error: err,
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
          onError?.(err);
        }

        throw err;
      }
    },
    [asyncFunction, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setState({
      data: initialData,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, [initialData]);

  // Handle immediate execution
  useEffect(() => {
    if (immediate) {
      execute(...([] as unknown as TArgs));
    }
  }, [immediate, execute]);

  // Handle component unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

/**
 * Hook for fetching data with automatic refetch
 */
export function useFetch<T>(
  url: string,
  options?: RequestInit & {
    enabled?: boolean;
    refetchInterval?: number;
  }
) {
  const { enabled = true, refetchInterval, ...fetchOptions } = options || {};

  const fetcher = useCallback(async () => {
    const response = await fetch(url, fetchOptions);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }, [url, fetchOptions]);

  const { data, error, isLoading, execute, reset } = useAsync(fetcher, {
    immediate: enabled,
  });

  // Handle refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => {
      execute();
    }, refetchInterval);

    return () => clearInterval(interval);
  }, [refetchInterval, enabled, execute]);

  return {
    data,
    error,
    isLoading,
    refetch: execute,
    reset,
  };
}

/**
 * Hook for mutations (POST, PUT, DELETE)
 */
export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    onSettled?: (data: TData | null, error: Error | null, variables: TVariables) => void;
  }
) {
  const [state, setState] = useState<{
    data: TData | null;
    error: Error | null;
    isLoading: boolean;
    variables: TVariables | null;
  }>({
    data: null,
    error: null,
    isLoading: false,
    variables: null,
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState({ data: null, error: null, isLoading: true, variables });

      try {
        const data = await mutationFn(variables);
        setState({ data, error: null, isLoading: false, variables });
        options?.onSuccess?.(data, variables);
        options?.onSettled?.(data, null, variables);
        return data;
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        setState({ data: null, error: err, isLoading: false, variables });
        options?.onError?.(err, variables);
        options?.onSettled?.(null, err, variables);
        throw err;
      }
    },
    [mutationFn, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false, variables: null });
  }, []);

  return {
    mutate,
    reset,
    ...state,
    isSuccess: state.data !== null,
    isError: state.error !== null,
  };
}
