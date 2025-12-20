
import { 
    Pose, CameraPerspective, PhotographicStyle, BodyType, AspectRatio, Gender, 
    HairLength, HairStyle, HairPhysics, GenerationMode, 
    LandscapeType, TimeOfDay, Weather, Season, ArchitectureStyle, 
    ArchitectureShotType, MaleBodyType, LightingPreset, CameraType, FilmStock,
    LightColorTemperature, ConsistencyMode, NodeType
} from './types';

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// --- 0. TYPES & INTERFACES ---

/**
 * Interface for visual pose selection used in PoseLibrary
 */
export interface PoseInfo {
    id: string;
    label: string;
    paths: string[];
}

// --- 1. CORE LISTS (Restored from Reference) ---

export const CAMERA_MODELS = [
  "None",
  // Modern Mirrorless / Digital
  "Sony Alpha 1","Canon EOS R3","Nikon Z9","Sony A7 IV","Sony A7R V","Canon EOS R5 II","Nikon Z5 II","Fujifilm X-T5","Fujifilm GFX 100S II","Hasselblad X2D 100C","Phase One XF IQ4","Leica SL3","iPhone 16 Pro","Hasselblad H6D","Nikon D850","Canon EOS 5D Mark IV","DJI Mavic 3",
  // Cinema Digital
  "Arri Alexa 35","Arri Alexa LF","Red V-Raptor","Arri Alexa 65",
  // 35mm Film Rangefinders & SLRs
  "Leica M3", "Leica M6", "Nikon F3", "Nikon F5", "Nikon F6", "Canon EOS 1v", "Contax T2", "Ricoh GR21", "Canon Rangefinder",
  // Medium Format Film
  "Rolleiflex 2.8F", "Hasselblad 500C/M", "Pentax 67", "Pentax 645", "Mamiya RZ67",
  // Large Format & Press
  "Speed Graphic 4x5", "Deardorff 8x10", "Large Format 4x5", "Large Format 8x10", "Voigtländer Bergheil", "Graflex Series D",
  // Cinema Film
  "Arriflex 35 BL", "Arricam ST", "Panavision PSR", "Mitchell BNC", "Technicolor 3-Strip Camera", "IMAX 15/65",
  // Vintage / Specialty
  "Polaroid SX-70", "Sony VX1000", "Contact Print"
];

export const LENSES_BY_GENRE: Record<string, string[]> = {
  portrait: [
    "35mm prime", "50mm prime", "85mm prime", "105mm prime", "135mm prime", "70-200mm zoom",
    "80mm prime", "116mm prime", "120mm macro", "150mm prime"
  ],
  boudoir: [
    "35mm prime", "50mm prime", "85mm prime", "24-70mm zoom"
  ],
  street: [
    "24mm prime", "28mm prime", "35mm prime", "50mm prime", "24-70mm zoom"
  ],
  landscape: [
    "14-24mm wide", "16-35mm wide", "24mm prime", "24-70mm zoom", "70-200mm tele"
  ],
  product: [
    "50mm prime", "85mm prime", "60mm macro", "100mm macro", "90mm tilt-shift"
  ],
  cinematic: [
    "24mm prime", "35mm prime", "50mm prime", "85mm prime", "40mm anamorphic", "50mm anamorphic", "75mm anamorphic"
  ],
  architecture: [
    "14-24mm wide", "16-35mm wide", "24mm tilt-shift", "17mm tilt-shift"
  ]
};

export const ALL_LENS_OPTIONS = Array.from(new Set(Object.values(LENSES_BY_GENRE).flat())).sort();

