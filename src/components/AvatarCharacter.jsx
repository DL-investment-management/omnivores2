/**
 * Avatar character with customizable hat, shirt, pants, shoes, watch.
 */
import { motion } from "framer-motion";

// ── Base body ────────────────────────────────────────────────────────────────
function BaseBody({ skinColor = "#FFD5A0", waveKey = 0 }) {
  return (
    <g id="base-body">
      <circle cx="100" cy="52" r="28" fill={skinColor} />
      <circle cx="90" cy="47" r="3.5" fill="#333" />
      <circle cx="110" cy="47" r="3.5" fill="#333" />
      <circle cx="91" cy="46" r="1.2" fill="#fff" />
      <circle cx="111" cy="46" r="1.2" fill="#fff" />
      <path d="M93 61 Q100 68 107 61" stroke="#333" strokeWidth="2" fill="none" strokeLinecap="round" />
      <rect x="93" y="78" width="14" height="10" rx="3" fill={skinColor} />
      {/* Left arm */}
      <rect x="54" y="92" width="14" height="44" rx="7" fill={skinColor} />
      <circle cx="61" cy="138" r="7" fill={skinColor} />
      {/* Right arm — waves */}
      <motion.g
        key={waveKey}
        style={{ transformOrigin: "50% 0%" }}
        initial={{ rotate: 0 }}
        animate={waveKey > 0 ? { rotate: [0, -120, -95, -120, -95, -110, 0] } : { rotate: 0 }}
        transition={{ duration: 1.1, ease: "easeInOut" }}
      >
        <rect x="132" y="92" width="14" height="44" rx="7" fill={skinColor} />
        <circle cx="139" cy="138" r="7" fill={skinColor} />
      </motion.g>
    </g>
  );
}

// ── HATS ─────────────────────────────────────────────────────────────────────
function hatNone() { return null; }
function hat1() { // Baseball Cap
  return <g>
    <path d="M74 33 Q74 12 100 12 Q126 12 126 33" fill="#E74C3C" />
    <ellipse cx="100" cy="33" rx="32" ry="5.5" fill="#C0392B" />
    <path d="M100 33 Q120 35 134 30" stroke="#C0392B" strokeWidth="5" fill="none" strokeLinecap="round" />
    <rect x="96" y="11" width="8" height="6" rx="3" fill="#B03A2E" />
  </g>;
}
function hat2() { // Cowboy Hat
  return <g>
    <path d="M78 28 Q80 8 100 8 Q120 8 122 28" fill="#D4A04A" />
    <ellipse cx="100" cy="28" rx="38" ry="7" fill="#8B6914" />
    <path d="M64 28 Q100 22 136 28" stroke="#7A5C11" strokeWidth="2" fill="none" />
    <rect x="94" y="5" width="12" height="4" rx="2" fill="#A0780E" />
  </g>;
}
function hat3() { // Party Hat
  return <g>
    <path d="M100 5 L70 36 L130 36 Z" fill="#9B59B6" />
    <path d="M100 5 L70 36 L130 36 Z" fill="none" stroke="#8E44AD" strokeWidth="1.5" />
    <circle cx="86" cy="28" r="3" fill="#F1C40F" />
    <circle cx="114" cy="28" r="3" fill="#F1C40F" />
    <circle cx="100" cy="20" r="3" fill="#E74C3C" />
    <rect x="68" y="33" width="64" height="6" rx="3" fill="#8E44AD" />
    <line x1="100" y1="5" x2="100" y2="0" stroke="#F1C40F" strokeWidth="2" />
    <circle cx="100" cy="0" r="3" fill="#F1C40F" />
  </g>;
}
function hat4() { // Snapback
  return <g>
    <path d="M74 32 Q74 14 100 14 Q126 14 126 32" fill="#3498DB" />
    <rect x="68" y="29" width="64" height="7" rx="2" fill="#2980B9" />
    <path d="M100 30 Q118 31 134 27" stroke="#2471A3" strokeWidth="5" fill="none" strokeLinecap="round" />
    <rect x="90" y="14" width="20" height="5" rx="2" fill="#2471A3" />
    <text x="100" y="26" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#ECF0F1">NY</text>
  </g>;
}
function hat5() { // Beanie
  return <g>
    <path d="M70 36 Q70 10 100 10 Q130 10 130 36" fill="#9B59B6" />
    <rect x="66" y="32" width="68" height="8" rx="4" fill="#7D3C98" />
    <line x1="75" y1="32" x2="75" y2="15" stroke="#7D3C98" strokeWidth="3" />
    <line x1="85" y1="32" x2="83" y2="11" stroke="#7D3C98" strokeWidth="3" />
    <line x1="100" y1="32" x2="100" y2="10" stroke="#7D3C98" strokeWidth="3" />
    <line x1="115" y1="32" x2="117" y2="11" stroke="#7D3C98" strokeWidth="3" />
    <line x1="125" y1="32" x2="125" y2="15" stroke="#7D3C98" strokeWidth="3" />
    <circle cx="100" cy="10" r="5" fill="#F1C40F" />
  </g>;
}

