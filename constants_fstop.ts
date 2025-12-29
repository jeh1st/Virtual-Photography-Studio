
// Extracted from f-stop.vercel.app HTML source provided by User

export const COMPOSITIONS = [
    "None",
    "Rule of Thirds", "Centered", "Leading Lines",
    "Centered / Floating Head",
    "Centered & Symmetrical",
    "Wide Tableau",
    "Dynamic/Snapshot",
    "Environmental Portrait / Tableau",
    "Voyeuristic/Cropped",
    "High Angle (Bird's Eye)", "Low Angle Hero", "Top-down Flat Lay",
    "Over-the-shoulder", "Wide Establishing", "Tight Close-up",
    "Side Profile",
    "Environmental Portrait",
    "Candid Snapshot", "Asymmetric Framing", "Peek-through",
    "Symmetrical Arch", "Layered Depth", "Layered Abstraction", "Geometry & layered framing"
];

export const CAMERAS = [
    "None",
    "Sony Alpha 1", "Canon EOS R3", "Nikon Z9", "Sony A7 IV", "Sony A7R V", "Canon EOS R5 II", "Nikon Z5 II", "Fujifilm X-T5", "Fujifilm GFX 100S II", "Hasselblad X2D 100C", "Phase One XF IQ4", "Leica SL3", "iPhone 16 Pro", "Hasselblad H6D", "Hasselblad H6D-100c", "Nikon D850", "Canon EOS 5D Mark IV", "DJI Mavic 3",
    "Arri Alexa 35", "Arri Alexa LF", "Red V-Raptor", "Arri Alexa 65",
    "Leica M3", "Leica M3 (35mm rangefinder, black paint)", "Leica M6", "Nikon F3", "Nikon F5", "Nikon F6", "Canon EOS 1v", "Contax T2", "Ricoh GR21", "Canon Rangefinder",
    "Rolleiflex 2.8F", "Hasselblad 500C/M", "Hasselblad 555ELD", "Pentax 67", "Pentax 67II", "Pentax 645", "Mamiya RZ67",
    "Speed Graphic 4x5", "Deardorff 8x10", "Large Format 4x5", "Large Format 8x10", "Voigtländer Bergheil", "Graflex Series D",
    "Arriflex 35 BL", "Arricam ST", "Panavision PSR", "Mitchell BNC", "Technicolor 3-Strip Camera", "IMAX 15/65",
    "Polaroid SX-70", "Sony VX1000", "Contact Print"
];

export const LENSES_BY_GENRE = {
    portrait: [
        "35mm env", "50mm prime", "85mm prime", "105mm prime", "135mm prime", "70-200mm zoom",
        "30mm Zeiss Distagon T* Fisheye",
        "SMC Pentax 55mm f/4",
        "SMC Pentax 45mm f/4",
        "35mm prime", "80mm prime", "116mm prime", "120mm macro", "150mm prime", "300mm prime", "360mm prime",
        "50mm (35mm Equiv.)"
    ],
    fashion: [
        "SMC Pentax 55mm f/4", "35mm prime", "50mm prime", "85mm prime", "24-70mm zoom", "70-200mm zoom", "Ring Flash Setup"
    ],
    street: [
        "24mm prime", "28mm prime", "35mm prime", "50mm prime", "Leitz Summicron 50mm f/2 (collapsible)", "24-70mm zoom",
        "38mm prime", "45-85mm zoom", "80mm prime", "90mm tele", "90mm Elmar f/4", "105mm prime", "127mm Ektar"
    ],
    landscape: [
        "14-24mm wide", "16-35mm wide", "24mm prime", "24-70mm zoom", "70-200mm tele",
        "50mm prime", "150mm prime", "300mm prime", "300mm prime (8x10 eq)"
    ],
    product: [
        "50mm prime", "85mm prime", "60mm macro", "100mm macro", "90mm tilt-shift",
        "Hasselblad HC 120mm Macro II",
        "80mm prime", "90mm prime", "120mm macro", "150mm prime", "210mm prime"
    ],
    cinematic: [
        "24mm prime", "35mm prime", "50mm prime", "85mm prime", "40mm anamorphic", "50mm anamorphic", "75mm anamorphic",
        "14mm prime", "18mm prime", "32mm prime", "45mm wide", "55mm wide", "35mm anamorphic", "65mm anamorphic", "80mm prime", "300mm tele", "500mm tele"
    ],
    night: [
        "24mm prime", "35mm prime", "50mm prime", "85mm prime",
        "35mm anamorphic", "105mm prime", "127mm Ektar"
    ],
    sports: [
        "70-200mm zoom", "100-400mm tele", "300mm prime", "400mm prime",
        "24-70mm zoom", "80mm prime", "200mm prime", "300mm tele", "600mm prime"
    ],
    wildlife: [
        "100-400mm tele", "200-600mm super-tele", "400mm prime", "600mm prime",
        "16mm fisheye", "16-35mm wide", "24-70mm zoom", "100mm macro", "105mm prime", "105mm macro"
    ],
    architecture: [
        "14-24mm wide", "16-35mm wide", "24mm tilt-shift", "17mm tilt-shift",
        "24-70mm zoom", "28mm wide", "45mm tilt-shift", "50mm wide", "90mm wide", "90mm wide (8x10 eq)", "150mm prime"
    ],
    experimental: [
        "8mm fisheye", "50mm prime", "45mm tilt-shift", "None"
    ],
    "abstract street": [
        "90mm Elmar f/4",
        "50mm prime",
        "35mm prime",
        "90mm tele"
    ]
};

