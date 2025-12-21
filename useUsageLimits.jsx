import { useState } from 'react';

export function useUsageLimits(user) {
  // ALL FEATURES PERMANENTLY UNLOCKED - No usage limits whatsoever
  const [loading] = useState(false);
  const [usage] = useState({});

  // isLocked ALWAYS returns false - EVERYTHING IS UNLOCKED
  const isLocked = () => false;

  return { usage, loading, isLocked };
}