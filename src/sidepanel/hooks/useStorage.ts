import { useState, useEffect, useCallback } from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    chrome.storage.local.get(key).then((result) => {
      if (result[key] !== undefined) setValue(result[key]);
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area === "local" && changes[key]) {
        setValue(changes[key].newValue ?? defaultValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [key, defaultValue]);

  const set = useCallback(
    (newValue: T) => {
      setValue(newValue);
      chrome.storage.local.set({ [key]: newValue });
    },
    [key]
  );

  return [value, set] as const;
}

export function useSessionStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    chrome.storage.session.get(key).then((result) => {
      if (result[key] !== undefined) setValue(result[key]);
    });

    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area === "session" && changes[key]) {
        setValue(changes[key].newValue ?? defaultValue);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [key, defaultValue]);

  return value;
}