export const LENSES = Array.from(new Set(Object.values(LENSES_BY_GENRE).flat())).sort();

export const APERTURES = ["None", "f/0.7", "f/1.2", "f/1.4", "f/1.8", "f/2", "f/2.4", "f/2.8", "f/4", "f/4.5", "f/5.6", "f/8", "f/11", "f/16", "f/22", "f/32", "f/45", "f/64"];
export const SHUTTERS = ["None", "Bulb", "30s", "15s", "8s", "4s", "2s", "1s", "1/2s", "1/4s", "1/8s", "1/15s", "1/30s", "1/48s", "1/60s", "1/125s", "1/160s", "1/200s", "1/250s", "1/320s", "1/500s", "1/1000s", "1/1250s", "1/2000s", "1/4000s"];
export const ISOS = ["None", "1", "3", "5", "10", "25", "50", "64", "100", "200", "400", "500", "800", "1600", "3200", "6400"];

export const LIGHTINGS = [
    "None",
    "Natural Light", "Direct Sunlight", "Soft Overcast", "Golden Hour",
    "Natural Window Light / Diffused HMI",
    "Studio Softbox", "High Key White Cyc", "Studio Hard Light",
    "Large Octabank or Photek Softlighter",
    "Gradient Scrims / Backlit",
    "Ring Light", "Direct Ring Flash / Hard Strobe",
    "Hard Strobe", "Hard Strobe (Zoom Reflector)",
    "Direct Flash", "Neon Practical", "Candlelight",
    "Stadium Lights", "Underwater Ambient", "Available Light", "Available light (natural)"
];

export const LENS_CHARS = [
    "None",
    "Clinical Sharp", "Vintage Softness", "Dreamy Bloom", "Painterly & Soft",
    "Gentle Halation", "High Contrast & Saturated",
    "Clinical & Distortion-Free",
    "High Fidelity / Painterly Softness",
    "Sharp & High Contrast",
    "Chromatic Aberration", "Distorted & Sharp",
    "Heavy Vignette", "Swirly Bokeh", "Petzval Curvature",
    "Telephoto Compression",
    "Vintage Low Contrast",
    "High micro-contrast, gentle flare/halation, subtle vignetting"
];

