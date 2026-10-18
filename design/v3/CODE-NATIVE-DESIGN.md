# Living Exhibition — code-native motion contract

11 October 2026. This clarifies the design before implementation approval. The PNG boards in this folder are visual references only. They are **not production page assets**, and no section may be built as a full-page image, background screenshot, prerendered animation, sprite sheet, or video of the concept.

The only photographic content planned for the website is Amey's portrait, which he explicitly requested. Use the edited transparent portrait after he accepts its likeness, or the original photograph if he prefers. Fonts and tiny favicon assets are normal interface resources. Everything else that looks dimensional, diagrammatic, or animated is rendered from browser code and responds to the visitor.

## Core system

| Experience | How it is actually built | What changes live |
|---|---|---|
| Name intro | Semantic HTML letters with Motion for React/GSAP transforms | Letters align, secondary word changes, conductor begins its path; skip and reduced-motion paths show the complete name immediately |
| Hero silver assembly | One Three.js scene: custom extruded arch geometry, transparent plane meshes, a swept conductor curve, authored lighting and shadows | Camera orientation responds slightly to pointer; scroll opens the interface, logic, and intelligence layers |
| Portrait | One real photo in `<img>`; CSS color planes; SVG ribbon; Motion transforms | Plane reveal, shallow depth, ribbon stroke draw; the face stays visually stable |
| Architecture explorer | The same Three.js assembly and accessible HTML controls | Selecting a layer changes mesh positions/material emphasis and matching explanatory copy |
| VPN project | Instanced Three.js tunnel rings or SVG rings plus an SVG signal graph | A signal traverses the tunnel; selecting a state exposes a labeled connection path |
| JATAYU project | Procedural contour lines in canvas/SVG, a simple geometric UAV silhouette, vector vision overlays | Camera field, detected region, and depth interpretation respond to stage controls; sample data is labeled illustrative |
| Retail project | CSS/SVG shelves and products with a data layer generated from a small local data object | Shelf view transforms into an analytics view through shared positions; no photographed store or fake results |
| Vision study | SVG/canvas synthetic street/scene geometry and detection/depth layers | Frame / Detect / Interpret controls alter overlays and depth separation, not a fixed image swap |
| Experience and Stack | Existing components and interactions | Palette integration only; their content and structure stay protected |
| Scope and collaboration | HTML/CSS + Motion layout transitions, small SVG connector paths | Selected audience or engagement changes copy, arrangement, and an editable brief |
| Contact | Semantic form and SVG conductor | The ribbon resolves into the invitation; form state stays accessible and editable |

The opening and architecture explorer share **one** renderer and one Three.js scene graph. This avoids loading several WebGL worlds at once. Project exhibits use SVG/canvas where those primitives communicate the subject more clearly. There is no need for an image texture or premade 3D model to imitate the concept rendering. Metallic depth comes from authored geometry, material parameters, lighting, and motion; the exact generative render is an art-direction target, not a pixel-match guarantee.

## Motion ownership and interaction

- **GSAP:** intro sequence and one coordinated scroll timeline that positions the shared 3D assembly. Scroll progression is bounded and settles in legible poses.
- **Motion for React:** selected-state transitions, project preview changes, brief and contact panel presence, and small tactile feedback.
- **CSS/SVG:** ribbon path drawing, typographic details, color planes, and simple hover/focus cues.
- **Three.js:** live assembly geometry, camera, conductor, and spatial project moments that need depth.

Each property has one controller. A React selection tells the scene which state to render; React and GSAP never both write to the same object's transform. The page is semantic HTML first, and rendering enhances it. Work links, explanations, project details, Experience, Stack, and contact remain accessible if WebGL fails.

The signature motion is **align → separate → trace → resolve**. It follows the engineering story: distinct layers align into a system, separate for inspection, then reconnect into a usable result. Repeated generic fade-ups, wobbling cards, cursor trails, autoplay loops, and faux code rain are excluded.

Interactions must be useful without pointer movement: architecture tabs, vision stage buttons, and scope tabs are ordinary keyboard controls. Dragging and parallax are enhancements. Reduced motion presents final stable poses and still shows selected states. The portrait has no face distortion or morphing.

## Performance and review gates

Import the Three.js scene only where needed; render on interaction/scroll changes and pause when hidden. Cap device pixel ratio and limit transparent layers. Use small SVG/canvas datasets, not continuous high-frequency shaders. Measure the actual site on desktop and mobile; reduce detail if the renderer harms responsiveness. One main scene is active at a time.

The original distorted Index page remains a specific acceptance test. Content and headings must be visible before animation starts. Test direct load, slow fonts, resize, mobile, restored scroll, reduced motion, and WebGL unavailable. A screenshot of a beautiful mockup cannot satisfy these gates: the final review must inspect the running implementation and its interactive states.

This contract supersedes any older proposal wording that suggests shipping “optimized illustrations,” poster images of the hero, a photographic vision sample, or generated project art. The design boards continue to describe composition and palette only. Implementation starts after approval of this corrected direction.