export const APERTURE_OPTIONS_EXTENDED = ["None","f/0.7","f/1.2","f/1.4","f/1.8","f/2","f/2.8","f/4","f/4.5","f/5.6","f/8","f/11","f/16","f/22","f/32","f/45","f/64"];
export const SHUTTER_SPEED_OPTIONS_EXTENDED = ["None","Bulb","30s","15s","8s","4s","2s","1s","1/2s","1/4s","1/8s","1/15s","1/30s","1/48s","1/60s","1/125s","1/160s","1/200s","1/250s","1/320s","1/500s","1/1000s","1/1250s","1/2000s","1/4000s"];
export const ISO_OPTIONS_EXTENDED = ["None","1","5","10","25","50","100","200","400","800","1600","3200","6400"];

export const FILM_STOCK_VALUES = [
  "None",
  "Kodak Portra 400","Kodak Portra 160","Kodak Portra 800", "Fuji Pro 400H", "Kodak Gold 200", "Kodak Gold 400",
  "Kodak Vision3 500T (5219)", "Kodak Vision3 250D (5207)", "Cinestill 800T",
  "Kodak Tri-X 400", "Ilford HP5", "Ilford Delta 3200",
  "Kodachrome 64", "Fujichrome Velvia", "Kodak Ektachrome",
  "Wet Plate Collodion", "Polaroid 600", "Digital Sensor"
];

export const LIGHTING_STYLES = [
    "None", "Natural Light", "Soft Overcast", "Golden Hour", "Studio Softbox", "High Key White Cyc", "Hard Strobe", "Direct Flash", "Neon Practical", "Candlelight", "Moody Chiaroscuro"
];

export const GOBO_OPTIONS = [
    "None",
    "Venetian Blinds",
    "Intricate Lace",
    "Palm Fronds",
    "Window Pane Grid",
    "Geometric Stripes",
    "Tree Branches",
    "Prism Shards",
    "Abstract Texture"
];

export const LENS_CHARACTERISTICS = ["None","Clinical Sharp","Vintage Softness","Dreamy Bloom","Gentle Halation","Heavy Vignette", "Swirly Bokeh", "Petzval Curvature"];
export const WHITE_BALANCE_OPTIONS = ["None","Daylight Balanced","Warm Tungsten","Cool Shade","Mixed Lighting"];
export const GRAIN_OPTIONS = ["None","Clean/No Grain","Subtle Grain","Medium Texture","Heavy Grit"];

// --- 2. SUBJECT & POSE ---

export const POSE_OPTIONS = [
    { value: 'Standing', label: 'Standing (Neutral)' },
    { value: 'HandsInHair', label: 'Standing, Hands in Hair' },
    { value: 'OverTheShoulder', label: 'Over the Shoulder' },
    { value: 'LeaningAgainstWall', label: 'Leaning Against Wall' },
    { value: 'Sitting', label: 'Sitting (Chair)' },
    { value: 'SittingFloor', label: 'Sitting on Floor' },
    { value: 'KneelingOnBed', label: 'Kneeling on Bed' },
    { value: 'SeatedStool', label: 'Seated on Stool' },
    { value: 'Reclining', label: 'Reclining (Chaise)' },
    { value: 'LayingOnSide', label: 'Laying on Side' },
    { value: 'Supine', label: 'Lying on Back (Supine)' },
    { value: 'Prone', label: 'Lying on Stomach (Prone)' },
    { value: 'SilhouetteProfile', label: 'Silhouette Profile' }
];

export const BODY_TYPE_OPTIONS = [
    { value: BodyType.FullFigured, label: 'Full Figured - Curvy & Voluptuous' },
    { value: BodyType.Sculptural, label: 'Sculptural - Highly defined muscle' },
    { value: BodyType.Voluptuous, label: 'Voluptuous - Full, soft curvy figure' },
    { value: BodyType.Curvy, label: 'Curvy - Accentuated hourglass' },
    { value: BodyType.Athletic, label: 'Athletic - Toned, active physique' },
    { value: BodyType.Slender, label: 'Slender - Thin, elegant' },
    { value: BodyType.Average, label: 'Average - Natural proportions' },
    { value: BodyType.Petite, label: 'Petite - Small frame' }
];

