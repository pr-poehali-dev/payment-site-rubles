import { useState } from "react";
import Icon from "@/components/ui/icon";

type Section = "home" | "payments" | "history" | "analytics" | "documents" | "profile" | "support";

const NAV_ITEMS = [
  { id: "home", label: "Главная", icon: "LayoutDashboard" },
  { id: "payments", label: "Платежи", icon: "CreditCard" },
  { id: "history", label: "История", icon: "Clock" },
  { id: "analytics", label: "Аналитика", icon: "BarChart3" },
  { id: "documents", label: "Документы", icon: "FileText" },
  { id: "profile", label: "Профиль", icon: "User" },
  { id: "support", label: "Поддержка", icon: "MessageCircle" },
] as const;

const TRANSACTIONS = [
  { id: "TX-8821", name: "ООО «Альфа Трейд»", amount: "+128 500", type: "income", status: "success", date: "28 мар 2026", time: "14:32" },
  { id: "TX-8820", name: "Перевод поставщику", amount: "-45 000", type: "outcome", status: "success", date: "27 мар 2026", time: "09:15" },
  { id: "TX-8819", name: "ИП Смирнов А.В.", amount: "+87 200", type: "income", status: "success", date: "26 мар 2026", time: "16:48" },
  { id: "TX-8818", name: "Оплата услуг", amount: "-12 300", type: "outcome", status: "pending", date: "26 мар 2026", time: "11:20" },
  { id: "TX-8817", name: "Возврат платежа", amount: "+5 000", type: "income", status: "failed", date: "25 мар 2026", time: "08:05" },
];

const CHART_DATA = [
  { label: "Пн", value: 65 },
  { label: "Вт", value: 82 },
  { label: "Ср", value: 48 },
  { label: "Чт", value: 91 },
  { label: "Пт", value: 76 },
  { label: "Сб", value: 34 },
  { label: "Вс", value: 58 },
];

function Sidebar({ active, onNav }: { active: Section; onNav: (s: Section) => void }) {
  return (
    <aside className="hidden lg:flex w-64 min-h-screen flex-col py-8 px-4 border-r border-border flex-shrink-0" style={{ background: "hsl(220, 20%, 5%)" }}>
      <div className="px-4 mb-10 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center btn-gold text-sm font-bold">₽</div>
          <div>
            <div className="font-display text-xl font-semibold text-gold-gradient">ПейРу</div>
            <div className="text-xs text-muted-foreground tracking-widest uppercase">Premium Pay</div>
          </div>
        </div>
      </div>

      <div className="mx-2 mb-8 p-3 rounded-xl gold-border flex items-center gap-3 animate-fade-in animate-delay-1">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-background flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(43,40%,35%), hsl(43,74%,55%))" }}>АК</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">Алексей К.</div>
          <div className="text-xs text-muted-foreground truncate">aleksey@corp.ru</div>
        </div>
        <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onNav(item.id as Section)}
            className={`nav-item w-full ${active === item.id ? "active" : ""} animate-fade-in`}
            style={{ animationDelay: `${(i + 2) * 0.07}s`, opacity: 0 }}
          >
            <Icon name={item.icon} size={17} fallback="Circle" />
            <span>{item.label}</span>
            {active === item.id && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold" />}
          </button>
        ))}
      </nav>

      <div className="mt-6 mx-2 p-3 rounded-xl" style={{ background: "rgba(212,175,55,0.05)", border: "1px solid rgba(212,175,55,0.12)" }}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Icon name="Shield" size={13} fallback="Lock" />
          <span>256-bit шифрование</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="Lock" size={13} fallback="Shield" />
          <span>2FA активна</span>
        </div>
      </div>
    </aside>
  );
}

const MOBILE_NAV = [
  { id: "home", label: "Главная", icon: "LayoutDashboard" },
  { id: "payments", label: "Платежи", icon: "CreditCard" },
  { id: "history", label: "История", icon: "Clock" },
  { id: "analytics", label: "Аналитика", icon: "BarChart3" },
  { id: "profile", label: "Профиль", icon: "User" },
] as const;

