import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...nextCoreWebVitals,
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    ignores: ["out/", ".next/", "node_modules/"],
  },
];
