import { useMemo } from 'react';

const RUNES = ['ᚱ', 'ᚢ', 'ᚾ', 'ᛖ', 'ᛗ', 'ᚨ', 'ᚷ', 'ᛁ', 'ᚲ'];

export default function HorrorBackground() {
  // Memoize random values to avoid re-generating on every render
  const skulls = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${(i * 7.3 + 3) % 100}%`,
      delay: `${(i * 0.57) % 8}s`,
      duration: `${8 + (i * 1.3) % 12}s`,
      size: `${8 + (i * 1.1) % 16}px`,
      opacity: 0.15 + (i * 0.013) % 0.2,
    })),
  []);

  const runes = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${(i * 8.7 + 5) % 100}%`,
      delay: `${(i * 0.83) % 10}s`,
      duration: `${10 + (i * 1.25) % 15}s`,
      size: `${10 + (i * 1.17) % 14}px`,
      opacity: 0.1 + (i * 0.012) % 0.15,
      rune: RUNES[i % RUNES.length],
    })),
  []);

  return (
    <div
      className="horror-bg"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {/* Layer 1: Floating skull particles */}
      <div className="skull-particles">
        {skulls.map((s) => (
          <span
            key={s.id}
            className="skull-particle"
            style={{
              left: s.left,
              animationDelay: s.delay,
              animationDuration: s.duration,
              fontSize: s.size,
              opacity: s.opacity,
              willChange: 'transform',
            }}
          >
            💀
          </span>
        ))}
      </div>

      {/* Layer 2: Floating magic runes */}
      {runes.map((r) => (
        <span
          key={`rune-${r.id}`}
          className="rune-particle"
          style={{
            left: r.left,
            animationDelay: r.delay,
            animationDuration: r.duration,
            fontSize: r.size,
            opacity: r.opacity,
            willChange: 'transform',
          }}
        >
          {r.rune}
        </span>
      ))}

      {/* Layer 3: Glowing orbs */}
      <div className="orb orb-1" style={{ willChange: 'transform' }} />
      <div className="orb orb-2" style={{ willChange: 'transform' }} />
      <div className="orb orb-3" style={{ willChange: 'transform' }} />

      {/* Layer 4: Mist/fog at bottom */}
      <div className="mist-layer" />
    </div>
  );
}