// ── SHIRTS ───────────────────────────────────────────────────────────────────
function shirtNone() { return <rect x="68" y="86" width="64" height="52" rx="8" fill="#ECF0F1" />; }
function shirt1() {
  return <g><rect x="68" y="86" width="64" height="52" rx="8" fill="#E74C3C" /><rect x="92" y="86" width="16" height="52" fill="#C0392B" /></g>;
}
function shirt2() {
  return <g><rect x="68" y="86" width="64" height="52" rx="8" fill="#3498DB" /><path d="M68 100 L132 100" stroke="#2980B9" strokeWidth="3" /><path d="M68 116 L132 116" stroke="#2980B9" strokeWidth="3" /></g>;
}
function shirt3() {
  return <g><rect x="68" y="86" width="64" height="52" rx="8" fill="#2ECC71" /><circle cx="100" cy="110" r="10" fill="#27AE60" /><circle cx="100" cy="110" r="5" fill="#F1C40F" /></g>;
}
function shirt4() {
  return <g><rect x="68" y="86" width="64" height="52" rx="8" fill="#1ABC9C" /><path d="M80 92 L100 106 L120 92" stroke="#16A085" strokeWidth="3" fill="none" /><path d="M80 108 L100 122 L120 108" stroke="#16A085" strokeWidth="3" fill="none" /></g>;
}
function shirt5() {
  return <g><rect x="68" y="86" width="64" height="52" rx="8" fill="#F39C12" /><rect x="68" y="86" width="32" height="52" rx="0" fill="#E67E22" /><text x="100" y="116" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#fff">$</text></g>;
}

// ── PANTS ────────────────────────────────────────────────────────────────────
function pantsNone() { return <g><rect x="76" y="136" width="20" height="40" rx="6" fill="#BDC3C7" /><rect x="104" y="136" width="20" height="40" rx="6" fill="#BDC3C7" /></g>; }
function pants1() { return <g><rect x="76" y="136" width="20" height="40" rx="6" fill="#2C3E50" /><rect x="104" y="136" width="20" height="40" rx="6" fill="#2C3E50" /></g>; }
function pants2() { return <g><rect x="76" y="136" width="20" height="40" rx="6" fill="#3498DB" /><rect x="104" y="136" width="20" height="40" rx="6" fill="#3498DB" /><rect x="76" y="150" width="20" height="3" rx="1" fill="#2980B9" /><rect x="104" y="150" width="20" height="3" rx="1" fill="#2980B9" /></g>; }
function pants3() { return <g><rect x="76" y="136" width="20" height="40" rx="6" fill="#8E44AD" /><rect x="104" y="136" width="20" height="40" rx="6" fill="#8E44AD" /></g>; }
function pants4() { return <g><rect x="76" y="136" width="20" height="40" rx="6" fill="#D35400" /><rect x="104" y="136" width="20" height="40" rx="6" fill="#D35400" /><rect x="76" y="136" width="20" height="6" rx="3" fill="#E67E22" /><rect x="104" y="136" width="20" height="6" rx="3" fill="#E67E22" /></g>; }
function pants5() { return <g><rect x="76" y="136" width="20" height="40" rx="6" fill="#16A085" /><rect x="104" y="136" width="20" height="40" rx="6" fill="#16A085" /><circle cx="86" cy="152" r="3" fill="#1ABC9C" /><circle cx="114" cy="152" r="3" fill="#1ABC9C" /></g>; }

