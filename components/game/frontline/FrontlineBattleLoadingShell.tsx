export default function FrontlineBattleLoadingShell() {
  return (
    <div
      className="relative min-h-[42rem] overflow-hidden rounded-[34px] border border-[#f5d498]/14 bg-[linear-gradient(135deg,rgba(35,25,20,0.74),rgba(9,11,17,0.94)_52%,rgba(4,6,10,0.98)_100%)] p-4 shadow-[0_30px_90px_rgba(0,0,0,0.44)]"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(245,196,81,0.14),transparent_24%),radial-gradient(circle_at_78%_22%,rgba(137,66,38,0.16),transparent_28%)]" />
      <div className="relative z-[1] flex h-full min-h-[40rem] flex-col gap-4">
        <div className="grid gap-3 md:grid-cols-[16rem_minmax(0,1fr)_16rem]">
          <div className="h-24 rounded-[24px] border border-white/10 bg-white/[0.045]" />
          <div className="h-24 rounded-[24px] border border-[#f5d498]/12 bg-[#f5d498]/[0.055]" />
          <div className="h-24 rounded-[24px] border border-white/10 bg-white/[0.045]" />
        </div>
        <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="grid gap-3 rounded-[30px] border border-white/10 bg-black/24 p-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-white/10 bg-white/[0.045]" />
            <div className="rounded-[24px] border border-white/10 bg-white/[0.055]" />
            <div className="rounded-[24px] border border-white/10 bg-white/[0.045]" />
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.045]" />
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          <div className="h-36 rounded-[22px] border border-white/10 bg-white/[0.05]" />
          <div className="h-36 rounded-[22px] border border-white/10 bg-white/[0.05]" />
          <div className="h-36 rounded-[22px] border border-white/10 bg-white/[0.05]" />
          <div className="h-36 rounded-[22px] border border-white/10 bg-white/[0.05]" />
          <div className="h-36 rounded-[22px] border border-white/10 bg-white/[0.05]" />
        </div>
      </div>
    </div>
  );
}
