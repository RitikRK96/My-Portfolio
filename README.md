# 💼 Professional Developer Portfolio & Creative Writer's Studio

Welcome to my professional developer portfolio and digital playground! This project is a curated showcase of advanced frontend engineering, custom editor architecture, secure serverless APIs, and creative writing utility suites. 

It functions as both an interactive portfolio demonstrating my software development skills (featuring modern responsive layouts, animation workflows, and custom backend APIs) and a robust, production-grade **Writer's Studio and Digital Library** designed for novelists and content creators.

---

## 🎨 Creative Architecture & Portfolio Showcase

This application demonstrates professional engineering practices in building interactive web ecosystems:
1. **Custom Editor Architectures**: A fully custom Tiptap engine integrating complex paragraph-dimming focus states, page-break computation algorithms, and multi-unit canvas rulers.
2. **State & Sync Synchronization**: Real-time database synchronizations, autosaving debounces, local storage fallback systems, and dynamic state machines.
3. **Advanced Layout Engineering**: Immersive CSS styling including glassmorphism, responsive sidebars, smooth animations (Framer Motion + AOS), and dark/light/sepia contrast-aware themes.
4. **Serverless REST APIs**: Secured microservices deployed via Firebase Cloud Functions utilizing Express routing and custom claims middleware.

---

## 📂 Folder Structure

The project has a decoupled structure separating the client-side SPA (built with React, TypeScript, and Vite) from the serverless API backend (built with Express and Node.js on Firebase Cloud Functions).

### 🖥️ Frontend Structure (`/src`)
The client application is organized into modular page views, components, custom hooks, and route configurations:

```
src/
├── assets/             # Photography media, logos, and static graphics
├── components/         # Global shared React UI components
│   ├── admin/          # Management modules for portfolio databases
│   │   ├── AdminBlogs.tsx      # Admin console to publish and edit blog posts
│   │   ├── AdminContacts.tsx   # Dashboard panel to view user contact form submissions
│   │   ├── AdminPhotos.tsx     # Admin panel to manage photography gallery uploads
│   │   └── AdminProjects.tsx   # Catalog management dashboard for software projects
│   ├── ConfirmModal.tsx        # Standard reusable action confirmation dialog
│   ├── ContactSection.tsx      # Animated, interactive user contact form with validation
│   ├── FloatingAddButton.tsx   # Action trigger button for creating items
│   ├── Footer.tsx              # Application footer containing social media routes
│   ├── Navbar.tsx              # Glassmorphic responsive top navigation bar
│   └── ScrollToTop.tsx         # Utility that resets window scroll position on navigation
├── context/            # AuthContext providers managing Firebase Auth sessions
├── hooks/              # Custom React hooks (click-outside listeners, debounced inputs)
├── pages/              # Main route component views
│   ├── AdminDashboard.tsx      # Master dashboard panel containing system action logs
│   ├── BlogPost.tsx            # Full-page article reader with configuration sliders
│   ├── Blogs.tsx               # Grid of published blog articles with category filters
│   ├── BookDetail.tsx          # ADMIN: Novel workflow stats, outline tracker, and sortable chapters
│   ├── BookWriter.tsx          # ADMIN: Distraction-free typography writer, rulers, and Pomodoro timer
│   ├── BooksLibrary.tsx        # ADMIN: Books dashboard aggregating word counts and states
│   ├── Contact.tsx             # Dedicated contact form page
│   ├── Home.tsx                # Portfolio homepage showcasing animations, summary, and skills
│   ├── Login.tsx               # Security authentication gateway for admin workspace
│   ├── Photos.tsx              # High-performance responsive photography grid gallery
│   ├── Projects.tsx            # Grid of software engineering project cards
│   ├── PublicBookDetail.tsx    # Secure reading page with selection, copy, and print blocks
│   └── PublicBooks.tsx         # Digital bookshelf and catalogue for public visitors
├── App.tsx             # Core router defining path routes and auth wrappers
├── index.css           # Global CSS variables, custom styling layers, and animations
└── main.tsx            # Application bundle entry point and React root mounting
```