// ── SHOES ────────────────────────────────────────────────────────────────────
function shoesNone() { return <g><ellipse cx="86" cy="178" rx="14" ry="6" fill="#95A5A6" /><ellipse cx="114" cy="178" rx="14" ry="6" fill="#95A5A6" /></g>; }
function shoes1() { return <g><ellipse cx="84" cy="178" rx="16" ry="7" fill="#E74C3C" /><ellipse cx="116" cy="178" rx="16" ry="7" fill="#E74C3C" /><ellipse cx="78" cy="176" rx="4" ry="3" fill="#fff" /><ellipse cx="122" cy="176" rx="4" ry="3" fill="#fff" /></g>; }
function shoes2() { return <g><ellipse cx="84" cy="178" rx="16" ry="7" fill="#2C3E50" /><ellipse cx="116" cy="178" rx="16" ry="7" fill="#2C3E50" /><rect x="76" y="172" width="16" height="3" rx="1" fill="#F39C12" /><rect x="108" y="172" width="16" height="3" rx="1" fill="#F39C12" /></g>; }
function shoes3() { return <g><ellipse cx="84" cy="178" rx="16" ry="7" fill="#9B59B6" /><ellipse cx="116" cy="178" rx="16" ry="7" fill="#9B59B6" /></g>; }
function shoes4() { return <g><ellipse cx="84" cy="178" rx="16" ry="7" fill="#3498DB" /><ellipse cx="116" cy="178" rx="16" ry="7" fill="#3498DB" /><path d="M72 176 L78 172 L84 176" stroke="#fff" strokeWidth="1.5" fill="none" /><path d="M104 176 L110 172 L116 176" stroke="#fff" strokeWidth="1.5" fill="none" /></g>; }
function shoes5() { return <g><ellipse cx="84" cy="178" rx="16" ry="7" fill="#F1C40F" /><ellipse cx="116" cy="178" rx="16" ry="7" fill="#F1C40F" /><circle cx="84" cy="176" r="3" fill="#E67E22" /><circle cx="116" cy="176" r="3" fill="#E67E22" /></g>; }

// ── WATCHES (on left wrist ~y=122-134) ───────────────────────────────────────
function watchNone() { return null; }
function watch1() { // Classic leather
  return <g>
    <rect x="51" y="123" width="20" height="9" rx="3" fill="#6B4226" />
    <rect x="54" y="120" width="14" height="15" rx="3" fill="#F5F0E8" stroke="#8B6914" strokeWidth="1.5" />
    <circle cx="61" cy="127.5" r="5.5" fill="#FDFAF5" stroke="#C9A227" strokeWidth="1" />
    <line x1="61" y1="127.5" x2="61" y2="123.5" stroke="#2C3E50" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="61" y1="127.5" x2="64.5" y2="127.5" stroke="#2C3E50" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="61" cy="127.5" r="0.8" fill="#E74C3C" />
  </g>;
}
function watch2() { // Sport watch
  return <g>
    <rect x="51" y="123" width="20" height="9" rx="4" fill="#E74C3C" />
    <rect x="54" y="119" width="14" height="17" rx="3" fill="#1A1A2E" stroke="#E74C3C" strokeWidth="1.5" />
    <rect x="55.5" y="120.5" width="11" height="14" rx="2" fill="#0D0D1A" />
    <text x="61" y="128" textAnchor="middle" fontSize="3.2" fill="#2ECC71" fontWeight="bold" fontFamily="monospace">12:00</text>
  </g>;
}
function watch3() { // Smartwatch
  return <g>
    <rect x="51" y="123" width="20" height="9" rx="3" fill="#5D6D7E" />
    <rect x="54" y="119" width="14" height="17" rx="4" fill="#2C3E50" stroke="#85929E" strokeWidth="1" />
    <rect x="55.5" y="120.5" width="11" height="14" rx="3" fill="#2980B9" opacity="0.7" />
    <text x="61" y="129" textAnchor="middle" fontSize="7" fill="#fff">⊞</text>
  </g>;
}
function watch4() { // Gold luxury
  return <g>
    <rect x="51" y="123" width="20" height="9" rx="3" fill="#D4AC0D" />
    <rect x="54" y="119" width="14" height="17" rx="3" fill="#F1C40F" stroke="#9A7D0A" strokeWidth="1.5" />
    <circle cx="61" cy="127.5" r="6" fill="#FEF9E7" stroke="#D4AC0D" strokeWidth="1.2" />
    <line x1="61" y1="127.5" x2="61" y2="123" stroke="#2C3E50" strokeWidth="1" strokeLinecap="round" />
    <line x1="61" y1="127.5" x2="65" y2="127.5" stroke="#2C3E50" strokeWidth="1" strokeLinecap="round" />
    <circle cx="61" cy="127.5" r="0.8" fill="#2C3E50" />
  </g>;
}
function watch5() { // Neon digital
  return <g>
    <rect x="51" y="123" width="20" height="9" rx="3" fill="#1A252F" />
    <rect x="54" y="119" width="14" height="17" rx="3" fill="#0D1B2A" stroke="#00E676" strokeWidth="1.5" />
    <rect x="55.5" y="120.5" width="11" height="14" rx="2" fill="#050D14" />
    <text x="61" y="128" textAnchor="middle" fontSize="3.2" fill="#00E676" fontWeight="bold" fontFamily="monospace">88:88</text>
  </g>;
}

