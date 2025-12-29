# Features & Capabilities

## 1. Core Concept
*   **AI-Powered Virtual Studio**: A professional photography studio simulator powered by **Google Gemini AI**, offering high-fidelity image generation.
*   **Node-Based Workflow**: A visual node-graph interface allowing users to modularly combine Subject, Camera, Lighting, and Environment nodes to construct complex scenes rather than relying solely on linear text prompts.

## 2. Studio Simulation Tools
### Camera Control
*   **Gear Simulation**: Select from various camera types (DSLR, Mirrorless, Medium Format, Film) and lenses (Fisheye, 35mm, 85mm, Telephoto).
*   **Manual Settings**: Full control over simulation parameters including Aperture (f/1.4 - f/22), Shutter Speed, and ISO.
*   **Film Stocks**: Emulation of classic film stocks such as Kodak Portra 400, Fujifilm Pro 400H, Ilford HP5, and CineStill 800T.

### Lighting Engine
*   **Multi-Light Setup**: distinct controls for Key, Fill, Rim, and Ambient light sources.
*   **Color Temperature**: Adjustable Kelvin temperatures ranging from Candlelight (1800K) to Moonlight (8000K).
*   **Light Modifiers**: Simulation of softboxes, scrims, ring lights, and "Gobos" (patterns projected by light).

### Environment & Atmosphere
*   **Geo-Specifics**: Settings for precise Latitude/Longitude, Season, and Time of Day (e.g., Golden Hour, Blue Hour).
*   **Weather Dynamics**: Controls for atmospheric conditions like Fog, Rain, Storms, and Snow.
*   **Architectural Context**: Detailed environment types including Interior/Exterior shots and specific styles (Brutalist, Gothic, Mid-Century Modern).

## 3. Subject & Character Generation
*   **Detailed Morphology**: Fine-grained settings for Gender, Age, Ethnicity, and Body Type (e.g., "Full Figured", "V-tapered", "Athletic").
*   **Skin Realism Engine**: A specialized toggle to enhance realism with details like pores, freckles, veins, stretch marks, and discoloration.
*   **Hair Physics**: Control over hair style, length, and physics simulation (e.g., "Windblown", "Underwater", "Static").
*   **Subject Library**: Save and load custom character profiles (`SubjectProfile`) with consistency modes (Face Only, Full Character).
*   **Pose Library**: A library of predefined poses ranging from static (Standing, Sitting) to dynamic (Jumping, Dancing).

## 4. Advanced Image Tools
*   **Integrated Image Editor**: Built-in tool for post-generation adjustments and cropping.
*   **Background Removal**: Client-side background removal powered by `@imgly/background-removal`.
*   **Upscaling**: AI-driven image upscaling to increase resolution and clarity.
*   **Reference Assets**: Support for uploading external images to guide the generation style, composition, or subject.
*   **Image Blending**: Capabilities to generate composites or blend multiple inspirations.

## 5. Application Features
*   **Session Modes**: Pre-configured workspaces for different creative directions:
    *   *Standard*: Default studio setup.
    *   *Nostalgia*: Setup for retro/vintage aesthetics.
    *   *Viscosity Study*: Experimental setups for fluid/texture studies.
    *   *Abstract Art*: Creative mode for avant-garde compositions.
*   **Gallery & Archive**: Local management system to view, organize, and delete generated images.
*   **Prompt Engineering Aids**:
    *   *Prompt Wizard*: Step-by-step assistant for building complex prompts.
    *   *Contextual Suggestions*: AI-driven tips to improve scene cohesiveness.
*   **Local Privacy**: Uses IndexedDB (`dexie`) to store your gallery, settings, and library entirely locally on your machine.
*   **Responsive Design**: distinct mobile views and a touch-friendly interface.
