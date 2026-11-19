// An original geometric street scene (flat colour blocks, arches, stairs, one pink sun).
// Pure SVG, so it scales and needs no image file.
export default function Hero() {
  return (
    <svg className="hero-art" viewBox="0 0 800 340" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Stylised street of colourful blocks under a pink sun">
      <rect width="800" height="340" fill="var(--sky)" />
      <circle cx="560" cy="62" r="30" fill="var(--sun)" />

      {/* far blocks */}
      <rect x="470" y="110" width="70" height="170" fill="var(--peach)" />
      <rect x="540" y="90" width="46" height="190" fill="var(--periwinkle)" />
      <rect x="500" y="150" width="14" height="120" fill="var(--orange)" />

      {/* left: tall indigo wall with lilac face */}
      <polygon points="0,0 150,0 150,300 0,300" fill="var(--lilac)" />
      <polygon points="0,60 70,60 70,300 0,300" fill="var(--indigo)" />

      {/* big pink block with arch doorway and mint reveal */}
      <rect x="120" y="50" width="200" height="250" fill="var(--pink)" />
      <path d="M160 300 V170 a40 40 0 0 1 80 0 V300 Z" fill="var(--mint)" />
      <path d="M175 300 V172 a25 25 0 0 1 50 0 V300 Z" fill="var(--ink)" />
      <rect x="120" y="50" width="200" height="14" fill="var(--pink-deep)" />

      {/* stairs */}
      <g fill="var(--rose)">
        <polygon points="120,300 330,300 330,284 120,284" />
        <polygon points="150,284 330,284 330,268 150,268" />
        <polygon points="190,268 330,268 330,252 190,252" />
      </g>

      {/* peach block with two arched windows */}
      <rect x="320" y="110" width="150" height="190" fill="var(--peach)" />
      <path d="M345 150 v-14 a8 8 0 0 1 16 0 v14 Z M375 150 v-14 a8 8 0 0 1 16 0 v14 Z" fill="var(--indigo)" />
      <path d="M350 300 v-70 a30 30 0 0 1 60 0 v70 Z" fill="var(--ink)" />

      {/* right: brick tower with round window, light-blue block */}
      <rect x="690" y="40" width="110" height="260" fill="var(--brick)" />
      <circle cx="770" cy="150" r="9" fill="var(--ink)" />
      <rect x="560" y="140" width="130" height="160" fill="var(--sky-light)" />
      <rect x="600" y="180" width="34" height="48" fill="var(--indigo)" />
      <polygon points="560,140 690,140 690,126 575,126" fill="var(--periwinkle)" />

      {/* ground with long cast shadows */}
      <rect y="300" width="800" height="40" fill="var(--ink)" />
      <polygon points="0,340 0,312 400,300 520,340" fill="var(--indigo)" />
      <polygon points="520,340 400,300 800,300 800,340" fill="var(--shadow)" />
    </svg>
  );
}
