/**
 * Original hand-drawn landmark silhouettes — not photographs or traced
 * copies of any specific image. Each destination card gets a distinct
 * skyline so "Popular destinations" reads as a picture, not a flat color
 * swatch, without depending on any licensed photo asset.
 */
export function DestinationArt({ city, className }: { city: string; className?: string }) {
  const common = "absolute inset-x-0 bottom-0 h-full w-full";
  switch (city) {
    case "LHR":
      return (
        <svg viewBox="0 0 240 120" className={`${common} ${className ?? ""}`} preserveAspectRatio="xMidYMax slice" fill="none">
          <circle cx="60" cy="72" r="40" stroke="white" strokeOpacity="0.55" strokeWidth="3" />
          <circle cx="60" cy="72" r="3" fill="white" fillOpacity="0.7" />
          <line x1="60" y1="72" x2="60" y2="32" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
          <line x1="60" y1="72" x2="94" y2="50" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
          <line x1="60" y1="72" x2="94" y2="94" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
          <line x1="60" y1="72" x2="26" y2="94" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
          <line x1="60" y1="72" x2="26" y2="50" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" />
          <rect x="34" y="108" width="52" height="12" fill="white" fillOpacity="0.55" />
          <rect x="152" y="46" width="26" height="74" fill="white" fillOpacity="0.75" />
          <circle cx="165" cy="58" r="9" fill="white" fillOpacity="0.95" />
          <path d="M165 58 L165 51 M165 58 L171 58" stroke="#0a4eac" strokeWidth="1.6" strokeLinecap="round" />
          <polygon points="152,46 178,46 165,24" fill="white" fillOpacity="0.85" />
          <rect x="161" y="10" width="8" height="16" fill="white" fillOpacity="0.85" />
        </svg>
      );
    case "DXB":
      return (
        <svg viewBox="0 0 240 120" className={`${common} ${className ?? ""}`} preserveAspectRatio="xMidYMax slice" fill="none">
          <rect x="30" y="80" width="20" height="40" fill="white" fillOpacity="0.35" />
          <rect x="188" y="70" width="18" height="50" fill="white" fillOpacity="0.35" />
          <polygon points="96,120 152,120 142,72 106,72" fill="white" fillOpacity="0.55" />
          <polygon points="106,72 142,72 134,40 114,40" fill="white" fillOpacity="0.7" />
          <polygon points="114,40 134,40 126,14 122,14" fill="white" fillOpacity="0.85" />
          <line x1="124" y1="14" x2="124" y2="2" stroke="white" strokeOpacity="0.9" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "NRT":
      return (
        <svg viewBox="0 0 240 120" className={`${common} ${className ?? ""}`} preserveAspectRatio="xMidYMax slice" fill="none">
          <polygon points="20,120 116,120 68,34" fill="white" fillOpacity="0.4" />
          <polygon points="59,58 77,58 68,34" fill="white" fillOpacity="0.75" />
          <polygon points="176,120 184,120 180,88 172,88" fill="white" fillOpacity="0.55" />
          <polygon points="150,120 206,120 180,30 176,30" fill="none" stroke="white" strokeOpacity="0.6" strokeWidth="2" />
          <line x1="158" y1="98" x2="198" y2="98" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" />
          <line x1="165" y1="72" x2="191" y2="72" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" />
        </svg>
      );
    case "SIN":
      return (
        <svg viewBox="0 0 240 120" className={`${common} ${className ?? ""}`} preserveAspectRatio="xMidYMax slice" fill="none">
          <rect x="82" y="52" width="16" height="68" fill="white" fillOpacity="0.6" />
          <rect x="112" y="52" width="16" height="68" fill="white" fillOpacity="0.7" />
          <rect x="142" y="52" width="16" height="68" fill="white" fillOpacity="0.6" />
          <path d="M76 54 Q120 30 164 54 L160 64 Q120 44 80 64 Z" fill="white" fillOpacity="0.85" />
          <rect x="30" y="92" width="14" height="28" fill="white" fillOpacity="0.3" />
          <rect x="196" y="86" width="14" height="34" fill="white" fillOpacity="0.3" />
        </svg>
      );
    case "CDG":
      return (
        <svg viewBox="0 0 240 120" className={`${common} ${className ?? ""}`} preserveAspectRatio="xMidYMax slice" fill="none">
          <polygon
            points="98,120 142,120 128,86 124,86 132,58 128,58 133,34 127,34 120,10 113,34 107,34 112,58 108,58 116,86 112,86"
            fill="white"
            fillOpacity="0.7"
          />
          <line x1="90" y1="120" x2="108" y2="86" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
          <line x1="150" y1="120" x2="132" y2="86" stroke="white" strokeOpacity="0.5" strokeWidth="2" />
        </svg>
      );
    case "SYD":
      return (
        <svg viewBox="0 0 240 120" className={`${common} ${className ?? ""}`} preserveAspectRatio="xMidYMax slice" fill="none">
          <path d="M20 92 Q100 34 180 92" stroke="white" strokeOpacity="0.45" strokeWidth="3" fill="none" />
          <line x1="60" y1="72" x2="60" y2="98" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
          <line x1="140" y1="72" x2="140" y2="98" stroke="white" strokeOpacity="0.4" strokeWidth="2" />
          <path d="M96,120 C96,86 108,64 122,64 C136,64 144,88 142,120 Z" fill="white" fillOpacity="0.55" />
          <path d="M118,120 C118,92 128,74 140,74 C150,74 158,94 156,120 Z" fill="white" fillOpacity="0.75" />
          <path d="M138,120 C138,98 146,84 156,84 C164,84 170,100 168,120 Z" fill="white" fillOpacity="0.9" />
        </svg>
      );
    case "BCN":
      return (
        <svg viewBox="0 0 240 120" className={`${common} ${className ?? ""}`} preserveAspectRatio="xMidYMax slice" fill="none">
          <rect x="86" y="60" width="10" height="60" fill="white" fillOpacity="0.55" />
          <circle cx="91" cy="54" r="6" fill="white" fillOpacity="0.6" />
          <rect x="104" y="38" width="12" height="82" fill="white" fillOpacity="0.75" />
          <circle cx="110" cy="30" r="7" fill="white" fillOpacity="0.8" />
          <rect x="124" y="50" width="10" height="70" fill="white" fillOpacity="0.65" />
          <circle cx="129" cy="44" r="6" fill="white" fillOpacity="0.7" />
          <rect x="142" y="66" width="9" height="54" fill="white" fillOpacity="0.5" />
          <circle cx="146.5" cy="60" r="5" fill="white" fillOpacity="0.6" />
        </svg>
      );
    case "DPS":
      return (
        <svg viewBox="0 0 240 120" className={`${common} ${className ?? ""}`} preserveAspectRatio="xMidYMax slice" fill="none">
          <polygon points="70,120 96,120 90,96 76,96" fill="white" fillOpacity="0.5" />
          <polygon points="72,96 94,96 88,76 78,76" fill="white" fillOpacity="0.6" />
          <polygon points="74,76 92,76 86,58 80,58" fill="white" fillOpacity="0.75" />
          <polygon points="144,120 170,120 164,96 150,96" fill="white" fillOpacity="0.5" />
          <polygon points="146,96 168,96 162,76 152,76" fill="white" fillOpacity="0.6" />
          <polygon points="148,76 166,76 160,58 154,58" fill="white" fillOpacity="0.75" />
          <path d="M186 120 C186 90 190 64 190 44" stroke="white" strokeOpacity="0.55" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M190 44 C176 38 168 30 162 22" stroke="white" strokeOpacity="0.55" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M190 44 C198 34 202 24 200 14" stroke="white" strokeOpacity="0.55" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M190 44 C192 32 198 22 208 18" stroke="white" strokeOpacity="0.55" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
