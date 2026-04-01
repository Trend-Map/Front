import { useState, useEffect } from 'react';
import { subscribeToUpdates } from '../data/mockData';

export function useMockStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribeToUpdates(() => setTick(t => t + 1));
  }, []);
}
