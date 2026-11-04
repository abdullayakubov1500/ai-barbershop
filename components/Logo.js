import Link from "next/link";

export default function Logo() {
  return (
    <Link className="brand" href="/">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="40" height="40">
          <circle cx="20" cy="20" r="20" fill="#2f8fff" />
          <circle cx="14" cy="14" r="4.2" fill="none" stroke="#fff" strokeWidth="2.2" />
          <circle cx="14" cy="26" r="4.2" fill="none" stroke="#fff" strokeWidth="2.2" />
          <path d="M17.4 16.2 28 27.2M17.4 23.8 28 12.8" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      </span>
      <strong>Остриё</strong>
    </Link>
  );
}
