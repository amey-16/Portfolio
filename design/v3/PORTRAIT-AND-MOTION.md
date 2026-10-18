# Portrait and motion — revised design for approval

11 October 2026. This revision extends The Living Exhibition in response to the request for a prominent photo section and more explicit motion graphics. **Design only; implementation still awaits approval.**

The [code-native motion contract](CODE-NATIVE-DESIGN.md) is binding for implementation: the portrait is the intentional photograph; the sculpture, project exhibits, vision sample, connector, and other motion graphics are generated in browser code. The boards here are composition references.

## Visuals to approve

- [Full website with photo section](05-complete-scroll-with-portrait.png)
- [Portrait composition and choreography](04-portrait-motion.png)
- [Animated component state board](06-interactive-motion.png)
- [Edited portrait cutout](amey-portrait-cutout.png)

The boards are static compositions and keyframes, not functioning animations. The long-page rendering repeats some small chapter numbers; the sequence below is authoritative. The older mobile board predates the portrait addition; mobile behavior for this chapter is specified here.

## Your photo is a full chapter

“The person behind the systems.” follows the hero and introduces Amey before the technical work. The original source is `photos mine/WhatsApp Image 2026-10-09 at 11.21.53 PM.jpeg`. The edited image removes the event background and adjusts tone, retaining the recognizable appearance, blue shirt, sunglasses, hairstyle, and pose. This is an AI-assisted edit for review, not pixel-identical preservation. Original photos and the existing public portrait remain untouched. The new cutout has verified native RGBA transparency at 1113 × 1414 pixels.

The photo occupies roughly 40–45% of the desktop composition. Oxblood and ice-blue planes provide depth behind it. A silver ribbon connects the hero to the portrait and onward into the engineering story. Typography stays clear of the face. A small “Meet Amey” anchor in the opening jumps directly to this chapter.

The short bio: “I am Amey. I connect thoughtful interfaces, dependable systems and applied AI.” The role remains Senior Full Stack Developer & AI/ML Engineer. No new credentials or performance claims are introduced.

## Complete sequence

| Chapter | Main scene | Motion purpose |
|---|---|---|
| Intro | Name and secondary role | A 2.3-second kinetic title sequence resolves into the opening assembly; skippable |
| 01 — Hero | Complex systems. Beautifully resolved. | Gentle pointer response and a short scroll-led opening of the silver assembly |
| 02 — Portrait | The person behind the systems | Reveal the photo, separate the backdrop, trace the ribbon, then settle |
| 03 — Engineering story | The beauty is in how it works | Interface / Logic / Intelligence selection reveals each layer's contribution |
| 04 — Selected work | Three project-specific exhibits | Signal movement for VPN, camera/depth movement for JATAYU, shelf-to-data transition for retail |
| 05 — Vision study | From signal to understanding | Scrub through clearly labeled illustrative processing stages |
| 06 — Experience | Existing map and career stops | Existing content, structure, and interaction unchanged; palette alignment only |
| 07 — Stack | Existing orbit and detail panel | Existing content, structure, and interaction unchanged; palette alignment only |
| 08 — Scope explorer | What your product needs next | Launch / Extend / Integrate rearranges the relevant layers and proposed brief |
| 09 — Collaboration | Small team. Shared ambition. | Selecting an audience reveals working context while the docking sculpture changes configuration |
| 10 — Contact | Your next chapter starts here | Conductor resolves into the invitation; inquiry panel opens with editable scope |

Allow approximately 11–14 desktop viewports for actual content and interaction, rather than using long empty pinning intervals. Work remains reachable immediately from the opening navigation.

## Portrait choreography

1. **Reveal:** a single mask introduces the intact photograph as the section enters. Never cut the face into strips or morph its features.
2. **Separate:** background layers offset by up to 16px while the person stays visually stable. Optional fine-pointer depth is capped at 6px.
3. **Connect:** the silver ribbon traces behind the person at waist level. It never overlays the face or reading text.
4. **Settle:** the composition comes to rest and the bio/CTA remain fully visible. No endless floating portrait.

The sequence follows a short scroll interval and runs once. The mockup's play/pause symbols mean **Replay portrait motion / Pause motion**, not a video interview or audio recording. Use a single labeled stateful control in implementation. The portrait needs layered imagery and transforms, not a second WebGL scene.

Mobile: heading → portrait → bio → CTA in natural reading order. Portrait approximately 85% of content width, reserved aspect ratio, head fully visible. The ribbon can crop decoratively at edges but cannot create horizontal overflow. No hover dependency. Reduced motion shows the settled composition immediately, without masks or parallax.

## Animated components: behavior, not just decoration

| Component | Action | Result | Proposed timing / alternative |
|---|---|---|---|
| Architecture explorer | Select Interface, Logic, or Intelligence | Chosen layer separates; corresponding explanation updates | 650–800ms, with selected-button state; reduced motion uses a direct crossfade |
| Vision study | Choose a stage, drag the scrubber, or Play sample | Same image gains detection/depth layers; current stage stays visible | About 600ms per manual change; one pausable playback cycle; buttons replace dragging |
| Project previews | Focus or hover the project link | Corresponding project illustration animates once | 450–650ms; touch opens the project directly; the link never chases the pointer |
| Scope explorer | Choose Launch / Extend / Integrate | Sheets rearrange; proposed deliverables and draft brief update together | 650–800ms; all meaning remains available in text |
| Collaboration selector | Choose Founders / Product teams / Creative partners | Contextual description and docking scene change | About 500ms; ordinary buttons with visible focus |
| Contact invitation | Open the inquiry panel | A short editable inquiry inherits the chosen scope | 350–450ms; direct email remains available |

The state board uses different background colors to distinguish examples. The full-scroll board governs actual section backgrounds: vision remains ice-blue and the scope explorer remains porcelain. Avoid the generated board's glowing selection edge in implementation; use a restrained contrast change and clear selected label.

Each component follows input → understandable state change → settled result. No fake processing delays, endless loops, or decorative loading bars. Vision imagery is an illustrative sample, not claimed live inference. A project brief is saved locally or opened as an email draft; it is not automatically sent.

## Motion quality and UX

Motion for React handles local state transitions, pointer response, and presence. GSAP handles the coordinated introduction and scroll sequence. One controller owns each animated property. Only one major scene is active at a time, and off-screen scenes pause. The portrait adds no extra 3D runtime.

Keep text visible before enhancement, reserve media dimensions, preserve native scrolling, and provide keyboard/touch equivalents. Reduced-motion users see the same content in stable states. The original distorted-index issue remains a required implementation test: direct entry, hard reload, slow font loading, resized windows, restored scroll, reduced motion, and renderer failure.

Experience and Stack stay protected. Their generated appearances remain color/composition studies; actual component content and structure take precedence over speculative logos or text in the image. All earlier truthfulness, performance, and project-evidence constraints in [PROPOSAL.md](PROPOSAL.md) still apply.

The photo edit and boards were made using the built-in image generation tool. Exact prompts: [photo edit](portrait-edit-prompt.txt), [portrait scene](portrait-scene-prompt.txt), [full page](full-page-portrait-prompt.txt), [component states](components-motion-prompt.txt).

Approval now covers the prominent portrait chapter, ten-chapter sequence, and these proposed interactions. No website code was changed in this revision.