function MobileNav({ active, onNav }: { active: Section; onNav: (s: Section) => void }) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 border-t border-border" style={{ background: "rgba(10,12,18,0.95)", backdropFilter: "blur(20px)" }}>
      {MOBILE_NAV.map(item => (
        <button
          key={item.id}
          onClick={() => onNav(item.id as Section)}
          className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all"
          style={{ color: active === item.id ? "hsl(43,74%,55%)" : "hsl(220,10%,50%)" }}
        >
          <Icon name={item.icon} size={20} fallback="Circle" />
          <span className="text-[10px] font-medium">{item.label}</span>
          {active === item.id && <span className="w-1 h-1 rounded-full bg-gold" />}
        </button>
      ))}
    </nav>
  );
}

function StatCard({ label, value, sub, icon, delay = 0 }: { label: string; value: string; sub: string; icon: string; delay?: number }) {
  return (
    <div className="card-glow gold-border relative overflow-hidden rounded-2xl p-6 animate-fade-in" style={{ background: "hsl(220,18%,9%)", animationDelay: `${delay}s`, opacity: 0 }}>
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(212,175,55,0.12)" }}>
          <Icon name={icon} size={18} fallback="Circle" className="text-gold" />
        </div>
        <Icon name="TrendingUp" size={14} fallback="ArrowUp" className="text-green-400 mt-1" />
      </div>
      <div className="font-display text-3xl font-semibold mb-1 text-gold-gradient">{value}</div>
      <div className="text-sm font-medium text-foreground mb-1">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
      <div className="absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-5 pointer-events-none" style={{ background: "hsl(43,74%,55%)", filter: "blur(24px)", transform: "translate(30%, 30%)" }} />
    </div>
  );
}

