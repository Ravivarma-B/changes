import { useMemo } from "react";
import { fieldTypes } from "../constants";

export function useFormBuilderConfig(userConfig?: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  overrides?: Record<string, any>;
  order?: string[];
}) {
  return useMemo(() => {
    const overrides = userConfig?.overrides || {};
    const order = userConfig?.order || [];

    // 1️⃣ Merge defaults + overrides
    let merged = fieldTypes.map((comp) => {
      const override = overrides[comp.id];
      return { ...comp, ...override };
    });
    // console.log(merged.slice());

    // 2️⃣ Add new components from overrides (not in defaults)
    Object.entries(overrides).forEach(([id, cfg]) => {
      if (!fieldTypes.find((d) => d.id === id)) {
        merged.push({ id, ...cfg, showInFormBuilder: true });
      }
    });

    // console.log(merged.slice());

    // 3️⃣ Filter out disabled components
    merged = merged.filter((comp) => comp.enabled !== false);

    // console.log(merged.slice());
    // 4️⃣ Reorder if user provided order
    if (order.length) {
      merged.sort((a, b) => {
        const ai = order.indexOf(a.id);
        const bi = order.indexOf(b.id);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
    }

    // console.log(merged.slice());
    return merged;
  }, [userConfig]);
}