export const FILMS = [
    "None",
    "Kodak Portra 400", "Kodak Portra 160", "Kodak Portra 800", "Fuji Pro 400H", "Kodak Gold 200", "Kodak Gold 400",
    "Kodak Portra 400NC (Overexposed)",
    "Kodak Vision3 500T (5219)", "Kodak Vision3 250D (5207)", "Kodak Vision3 200T (5213)", "Cinestill 800T",
    "Kodak 5247 100T (70s/80s)", "Kodak 5293 200T", "Technicolor Three-Strip",
    "Eastman Double-X 5222", "Kodak Tri-X 400", "Kodak Tri-X 400 (35mm B&W)", "Kodak Tri-X 400 (Pushed)", "Kodak Tri-X B&W", "Ilford HP5", "Ilford HP5 Plus",
    "Kodachrome 64", "Fujichrome Velvia", "Fujichrome Velvia 50",
    "Kodak Ektachrome", "Kodak Ektachrome E100",
    "Wet Plate Collodion", "Nitrate Film", "Autochrome Plate", "Kodak Aerochrome (IR)", "Polaroid 600", "Polaroid Type 55",
    "Digital Sensor", "16-bit Digital Raw", "Medium Format Digital", "Digital Video Tape (DV)", "Expired Kodachrome", "Digital", "Expired Kodachrome"
];

export const WBS = ["None", "Daylight Balanced", "Warm Tungsten", "Cool Shade", "Mixed Lighting", "Monochrome", "B&W (N/A)", "Flash Balanced", "5500K (Flash)", "Warm/Magenta Shift"];
export const GRAINS = ["None", "Clean/No Grain", "Zero Grain", "Fine/Low Grain", "Subtle Grain", "Medium Texture", "Classic pronounced grain", "Heavy Grit", "Heavy Silver Halide", "Fine Color Grain", "Organic Medium", "Very Fine", "Fine Dye Cloud"];

export const PRODUCT_SUBGENRES = [
    "None",
    "Ecommerce Packshot", "Luxury Jewelry Macro", "Watch Hero",
    "Cosmetics / Liquids",
    "Cosmetics Splash", "Sneaker Floating", "Tech Gadget Hero",
    "Beverage Condensation", "Food Editorial", "Tabletop Styled"
];

export const LIGHTING_SETUPS = [
    { label: "Softbox Key", phrase: "45 degree softbox key, white bounce fill" },
    { label: "Butterfly", phrase: "butterfly lighting, single light source placed high above lens, distinct shadow under nose" },
    { label: "Painterly Octa", phrase: "large octabank source, feathered edge, painterly falloff" },
    { label: "Octabank/Softlighter", phrase: "Large feathered light source (Octabank/Softlighter)" },
    { label: "Edge Falloff", phrase: "Subject placed at edge of light falloff" },
    { label: "Negative Contrast", phrase: "Negative fill for contrast" },
    { label: "Negative Fill", phrase: "negative fill, black flags, light subtraction" },
    { label: "Dual Softbox", phrase: "dual softbox symmetric lighting" },
    { label: "Top Scrim", phrase: "top down scrim, negative fill" },
    { label: "Rim Light", phrase: "strip rim light, edge definition" },
    { label: "Clamshell", phrase: "clamshell beauty lighting" },
    { label: "White Cyc", phrase: "high key white cyc, even wraparound light" },
    { label: "Cross Polarized", phrase: "cross-polarized lighting to control reflections" },
    { label: "Gradient Sweep", phrase: "gradient sweep background, tabletop product lighting" },
    { label: "Hard Flash", phrase: "hard direct flash, fast falloff shadows" },
    { label: "Window Side", phrase: "window side light, soft falloff" },
    { label: "Underwater", phrase: "underwater strobe fill, particle sparkle" },
    { label: "Backlit", phrase: "backlit translucent diffusion, soft halos" },
    { label: "Atmospheric", phrase: "atmospheric smoke and light shafts" },
    { label: "Neon Spill", phrase: "neon sign spill" },
    { label: "Stadium", phrase: "stadium top light, crisp action freeze" },
    { label: "Ring Light", phrase: "ring light fill" },
    { label: "Practical", phrase: "practical lighting" },
    { label: "High Contrast", phrase: "high contrast rim lighting" }
];