export const MALE_BODY_TYPE_OPTIONS = [
    { value: MaleBodyType.VTaper, label: 'V-Taper - Broad shoulders' },
    { value: MaleBodyType.Muscular, label: 'Muscular - Bulky' },
    { value: MaleBodyType.Lean, label: 'Lean - Low body fat' },
    { value: MaleBodyType.DadBod, label: 'Dad Bod' },
    { value: MaleBodyType.Slim, label: 'Slim' }
];

export const GENDER_OPTIONS = [
    { value: Gender.Woman, label: 'Woman' },
    { value: Gender.Man, label: 'Man' },
    { value: Gender.NonBinary, label: 'Non-Binary' }
];

export const HAIR_LENGTH_OPTIONS = Object.values(HairLength);
export const HAIR_STYLE_OPTIONS = Object.values(HairStyle);
export const HAIR_COLOR_OPTIONS = ['Black', 'Brown', 'Blonde', 'Platinum Blonde', 'Red', 'Auburn', 'Grey', 'White', 'Dyed (Pink)', 'Dyed (Blue)', 'Ombre'];

// --- 3. ENVIRONMENT ---

export const LANDSCAPE_TYPE_OPTIONS = Object.values(LandscapeType);
export const WEATHER_OPTIONS = Object.values(Weather);
export const SEASON_OPTIONS = Object.values(Season);
export const ARCHITECTURE_STYLE_OPTIONS = Object.values(ArchitectureStyle);
export const EXTERIOR_SHOT_OPTIONS = ['Exterior Facade', 'Wide Establishing Shot', 'Low Angle Hero'];
export const INTERIOR_SHOT_OPTIONS = ['Interior Room', 'Wide Angle Interior', 'Boudoir Setting'];
export const ARCHITECTURE_BUILDING_OPTIONS = ['House', 'Apartment', 'Hotel Room', 'Studio', 'Villa'];

// --- 4. PRESET LIBRARY (The Massive Expansion) ---

