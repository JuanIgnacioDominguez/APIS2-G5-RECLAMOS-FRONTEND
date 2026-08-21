/**
 * Decorative line-art skyline for the bottom of the sidebar, echoing the
 * CityPass+ brand illustration. Purely cosmetic, hidden from assistive tech.
 */
export function CitySkyline() {
  return (
    <svg
      viewBox="0 0 264 96"
      width="100%"
      height="96"
      fill="none"
      aria-hidden="true"
      style={{ display: "block", opacity: 0.35 }}
    >
      <g stroke="var(--mantine-color-azulUrbano-3)" strokeWidth="1.4" strokeLinejoin="round">
        {/* sun */}
        <circle cx="44" cy="30" r="10" />
        {/* clouds */}
        <path d="M150 24 q6 -8 14 0 q8 -2 8 6 h-26 q-2 -6 4 -6 Z" />
        <path d="M196 40 q5 -7 12 0 q7 -2 7 5 h-22 q-2 -5 3 -5 Z" />
        {/* skyline */}
        <path d="M0 96 V70 h18 V54 h14 V70 h10 V44 h16 V70 h12 V60 h20 V70 h14 V50 h16 V70 h10 V58 h18 V70 h14 V40 h14 V70 h16 V62 h22 V96 Z" />
      </g>
    </svg>
  );
}
