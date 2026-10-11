# Amey Shelar — portfolio redesign proposal

> Superseded visual direction: the user rejected this concept as too generic. The active proposal is [DESIGN-DIRECTION-V2.md](DESIGN-DIRECTION-V2.md). Retain this document only as design history; do not implement its pine/mint hero or floating planes.

Status: Phase 1, awaiting design approval. This document proposes the implementation; it does not authorize deployment. No production website files were edited for this proposal.

Visual proposal: [hero-concept.png](design/hero-concept.png). AI-generated design exploration, created for this proposal on 2026-10-10; use it as composition guidance, not a shipped screenshot or a website background image. The intended implementation recreates its planes and typography as accessible, responsive HTML/CSS/SVG.

## Direction: From interface to intelligence

A story about the complete product: what people touch, the systems that make it work, and the intelligence that makes it useful. Position Amey as a Senior Full Stack Developer & AI/ML Engineer with a strong eye for interaction and presentation.

Primary audience: freelance clients and founders. Secondary audience: hiring teams. The site should help someone understand Amey's scope, inspect credible work, and begin a relevant conversation. The journey is cinematic when explored, but direct navigation makes work and contact immediately accessible.

The visual signature is one product represented as three connected planes: Interface, System, Intelligence. The planes assemble during the hero and separate on scroll. Their relationship explains the engineering story. Use HTML, CSS perspective and a small SVG diagram rather than a large 3D scene. The concept image is a proposed first viewport, not a finished site or a promise of exact raster rendering.

## Palette and type

| Role | Color | Use |
|---|---|---|
| Pine | #103D36 | Hero, selected technical passages, contact |
| Mineral mint | #DDF1E8 | Main text on pine, diagram planes, highlighted passages |
| Warm paper | #ECE9E1 | Story and case-study reading surfaces; bridges to preserved sections |
| Ink | #0E0E0D | Reading text and diagrams on light surfaces |
| Signal orange | #FF4B26 | Small active nodes and a few key interactions; connects to existing sections |

Color belongs to whole chapters, with roughly two-thirds calm light reading surfaces and one-third saturated green stages. Orange marks activity and actions, not entire paragraphs. Actual text pairs and interaction states will be contrast-tested during implementation.

Proposed type: Bricolage Grotesque for the new headline system, Manrope for body and controls, and the existing Geist Mono only for meaningful technical annotations. Use locally hosted, subset font files, limited weights, and fluid sizing. Headlines around 64–112px on desktop and 40–56px on phones, constrained by actual line lengths. Body copy 17–19px, generally 50–65 characters per line. Preserve original fonts inside Experience and Stack.

Composition: full-width color fields with a 12-column internal grid, 64–96px desktop edges and 20–24px mobile edges. Alternate wide visual moments with compact readable passages. Project images can cross the internal column grid while headings and controls retain a clear alignment.

## Narrative and section architecture

| Chapter / component | Content and purpose | Motion and interaction |
|---|---|---|
| Intro / KineticIntro | AMEY SHELAR, then Developer / Engineer / Builder | Letters rotate from alternate angles, land with a restrained overshoot, and settle into the name. Role changes use a mechanical flip. Final letter alignment becomes the hero alignment. |
| Hero / ProductHero | “From interface to intelligence.” Role immediately visible. Supporting line: “I build digital products that connect thoughtful interfaces, reliable systems, and useful AI.” CTAs: Explore my work; Start a conversation. | Three product planes assemble. Small pointer tilt stays within 4 degrees. Scroll separates the planes to introduce the story. Headline remains selectable DOM text. |
| Story / EngineeringStory | “Good software starts with understanding.” Three short beats: understand the problem; connect the layers; build for real use. Add a curated personal paragraph and the existing portrait. | A short sequence reveals one relationship at a time. The portrait enters as a complete image; text shifts from supporting to foreground emphasis. Mobile uses natural vertical flow. |
| Selected work / ProjectStories | Three strong, verified projects, ideally covering full-stack delivery and applied AI. Each explains problem, ownership, important decision, and evidence. | Large alternating project compositions, restrained image parallax, and an accessible Interface / Architecture switch. Each has a real detail-page link. |
| Experience / existing component | Existing content and structure exactly preserved. | Existing route-map behavior preserved. |
| Stack / existing component | Existing content and structure exactly preserved. | Existing draggable orbit preserved. |
| What I build / CapabilityExplorer | Replaces Process entirely. Three proposed tracks: Product platforms; Applied AI; Integrations & automation. Each explains situations it helps, deliverables, and important tradeoffs. Validate specific capabilities against the resume before final publication. | Select a track to change a compact diagram and example delivery scope. Keyboard-accessible tab controls; tap-friendly on mobile. One shared visual changes meaningfully rather than three repetitive cards. |
| Engineering decisions / DecisionNotes | A concise view into senior judgment: performance versus complexity, AI versus deterministic logic, and delivery versus maintenance. Final examples should come from real work. | Expandable notes reveal rationale and evidence. Optional “Show the tradeoff” control highlights the affected layer of a simple diagram. |
| Collaboration / WorkingTogether | Replaces anonymous client lists and unverified quotes. Explain three engagement situations: a founder launching a product, a team extending a platform, a studio needing an engineering partner. | Choosing a situation reveals proposed scope, how communication works, and what a useful first brief includes. Selection can prefill the contact subject. Add genuine client stories only when supplied. |
| Contact / ProjectInquiry | “What should we build next?” A clear invitation with verified email and social links. Short inquiry form: name, email, project context; optional project type and timeline. | Magnetic CTA limited to pointer devices; focus and pressed feedback on all devices. Clear pending, success, and recoverable error states. |
| Footer / SiteFooter | Full name, verified links, location if confirmed, back to top, motion preference. | Name forms a final typographic composition. Link underlines draw on hover/focus. |