export const PRESET_LIBRARY = [
  { id:"none", title:"None", desc:"Manual mode", category:"Core", data:{} },
  
  // BOUDOIR PRESETS (Section 1)
  { id:"boudoir-soft-morning", title:"Soft Morning", category:"Boudoir", desc:"Bright, airy, white sheets.", data:{ genre:"boudoir", camera:"Canon EOS R5 II", lens:"50mm prime", focal:50, aperture:"f/2.8", shutter:"1/125s", iso:"100", lighting:"Natural Light", composition:"Rule of Thirds", lightingSetups:["natural window light", "light diffused through sheer curtains"], vibe:"Bright airy boudoir, white bedsheets, morning light, soft contrast, dreamy atmosphere.", lensChar:"Dreamy Bloom", film:"Kodak Portra 400", wb:"Daylight Balanced", grain:"Clean/No Grain" } },
  { id:"boudoir-dark-romance", title:"Dark Romance", category:"Boudoir", desc:"Moody, shadows, lace.", data:{ genre:"boudoir", camera:"Sony Alpha 1", lens:"85mm prime", focal:85, aperture:"f/1.8", shutter:"1/60s", iso:"800", lighting:"Moody Chiaroscuro", composition:"Tight Close-up", lightingSetups:["shadowy moody lighting", "rim light edge definition"], vibe:"Dark romantic boudoir, black lace, deep shadows, mystery, sensual mood.", lensChar:"Vintage Softness", film:"Kodak Tri-X 400", wb:"Warm Tungsten", grain:"Medium Texture" } },
  { id:"boudoir-vintage-glam", title:"Vintage Glamour", category:"Boudoir", desc:"Pin-up style, warm.", data:{ genre:"boudoir", camera:"Hasselblad 500C/M", lens:"80mm prime", focal:80, aperture:"f/4", shutter:"1/125s", iso:"100", lighting:"Studio Softbox", composition:"Centered", lightingSetups:["softbox key plus bounce"], vibe:"Vintage 1950s pin-up aesthetic, warm tones, soft skin, classic glamour.", lensChar:"Vintage Softness", film:"Kodak Gold 200", wb:"Warm Tungsten", grain:"Subtle Grain" } },
  { id:"boudoir-silhouette", title:"Silhouette Study", category:"Boudoir", desc:"Form focus, backlighting.", data:{ genre:"boudoir", camera:"Leica M6", lens:"35mm prime", focal:35, aperture:"f/8", shutter:"1/250s", iso:"400", lighting:"Natural Light", composition:"Leading Lines", lightingSetups:["window side light, soft falloff"], vibe:"Artistic silhouette against a bright window, focus on body form and curves, high contrast.", lensChar:"Clinical Sharp", film:"Ilford HP5", wb:"Daylight Balanced", grain:"Medium Texture" } },

  // STREET (Restored)
  { id:"leiter-street", title:"Saul Leiter", category:"Street", desc:"Reflections, layered color panes.", data:{ genre:"street", camera:"Leica M3", lens:"90mm tele", focal:90, aperture:"f/4", shutter:"1/60s", iso:"100", lighting:"Natural Light", composition:"Candid Snapshot", lightingSetups:["window side light, soft falloff"], vibe:"Saul Leiter style, shooting through windows and rain-specked glass, muted reds and ambers.", lensChar:"Vintage Softness", film:"Kodachrome 64", wb:"Daylight Balanced", grain:"Subtle Grain" } },
  { id:"maier-doc", title:"Vivian Maier", category:"Street", desc:"Observational candid, sharp moments.", data:{ genre:"street", camera:"Rolleiflex 2.8F", lens:"80mm prime", focal:80, aperture:"f/8", shutter:"1/250s", iso:"100", lighting:"Soft Overcast", composition:"Rule of Thirds", vibe:"Vivian Maier style, candid pedestrian life, clean geometry, mirror play.", lensChar:"Clinical Sharp", film:"Kodak Tri-X 400", wb:"Daylight Balanced", grain:"Medium Texture" } },
  { id:"moriyama-flash", title:"Daido Moriyama", category:"Street", desc:"High contrast grit.", data:{ genre:"street", camera:"Ricoh GR21", lens:"28mm prime", focal:28, aperture:"f/11", shutter:"1/60s", iso:"1600", lighting:"Direct Flash", composition:"Tight Close-up", vibe:"Aggressive close range flash, high contrast blacks, restless night energy.", lensChar:"Heavy Vignette", film:"Kodak Tri-X 400", wb:"Mixed Lighting", grain:"Heavy Grit" } },

  // PORTRAIT & FASHION (Restored)
  { id:"lindbergh-raw", title:"Peter Lindbergh", category:"Portrait & Fashion", desc:"Raw black and white realism.", data:{ genre:"portrait", camera:"Nikon F5", lens:"85mm prime", focal:85, aperture:"f/2.8", shutter:"1/250s", iso:"400", lighting:"Soft Overcast", composition:"Centered", vibe:"Peter Lindbergh style, raw emotive portrait realism, natural skin texture.", lensChar:"Vintage Softness", film:"Kodak Tri-X 400", wb:"Daylight Balanced", grain:"Medium Texture" } },
  { id:"avedon-highkey", title:"Richard Avedon", category:"Portrait & Fashion", desc:"White background, crisp gestures.", data:{ genre:"portrait", camera:"Deardorff 8x10", lens:"300mm prime", focal:300, aperture:"f/22", shutter:"1/60s", iso:"100", lighting:"High Key White Cyc", composition:"Centered", vibe:"High-key white cyc fashion portraits, sharp edges, movement.", lensChar:"Clinical Sharp", film:"Kodak Tri-X 400", wb:"Daylight Balanced", grain:"Clean/No Grain" } },
  { id:"leibovitz-celeb", title:"Annie Leibovitz", category:"Portrait & Fashion", desc:"Theatrical staged storytelling.", data:{ genre:"cinematic", camera:"Hasselblad 500C/M", lens:"80mm prime", focal:80, aperture:"f/5.6", shutter:"1/60s", iso:"400", lighting:"Studio Softbox", composition:"Centered", vibe:"Annie Leibovitz style, cinematic celebrity portraiture, staged storytelling.", lensChar:"Clinical Sharp", film:"Kodak Portra 400", wb:"Daylight Balanced", grain:"Subtle Grain" } },

  // CINEMATIC (Restored)
  { id:"deakins-cine", title:"Roger Deakins", category:"Cinematic", desc:"Naturalistic film precision.", data:{ genre:"cinematic", camera:"Arri Alexa 35", lens:"35mm prime", focal:35, aperture:"f/2.8", shutter:"1/48s", iso:"800", lighting:"Neon Practical", composition:"Leading Lines", vibe:"Roger Deakins style, grounded cinematic realism, motivated practical light.", lensChar:"Clinical Sharp", film:"Kodak Vision3 500T (5219)", wb:"Mixed Lighting", grain:"Subtle Grain" } },
  { id:"anderson-symmetry", title:"Wes Anderson", category:"Cinematic", desc:"Symmetrical, pastel, flat.", data:{ genre:"cinematic", camera:"Arricam ST", lens:"40mm anamorphic", focal:40, aperture:"f/5.6", shutter:"1/48s", iso:"200", lighting:"Soft Overcast", composition:"Centered", vibe:"Wes Anderson style, perfectly symmetrical composition, pastel color palette.", lensChar:"Clinical Sharp", film:"Kodak Vision3 250D (5207)", wb:"Daylight Balanced", grain:"Clean/No Grain" } },
  { id:"fraser-darkness", title:"Greig Fraser", category:"Cinematic", desc:"Modern dark epic.", data:{ genre:"cinematic", camera:"Arri Alexa LF", lens:"50mm anamorphic", focal:50, aperture:"f/2.8", shutter:"1/48s", iso:"1600", lighting:"Soft Overcast", composition:"Rule of Thirds", vibe:"Greig Fraser style (Dune/Batman), modern dark epic, textured shadows, haze.", lensChar:"Vintage Softness", film:"Kodak Vision3 500T (5219)", wb:"Daylight Balanced", grain:"Medium Texture" } },

  // ANALOG VAULT (Restored)
  { id:"wet-plate", title:"Wet Plate Collodion", category:"Analog Vault", desc:"1850s ghostly chemical imperfection.", data:{ genre:"portrait", camera:"Large Format 8x10", lens:"300mm prime", focal:300, aperture:"f/5.6", shutter:"4s", iso:"1", lighting:"Natural Light", composition:"Centered", vibe:"Wet plate collodion process (1850s), ghostly silver nitrate texture, antique sepia monochrome.", lensChar:"Vintage Softness", film:"Wet Plate Collodion", wb:"Cool Shade", grain:"Heavy Grit" } },
  { id:"infrared-aero", title:"Infrared Aerochrome", category:"Experimental", desc:"Surreal pink foliage.", data:{ genre:"landscape", camera:"Hasselblad 500C/M", lens:"50mm prime", focal:50, aperture:"f/8", shutter:"1/250s", iso:"400", lighting:"Natural Light", composition:"Wide Establishing", vibe:"Kodak Aerochrome Infrared film, surreal color shift, green foliage rendered as hot pink.", lensChar:"Clinical Sharp", film:"Kodak Portra 400", wb:"Daylight Balanced", grain:"Medium Texture" } }
];