function TransactionTable({ rows }: { rows: typeof TRANSACTIONS }) {
  const statusLabel = (s: string) => s === "success" ? "Выполнен" : s === "pending" ? "В обработке" : "Отклонён";
  const statusClass = (s: string) => s === "success" ? "status-success" : s === "pending" ? "status-pending" : "status-failed";
  return (
    <div className="rounded-2xl overflow-hidden gold-border" style={{ background: "hsl(220,18%,9%)" }}>
      <div className="hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["ID", "Получатель / Отправитель", "Сумма", "Статус", "Дата"].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(tx => (
              <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer">
                <td className="px-5 py-4 text-xs text-muted-foreground font-mono">{tx.id}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: tx.type === "income" ? "rgba(34,197,94,0.1)" : "rgba(212,175,55,0.1)" }}>
                      <Icon name={tx.type === "income" ? "ArrowDownLeft" : "ArrowUpRight"} size={14} fallback="ArrowRight" className={tx.type === "income" ? "text-green-400" : "text-gold"} />
                    </div>
                    <span className="text-sm font-medium">{tx.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm font-semibold" style={{ color: tx.type === "income" ? "hsl(142,60%,55%)" : "hsl(var(--foreground))" }}>{tx.amount} ₽</td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusClass(tx.status)}`}>{statusLabel(tx.status)}</span>
                </td>
                <td className="px-5 py-4 text-xs text-muted-foreground">
                  <div>{tx.date}</div>
                  <div className="opacity-60">{tx.time}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile list */}
      <div className="md:hidden divide-y divide-border">
        {rows.map(tx => (
          <div key={tx.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tx.type === "income" ? "rgba(34,197,94,0.1)" : "rgba(212,175,55,0.1)" }}>
              <Icon name={tx.type === "income" ? "ArrowDownLeft" : "ArrowUpRight"} size={15} fallback="ArrowRight" className={tx.type === "income" ? "text-green-400" : "text-gold"} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{tx.name}</div>
              <div className="text-xs text-muted-foreground">{tx.date}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-sm font-semibold" style={{ color: tx.type === "income" ? "hsl(142,60%,55%)" : "hsl(var(--foreground))" }}>{tx.amount} ₽</div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusClass(tx.status)}`}>{statusLabel(tx.status)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeSection() {
  return (
    <div className="space-y-8">
      <div className="animate-fade-in" style={{ opacity: 0 }}>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Добро пожаловать</div>
        <h1 className="font-display text-4xl font-medium">Панель управления</h1>
      </div>

      <div className="relative rounded-2xl p-8 overflow-hidden animate-fade-in animate-delay-1" style={{ background: "linear-gradient(135deg, hsl(220,18%,11%) 0%, hsl(220,20%,8%) 100%)", border: "1px solid rgba(212,175,55,0.2)", opacity: 0 }}>
        <div className="absolute inset-0 pointer-events-none opacity-10" style={{ background: "radial-gradient(ellipse at 80% 20%, hsl(43,74%,55%) 0%, transparent 60%)" }} />
        <div className="relative z-10">
          <div className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Основной счёт</div>
          <div className="font-display text-6xl font-light mb-1 text-gold-gradient">1 284 750 ₽</div>
          <div className="text-sm text-muted-foreground mb-6">Доступно · Счёт №4081•••2317</div>
          <div className="flex gap-3">
            <button className="btn-gold px-6 py-2.5 rounded-xl text-sm font-medium">Перевести</button>
            <button className="px-6 py-2.5 rounded-xl text-sm font-medium text-foreground" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>Пополнить</button>
          </div>
        </div>
        <div className="absolute top-6 right-8 opacity-20 pointer-events-none select-none">
          <div className="font-display text-8xl font-light text-gold">₽</div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Доход за месяц" value="842 300 ₽" sub="+14.2% к прошлому" icon="ArrowDownLeft" delay={0.1} />
        <StatCard label="Расходы" value="215 400 ₽" sub="-3.1% к прошлому" icon="ArrowUpRight" delay={0.2} />
        <StatCard label="Транзакций" value="248" sub="За текущий месяц" icon="Zap" delay={0.3} />
        <StatCard label="Партнёры" value="32" sub="Активных контрагента" icon="Users" delay={0.4} />
      </div>

      <div className="animate-fade-in animate-delay-3" style={{ opacity: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-medium">Последние операции</h2>
          <button className="text-xs text-gold hover:underline">Все операции →</button>
        </div>
        <TransactionTable rows={TRANSACTIONS.slice(0, 4)} />
      </div>
    </div>
  );
}

function PaymentsSection() {
  const [step, setStep] = useState(1);
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="animate-fade-in" style={{ opacity: 0 }}>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Операции</div>
        <h1 className="font-display text-4xl font-medium">Новый платёж</h1>
      </div>
      <div className="flex items-center gap-2 animate-fade-in animate-delay-1" style={{ opacity: 0 }}>
        {["Получатель", "Сумма", "Подтверждение"].map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${i + 1 <= step ? "btn-gold" : "bg-muted text-muted-foreground"}`}>{i + 1}</div>
              <span className={`text-sm ${i + 1 <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
            </div>
            {i < 2 && <div className="w-8 h-px bg-border mx-2" />}
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-8 gold-border animate-fade-in animate-delay-2" style={{ background: "hsl(220,18%,9%)", opacity: 0 }}>
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-display text-xl mb-6">Данные получателя</h2>
            {[
              { label: "Имя получателя / Организация", placeholder: "ООО «Название компании»" },
              { label: "ИНН", placeholder: "7700000000" },
              { label: "Расчётный счёт (20 цифр)", placeholder: "40817810000000000000" },
              { label: "БИК банка", placeholder: "044525225" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">{f.label}</label>
                <input placeholder={f.placeholder} className="w-full px-4 py-3 rounded-xl text-sm bg-muted border border-border focus:border-gold focus:outline-none transition-all placeholder:text-muted-foreground/40 text-foreground" />
              </div>
            ))}
            <button onClick={() => setStep(2)} className="btn-gold w-full py-3 rounded-xl text-sm font-medium mt-2">Продолжить</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-display text-xl mb-6">Сумма и назначение</h2>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Сумма платежа (₽)</label>
              <div className="relative">
                <input placeholder="0.00" type="number" className="w-full px-4 py-4 rounded-xl text-2xl font-display bg-muted border border-border focus:border-gold focus:outline-none transition-all pr-12 text-foreground" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-muted-foreground font-display">₽</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Назначение платежа</label>
              <textarea rows={3} placeholder="Оплата по договору №..." className="w-full px-4 py-3 rounded-xl text-sm bg-muted border border-border focus:border-gold focus:outline-none transition-all resize-none placeholder:text-muted-foreground/40 text-foreground" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground hover:border-gold/40 transition-all">Назад</button>
              <button onClick={() => setStep(3)} className="btn-gold px-8 py-3 rounded-xl text-sm font-medium">Далее</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-display text-xl mb-6">Подтверждение платежа</h2>
            <div className="rounded-xl p-5 space-y-3" style={{ background: "hsl(220,15%,12%)" }}>
              {[["Получатель","ООО «Альфа Трейд»"],["Счёт","40817810•••0000"],["Банк","Сбербанк · 044525225"],["Сумма","128 500,00 ₽"],["Комиссия","0 ₽"]].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className={k === "Сумма" ? "font-semibold text-gold" : "font-medium text-foreground"}>{v}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="divider-text mb-5">Введите код из приложения</div>
              <div className="flex gap-3 justify-center mb-5">
                {[1,2,3,4,5,6].map(i => <input key={i} maxLength={1} className="otp-input" />)}
              </div>
              <div className="text-center text-xs text-muted-foreground mb-5">Код отправлен на +7 900 •••-••-22</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground hover:border-gold/40 transition-all">Назад</button>
              <button onClick={() => setStep(1)} className="btn-gold px-8 py-3 rounded-xl text-sm font-medium">Подтвердить</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function HistorySection() {
  const [filter, setFilter] = useState("all");
  const filters = [{ id: "all", label: "Все" }, { id: "income", label: "Входящие" }, { id: "outcome", label: "Исходящие" }];
  const filtered = filter === "all" ? TRANSACTIONS : TRANSACTIONS.filter(t => t.type === filter);
  return (
    <div className="space-y-6">
      <div className="animate-fade-in" style={{ opacity: 0 }}>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Операции</div>
        <h1 className="font-display text-4xl font-medium">История платежей</h1>
      </div>
      <div className="flex items-center justify-between animate-fade-in animate-delay-1" style={{ opacity: 0 }}>
        <div className="flex gap-2">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-2 rounded-lg text-sm transition-all ${filter === f.id ? "btn-gold" : "text-muted-foreground border border-border hover:border-gold/30 hover:text-foreground"}`}>{f.label}</button>
          ))}
        </div>
        <button className="flex items-center gap-2 text-sm text-muted-foreground border border-border px-4 py-2 rounded-lg hover:border-gold/40 hover:text-foreground transition-all">
          <Icon name="Download" size={14} fallback="ArrowDown" />Экспорт
        </button>
      </div>
      <div className="animate-fade-in animate-delay-2" style={{ opacity: 0 }}>
        <TransactionTable rows={filtered} />
      </div>
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div className="space-y-8">
      <div className="animate-fade-in" style={{ opacity: 0 }}>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Финансы</div>
        <h1 className="font-display text-4xl font-medium">Аналитика</h1>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Оборот (март)", value: "1 057 700 ₽", trend: "+18.4%" },
          { label: "Средний платёж", value: "43 250 ₽", trend: "+2.1%" },
          { label: "Успешность", value: "98.7%", trend: "+0.3%" },
        ].map((s, i) => (
          <div key={s.label} className="card-glow gold-border rounded-2xl p-6 animate-fade-in" style={{ background: "hsl(220,18%,9%)", animationDelay: `${(i + 1) * 0.1}s`, opacity: 0 }}>
            <div className="text-sm text-muted-foreground mb-2">{s.label}</div>
            <div className="font-display text-3xl font-semibold text-gold-gradient mb-2">{s.value}</div>
            <div className="text-xs text-green-400">{s.trend} к прошлому месяцу</div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6 gold-border animate-fade-in animate-delay-3" style={{ background: "hsl(220,18%,9%)", opacity: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl">Объём платежей по дням</h2>
          <div className="text-xs text-muted-foreground">Текущая неделя</div>
        </div>
        <div className="flex items-end gap-4 h-40">
          {CHART_DATA.map(d => (
            <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs text-muted-foreground">{Math.round(d.value * 1200).toLocaleString("ru")}</div>
              <div className="w-full chart-bar" style={{ height: `${d.value}%` }} />
              <div className="text-xs text-muted-foreground">{d.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl p-6 gold-border animate-fade-in animate-delay-4" style={{ background: "hsl(220,18%,9%)", opacity: 0 }}>
        <h2 className="font-display text-xl mb-6">Структура платежей</h2>
        <div className="space-y-4">
          {[
            { label: "Поставщики", value: 58, color: "hsl(43,74%,55%)" },
            { label: "Услуги", value: 24, color: "hsl(43,50%,40%)" },
            { label: "Налоги и сборы", value: 12, color: "hsl(43,30%,30%)" },
            { label: "Прочее", value: 6, color: "hsl(220,15%,25%)" },
          ].map(c => (
            <div key={c.label} className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground w-36">{c.label}</div>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.value}%`, background: c.color }} />
              </div>
              <div className="text-sm font-medium w-8 text-right text-foreground">{c.value}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentsSection() {
  const docs = [
    { name: "Договор №2024-01", date: "01 янв 2026", size: "245 КБ", type: "Договор" },
    { name: "Акт выполненных работ Q1", date: "31 мар 2026", size: "118 КБ", type: "Акт" },
    { name: "Счёт-фактура 2026-0128", date: "28 мар 2026", size: "67 КБ", type: "Счёт" },
    { name: "Выписка по счёту март", date: "28 мар 2026", size: "1.2 МБ", type: "Выписка" },
    { name: "Платёжное поручение TX-8821", date: "28 мар 2026", size: "32 КБ", type: "Поручение" },
  ];
  return (
    <div className="space-y-6">
      <div className="animate-fade-in" style={{ opacity: 0 }}>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Архив</div>
        <h1 className="font-display text-4xl font-medium">Документы</h1>
      </div>
      <div className="flex items-center gap-3 animate-fade-in animate-delay-1" style={{ opacity: 0 }}>
        <div className="flex-1 relative">
          <Icon name="Search" size={15} fallback="Filter" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input placeholder="Поиск документов..." className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-muted border border-border focus:border-gold focus:outline-none transition-all text-foreground placeholder:text-muted-foreground/40" />
        </div>
        <button className="btn-gold px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <Icon name="Upload" size={14} fallback="ArrowUp" />Загрузить
        </button>
      </div>
      <div className="rounded-2xl overflow-hidden gold-border animate-fade-in animate-delay-2" style={{ background: "hsl(220,18%,9%)", opacity: 0 }}>
        {docs.map(doc => (
          <div key={doc.name} className="flex items-center gap-4 px-6 py-4 border-b border-border last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(212,175,55,0.08)" }}>
              <Icon name="FileText" size={18} fallback="File" className="text-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{doc.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{doc.date} · {doc.size}</div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full status-pending flex-shrink-0">{doc.type}</span>
            <button className="text-muted-foreground hover:text-gold transition-colors ml-2 flex-shrink-0">
              <Icon name="Download" size={15} fallback="ArrowDown" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileSection() {
  const [twofa, setTwofa] = useState(true);
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="animate-fade-in" style={{ opacity: 0 }}>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Аккаунт</div>
        <h1 className="font-display text-4xl font-medium">Профиль</h1>
      </div>
      <div className="rounded-2xl p-6 gold-border flex items-center gap-6 animate-fade-in animate-delay-1" style={{ background: "hsl(220,18%,9%)", opacity: 0 }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-display font-light text-background flex-shrink-0" style={{ background: "linear-gradient(135deg, hsl(43,40%,35%), hsl(43,74%,55%))" }}>АК</div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-2xl font-medium">Алексей Кириллов</div>
          <div className="text-sm text-muted-foreground">aleksey@corp.ru · +7 900 000-00-22</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2.5 py-1 rounded-full status-success">Верифицирован</span>
            <span className="text-xs text-muted-foreground">Корпоративный аккаунт</span>
          </div>
        </div>
        <button className="btn-gold px-4 py-2 rounded-lg text-sm flex-shrink-0">Изменить</button>
      </div>
      <div className="rounded-2xl p-6 gold-border animate-fade-in animate-delay-2" style={{ background: "hsl(220,18%,9%)", opacity: 0 }}>
        <h2 className="font-display text-xl mb-5">Безопасность</h2>
        <div className="space-y-0">
          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <div className="text-sm font-medium">Двухфакторная аутентификация</div>
              <div className="text-xs text-muted-foreground mt-0.5">Приложение Google Authenticator</div>
            </div>
            <button onClick={() => setTwofa(!twofa)} className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${twofa ? "bg-gold" : "bg-muted"}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${twofa ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>
          {[
            { label: "Уведомления при входе", desc: "Email-оповещения", enabled: true },
            { label: "Защита от мошенничества", desc: "Антифрод-система активна", enabled: true },
            { label: "Шифрование данных", desc: "AES-256 + TLS 1.3", enabled: true },
          ].map(s => (
            <div key={s.label} className="flex items-center justify-between py-4 border-b border-border last:border-0">
              <div>
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full status-success flex items-center gap-1.5 flex-shrink-0">
                <Icon name="ShieldCheck" size={11} fallback="Shield" />Активно
              </span>
            </div>
          ))}
        </div>
      </div>
      {twofa && (
        <div className="rounded-2xl p-6 gold-border animate-scale-in" style={{ background: "hsl(220,18%,9%)" }}>
          <h2 className="font-display text-xl mb-2">Код подтверждения</h2>
          <p className="text-sm text-muted-foreground mb-5">Введите 6-значный код для операций</p>
          <div className="flex gap-3 mb-4">
            {[1,2,3,4,5,6].map(i => <input key={i} maxLength={1} className="otp-input" />)}
          </div>
          <button className="btn-gold px-6 py-2.5 rounded-xl text-sm font-medium">Подтвердить</button>
        </div>
      )}
    </div>
  );
}

function SupportSection() {
  const faqs = [
    { q: "Как отменить платёж?", a: "Платёж можно отменить в течение 30 минут с момента отправки через раздел «История»." },
    { q: "Лимиты на переводы", a: "Ежедневный лимит — 5 000 000 ₽. Для увеличения лимита обратитесь к менеджеру." },
    { q: "Как подключить 2FA?", a: "Перейдите в раздел «Профиль → Безопасность» и активируйте двухфакторную аутентификацию." },
    { q: "Время обработки платежей", a: "Платежи в рублях обрабатываются в течение 1–2 рабочих дней. НСПК — мгновенно." },
  ];
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="animate-fade-in" style={{ opacity: 0 }}>
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Помощь</div>
        <h1 className="font-display text-4xl font-medium">Поддержка</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 animate-fade-in animate-delay-1" style={{ opacity: 0 }}>
        {[
          { icon: "MessageCircle", label: "Онлайн-чат", sub: "Среднее время ответа — 2 мин", action: "Написать" },
          { icon: "Phone", label: "Телефон", sub: "8 800 000-00-00 (бесплатно)", action: "Позвонить" },
        ].map(c => (
          <div key={c.label} className="card-glow gold-border rounded-2xl p-6" style={{ background: "hsl(220,18%,9%)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(212,175,55,0.12)" }}>
              <Icon name={c.icon} size={18} fallback="Circle" className="text-gold" />
            </div>
            <div className="font-medium mb-1 text-foreground">{c.label}</div>
            <div className="text-xs text-muted-foreground mb-4">{c.sub}</div>
            <button className="btn-gold px-4 py-2 rounded-lg text-sm">{c.action}</button>
          </div>
        ))}
      </div>
      <div className="rounded-2xl p-6 gold-border animate-fade-in animate-delay-2" style={{ background: "hsl(220,18%,9%)", opacity: 0 }}>
        <h2 className="font-display text-xl mb-5">Написать обращение</h2>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Тема</label>
            <select className="w-full px-4 py-3 rounded-xl text-sm bg-muted border border-border focus:border-gold focus:outline-none transition-all text-foreground">
              <option>Вопрос по платежу</option>
              <option>Технические проблемы</option>
              <option>Документы</option>
              <option>Другое</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Сообщение</label>
            <textarea rows={4} placeholder="Опишите вашу проблему..." className="w-full px-4 py-3 rounded-xl text-sm bg-muted border border-border focus:border-gold focus:outline-none transition-all resize-none placeholder:text-muted-foreground/40 text-foreground" />
          </div>
          <button className="btn-gold w-full py-3 rounded-xl text-sm font-medium">Отправить обращение</button>
        </div>
      </div>
      <div className="animate-fade-in animate-delay-3" style={{ opacity: 0 }}>
        <h2 className="font-display text-xl mb-4">Частые вопросы</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details key={i} className="gold-border rounded-xl overflow-hidden group" style={{ background: "hsl(220,18%,9%)" }}>
              <summary className="px-5 py-4 text-sm font-medium cursor-pointer list-none flex items-center justify-between hover:text-gold transition-colors text-foreground">
                {f.q}
                <Icon name="ChevronDown" size={15} fallback="ArrowDown" className="text-muted-foreground transition-transform" />
              </summary>
              <div className="px-5 pb-4 text-sm text-muted-foreground border-t border-border pt-3">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [activeSection, setActiveSection] = useState<Section>("home");

  const renderSection = () => {
    switch (activeSection) {
      case "home": return <HomeSection />;
      case "payments": return <PaymentsSection />;
      case "history": return <HistorySection />;
      case "analytics": return <AnalyticsSection />;
      case "documents": return <DocumentsSection />;
      case "profile": return <ProfileSection />;
      case "support": return <SupportSection />;
      default: return <HomeSection />;
    }
  };

  return (
    <div className="flex min-h-screen w-full" style={{ background: "hsl(220,20%,6%)" }}>
      <Sidebar active={activeSection} onNav={setActiveSection} />
      <main className="flex-1 overflow-y-auto overflow-x-hidden" style={{ minWidth: 0 }}>
        {/* Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-4 lg:px-8 py-4 border-b border-border" style={{ background: "rgba(14,16,22,0.92)", backdropFilter: "blur(16px)" }}>
          {/* Mobile: logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center btn-gold text-sm font-bold">₽</div>
            <span className="font-display text-lg font-semibold text-gold-gradient">ПейРу</span>
          </div>
          {/* Desktop: date */}
          <div className="hidden lg:block text-sm text-muted-foreground">
            {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
              <Icon name="Bell" size={17} fallback="AlertCircle" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-gold" />
            </button>
            <div className="w-9 h-9 rounded-xl btn-gold flex items-center justify-center text-xs font-bold cursor-pointer">АК</div>
          </div>
        </header>
        {/* Content */}
        <div className="px-4 lg:px-8 py-6 pb-24 lg:pb-8">
          {renderSection()}
        </div>
      </main>
      {/* Mobile bottom nav */}
      <MobileNav active={activeSection} onNav={setActiveSection} />
    </div>
  );
}