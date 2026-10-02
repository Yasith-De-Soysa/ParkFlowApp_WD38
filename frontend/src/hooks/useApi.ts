import { useCallback, useRef, useEffect } from 'react';

interface UseApiOptions {
  retry?: number;
  timeout?: number;
}

export const useApi = <T,>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) => {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const retryCount = useRef(0);
  const { retry = 3, timeout = 10000 } = options;

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await Promise.race([
        apiCall(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), timeout)
        ),
      ]);
      setData(result as T);
      retryCount.current = 0;
    } catch (err) {
      if (retryCount.current < retry) {
        retryCount.current++;
        setTimeout(execute, 1000 * retryCount.current);
      } else {
        setError(err as Error);
      }
    } finally {
      setLoading(false);
    }
  }, [apiCall, retry, timeout]);

  return { data, loading, error, execute };
};
