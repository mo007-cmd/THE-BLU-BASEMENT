# THE BLU BASEMENT — React Website

A responsive, cinematic reading experience built with React, Vite, React Router, Framer Motion and Lucide icons. The eight chapter manuscripts you uploaded are included in `src/chapters.js`.

## Run in VS Code
1. Install Node.js 18+ (Node.js 20 LTS recommended).
2. Extract this ZIP and open the `the-blu-basement` folder in VS Code.
3. Open **Terminal → New Terminal**.
4. Run `npm install`
5. Run `npm run dev`
6. Open the localhost URL printed by Vite (usually `http://localhost:5173`).

## Production build
Run `npm run build`; output will be in `dist/`.

## Included
- Cinematic landing page and ENTER THE BASEMENT button
- Eight chapter archive and full chapter reading routes
- Reading progress stored in the browser
- Chapter dropdown, previous/next navigation and reader text-size controls
- Chapter-specific visual panels and responsive design
- Separate author page listing five previously published books

## Add media later
Put images and videos in `public/media/`. Visual panels are clearly marked placeholders. Replace sample image URLs and wire your chosen clips in `src/App.jsx` when your own scene assets are ready. Use only assets you own or have permission to publish.

## Chapter 3 title
The file is named `THE EDGE RIPS`, but its internal heading says `CHAPTER THREE - NOT BY BLOOD`. This build uses **Not by Blood**, following the document heading. Update `src/chapters.js` if you confirm a different final title.

Before publishing, preview all reading pages and verify final chapter formatting/title choices. The original story paragraphs are included after removing repeated document-level titles and decorative divider lines.
