import Link from "next/link";

const STATS = [
  { value: "30 秒", label: "貼上職缺就能開始" },
  { value: "1–10 題", label: "自訂面試長度" },
  { value: "每一題", label: "即時點評與參考解答" },
  { value: "0–100", label: "整體表現評分" },
];

const FEATURES = [
  {
    tag: "01",
    title: "依職缺量身出題",
    body: "讀懂你貼上的職缺描述，從技術能力、專案經驗到軟實力，問的都是這個職位真正在意的事。",
    wide: true,
  },
  {
    tag: "02",
    title: "會追問的面試官",
    body: "回答太籠統？面試官會像真人一樣追問細節，逼你把經驗講清楚。",
  },
  {
    tag: "03",
    title: "每題即時點評",
    body: "答完一題就知道哪裡好、哪裡缺，不用等到最後才發現問題。",
  },
  {
    tag: "04",
    title: "示範更好的答法",
    body: "每題附上以 STAR 法則撰寫、貼合職缺的參考解答，可以直接拿來練習。",
    wide: true,
  },
  {
    tag: "05",
    title: "整體評分報告",
    body: "面試結束給你 0–100 分的總評，加上優點與具體的改進方向，知道下一步該加強什麼。",
    wide: true,
  },
];

const STEPS = [
  { title: "貼上職缺描述", body: "從求職網站複製職缺內容，越完整，題目越精準。" },
  { title: "選擇題數，開始作答", body: "1 到 10 題自由設定，像真實面試一樣一題一題回答。" },
  { title: "逐題拿點評，最後看總評", body: "每題即時點評與參考解答，結束後拿到整體評分與建議。" },
];

