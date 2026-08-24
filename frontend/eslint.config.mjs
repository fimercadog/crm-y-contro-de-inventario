import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // This app's DataTable pages all fetch from a useCallback'd
      // fetcher (`useEffect(() => { fetchData() }, [fetchData])`) so the
      // same function can be reused as a manual refetch after mutations.
      // That's React's own documented data-fetching-on-param-change
      // pattern (setLoading(true) then an async call), but this rule's
      // static analysis can't see the async gap through the extra
      // function indirection and flags it as an unsafe sync setState.
      "react-hooks/set-state-in-effect": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
