"use client";

import { useEffect, useState } from "react";
import { useRef } from "react";
import { readLocalStorage, writeLocalStorage } from "@/lib/persistence/local-storage";

export function useLocalStorageState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => readLocalStorage(key, initialValue));
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    writeLocalStorage(key, value);
  }, [key, value]);

  return [value, setValue, true] as const;
}
