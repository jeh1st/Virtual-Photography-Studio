
# V-Studio Pro: User Manual & Settings Guide

Welcome to **V-Studio Pro**, an advanced AI-powered virtual photography studio. This workspace allows you to plan, visualize, and generate high-end photography concepts using a node-based workflow.

## 1. Session Modes
The application functionality adapts based on the "Session Mode" selected in the top header.

*   **Standard (Boudoir Pre-Viz)**: The default balanced mode. Best for general portraiture, fashion, and lighting tests.
*   **Viscosity Study (October/February Setup)**: A specialized mode for texture, liquid effects, and avant-garde concepts. Unlocks "Liquid Color" and "Liquid Thickness" controls.
*   **Nostalgia (June 7th Setup)**: optimizing for vintage film aesthetics, warmer tones, and softer lenses.
*   **Abstract Art (Wig/September Setup)**: A creative mode for surrealism, anti-gravity hair physics, and neon lighting.

---

## 2. Node Graph System
The core interface is a node graph. Click on any node to edit its properties in the **Studio Inspector** sidebar.

### 🟣 Subject / Model Node
Controls the physical appearance of the subject.

*   **Library Identity**: Link to a saved character from your Asset Library for consistent faces.
*   **Gender / Body Type**: Select from diverse options including specific male/female body types (e.g., "Full Figured", "V-Taper", "Athletic").
*   **Age / Ethnicity**: Define demographic details.
*   **Wardrobe & Props (Smart Automation)**:
    *   *Input Text*: Describes what the subject is wearing (e.g., "Silk Robe").
    *   *Leave Empty*: Automatically triggers **"Fine Art Figure Study"** logic, focusing on silhouette and shadow rather than clothing.
*   **Skin Realism**:
    *   *Intensity slider*: Controls the raw texture (0-100). High values add "micro-contrast" and "peach fuzz".
    *   *Detail Toggles*: Enable specific textures like Pores, Freckles, Stretch Marks, Cellulite, and Vitiligo/Discoloration.
*   **Viscosity Controls** (Only in Viscosity Mode):
    *   *Liquid Color*: Determine the fluid substance (Blood, Oil, Slime, Gold, etc.).
    *   *Liquid Thickness*: Control physics from "Runny" to "Thick Sludge".

### 🟢 Environment / Room Node
Sets the stage for the photo.

*   **Type**:
    *   *General*: Standard text-based description.
    *   *Landscape*: Unlocks specific landscape types (Mountains, Desert, etc.).
    *   *Architecture*: Advanced controls for interior/exterior architectural shots.
*   **Time & Location**: Updates the sun position based on real-world coordinates and time.
    *   *Sun Phase*: Automatically calculated (e.g., "Golden Hour", "Blue Hour", "Midnight").
*   **Scene Reference Image**: Upload an image to guide the color palette and layout of the background.

### 🔵 Camera Node
Simulates physical camera optics.

*   **Camera Model**: Emulates specific sensors (e.g., "Sony Alpha 1", "Leica M6").
*   **Lens**: Choose focal lengths (35mm, 85mm, 105mm Macro) which affects depth-of-field and compression.
*   **Exposure Settings**: Aperture (f-stop), Shutter Speed, and ISO.
*   **Film Emulation**: Adds color grading profiles (e.g., "Kodak Portra 400", "Ilford HP5").
*   **Lens Characteristics**: Adds optical flaws like "Vintage Softness" or "Dreamy Bloom".

### 🟡 Lighting Node
Controls the illumination of the scene.

*   **Lighting Style**: Global styles like "Rembrandt", "High Key", or "Neon Practical".
*   **Gobo**: Projects patterns (Venetian Blinds, Tree Branches) onto the scene.
*   **Modifiers**: Add specific setups like "Rim Light" or "Softbox Key".

### 🔴 Composition Node
Directs the artistic framing.

*   **Aspect Ratio**: Square (1:1), Portrait (3:4, 9:16), Landscape (4:3, 16:9).
*   **Vibe / Mood**: A text field to influence the atmospheric feeling (e.g., "Melancholic", "Energetic").

---

## 3. Library & Assets
*   **Subject Library**: Upload reference photos of a person to train a consistent "Identity". Use this identity in the Subject Node to auto-generate that person's face.
*   **Image Library**: Store general reference assets or successful generations.

## 4. Generation Logs
Located in the **LOGS** tab.
*   **Status Tracking**: See every prompt sent to the AI, including those that Failed.
*   **Safety Debugging**: If an image is refused, check the Logs to see the "Error" message and the exact prompt that caused it. This is essential for tuning "Viscosity" or "Nude" prompts.

## 5. Tips & Tricks
*   **Obsidian Mode**: In the Gender dropdown, select "Obsidian Form". This creates a statue-like, shiny black figure study, excellent for lighting tests without distraction.
*   **Reference Images**: You can attach a "Manual Face Reference" directly to a Subject Node for a one-off face swap without creating a full library profile.
*   **Upscaling**: In the Gallery, click a generated image to open the editor. Use the "Upscale" button to regenerate it at 4x detail.
