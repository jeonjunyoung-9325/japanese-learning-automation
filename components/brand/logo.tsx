"use client";

type LogoProps = {
  compact?: boolean;
  light?: boolean;
};

export function Logo({ compact = false, light = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      <div>
        <p className={`font-semibold tracking-[0.24em] ${light ? "text-orange-200" : "text-orange-300"} ${compact ? "text-[10px]" : "text-xs"}`}>
          JAPANESE SPEAKING PRACTICE
        </p>
        <h1 className={`font-semibold ${light ? "text-white" : "text-stone-50"} ${compact ? "text-lg" : "text-2xl"}`}>
          Kotoba Mate
        </h1>
      </div>
    </div>
  );
}

export function LogoMark() {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#ff8d5d,#ffb347)] shadow-lg shadow-orange-950/25">
      <div className="absolute inset-[6px] rounded-[14px] border border-white/25 bg-stone-950/10" />
      <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-stone-950/80 text-sm font-semibold text-orange-200">
        こ
      </div>
      <div className="absolute bottom-2 right-2 h-2.5 w-2.5 rounded-full bg-white/85" />
    </div>
  );
}
