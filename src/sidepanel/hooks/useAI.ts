import { useCallback } from "react";
import { useUIStore } from "../store";
import type { PanelMessage, ServiceResponse } from "../../shared/messages";

export function useAI() {
  const setLoading = useUIStore((s) => s.setLoading);
  const setError = useUIStore((s) => s.setError);
  const clearError = useUIStore((s) => s.clearError);

  const sendMessage = useCallback(
    async <T = unknown>(message: PanelMessage, loadingKey: string): Promise<T | null> => {
      setLoading(loadingKey, true);
      clearError(loadingKey);
      try {
        const response: ServiceResponse = await chrome.runtime.sendMessage(message);
        if (!response.success) {
          setError(loadingKey, response.error);
          return null;
        }
        return response.data as T;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        setError(loadingKey, errorMsg);
        return null;
      } finally {
        setLoading(loadingKey, false);
      }
    },
    [setLoading, setError, clearError]
  );

  return { sendMessage };
}