### ⚙️ Backend Structure (`/functions`)
The REST API backend runs on serverless Firebase Cloud Functions:

```
functions/
├── middleware/         # Security validation filters
│   └── auth.js         # JWT validation checking headers, query params, or cookies (checkAdminAuth)
├── routes/             # API routing sub-controllers
│   ├── blogs.js        # Blog writing, modifying, and retrieval handlers
│   ├── books.js        # Novel management, sorting, and authenticated manuscript exports
│   ├── contacts.js     # Form posting to Cloud Firestore with notifications
│   ├── photos.js       # Gallery asset indexation and indexing handlers
│   ├── projects.js     # Project entries REST handlers
│   └── songs.js        # Spotify/music integration handlers
├── index.js            # Main Express application bootstrap and export functions wrapper
└── package.json        # Node.js backend configuration and dependency manifest
```

---

## 🔒 Layered Security & Intellectual Property Protection

To safeguard original novels and digital manuscripts from unauthorized copy-pasting, piracy, and cloning, the platform implements a layered security model combining **aggressive client-side anti-theft blocks** with **token-authenticated backend microservices**.

> [!IMPORTANT]  
> All public-facing book reader layouts ([PublicBookDetail.tsx](src/pages/PublicBookDetail.tsx)) feature zero export options. Any print, capture, or download mechanism is blocked or secured using Firebase ID Tokens.

```
       [Public User Request]                 [Admin / Writer Request]
                 │                                      │
                 ▼                                      ▼
    ┌─────────────────────────┐            ┌─────────────────────────┐
    │  Public Reader Page     │            │  Writer Admin Canvas    │
    │  (Anti-Theft Active)    │            │  (Full Access Studio)   │
    └────────────┬────────────┘            └────────────┬────────────┘
                 │                                      │
 ┌───────────────┼───────────────┐                      │
 ▼               ▼               ▼                      ▼
Disable       Block       Blank Prints             Attach Token
Select     Ctrl+C/A/P/S    (@media print)      (?token=Firebase_JWT)
                 │                                      │
                 └───────────────┬──────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │  Backend API Guard    │
                     │  (checkAdminAuth)     │
                     └───────────┬───────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
            [Token Valid]               [Token Invalid]
            (Allow Export)             (403 Forbidden)
```

### 🛡️ Client-Side Content Protections
1.  **Selection Blocker (`CSS: user-select: none`)**: Standard text highlighting is completely disabled on reading pages, preventing cursor drags from selecting chapter text.
2.  **Context Menu Interceptor**: Right-clicking anywhere within the book canvas is intercepted and disabled, preventing browser tools or text-copy menu commands.
3.  **Keyboard Modifier Blocker**: Keypress listeners monitor modifier combos to prevent common shortcuts:
    *   **Copy & Select All**: Prevents `Ctrl+C` / `Cmd+C` and `Ctrl+A` / `Cmd+A`.
    *   **Save & Print**: Prevents `Ctrl+S` / `Cmd+S` and `Ctrl+P` / `Cmd+P`.
    *   **Developer Inspector**: Blocks `F12` and DevTools configurations (`Ctrl+Shift+I` / `Cmd+Opt+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C`).
    *   *Note: Attempts trigger immediate security toast alerts warning the reader.*
4.  **Print Empty-Out Query (`CSS: @media print`)**: Prevents printing pages or compiling "Save to PDF" documents in the browser. Injected media queries set the `body` container display to `none !important`, outputting blank pages.

### 🔑 Backend API Security (`functions/routes/books.js`)
*   **Authentication Middleware (`checkAdminAuth`)**: Backend microservices for file exports (HTML/PDF formats) are fully guarded. The middleware parses JWT tokens from:
    *   Authorization Bearer Headers (`Bearer <token>`)
    *   URL Query Parameters (`?token=<token>`)
    *   Browser Session Cookies
*   **Firebase Claims Verification**: The middleware validates tokens using the `admin.auth().verifyIdToken(token)` SDK. Only users with valid admin credentials are permitted to download book manuscripts. Public requests or invalid tokens receive a `403 Forbidden` response:
    ```json
    { "error": "Forbidden: Admin access required" }
    ```

