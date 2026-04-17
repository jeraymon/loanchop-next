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
    files: ["src/app/**/use*Calculator*.ts"],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: ["out/", ".next/", "node_modules/"],
  },
];
