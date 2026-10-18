# Amey Shelar — The Living Exhibition

Design proposal, 11 October 2026. **Awaiting approval.** The existing application has not been redesigned in this round. These are visual concepts and proposed behaviors, not a running website or measured performance results.

**Latest revision:** read the [code-native motion contract](CODE-NATIVE-DESIGN.md) and [portrait and motion revision](PORTRAIT-AND-MOTION.md) first. The former specifies live browser rendering, and the latter adds a dedicated photo chapter and updates the page to ten chapters. They supersede conflicting details in this earlier overview.

## The idea

**Complex systems. Beautifully resolved.**

The portfolio unfolds like an exhibition of working ideas. A machined silver assembly introduces Amey's three connected disciplines: the interface people use, the logic that supports it, and the intelligence that adds value. An oxblood conductor travels through these layers. As the visitor scrolls, the assembly opens, becomes a project-specific visual, then reconnects at the contact section.

The first impression is sculptural and memorable. The next impression must be technical clarity: real projects, comprehensible decisions, and a direct route to discussing a commission. Founders and freelance clients lead; hiring teams can move directly to work, Experience, and Stack.

## Review the visual boards

- [Opening composition](01-opening.png): hero proportions, material character, typography, focal object.
- [Current complete scroll with portrait](05-complete-scroll-with-portrait.png): ten chapters including the new photo section.
- [Portrait section and choreography](04-portrait-motion.png): the photo composition and four motion keyframes.
- [Interactive component states](06-interactive-motion.png): before/after states for architecture, vision, and scope controls.
- [Project detail, mobile, and intro storyboard](03-interiors-motion.png): interior-page composition, mobile hierarchy, four loader keyframes.

The long board is a condensed overview, not the intended literal page height. Final sections need room to read and interact: approximately 10–13 desktop viewports in normal reading, without adding empty scroll distance to make the website seem longer.

Generated imagery is conceptual. The UAV shape, interface data, charts, terrain, and product screens are illustrative, not documentary evidence of Amey's projects. The small labels and fonts in the renders are approximations; the specifications below govern content and implementation. The final loader returns to the porcelain hero even though the last storyboard frame uses oxblood for visual separation.

## Visual system

| Role | Proposed value | Use |
|---|---|---|
| Porcelain | `#F0EDE6` | Opening, story, long-form reading, protected Experience background |
| Oxblood | `#581E2C` | Main identity, project gallery, final invitation, active routes |
| Graphite | `#232321` | Body copy, protected Stack environment, dark figure details |
| Ice | `#C7D9E5` | Vision study and collaboration; cool counterpoint to the warm materials |
| Silver | Asset material | Sculptural assembly; avoid rendering essential text as reflective metal |

Oxblood owns complete sections rather than appearing only on buttons. Ice-blue identifies exploration and collaboration. The metal belongs to the authored objects, while controls stay flat and legible.

