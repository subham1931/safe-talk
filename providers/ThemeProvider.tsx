import { PropsWithChildren, useEffect } from 'react';
import { useThemeStore } from '@/store/themeStore';

export function ThemeProvider({ children }: PropsWithChildren) {
  const hydrate = useThemeStore((s) => s.hydrate);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  return children;
}
