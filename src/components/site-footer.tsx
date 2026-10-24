import Link from "next/link";
import { Logo } from "@/components/logo";

const FOOTER_COLUMNS = [
  {
    title: "產品",
    links: [
      { href: "/#features", label: "功能" },
      { href: "/#how", label: "使用流程" },
      { href: "/interview", label: "開始模擬面試" },
    ],
  },
  {
    title: "資源",
    links: [
      { href: "/#sample", label: "點評範例" },
      { href: "/#faq", label: "常見問題" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper-2">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[2fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-ink-2">
            依照職缺量身出題的 AI 面試官，陪你在真正上場前，把每一題都練到有把握。
          </p>
        </div>
        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title} className="flex flex-col gap-3">
            <h3 className="font-mono text-xs tracking-widest text-muted uppercase">
              {column.title}
            </h3>
            {column.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-ink-2 transition-colors hover:text-coral"
              >
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>© 2026 AI Interview. All rights reserved.</span>
          <span className="font-mono">Powered by OpenAI · Built with Next.js</span>
        </div>
      </div>
    </footer>
  );
}
