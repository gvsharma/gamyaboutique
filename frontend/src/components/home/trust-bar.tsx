const ITEMS = [
  "Custom fit guarantee",
  "Women & girls ethnic wear",
  "Bespoke stitching · Hyderabad",
  "Free styling consultation",
] as const;

export function TrustBar() {
  const line = ITEMS.join("  ·  ");

  return (
    <div className="trust-ticker overflow-hidden">
      <p className="animate-[marquee_28s_linear_infinite] whitespace-nowrap sm:animate-none">
        <span className="sm:hidden">{line}  ·  {line}</span>
        <span className="hidden sm:inline">{line}</span>
      </p>
    </div>
  );
}
