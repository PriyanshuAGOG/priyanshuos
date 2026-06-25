# Priyanshu OS

Interactive React portfolio website for Priyanshu Agarwal.

## Project structure

```text
.
├── index.html                  # Vite document shell and React root
├── package.json                # React/Vite scripts and dependencies
├── public/
│   └── assets/videos/          # Static mascot gesture clips served at /assets/videos/*
├── src/
│   ├── main.jsx                # React entry point
│   ├── App.jsx                 # Application composition and legacy effects bootstrap
│   ├── components/
│   │   ├── chrome/             # Persistent UI: boot chrome, dock, overlays
│   │   ├── sections/           # Page sections: hero, work, story, lab, contact, etc.
│   │   └── RawHtml.jsx         # Transitional wrapper for static section markup
│   ├── legacy/main.js          # Existing interaction/rendering engine now loaded by React
│   ├── mascot/                 # Mascot engine and voice/choreography layer
│   └── styles/                 # Main site and mascot styles imported by React
└── README.md
```

## Run locally

Install dependencies once:

```bash
npm install
```

Start the React/Vite dev server:

```bash
npm run dev -- --port 4173
```

Then visit `http://127.0.0.1:4173/`.

## Build

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview -- --port 4173
```

## Deploy

This repo is ready for Vercel, Netlify, or any static host that supports Vite builds. Use `npm run build` and deploy the `dist/` output.