// ── Lookup maps ───────────────────────────────────────────────────────────────
export const HAT_PARTS   = [hatNone, hat1, hat2, hat3, hat4, hat5];
export const SHIRT_PARTS = [shirtNone, shirt1, shirt2, shirt3, shirt4, shirt5];
export const PANTS_PARTS = [pantsNone, pants1, pants2, pants3, pants4, pants5];
export const SHOES_PARTS = [shoesNone, shoes1, shoes2, shoes3, shoes4, shoes5];
export const WATCH_PARTS = [watchNone, watch1, watch2, watch3, watch4, watch5];

export const AVATAR_ITEMS = {
  hats: [
    { id: 0,  name: "None",        level: 1, color: "#ccc"     },
    { id: 1,  name: "Baseball Cap",level: 1, color: "#E74C3C"  },
    { id: 2,  name: "Cowboy",      level: 1, color: "#D4A04A"  },
    { id: 3,  name: "Party Hat",   level: 1, color: "#9B59B6"  },
    { id: 4,  name: "Snapback",    level: 1, color: "#3498DB"  },
    { id: 5,  name: "Beanie",      level: 1, color: "#8E44AD"  },
    { id: 6,  name: "Viking",      level: 2, color: "#8B6914"  },
    { id: 7,  name: "Chef",        level: 2, color: "#ECF0F1"  },
    { id: 8,  name: "Crown",       level: 2, color: "#F1C40F"  },
    { id: 9,  name: "Pirate",      level: 2, color: "#2C3E50"  },
    { id: 10, name: "Headband",    level: 2, color: "#E74C3C"  },
    { id: 11, name: "Fedora",      level: 3, color: "#7F8C8D"  },
    { id: 12, name: "Top Hat",     level: 3, color: "#2C3E50"  },
    { id: 13, name: "Wizard",      level: 3, color: "#8E44AD"  },
    { id: 14, name: "Halo",        level: 3, color: "#F1C40F"  },
    { id: 15, name: "Beret",       level: 3, color: "#E74C3C"  },
    { id: 16, name: "Astronaut",   level: 4, color: "#BDC3C7"  },
    { id: 17, name: "Samurai",     level: 4, color: "#C0392B"  },
    { id: 18, name: "Hard Hat",    level: 4, color: "#F39C12"  },
    { id: 19, name: "Mohawk",      level: 4, color: "#2ECC71"  },
    { id: 20, name: "Antlers",     level: 4, color: "#8B6914"  },
    { id: 21, name: "Pharaoh",     level: 5, color: "#F1C40F"  },
    { id: 22, name: "Alien",       level: 5, color: "#2ECC71"  },
    { id: 23, name: "Fire Crown",  level: 5, color: "#E74C3C"  },
    { id: 24, name: "Diamond",     level: 5, color: "#3498DB"  },
    { id: 25, name: "Rainbow",     level: 5, color: "#9B59B6"  },
  ],
  shirts: [
    { id: 0,  name: "Plain Tee",   level: 1, color: "#ECF0F1" },
    { id: 1,  name: "Red Stripe",  level: 1, color: "#E74C3C" },
    { id: 2,  name: "Blue Lines",  level: 1, color: "#3498DB" },
    { id: 3,  name: "Green Logo",  level: 1, color: "#2ECC71" },
    { id: 4,  name: "Teal V-Neck", level: 1, color: "#1ABC9C" },
    { id: 5,  name: "Gold Split",  level: 1, color: "#F39C12" },
    { id: 6,  name: "Hoodie",      level: 2, color: "#7F8C8D" },
    { id: 7,  name: "Jersey",      level: 2, color: "#E74C3C" },
    { id: 8,  name: "Polo",        level: 2, color: "#2980B9" },
    { id: 9,  name: "Tank Top",    level: 2, color: "#16A085" },
    { id: 10, name: "Hawaiian",    level: 2, color: "#F39C12" },
    { id: 11, name: "Blazer",      level: 3, color: "#2C3E50" },
    { id: 12, name: "Flannel",     level: 3, color: "#C0392B" },
    { id: 13, name: "Denim",       level: 3, color: "#3498DB" },
    { id: 14, name: "Tuxedo",      level: 3, color: "#1A1A2E" },
    { id: 15, name: "Crop Top",    level: 3, color: "#E91E63" },
    { id: 16, name: "Varsity",     level: 4, color: "#8E44AD" },
    { id: 17, name: "Armor",       level: 4, color: "#7F8C8D" },
    { id: 18, name: "Lab Coat",    level: 4, color: "#ECF0F1" },
    { id: 19, name: "Camo",        level: 4, color: "#27AE60" },
    { id: 20, name: "Leather",     level: 4, color: "#2C3E50" },
    { id: 21, name: "Royalty",     level: 5, color: "#F1C40F" },
    { id: 22, name: "Cosmic",      level: 5, color: "#9B59B6" },
    { id: 23, name: "Dragon",      level: 5, color: "#E74C3C" },
    { id: 24, name: "Hologram",    level: 5, color: "#1ABC9C" },
    { id: 25, name: "Legendary",   level: 5, color: "#F39C12" },
  ],
  pants: [
    { id: 0,  name: "Gray Sweats", level: 1, color: "#BDC3C7" },
    { id: 1,  name: "Black Jeans", level: 1, color: "#2C3E50" },
    { id: 2,  name: "Blue Denim",  level: 1, color: "#3498DB" },
    { id: 3,  name: "Purple",      level: 1, color: "#8E44AD" },
    { id: 4,  name: "Cargo",       level: 1, color: "#D35400" },
    { id: 5,  name: "Teal Chinos", level: 1, color: "#16A085" },
    { id: 6,  name: "Joggers",     level: 2, color: "#2C3E50" },
    { id: 7,  name: "Khakis",      level: 2, color: "#D4A04A" },
    { id: 8,  name: "Shorts",      level: 2, color: "#3498DB" },
    { id: 9,  name: "Plaid",       level: 2, color: "#E74C3C" },
    { id: 10, name: "Army Green",  level: 2, color: "#27AE60" },
    { id: 11, name: "Suit Pants",  level: 3, color: "#2C3E50" },
    { id: 12, name: "Corduroy",    level: 3, color: "#8B6914" },
    { id: 13, name: "Leather",     level: 3, color: "#1A1A2E" },
    { id: 14, name: "Ripped",      level: 3, color: "#3498DB" },
    { id: 15, name: "White",       level: 3, color: "#ECF0F1" },
    { id: 16, name: "Neon",        level: 4, color: "#2ECC71" },
    { id: 17, name: "Baggy",       level: 4, color: "#9B59B6" },
    { id: 18, name: "Pinstripe",   level: 4, color: "#2C3E50" },
    { id: 19, name: "Tactical",    level: 4, color: "#7F8C8D" },
    { id: 20, name: "Armored",     level: 4, color: "#C0392B" },
    { id: 21, name: "Royal",       level: 5, color: "#F1C40F" },
    { id: 22, name: "Cosmic",      level: 5, color: "#9B59B6" },
    { id: 23, name: "Lava",        level: 5, color: "#E74C3C" },
    { id: 24, name: "Crystal",     level: 5, color: "#1ABC9C" },
    { id: 25, name: "Legendary",   level: 5, color: "#F39C12" },
  ],
  shoes: [
    { id: 0,  name: "Gray Kicks",     level: 1, color: "#95A5A6" },
    { id: 1,  name: "Red Sneakers",   level: 1, color: "#E74C3C" },
    { id: 2,  name: "Dress Shoes",    level: 1, color: "#2C3E50" },
    { id: 3,  name: "Purple Hightops",level: 1, color: "#9B59B6" },
    { id: 4,  name: "Blue Runners",   level: 1, color: "#3498DB" },
    { id: 5,  name: "Gold Sneaks",    level: 1, color: "#F1C40F" },
    { id: 6,  name: "Boots",          level: 2, color: "#8B6914" },
    { id: 7,  name: "Sandals",        level: 2, color: "#D4A04A" },
    { id: 8,  name: "Loafers",        level: 2, color: "#C0392B" },
    { id: 9,  name: "Slippers",       level: 2, color: "#E91E63" },
    { id: 10, name: "White Kicks",    level: 2, color: "#ECF0F1" },
    { id: 11, name: "Oxfords",        level: 3, color: "#2C3E50" },
    { id: 12, name: "Heels",          level: 3, color: "#E74C3C" },
    { id: 13, name: "Platforms",      level: 3, color: "#9B59B6" },
    { id: 14, name: "Cowboy",         level: 3, color: "#8B6914" },
    { id: 15, name: "Retro",          level: 3, color: "#3498DB" },
    { id: 16, name: "Neon",           level: 4, color: "#2ECC71" },
    { id: 17, name: "Steel Toes",     level: 4, color: "#7F8C8D" },
    { id: 18, name: "Moon Boots",     level: 4, color: "#BDC3C7" },
    { id: 19, name: "Jet Shoes",      level: 4, color: "#E74C3C" },
    { id: 20, name: "Cleats",         level: 4, color: "#2C3E50" },
    { id: 21, name: "Royal",          level: 5, color: "#F1C40F" },
    { id: 22, name: "Hoverboard",     level: 5, color: "#9B59B6" },
    { id: 23, name: "Flame",          level: 5, color: "#E74C3C" },
    { id: 24, name: "Crystal",        level: 5, color: "#1ABC9C" },
    { id: 25, name: "Legendary",      level: 5, color: "#F39C12" },
  ],
  watches: [
    { id: 0,  name: "None",          level: 1, color: "#ccc"    },
    { id: 1,  name: "Classic",       level: 1, color: "#8B6914" },
    { id: 2,  name: "Sport",         level: 1, color: "#E74C3C" },
    { id: 3,  name: "Smartwatch",    level: 1, color: "#2C3E50" },
    { id: 4,  name: "Gold Watch",    level: 1, color: "#F1C40F" },
    { id: 5,  name: "Neon Digital",  level: 1, color: "#2ECC71" },
    { id: 6,  name: "Silver",        level: 2, color: "#BDC3C7" },
    { id: 7,  name: "Chronograph",   level: 2, color: "#2C3E50" },
    { id: 8,  name: "Rose Gold",     level: 2, color: "#E8B4B8" },
    { id: 9,  name: "Diver",         level: 2, color: "#1A5276"  },
    { id: 10, name: "Pilot",         level: 2, color: "#1C2833" },
    { id: 11, name: "Skeleton",      level: 3, color: "#7F8C8D" },
    { id: 12, name: "Tourbillon",    level: 3, color: "#D4AC0D" },
    { id: 13, name: "Camo Band",     level: 3, color: "#27AE60" },
    { id: 14, name: "Carbon Fiber",  level: 3, color: "#2C3E50" },
    { id: 15, name: "Tiffany",       level: 3, color: "#0ABAB5" },
    { id: 16, name: "Titanium",      level: 4, color: "#808B96" },
    { id: 17, name: "Sapphire",      level: 4, color: "#1A5276" },
    { id: 18, name: "Platinum",      level: 4, color: "#D7DBDD" },
    { id: 19, name: "Obsidian",      level: 4, color: "#1C2833" },
    { id: 20, name: "Meteorite",     level: 4, color: "#626567" },
    { id: 21, name: "Royal Oak",     level: 5, color: "#F1C40F" },
    { id: 22, name: "Cosmic",        level: 5, color: "#9B59B6" },
    { id: 23, name: "Flame",         level: 5, color: "#E74C3C" },
    { id: 24, name: "Diamond Set",   level: 5, color: "#AED6F1" },
    { id: 25, name: "Legendary",     level: 5, color: "#F39C12" },
  ],
};

