import * as React from "react";

interface Options<T> {
  value?: T;
  defaultValue: T | (() => T);
  onChange?: (value: T) => void;
}

export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: Options<T>) {
  const isControlled = typeof value !== "undefined";
  const getDefault = React.useCallback(
    () => (typeof defaultValue === "function" ? (defaultValue as () => T)() : defaultValue),
    [defaultValue]
  );
  const [internalValue, setInternalValue] = React.useState<T>(getDefault);

  React.useEffect(() => {
    if (isControlled) {
      setInternalValue(value as T);
    }
  }, [isControlled, value]);

  const setValue = React.useCallback(
    (next: T) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange]
  );

  return [isControlled ? (value as T) : internalValue, setValue] as const;
}