export const LIGHTING_MODIFIERS = [
  { label: "Softbox", phrase: "large softbox key light" },
  { label: "Window", phrase: "natural window light" },
  { label: "Rim", phrase: "rim light edge definition" },
  { label: "Sheer", phrase: "light diffused through sheer curtains" },
  { label: "Candle", phrase: "warm candlelight glow" },
  { label: "Moody", phrase: "shadowy moody lighting" },
  { label: "Strobe", phrase: "hard directional strobe" }
];

export const COMPOSITION_TYPES = [
    "None", "Rule of Thirds", "Centered", "Leading Lines", "Tight Close-up", "Low Angle Hero", "Top-down Flat Lay"
];

export const ASPECT_RATIO_OPTIONS = [
    { value: AspectRatio.Portrait_3_4, label: "3:4 - Classic Portrait" },
    { value: AspectRatio.Portrait_9_16, label: "9:16 - Full Vertical" },
    { value: AspectRatio.Square_1_1, label: "1:1 - Square" },
    { value: AspectRatio.Landscape_4_3, label: "4:3 - Classic Landscape" },
    { value: AspectRatio.Landscape_16_9, label: "16:9 - Cinematic" }
];

export const LIGHT_COLOR_TEMPERATURE_OPTIONS = Object.values(LightColorTemperature) as string[];