// ── Make functions (tint extended items) ──────────────────────────────────────
function makeHat(item) {
  const funcs = [hatNone, hat1, hat2, hat3, hat4, hat5];
  if (item.id < funcs.length) return funcs[item.id];
  const base = (item.id % 5) + 1;
  return () => { const inner = funcs[base](); return <g style={{filter:`hue-rotate(${item.id*28}deg)`}}>{inner}</g>; };
}
function makeShirt(item) {
  const funcs = [shirtNone, shirt1, shirt2, shirt3, shirt4, shirt5];
  if (item.id < funcs.length) return funcs[item.id];
  const base = (item.id % 5) + 1;
  return () => { const inner = funcs[base](); return <g style={{filter:`hue-rotate(${item.id*25}deg)`}}>{inner}</g>; };
}
function makePants(item) {
  const funcs = [pantsNone, pants1, pants2, pants3, pants4, pants5];
  if (item.id < funcs.length) return funcs[item.id];
  const base = (item.id % 5) + 1;
  return () => { const inner = funcs[base](); return <g style={{filter:`hue-rotate(${item.id*25}deg)`}}>{inner}</g>; };
}
function makeShoes(item) {
  const funcs = [shoesNone, shoes1, shoes2, shoes3, shoes4, shoes5];
  if (item.id < funcs.length) return funcs[item.id];
  const base = (item.id % 5) + 1;
  return () => { const inner = funcs[base](); return <g style={{filter:`hue-rotate(${item.id*25}deg)`}}>{inner}</g>; };
}
function makeWatch(item) {
  const funcs = [watchNone, watch1, watch2, watch3, watch4, watch5];
  if (item.id < funcs.length) return funcs[item.id];
  const base = (item.id % 5) + 1;
  return () => { const inner = funcs[base](); return <g style={{filter:`hue-rotate(${item.id*30}deg)`}}>{inner}</g>; };
}

// ── Main render ───────────────────────────────────────────────────────────────
export default function AvatarCharacter({ hat = 0, shirt = 0, pants = 0, shoes = 0, watch = 0, size = 120, className = "", waveKey = 0 }) {
  const HatFn   = makeHat(AVATAR_ITEMS.hats[hat]     || AVATAR_ITEMS.hats[0]);
  const ShirtFn = makeShirt(AVATAR_ITEMS.shirts[shirt] || AVATAR_ITEMS.shirts[0]);
  const PantsFn = makePants(AVATAR_ITEMS.pants[pants] || AVATAR_ITEMS.pants[0]);
  const ShoesFn = makeShoes(AVATAR_ITEMS.shoes[shoes] || AVATAR_ITEMS.shoes[0]);
  const WatchFn = makeWatch(AVATAR_ITEMS.watches[watch] || AVATAR_ITEMS.watches[0]);

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg">
      <ShoesFn />
      <PantsFn />
      <BaseBody waveKey={waveKey} />
      <ShirtFn />
      <WatchFn />
      <HatFn />
    </svg>
  );
}