Target depth: roughly 12–16 meaningful desktop viewports plus project detail pages, with final length governed by verified content. The primary journey should be scannable in about two minutes and reward a deeper read. Avoid empty scroll distance used only to stretch animations.

## Loader storyboard

- 0.00–0.35s: the full name is visible immediately in separated character positions; background is already the hero's pine.
- 0.35–1.20s: alternating letters twist into alignment with a small overshoot. Animate the spans rather than a rasterized headline.
- 0.80–1.80s: Developer, Engineer, Builder rotate through a compact secondary line.
- 1.80–2.40s: the name settles and the composition opens into the hero; its first product plane aligns with the loader baseline.
- Finish by roughly 2.5s on the intended path. Provide Skip intro, honor reduced motion, and shorten repeat visits within the session. Asset errors must never trap the page; no fake loading percentage.

## Motion system and interaction coverage

The motion vocabulary is assemble, connect, reveal. It tells the same story at different scales. Use 150–220ms feedback for controls, 450–800ms scene transitions, and restrained spring settling for the intro. Avoid concurrent animation on every element. The hero and a short story transition are the new scroll-controlled stages; retain the protected Experience behavior.

At least four useful interactions: the existing draggable Stack, the project Interface / Architecture switch, the Capability Explorer, and the collaboration selector feeding the contact subject. Pointer tilt and magnetic controls supplement them. Every interaction must have a keyboard or touch equivalent, visible selected states and legible focus treatment.

Reduced motion presents the complete narrative in normal reading order, skips the kinetic intro, disables parallax and scroll scrubbing, and uses immediate state changes or brief opacity transitions. A failure to initialize an effect leaves its content visible.

## Project detail template

Each verified project receives a dedicated static route: overview and role; original problem; system diagram; two or three consequential engineering decisions; implementation excerpts or genuine product images; evidence and limitations; relevant repository or live link; next project/contact. Include outcomes only when supported. If metrics are unavailable, show a concrete shipped capability and the evidence for it.

Project names, companies, dates, user counts, quotations and accomplishments in the current demo content are not assumed to be factual. Await the resume and supporting links, then curate rather than transcribe. The concept graphic is illustrative and must not be presented as a delivered client project.

## Implementation and protection plan

Keep Astro and GSAP/ScrollTrigger. Use CSS and small SVGs for the redesigned sections. Avoid adding React or a second animation engine merely for this redesign. Retain Lenis only if it improves the tested scrolling behavior; preserve compatibility with the protected scenes. Remove unused animation imports from replaced sections after confirming references.

New components: KineticIntro, ProductHero, EngineeringStory, ProjectStories, ProjectDetail, CapabilityExplorer, DecisionNotes, WorkingTogether, ProjectInquiry and SiteFooter. Shared pieces: SectionNav, MotionPreference, MagneticLink, DiagramLayer, ProjectViewSwitch and Reveal. Keep content separate from animation setup and clean up observers/listeners where needed.

Protect Experience.astro, Stack.astro, route.js and orbit.js, together with their existing selectors and inherited typography/tokens. Scope new design tokens and global-looking typography to redesigned regions so protected sections do not change accidentally. Capture their current desktop/mobile rendering before implementation and compare afterward. Existing source text in both sections still describes designer work; that mismatch is deliberately preserved under the user's boundary and needs a separate explicit instruction to change.

Contact submission needs a confirmed destination and a working delivery mechanism. Until one is configured, use an honest email-composer path and copy-email action; never simulate a successful send. Social links and availability require confirmation.

## Performance and acceptance criteria

- Keep the new hero free of a WebGL dependency; CSS/SVG provide the product-plane effect.
- Lazy-load below-fold media and optional interactive modules. Stop work when scenes are offscreen or the tab is hidden. Cap any retained canvas resolution.
- Prefer transform/opacity animation and precomputed geometry. Avoid frame-by-frame layout reads and full-screen blur/noise filters.
- Aim for LCP at or below 2.5s, CLS below 0.1 and INP below 200ms on representative mobile tests; these are implementation targets, not achieved scores. The loader must be included in real user-perceived loading evaluation.
- Verify 390px, 768px and 1440px layouts, keyboard navigation, reduced motion, delayed/failed font loads, resizing and repeat visits. No horizontal clipping, trapped scroll, blank fallback or false form success.
- Compare the approved hero concept with the built composition and verify all protected content remains unchanged.

## Reference study

- Awwwards portfolio and animation collections: a reference pool for authored transitions and memorable interaction; do not assume every listed site is an award winner. https://www.awwwards.com/websites/portfolio/
- Gilberto León, Made in Webflow: relevant engineer-to-developer positioning, editorial storytelling and scroll interaction. https://webflow.com/made-in-webflow/website/gilberto-leon
- Ayush Wanjari, featured in Framer Gallery: relevant clear client positioning and case-study context. https://www.framer.com/community/gallery/ayush-dezign/ and https://www.ayushwanjari.com/

Apply the principles to Amey's own story rather than reproducing reference layouts. Awwwards consideration is an ambition, not a guaranteed award or listing.

## Approval request

Approve the proposed visual direction, narrative order and interaction plan, or identify the changes you want. Implementation follows that approval. Resume and verified project/contact material can arrive separately before content is finalized.
