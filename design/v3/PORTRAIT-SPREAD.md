# Portrait spread proposal

Status: awaiting the user's design approval. This supersedes the blended portrait direction only if approved. No production website files changed.

## Purpose and visual direction

Help founders and freelance clients meet Amey as the person responsible for interfaces, systems and applied AI. The portrait is a clearly bounded editorial photograph, separate from the porcelain page. The existing proposed porcelain, oxblood, graphite and ice-blue palette continues.

- [Desktop, mobile and motion board](07-portrait-spread-proposal.png): static visual proposal, not implemented motion.
- [Studio portrait](amey-portrait-studio-v3.png): AI edit based on the original blue-shirt photo; charcoal overshirt and neutral studio backdrop. Facial likeness requires Amey's review. Original photo remains intact.
- Typography, rectangular mount, registration marks, caption, connecting line and all motion are live code in implementation. Do not ship the board as a website section.

## Reference study

- [Dennis Snellenberg — About](https://dennissnellenberg.com/about): inspected the live page in Chrome. Large rectangular photography, generous spacing and direct personal copy inform the choice to give the portrait its own clear photographic boundary.
- [Niccolo Miranda — About](https://www.niccolomiranda.com/about) and [Awwwards editorial case study](https://assets.awwwards.com/awards/gallery/2023/07/HOT-RIGHT-NOW-BOOK-2023.pdf): typography and editorial hierarchy inform the oversized name and varied type scale. Live page content was inspected; visual inspection was limited by the site's orientation notice. This is an interpretation of editorial principles, not a reproduction of that site.

## Proposed choreography

1. Arrive: the oxblood mount offsets by 16–24px while the portrait rises by at most 20px. No face masking or deformation. The photograph itself remains visible before enhancement.
2. Align: headline lines settle with 60ms stagger over roughly 550ms; the photo eases from scale 1.025 to 1. The caption arrives after the frame settles. One entrance sequence, no endless loop.
3. Continue: a thin SVG connection draws toward the next engineering-story chapter as the visitor scrolls. It represents the transition from person to approach.
4. Pointer: only the mount and registration marks respond, up to 6px. Keep the image stable so the face stays easy to view. No cursor replacement or fake draggable affordance.

Use Motion for React for local frame response and GSAP only for the coordinated scroll sequence, with separate property ownership. No Three.js needed for this portrait section. Pause off-screen work. Native scroll remains available.

## Responsive and accessibility behavior

Desktop uses headline/bio on the left and a large portrait on the right. Mobile stacks heading, portrait, caption, bio and work link; no fixed-height viewport, rotation lock or horizontal scrolling. Keep the full hair and face visible, preserve an explicit aspect ratio, reserve layout dimensions and use responsive photo sizes. Reduced motion displays the settled composition without parallax. Work link is an ordinary keyboard-accessible anchor with visible focus.

The full-sized name is decorative repetition and should be aria-hidden. The generated board has small text and may differ from final font metrics; production must use the supplied profile title, readable mobile text, and the actual photograph file without regenerating the face. Experience and Stack remain outside this revision.

## Asset provenance

Both assets were created with the built-in image-generation tool. Exact prompts: [portrait](portrait-studio-v3-prompt.txt), [page board](portrait-spread-prompt.txt). Source: `photos mine/WhatsApp Image 2026-10-09 at 11.21.53 PM.jpeg`. No source photo was overwritten. This proposal has not been published or pushed to GitHub.
