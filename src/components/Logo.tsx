interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  wordmarkClassName?: string;
}

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="CityPass+"
    >
      <path d="M14 58 L48 118 L82 58 Z" fill="#154a6b" />
      <path d="M48 6 C26 6 14 24 14 42 L14 58 L82 58 L82 42 C82 24 70 6 48 6 Z" fill="#0f9bc7" />
      <path
        d="M22 58 L22 44 L30 44 L30 36 L38 36 L38 48 L44 48 L44 28 L52 24 L52 48 L58 48 L58 40 L66 40 L66 46 L74 46 L74 58 Z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function Logo({ size = 32, withWordmark = true, wordmarkClassName }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <LogoMark size={size} />
      {withWordmark && (
        <span
          className={`font-bold tracking-tight ${wordmarkClassName ?? ""}`}
          style={{ fontSize: size * 0.62 }}
        >
          CityPass<span className="text-[#e6b566]">+</span>
        </span>
      )}
    </div>
  );
}