export const WARDROBE_SUGGESTIONS = [
    { name: 'Lingerie', description: 'black lace lingerie bodysuit' },
    { name: 'Silk Robe', description: 'sheer silk robe draping off shoulders' },
    { name: 'Oversized Shirt', description: 'oversized white button down shirt' },
    { name: 'Corset', description: 'vintage satin corset' },
    { name: 'Draped Sheet', description: 'wrapped artistically in white bedsheets' }
];

export const ETHNICITY_OPTIONS = ['Caucasian', 'African American', 'East Asian', 'South Asian', 'Latino', 'Middle Eastern', 'Mixed Race'];

export const CAMEO_SUBJECTS = ["Generic Model", "Jason Vorhees", "Santa Claus"];
export const CAMEO_ARCHITECTURE_EXTERIOR = ["The White House"];
export const CAMEO_ARCHITECTURE_INTERIOR = ["The Oval Office"];
export const CAMEO_LANDSCAPE = ["The Grand Canyon"];

export const CONSISTENCY_MODE_OPTIONS = [
    { value: ConsistencyMode.FaceOnly, label: 'Face Only' },
    { value: ConsistencyMode.FaceAndHair, label: 'Face & Hair' },
    { value: ConsistencyMode.FullCharacter, label: 'Full Character' }
];

// --- 5. WIZARD & APP CORE OPTIONS ---

export const GENERATION_MODE_OPTIONS = Object.values(GenerationMode);
export const TIME_OF_DAY_OPTIONS = Object.values(TimeOfDay);
export const PHOTOGRAPHIC_STYLE_OPTIONS = Object.values(PhotographicStyle);
export const CAMERA_PERSPECTIVE_OPTIONS = Object.values(CameraPerspective);
export const ARCHITECTURE_SHOT_TYPE_OPTIONS = Object.values(ArchitectureShotType);

/**
 * Mapping of styles to prompt descriptions used in promptBuilder
 */
export const PHOTOGRAPHIC_STYLE_MAP: Record<string, { description: string }> = {
    [PhotographicStyle.Cinematic]: { description: "Cinematic lighting with deep shadows and high dynamic range, anamorphic lens qualities." },
    [PhotographicStyle.VintageFilm]: { description: "Analog film aesthetic with natural grain, soft highlights, and slight color shifts." },
    [PhotographicStyle.FashionMagazine]: { description: "High-end editorial fashion photography, clean lighting, sharp focus on texture." },
    [PhotographicStyle.Documentary]: { description: "Raw, unposed observational style with natural light and realistic color." },
    [PhotographicStyle.BlackAndWhite]: { description: "Monochrome fine art photography focusing on light, shadow, and form." },
    [PhotographicStyle.ArchitecturalDigest]: { description: "Clean, balanced architectural photography, vertical lines preserved, wide perspective." },
    [PhotographicStyle.NationalGeographic]: { description: "Vivid, high-detail environmental portraiture and landscape photography." },
};