**Typography:** proposed Hanken Grotesk for headings, navigation, and body text; Bodoni* display italic for selected narrative words. The italic is used sparingly at large sizes. Body copy remains a readable sans, even where the generated boards use serif paragraphs. Self-host only the required font subsets after license verification. Bodoni* has an [OFL-licensed source](https://github.com/indestructible-type/Bodoni).

Desktop hero: approximately 112–148px at 1440px, fluid within the text measure. Section headings: 64–96px. Body: 18–20px, 1.5–1.65 line height, 50–65-character measure. Mobile hero: approximately 46–62px with authored line breaks; body 17–18px. Thin strokes remain readable on small screens; labels are never essential information at microscopic sizes.

**Composition:** full-width color fields; generous 48–80px desktop outer margins; 20–24px mobile margins. Navigation is a small wordmark and ordinary links. Selected work uses one large scene and offset supporting exhibits, not equal cards. Fine chapter markers aid orientation but do not become decorative dashboard chrome.

## Page architecture and choreography

| Chapter | What the visitor learns | Composition | Proposed motion and interaction |
|---|---|---|---|
| Intro | A distinctive name and engineering identity | AMEY SHELAR; one secondary word at a time | A 2.3-second title sequence. Letters rotate on their vertical axes and settle into one readable name; ENGINEER changes to BUILDER. The connecting line becomes the hero conductor. Skip is always available. |
| 01 — Opening | Who Amey is and where to inspect his work | Large typographic thesis and an off-center silver assembly | Restrained pointer parallax changes the assembly's orientation, capped at about 5 degrees. Scroll opens the three layers; the headline remains stable and readable. Work CTA is visible immediately. |
| 02 — Story | How interface, systems, and AI connect | Quiet large statement and exploded assembly | The assembly opens in three deliberate phases. Each label resolves beside its layer. Narrative text appears in short line groups; the full paragraph is available without animation. |
| 03 — Selected work | Evidence of technical range | Oxblood gallery; three distinct compositions | VPN: a signal travels through a tunnel. JATAYU: a camera field moves across a contour study. Retail: shelves resolve into a data view. Pointer/focus previews are restrained; selecting a project opens its detail page. |
| 04 — Vision study | What a computer-vision pipeline does | Ice-blue field, layered image/depth/annotation planes | A keyboard-accessible Frame / Detect / Interpret control changes a labeled illustrative sample. Scrubbing separates the layers. No webcam request and no suggestion that precomputed graphics are live inference. |
| 05 — Experience | Existing career narrative | Existing survey-map structure | Preserve the actual route, stops, content, and interactions. Recolor only. No new parallax, pinning, or choreography imposed on this protected component. |
| 06 — Stack | Existing tool narrative | Existing draggable sphere and detail panel | Preserve the actual orbit, logos, content, and interactions. Recolor only. Do not replace the sphere with the generated board's metallic center or substitute its speculative logos. |
| 07 — What your product needs next | How a potential engagement could begin | Three layered material samples and Launch / Extend / Integrate controls | This replaces Process. Selecting an engagement type changes the connected layers and a concise proposed scope. Motion explains the work emphasis, not an invented automated architecture recommendation. |
| 08 — Collaboration | How working together could feel | Large Founders / Product teams / Creative partners rows | A selected row reveals practical working arrangements. Two sculptural elements dock to suggest collaboration. Focus and touch work exactly like pointer selection. No invented client logos or testimonials. |
| 09 — Invitation | How to take the next step | Oxblood close, conductor forming an open loop, large direct CTA | The line resolves into the CTA. A subtle magnetic effect moves only the arrow/decoration, not the hit area. The contact panel expands inline; email and social links stay immediately usable. |

Every chapter has a distinct motion role, but only one major scene moves at a time. Reading passages settle completely. The visual story alternates spectacle, explanation, evidence, interaction, and invitation.

## Project-detail pages

Three routes share a reading system but each has a different opening visual. Their structure is: title and context → project illustration → challenge → contribution and architecture → technical choices → honest limitations → next project.

**VPN Tunneling Dashboard** — suggested title: “Making the invisible visible.” The hero uses a signal inside a transparent tunnel. The explanation covers monitoring IKE and Child security associations through a React interface, REST APIs, and charts. A state explorer illustrates how the information is organized. Any mock states must be marked sample data. Real screenshots and contribution details should replace illustrative material when supplied.

**JATAYU** — suggested title: “From seeing to responding.” Its hero is a monochrome landscape/vision exhibit. The narrative connects camera input, OpenCV/NanoDet detection, depth information, and MAVLink-related control. The resume supports this technical vocabulary; it does not establish a specific aircraft shape, detection accuracy, field deployment, safety certification, or outcome. Do not infer those from the generated illustration.

**Retail Optimization Platform** — suggested title: “Making store activity useful.” Its hero moves between a spatial store illustration and an analytics layer. The story covers React, Node/Express, Supabase, YOLO/OpenCV, and Stripe as appropriate to verified contribution. Do not add sales improvements, conversion numbers, production scale, or client identity without evidence.

Shared route transition: the selected project's media expands into its detail-page frame, then the text settles. Default browser navigation remains available. Back restores the work section and focus; next-project navigation is explicit. Mobile uses a short crossfade/translation instead of a full-screen distortion.

## Motion direction

The motion vocabulary is **align → separate → trace → resolve**. It relates to engineering assemblies and data flow. Avoid shaking text, continuous glitch, random floating shapes, and repeated fade-up reveals as the main attraction.

Intro timing: 0–0.55s letters arrive with alternating rotation; 0.55–1.05s name aligns; 1.05–1.70s conductor passes through the assembly; 1.70–2.30s composition opens into the hero. Never make navigation wait for a heavy asset or restart the full intro on every visit.

Small controls: 160–240ms. Scene changes: 550–900ms. Shared project transition: about 650ms. Scroll scenes follow progress and finish in stable states. Springs are reserved for brief tactile responses. No exaggerated bouncing in technical reading areas.

**Framer Motion / Motion for React:** local interactive state, layout transitions, pointer response, and presence. **GSAP:** the coordinated intro and scroll narrative where a timeline is useful. Each animated property has one owner; both libraries must not write to the same transform. Existing protected sections retain their current controllers.

One carefully bounded Three.js assembly is proposed for the opening and its immediate story continuation, using authored procedural geometry, materials, and restrained lighting. SVG/canvas and code-generated geometry handle the other scenes. See the code-native motion contract; the concept boards are not production assets.

## Useful interactions

1. Layer explorer: select Interface / Logic / Intelligence; expose a small explanation and corresponding assembly layer.
2. Vision study: scrub through labeled illustrative processing states, with buttons as an alternative to dragging.
3. Scope explorer: Launch / Extend / Integrate changes proposed deliverables and a draft brief.
4. Collaboration selector: Founder / Product team / Creative partner changes working context.
5. Contact: edit a short inquiry, then open an email draft. If there is no backend, do not show a fake “message sent” state. Keep the direct email link available.

The draft brief may be downloaded locally or copied. It is not sent automatically. The contact form should use real labels, visible errors, preserved text, and a clear send action.

## Responsive and performance plan

Mobile is recomposed, not shrunk. Headline comes before the sculpture; project scenes become a vertical sequence; controls stay reachable without hover. A menu sheet exposes Work, About, Experience, Stack, and Contact. The decorative chapter rail disappears on narrow screens.

Reduced-motion mode: skip the animated intro, show stable final scene poses, remove magnetic movement and camera movement, keep all reading and controls. Content renders visibly before animation enhancement. Touch devices do not pay for cursor effects. Native scrolling remains the baseline.

Proposed engineering targets, not current measured results: LCP ≤2.5s, CLS ≤0.1, INP ≤200ms on a defined representative device/network profile. Target initial nonessential JS below 200KB compressed, with WebGL loaded after meaningful text/CTA. Load only the visible scene, pause off-screen rendering, cap device pixel ratio, and provide a CSS/SVG fallback when rendering fails. Actual protected-section costs must be measured; extra motion gets reduced before their behavior changes.

The previous distorted opening is a required implementation test case. Headings must render as one semantic text layer, have bounded responsive sizes, and never depend on animation completion to become legible. Any split-letter animation is decorative and cleaned up safely. Verify direct entry, hard reload, restored scroll, slow fonts, resize, mobile, reduced motion, and absent WebGL. This is a plan, not a claim that the deployed bug has been fixed in this design-only round.

## Content boundaries and approval scope

Experience and Stack stay exactly as currently implemented except their approved color changes. Their existing designer-oriented claims do not match the supplied engineering resumes; preserving them does not verify those claims. This proposal does not add or endorse them elsewhere. A later content correction requires separate authorization.

Use the confirmed contact details: ameys436@gmail.com, github.com/amey-16, linkedin.com/in/amey-shelar123. The user-provided Senior Full Stack Developer & AI/ML Engineer title is retained; do not invent years of experience, awards, client lists, project results, or availability.

Approval means accepting this art direction, nine-chapter narrative, project-detail system, and proposed motion language as the next implementation target. It does not require accepting accidental generated text, speculative tool logos, illustrative UAV geometry, or any change to the protected sections. The existing site remains a draft until the approved design is implemented and verified.

## Reference interpretation

The proposal draws its small, direct navigation and contact clarity from [Dennis Snellenberg](https://dennissnellenberg.com); project-led visual sequencing from [Aristide Benoist](https://aristidebenoist.com) and [Kenta Toshikura](https://kentatoshikura.com); typographic contrast and full-frame media from [Locomotive](https://locomotive.ca/en); spatial focal-point ambition from [Dogstudio](https://dogstudio.co) and [Active Theory](https://activetheory.net). These are design interpretations of the inspected sites, not claims that their code or assets are reused. See [RESEARCH.md](RESEARCH.md) for access limits and the full supplied-reference audit.

Generated using the built-in image generation tool. Exact prompts: [opening](hero-prompt.txt), [full scroll](full-page-prompt.txt), [interiors and motion](interiors-prompt.txt).
