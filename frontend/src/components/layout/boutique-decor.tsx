/** Subtle floating florals — decorative only; does not capture pointer events. */
export function BoutiqueDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {/* Soft corner blooms */}
      <svg
        className="animate-boutique-float-a absolute -left-8 top-[12%] h-24 w-24 opacity-[0.14] sm:h-32 sm:w-32"
        viewBox="0 0 64 64"
        fill="none"
      >
        <circle cx="32" cy="32" r="8" fill="#C9A9A6" />
        {[0, 72, 144, 216, 288].map((deg) => (
          <ellipse
            key={deg}
            cx="32"
            cy="14"
            rx="7"
            ry="14"
            fill="#E8D5D0"
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
      </svg>

      <svg
        className="animate-boutique-float-b absolute -right-6 top-[28%] h-20 w-20 opacity-[0.12] sm:h-28 sm:w-28"
        viewBox="0 0 64 64"
        fill="none"
      >
        <circle cx="32" cy="32" r="7" fill="#C9A9A6" />
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <ellipse
            key={deg}
            cx="32"
            cy="15"
            rx="6"
            ry="12"
            fill="#F0E4E2"
            transform={`rotate(${deg} 32 32)`}
          />
        ))}
      </svg>

      <svg
        className="animate-boutique-float-c absolute bottom-[18%] left-[8%] h-16 w-16 opacity-[0.1] sm:h-20 sm:w-20"
        viewBox="0 0 48 48"
        fill="none"
      >
        <path
          d="M24 4C20 14 10 18 10 24C10 30 16 34 24 38C32 34 38 30 38 24C38 18 28 14 24 4Z"
          fill="#E8D5D0"
        />
        <path
          d="M24 38C24 42 22 46 18 46C14 46 12 42 14 38"
          stroke="#C9A9A6"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Butterflies */}
      <svg
        className="animate-boutique-drift-a absolute right-[12%] top-[20%] h-10 w-10 opacity-[0.16] sm:h-12 sm:w-12"
        viewBox="0 0 40 40"
        fill="none"
      >
        <path
          d="M20 20C14 12 6 10 4 16C2 22 8 26 14 24C10 28 8 34 12 36C16 38 20 34 20 28"
          fill="#7A3E48"
          fillOpacity="0.35"
        />
        <path
          d="M20 20C26 12 34 10 36 16C38 22 32 26 26 24C30 28 32 34 28 36C24 38 20 34 20 28"
          fill="#7A3E48"
          fillOpacity="0.35"
        />
        <line x1="20" y1="20" x2="20" y2="36" stroke="#7A3E48" strokeWidth="1" strokeOpacity="0.4" />
      </svg>

      <svg
        className="animate-boutique-drift-b absolute bottom-[32%] right-[18%] h-8 w-8 opacity-[0.12] sm:h-10 sm:w-10"
        viewBox="0 0 40 40"
        fill="none"
      >
        <path
          d="M20 20C14 12 6 10 4 16C2 22 8 26 14 24C10 28 8 34 12 36C16 38 20 34 20 28"
          fill="#C9A9A6"
          fillOpacity="0.5"
        />
        <path
          d="M20 20C26 12 34 10 36 16C38 22 32 26 26 24C30 28 32 34 28 36C24 38 20 34 20 28"
          fill="#C9A9A6"
          fillOpacity="0.5"
        />
        <line x1="20" y1="20" x2="20" y2="36" stroke="#C9A9A6" strokeWidth="1" strokeOpacity="0.5" />
      </svg>

      <svg
        className="animate-boutique-drift-c absolute left-[20%] top-[55%] h-7 w-7 opacity-[0.1]"
        viewBox="0 0 40 40"
        fill="none"
      >
        <path
          d="M20 20C14 12 6 10 4 16C2 22 8 26 14 24C10 28 8 34 12 36C16 38 20 34 20 28"
          fill="#7A3E48"
          fillOpacity="0.3"
        />
        <path
          d="M20 20C26 12 34 10 36 16C38 22 32 26 26 24C30 28 32 34 28 36C24 38 20 34 20 28"
          fill="#7A3E48"
          fillOpacity="0.3"
        />
      </svg>
    </div>
  );
}
