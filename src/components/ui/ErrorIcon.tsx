/**
 * Inline validation error icon — a red circle with "!" that toggles via opacity.
 * Always in the DOM at fixed size (zero layout shift).
 * Usage: <ErrorIcon show={!!errors.fieldName} />
 */
export function ErrorIcon({ show }: { show: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 text-red-500 transition-opacity ${show ? "opacity-100" : "opacity-0"}`}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="8" />
      <text x="8" y="12" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">!</text>
    </svg>
  );
}