---

## ⚡ Intelligent Autosave & Sync Engine

Writing flows require absolute reliability. The Writer's Studio utilizes an advanced double-layer background synchronization system to ensure draft text is never lost:

1.  **State Change Debouncing**: To avoid spamming Firestore with millions of database writes as you type, mutations in both [BookWriter.tsx](src/pages/BookWriter.tsx) (for chapter content) and [BookDetail.tsx](src/pages/BookDetail.tsx) (for master outlines) trigger a **1500ms debouncing timer**. The system waits until the author pauses typing before sending a single coalesced update.
2.  **Dual-Layer Local Backup**: Edits are immediately written to browser `localStorage` keys (`bw-book-<id>-outline`, `bw-bookmarks`, etc.) synchronously. If a network interruption occurs, the client retains the draft buffer, restoring the active workspace state seamlessly on the next session.
3.  **Atomic Document Updates**: Content changes are packed into HTTP `PUT` requests, hitting backend endpoints to update specific Firestore document fields (like `content`, `wordCount`, `updatedAt`, and `outline`) atomically, maintaining low network overhead.

---

## 🆕 Recent Codebase Enhancements & Portfolio Updates

To showcase professional debugging, layout tuning, and security engineering, the following modifications have been implemented in the codebase:

*   **🛡️ Secure Manuscript Export APIs**: Added an authorization validation middleware (`checkAdminAuth`) to backend routes. Requests to HTML/PDF chapter and book downloads are blocked unless authorized with a valid Firebase ID Token (read from authorization headers, cookies, or query parameters).
*   **📖 Proper Status Queries**: Updated database filtering from `done` to `published`, ensuring only chapters officially marked as published appear on the public reader feeds.
*   **🚫 Public Reader Anti-Copy Blocks**: Added absolute `user-select: none` rules, intercepted context-menus (right-click blocks), and intercepted modifier shortcut keys (Ctrl+C, Ctrl+A, Ctrl+S, F12 inspector keys) on public reading pages, warning users with security toasts.
*   **🎨 Dynamic Typography & Contrast Tuning**:
    *   Added **Times New Roman** to the font choice selections, dynamically applying style overrides on the text canvas.
    *   Implemented contrast-aware typography labels across dark, light, and sepia themes. In sepia mode, all menu links and control titles adapt to dark brown (`#5c4938`) for perfect accessibility.
*   **📍 Fixed Desktop Table of Contents Sidebar**: Replaced the sticky TOC container with a `fixed` layout, bypassing parent viewport bugs, and configured the text reading canvas with dynamic paddings (`lg:pl-72` when open, `lg:pl-0` when closed) using smooth Framer Motion-style transition timings.
*   **💾 Local Storage Reader Settings**: Reading preferences (font family, font scale, theme) are initialized from `localStorage` values and saved back to the browser on every change, ensuring settings are remembered on return visits.
*   **⏱️ Auto-Closing Dropdown Menus**: Configured click-outside listeners to automatically collapse active popovers when clicked off-target.

---

## 🛠️ Technology Stack & APIs

*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, AOS (Animate on Scroll).
*   **Database**: Cloud Firestore (Hierarchical layout: `books` -> `chapters` nested collections).
*   **Backend Functions**: Express routing hosted on Node.js Firebase Functions (`asia-south1`).
*   **Authentication**: Firebase Auth with JWT Claims Verification.

---

## 💻 Setup, Installation, & Deployment

### Prerequisite Environment Variables
Create a `.env` file at the project root to target your backend API base:
```env
VITE_API_URL=https://api-dp2f6yjbbq-el.a.run.app
```

### Installation
1. Install project dependencies:
   ```bash
   npm install
   ```
2. Install backend cloud functions dependencies:
   ```bash
   cd functions
   npm install
   cd ..
   ```

### Run Locally
Launch the local Vite React server:
```bash
npm run dev
```

### Deployment
To push updates to production:
*   **Backend APIs**: `firebase deploy --only functions`
*   **Frontend SPA**: `npm run build && firebase deploy --only hosting`
