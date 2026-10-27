# Story Feature

A compact, Instagram-style stories feed built with Next.js and React. Browse sample story groups, add an image story from your device, and view stories in a timed full-screen viewer.

## Features

- Shows story groups with a gradient ring for stories that have not been viewed and a gray ring for viewed stories.
- Lets you add an image story using the file picker. Images are resized to fit within 1080 × 1920 pixels, converted to JPEG, and saved in the browser.
- Opens stories in a full-screen viewer with progress indicators. Stories advance automatically after five seconds; click the left or right half to go back or forward.
- Marks a group's stories as viewed when you open it.
- Keeps story data in browser `localStorage` under `client_stories` and filters out stories older than 24 hours when the app loads.
- Starts with a sample story group if the browser has no saved story data.

This is a front-end demonstration: stories are stored only in the current browser and are not shared with other users or synchronized to a server. The initial sample media and avatars use remote image URLs.

## Tech stack

- Next.js 16 (App Router)
- React 19 and TypeScript
- Tailwind CSS 4

## Getting started

Install the dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project layout

```text
app/
  components/
    StoryViewer.tsx   Full-screen story viewer and playback controls
  lib/
    imageUtils.tsx    Image resizing and JPEG conversion
    types.tsx         Story and user story group types
  globals.css         Global styles and Tailwind import
  layout.tsx          Root layout and page metadata
  page.tsx             Story feed, uploads, and local persistence
public/                Static assets
```

## Data and limitations

There is no API, database, authentication, or cross-device persistence. Uploaded images are stored as data URLs in `localStorage`, so browser storage limits apply. Removing this site's browser data clears locally saved stories. Expiration is applied when the page initializes; the app does not run a background cleanup timer.
