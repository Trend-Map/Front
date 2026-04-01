import { useState, useEffect, useCallback, DependencyList } from 'react';

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  deps: DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('알 수 없는 오류가 발생했습니다'));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { execute(); }, [execute]);

  return { data, loading, error, refetch: execute };
}
