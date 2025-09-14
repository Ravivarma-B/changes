import { FormFieldType } from "@/app/dynamic-form/formBuilder.types";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useMemo, useRef } from "react";

export function useEditFieldUpdater(
  updateSelectedFieldProperty: <K extends keyof FormFieldType>(
    key: K,
    val: FormFieldType[K]
  ) => void,
  delay = 500
) {
  const pendingRef = useRef<Partial<FormFieldType>>({});
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const flush = useCallback(() => {
    const updates = pendingRef.current;
    if (Object.keys(updates).length === 0) return;

    (
      Object.entries(updates) as [
        keyof FormFieldType,
        FormFieldType[keyof FormFieldType]
      ][]
    ).forEach(([k, v]) => updateSelectedFieldProperty(k, v));

    pendingRef.current = {};
  }, [updateSelectedFieldProperty]);

  const debouncedFlush = useMemo(
    () =>
      debounce(() => {
        if (!isMountedRef.current) return;
        flush();
      }, delay),
    [flush, delay]
  );

  useEffect(() => {
    return () => {
      debouncedFlush.cancel();
      flush();
    };
  }, [debouncedFlush, flush]);

  const updateField = useCallback(
    (updates: Partial<FormFieldType>, immediate = false) => {
      if (immediate) {
        (
          Object.entries(updates) as [
            keyof FormFieldType,
            FormFieldType[keyof FormFieldType]
          ][]
        ).forEach(([k, v]) => updateSelectedFieldProperty(k, v));
        return;
      }

      pendingRef.current = { ...pendingRef.current, ...updates };
      debouncedFlush();
    },
    [debouncedFlush, updateSelectedFieldProperty]
  );

  return { updateField, flush };
}
