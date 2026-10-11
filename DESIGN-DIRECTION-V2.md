# Amey Shelar — The Build Sequence

Status: revised Phase 1 concept; awaiting approval. Replaces the previous pine/mint split hero. Website implementation has not started. Existing bug fixes remain in place.

Visual: [hero-concept-v2.png](design/hero-concept-v2.png), an AI-generated concept and motion storyboard created on 2026-10-10. The bottom three frames explain successive animation states; they are not a proposed three-card website section. This is a static design preview, not a running Framer Motion demo.

## What changes

The previous concept was a conventional technology landing page: headline on the left, floating product illustration on the right. This direction uses the name itself as a full-width motion composition. Its graphic elements then reorganize across the story. The work needs to be recognizable through its composition and behavior as well as its palette.

Audience remains freelance clients and founders first, hiring teams second. Name and role remain immediately readable: AMEY SHELAR — Senior Full Stack Developer & AI/ML Engineer.

## Visual identity

| Color | Value | Role |
|---|---|---|
| Pollen | #F2F46B | Opening title sequence and hero field |
| Aubergine | #321A35 | Main typography, deeper technical scenes, contact |
| Chalk lilac | #E5D9F1 | Story and project reading surfaces; selected controls |
| Coral | #EA604B | Moving signal, selected transitions and graphic highlights |

The fields change by chapter, not through an arbitrary continuous rainbow. Pollen and lilac carry most reading; aubergine supplies strong text contrast. Coral is primarily graphic, with readable aubergine labels where appropriate. Verify all actual text/focus states rather than assuming every palette combination is accessible.

Typography: a heavy, condensed grotesque for the large name and display moments, paired with a quieter readable sans for descriptions. Proposed production pairing: locally hosted Archivo variable, including controlled width changes, and Manrope for body/controls. Kinetic transformations act on whole glyph wrappers; paragraphs stay steady and readable. The concept image expresses typographic character; final font rendering will be adapted deliberately rather than imitating a bitmap.

The hero breaks the standard split: AMEY spans the upper field, SHELAR shifts horizontally below it, role copy sits in the resulting open area, and the bottom edge carries clear work/contact actions. A coral signal travels through the composition to a small modular assembly. Graphic overlap stays in decorative areas; name, role and actions remain legible. No fake terminal, ambient particle cloud or generic floating UI illustration.

## One graphic, evolving through the story

Use three authored geometric pieces derived from the letter A. They form a repeatable graphic vocabulary with precise edges and consistent proportions. Their stages:

1. Assemble: three pieces lock together as an A during the name reveal.
2. Connect: they separate into functional parts joined by a short signal path.
3. Ship: they resolve into an abstract product composition and lead into actual work.

The graphic is an illustrative identity animation, not a claim about an actual delivered product. It occupies bounded scenes and changes state for a reason. It should read clearly in a still frame as well as in motion.

## Motion choreography

| Moment | Sequence | Intended behavior |
|---|---|---|
| Loader, roughly 2.4 seconds | Name characters arrive from opposing directions, selected letters twist into place, role text flips Developer / Engineer / Builder; the assembled A becomes the hero's object. | A single coherent title sequence; bounded rotation, spring settling, no repeated bouncing after completion. Skip control and fast returning-visitor path. |
| Hero → story | Name spacing expands slightly, the A separates into three parts, and the signal connects them. The next chapter enters through an expanding rectangular mask. | Scroll-linked translation, short rotation and clip reveal. Keep the role/CTA accessible throughout the hero. |
| Story | Three concise statements accompany the three transformations; a real portrait receives one cinematic reveal. | Different scale and tempo from the loader. Avoid animating every word independently. |
| Work | Project titles act as large typographic anchors around genuine screenshots and architecture views. | Hover/focus activates a bounded preview; selecting a project transitions to its detail with a shared visual anchor where supported. Normal links remain functional. |
| Capabilities | Three selectable tracks rearrange the same parts into Product / Applied AI / Automation diagrams. | Spring layout changes explain the selected capability. Click/tap and keyboard controls work without dragging. |
| Collaboration | Choose Launch a product / Extend a platform / Add AI. | The active row expands, explaining scope and useful briefing questions; the choice carries into contact. |
| Contact | The signal ends at the final invitation; name typography resolves again as a visual bookend. | One short completion sequence and tactile controls, then a quiet usable form. |

Full page order remains: Intro → Hero → Story → Selected work → Experience → Stack → What I build → Engineering decisions → Working together → Contact. Preserve depth through verified project detail and useful content, not long empty scroll holds.

## Framer Motion implementation plan

Use Motion for React, the current Motion React package, for new kinetic and interactive components inside Astro React islands. Build these with motion values, springs, scroll-linked transforms, layout transitions, drag constraints and presence transitions where appropriate. React islands should stay isolated and load only when needed.

The protected Experience and Stack scenes retain their existing GSAP behavior. Each element has one animation owner: do not allow GSAP and Motion to compete over the same transforms. Shared visual transitions require elements to live in the same interactive island; otherwise use an ordinary navigation/reveal rather than pretending separate roots share layout state.

Planned interactions:

- Drag the three-piece hero object within a small bounded area; it springs back or assembles. A keyboard/tap Assemble button offers the same state change.
- Select Interface or Architecture in a project preview with a smoothly changing composition.
- Switch capability tracks to rearrange the system graphic.
- Select a collaboration situation and carry that choice to the inquiry.
- Retain the existing draggable Tech Stack orbit.

CSS/SVG supplies most graphics. No additional 3D engine for the new direction. Font-width animation is confined to short display moments and replaced by transform-based motion if profiling shows excessive layout cost. Keep the name as live semantic text; decorative duplicate layers are hidden from assistive technology.

References for the chosen implementation mechanisms: https://motion.dev/docs/react-scroll-animations and https://motion.dev/docs/react-layout-animations . These support the technical approach, not a claim that the prototype or production build already exists.

## Preserved boundaries and delivery

Experience and Tech Stack remain exactly as requested: content, component structure and working interactions. Scope the new palette and type to redesigned sections so global changes cannot restyle them. Their current designer-focused wording remains a known mismatch under this constraint.

Use your resume to select true projects and decisions. Do not retain unverified clients, testimonials, statistics or contact details merely to fill the new composition. Existing project evidence and real screenshots should drive the work section; concept graphics stay clearly illustrative.

At mobile widths, the name uses intentional line breaks, the graphic sits within the flow, hover states become tap states, and scroll scenes shorten. Reduced motion shows final compositions with direct transitions. Every section remains readable if its animation fails, and the loader never waits indefinitely for assets.

Implementation targets: no horizontal clipping; keyboard-complete controls; good contrast; minimal layout shift; offscreen animation paused; bounded canvas cost in preserved scenes; representative mobile performance checks. Actual motion smoothness must be reviewed in-browser after design approval, because a static storyboard cannot demonstrate it.

## Approval

Review the revised hero and the Assemble / Connect / Ship keyframes together. Approval should cover the more expressive typography, pollen/aubergine/lilac/coral palette, and the idea of one graphic evolving across the narrative. This replaces, rather than modifies, the previous green proposal. Production coding begins after the revised direction is approved.
