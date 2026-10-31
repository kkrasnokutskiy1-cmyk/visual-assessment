import Link from "next/link";

/**
 * Account entry in the header. Owner: C (auth) may replace the body
 * with a session-aware menu; keep the export name and zero props.
 */
export function AccountLink() {
  return (
    <Link
      href="/login"
      className="text-[length:var(--fs-body)] text-muted-foreground transition-colors duration-[var(--duration-fast)] hover:text-foreground"
    >
      Войти
    </Link>
  );
}
