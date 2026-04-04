import { useEffect, useEffectEvent, useState } from "react";

import { translateCurrent } from "@/shared/lib/i18n";

interface AsyncValueState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsyncValue<T>(
  loadValue: () => Promise<T>,
  deps: unknown[],
): AsyncValueState<T> & {
  refresh: () => Promise<void>;
} {
  const [state, setState] = useState<AsyncValueState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const runLoadValue = useEffectEvent(async () => {
    setState((currentState) => ({
      data: currentState.data,
      loading: true,
      error: null,
    }));
    try {
      const nextValue = await loadValue();
      setState({
        data: nextValue,
        loading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : translateCurrent("errors.loadDataFailed"),
      });
    }
  });
  useEffect(() => {
    void runLoadValue();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return {
    ...state,
    refresh: runLoadValue,
  };
}