const FAQS = [
  {
    q: "需要註冊或付費嗎？",
    a: "不需要。打開就能開始模擬面試，沒有帳號、也不用綁定任何資料。",
  },
  {
    q: "我的回答會被保存嗎？",
    a: "面試紀錄只存在你目前的瀏覽器分頁中，關掉或重新開始就會清除，伺服器不會保存。為了產生題目與點評，你的職缺描述與回答會傳送給 OpenAI 處理。",
  },
  {
    q: "適用哪些職缺？",
    a: "任何職缺都可以——工程、設計、行銷、業務、管理職。題目會依你貼上的職缺描述調整。",
  },
  {
    q: "面試使用什麼語言？",
    a: "目前以繁體中文進行。職缺描述可以是中文或英文。",
  },
];

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4 10h12m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-coral/15 blur-3xl" />
      <div className="rotate-1 rounded-3xl border border-line bg-card p-5 shadow-[0_30px_60px_-20px_rgb(22_21_27/0.25)]">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-xs text-muted">前端工程師 · 第 2 / 3 題</span>
          <div className="flex gap-1">
            <span className="h-1.5 w-6 rounded-full bg-ink" />
            <span className="h-1.5 w-6 rounded-full bg-coral" />
            <span className="h-1.5 w-6 rounded-full bg-line" />
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink font-serif text-xs font-black text-paper">面</span>
            <p className="rounded-2xl rounded-tl-sm bg-paper-2 px-3.5 py-2.5 leading-relaxed">
              你提到用 React 做過電商網站，購物車的狀態是怎麼管理的？
            </p>
          </div>
          <p className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-ink px-3.5 py-2.5 leading-relaxed text-paper">
            我用 useReducer 搭配 Context，並同步到 localStorage…
          </p>
          <div className="rounded-2xl border border-moss/20 bg-moss-soft p-3.5">
            <p className="mb-1 font-mono text-[11px] tracking-wider text-moss uppercase">第 1 題點評</p>
            <p className="leading-relaxed text-ink-2">
              架構描述清楚。可以再補充遇到的效能問題與解法，會更有說服力。
            </p>
          </div>
        </div>
      </div>
      <div className="absolute right-4 -bottom-8 -rotate-3 sm:right-auto sm:-bottom-6 sm:-left-10 rounded-2xl border border-line bg-card px-4 py-3 shadow-lg">
        <p className="font-mono text-[11px] text-muted">整體評分</p>
        <p className="font-serif text-3xl font-black">
          82<span className="text-base font-semibold text-muted"> / 100</span>
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pt-16 pb-24 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
          <div className="flex flex-col items-start gap-7">
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1 text-xs text-ink-2">
              <span className="h-1.5 w-1.5 rounded-full bg-coral" />
              AI 模擬面試 · 每題即時點評
            </span>
            <h1 className="font-serif text-[2.6rem] leading-[1.15] font-black tracking-tight sm:text-6xl">
              下一場面試，
              <br />
              先跟{" "}
              <span className="relative whitespace-nowrap text-coral">
                AI 練過
                <svg viewBox="0 0 200 12" className="absolute -bottom-2 left-0 w-full" aria-hidden="true">
                  <path d="M2 9c50-6 120-8 196-4" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              一遍。
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-ink-2">
              貼上職缺描述，AI 面試官依照職位量身出題、針對你的回答追問。每答完一題，立刻拿到點評與參考解答。
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/interview"
                className="group inline-flex items-center gap-2 rounded-full bg-coral px-6 py-3.5 font-medium text-white shadow-[0_10px_30px_-10px_var(--coral)] transition-transform hover:-translate-y-0.5"
              >
                免費開始模擬面試
                <span className="transition-transform group-hover:translate-x-0.5"><ArrowIcon /></span>
              </Link>
              <Link
                href="/#how"
                className="rounded-full border border-line bg-card px-6 py-3.5 font-medium transition-colors hover:border-ink"
              >
                看看怎麼運作
              </Link>
            </div>
            <p className="font-mono text-xs text-muted">無需註冊 · 不保存紀錄 · 1–10 題自由設定</p>
          </div>
          <HeroPreview />
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-line bg-card">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:px-6 md:grid-cols-4">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex flex-col gap-1 py-8 ${i % 2 === 1 ? "pl-6" : ""} ${i > 0 ? "md:border-l md:border-line md:pl-6" : ""}`}
            >
              <dt className="order-2 text-sm text-ink-2">{stat.label}</dt>
              <dd className="font-serif text-2xl font-black sm:text-3xl">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-20">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mb-12 flex flex-col gap-4">
            <span className="font-mono text-xs tracking-widest text-coral uppercase">Features</span>
            <h2 className="max-w-2xl font-serif text-3xl leading-tight font-black sm:text-5xl">
              不只是題庫，是一位懂職缺的面試官。
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.tag}
                className={`group flex flex-col gap-4 rounded-3xl border border-line bg-card p-7 transition-colors hover:border-ink ${feature.wide ? "md:col-span-2" : ""}`}
              >
                <span className="font-mono text-xs text-muted group-hover:text-coral">{feature.tag}</span>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="leading-relaxed text-ink-2">{feature.body}</p>
              </article>
            ))}
            <Link
              href="/interview"
              className="group flex flex-col justify-between gap-6 rounded-3xl bg-ink p-7 text-paper transition-colors hover:bg-coral"
            >
              <span className="font-mono text-xs text-paper/60">06</span>
              <span className="flex items-end justify-between text-xl font-bold">
                現在就試一場
                <ArrowIcon />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="scroll-mt-20 bg-paper-2">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
          <div className="mb-14 flex flex-col gap-4">
            <span className="font-mono text-xs tracking-widest text-coral uppercase">How it works</span>
            <h2 className="font-serif text-3xl font-black sm:text-5xl">三個步驟，開始練習。</h2>
          </div>
          <ol className="grid gap-10 md:grid-cols-3 md:gap-6">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex flex-col gap-4 border-t-2 border-ink pt-6">
                <span className="font-serif text-5xl font-black text-coral">0{i + 1}</span>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="leading-relaxed text-ink-2">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Sample review */}
      <section id="sample" className="scroll-mt-20 bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <span className="font-mono text-xs tracking-widest text-coral uppercase">Feedback</span>
            <h2 className="font-serif text-3xl leading-tight font-black sm:text-5xl">
              不只說哪裡不好，
              <br />
              還示範怎麼答更好。
            </h2>
            <p className="max-w-md text-lg leading-relaxed text-paper/70">
              每一題的參考解答都依照你應徵的職缺撰寫，用清楚的結構把經驗講成故事——下次遇到類似題目，你就知道該怎麼開口。
            </p>
          </div>
          <div className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-sm">
            <div>
              <p className="mb-2 font-mono text-[11px] tracking-wider text-paper/50 uppercase">你的回答</p>
              <p className="rounded-2xl bg-white/10 px-4 py-3 leading-relaxed">我會用 SSR 來改善 SEO。</p>
            </div>
            <div>
              <p className="mb-2 font-mono text-[11px] tracking-wider text-coral uppercase">點評</p>
              <p className="leading-relaxed text-paper/80">
                方向正確，但缺少具體情境與成果。面試官想聽的是你「在什麼專案、怎麼做、帶來什麼改變」。
              </p>
            </div>
            <div className="rounded-2xl border-l-4 border-moss bg-paper p-4 leading-relaxed text-ink">
              <p className="mb-2 font-mono text-[11px] tracking-wider text-moss uppercase">參考解答</p>
              在上一個電商專案中，商品頁原本採用 CSR，搜尋引擎收錄不完整（情境）。我負責把商品頁改為 Next.js 的伺服器端渲染，並為每個商品產生 metadata（行動）。上線三個月後，自然搜尋流量明顯成長（結果）。
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.6fr]">
          <div className="flex flex-col gap-4">
            <span className="font-mono text-xs tracking-widest text-coral uppercase">FAQ</span>
            <h2 className="font-serif text-3xl font-black sm:text-5xl">常見問題</h2>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 pr-10 leading-relaxed text-ink-2">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 overflow-hidden rounded-[2rem] bg-coral px-8 py-14 text-white sm:px-14 md:flex-row md:items-center md:justify-between">
          <div className="pointer-events-none absolute -top-16 -right-10 font-serif text-[14rem] leading-none font-black text-white/10 select-none">
            面
          </div>
          <div className="relative flex flex-col gap-3">
            <h2 className="font-serif text-3xl font-black sm:text-4xl">準備好上場了嗎？</h2>
            <p className="text-white/85">花十分鐘模擬一場，真正面試時就少一分緊張。</p>
          </div>
          <Link
            href="/interview"
            className="group relative inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-6 py-3.5 font-medium text-paper transition-transform hover:-translate-y-0.5"
          >
            開始模擬面試
            <span className="transition-transform group-hover:translate-x-0.5"><ArrowIcon /></span>
          </Link>
        </div>
      </section>
    </main>
  );
}
