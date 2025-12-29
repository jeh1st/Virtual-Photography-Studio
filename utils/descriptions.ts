export const CAMERA_DESCRIPTIONS: Record<string, string> = {
    // Cameras
    "Sony Alpha 1": "High-res 50MP, 8K video. Flagship mirrorless for ultimate detail.",
    "Canon EOS R3": "High speed sports/action camera. Stacked sensor.",
    "Nikon Z9": "Professional flagship. 8K video, no mechanical shutter.",
    "Canon EOS R5 II": "45MP workhorse. Excellent color science and skin tones.",
    "Leica M6": "Classic 35mm rangefinder. Iconic street photography aesthetic.",
    "Hasselblad 500C/M": "Medium format 6x6 film legend. Square aspect ratio, incredible depth.",
    "Arri Alexa 35": "Industry standard cinema camera. Unmatched dynamic range and highlight rolloff.",
    "Leica M3": "The legendary rangefinder. 0.91x magnification viewfinder.",
    "Rolleiflex 2.8F": "Twin lens reflex masterpiece. Waist-level shooting style.",
    "Pentax 67": "The 'Texas Leica'. Massive 6x7 negative SLR. Tank-like build.",
    "Deardorff 8x10": "Large format field camera. Ultimate resolution and movements.",

    // Lenses
    "85mm prime": "Classic portrait focal length. Flattering compression, nice bokeh.",
    "35mm prime": "Environmental portrait / Street. Shows context.",
    "50mm prime": "Nifty fifty. Very natural field of view close to human eye.",
    "24mm prime": "Wide angle. Dynamic perspective, slight distortion on edges.",
    "70-200mm zoom": "Versatile telephoto. Great for compression and isolation.",
    "40mm anamorphic": "Cinematic widescreen look. Oval bokeh, horizontal flares.",
    "105mm prime": "Macro specialist. Perfect for beauty close-ups.",
    "28mm prime": "Standard street focal length. Wide but manageable.",
    "16-35mm wide": "Ultra-wide zoom. Great for landscapes and architecture.",
    "24-70mm zoom": "Standard zoom workhorse. Versatile.",

    // Film Stocks
    "Kodak Portra 400": "The gold standard for color negative film. Fine grain, amazing skin tones.",
    "Kodak Portra 160": "Finer grain than 400. Needs good light. Very natural.",
    "Kodak Portra 800": "High speed color negative. Good for low light, slight grain.",
    "Kodak Gold 200": "Warm, nostalgic consumer film. Great for sunny days.",
    "Fujifilm Pro 400H": "Cooler tones, soft greens and cyans. Wedding favorite.",
    "Kodak Tri-X 400": "Classic B&W film. Gritty, high contrast, documentary feel.",
    "Ilford HP5": "Versatile B&W. Fine grain, good contrast. Journalism standard.",
    "Cinestill 800T": "Tungsten balanced film. Famous for 'halations' around bright lights.",
    "Kodachrome 64": "Legendary saturated colors. High contrast, archival look.",
    "Wet Plate Collodion": "19th century process. Chemical imperfections, unique spectral response.",
    "Polaroid 600": "Instant film look. Soft focus, retro colors, white border feel.",

    // Lighting
    "Rule of Thirds": "Subject placed at intersection points. Dynamic and balanced.",
    "Centered": "Symmetrical, formal, focused. Wes Anderson style.",
    "Softbox": "Soft, wrapping light. Reduces harsh shadows. Smooth transition.",
    "Hard Strobe": "High contrast, defined edges. Dramatic fashion look.",
    "Natural Light": "Available sunlight. Varies by time of day.",
    "Golden Hour": "Warm, low angle sunlight. Flattering and romantic."
};

export const getDescription = (key: string): string | undefined => {
    return CAMERA_DESCRIPTIONS[key];
};
