import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="AI Interview 首頁">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink font-serif text-base font-black text-paper transition-transform group-hover:-rotate-6">
        面
      </span>
      <span className="text-[15px] font-bold tracking-tight">
        AI Interview
        <span className="text-coral">.</span>
      </span>
    </Link>
  );
}
