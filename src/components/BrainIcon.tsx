interface BrainIconProps {
  filled?: boolean;
  size?: number;
}

export function BrainIcon({ filled = true, size = 28 }: BrainIconProps) {
  const pink = "#E48CA5";
  const outline = "#7B3D5A";
  const sw = 2.2;

  // Overlapping elliptical lobes drawn back-to-front to create
  // a puffy, cartoonish brain. Stroke overlap between lobes
  // naturally forms the groove lines.
  const lobes = [
    // Center (behind everything)
    { cx: 32, cy: 30, rx: 12, ry: 11 },
    // Top row (back of brain)
    { cx: 32, cy: 14, rx: 11, ry: 10 },
    { cx: 19, cy: 18, rx: 12, ry: 10 },
    { cx: 45, cy: 18, rx: 12, ry: 10 },
    // Side lobes
    { cx: 12, cy: 32, rx: 11, ry: 12 },
    { cx: 52, cy: 32, rx: 11, ry: 12 },
    // Bottom row (front of brain, drawn last)
    { cx: 19, cy: 44, rx: 13, ry: 10 },
    { cx: 45, cy: 44, rx: 13, ry: 10 },
    { cx: 32, cy: 44, rx: 11, ry: 9 },
  ];

  // Small white shine marks on individual lobes
  const highlights = [
    "M 28 8 C 30 6 34 6 36 8",
    "M 14 14 C 16 12 20 12 22 14",
    "M 42 14 C 44 12 48 12 50 14",
    "M 7 28 C 9 26 12 26 14 28",
    "M 50 28 C 52 26 55 26 57 28",
    "M 14 40 C 16 38 20 38 22 40",
    "M 42 40 C 44 38 48 38 50 40",
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {filled ? (
        <>
          {lobes.map((l, i) => (
            <ellipse
              key={i}
              cx={l.cx}
              cy={l.cy}
              rx={l.rx}
              ry={l.ry}
              fill={pink}
              stroke={outline}
              strokeWidth={sw}
            />
          ))}
          {highlights.map((d, i) => (
            <path
              key={`h${i}`}
              d={d}
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
          ))}
        </>
      ) : (
        <path
          d={
            // Bumpy silhouette matching the filled lobe positions.
            // 8 bulges (one per lobe) with pinch-points between them.
            "M 23 12" +
            " C 25 4, 39 4, 41 12" + // top-center bump
            " C 48 7, 59 12, 57 23" + // top-right bump
            " C 64 25, 64 39, 57 41" + // right bump
            " C 60 48, 48 56, 39 52" + // bottom-right bump
            " C 36 57, 28 57, 25 52" + // bottom-center bump
            " C 16 56, 4 48, 7 41" + // bottom-left bump
            " C 0 39, 0 25, 7 23" + // left bump
            " C 5 16, 12 8, 23 12 Z" // top-left bump
          }
          fill="none"
          stroke={pink}
          strokeWidth={2.5}
          strokeLinejoin="round"
          opacity="0.3"
        />
      )}
    </svg>
  );
}
