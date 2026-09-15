# Quick Review - Mac Desktop App

A fast, distraction-free macOS desktop app for creating, organizing, reviewing, and editing record sets with rich descriptions, clipboard image pasting, automatic Finder-accessible persistence, and complete keyboard navigation.

---

## 🚀 Getting Started

### Launching the Application
You can launch the app in either of two ways:

1. **Directly from Finder (Double-Click)**:
   - Open this folder in Finder (`/Users/davidjohnson/Downloads/Quick-Review/`)
   - Double-click **`Quick Review.app`**
   - *(Optional: You can also drag `Quick Review.app` into your Mac's `/Applications` folder or Dock!)*

2. **From the Terminal**:
   ```bash
   npm start
   ```

### Running the Test Suite
```bash
npm test
```

---

## ✨ Refined Features & UX

### 1. Swapped Order & Compact Image Box
- **Order**: **Title** → **Description & Notes** → **Attached Image** → **Tags** → **Timestamps** (bottom).
- **Compact Placeholder**: When no image is attached, only a small, subtle placeholder box is shown instead of taking up valuable space.

### 2. Full Review Mode (Where Photos Are Added & Managed)
- **Direct Live Editing**: Edit Title, Description, and Tags right inside Full Review with real-time auto-saving.
- **Add / Paste Photos**: Press `⌘V`, drag & drop, or click "Browse..." directly in Full Review to add photos to any record.
- **Top Navigation Arrows**: Fast switching between records with `← Previous` and `Next →` buttons placed at the top bar beside the record counter.
- **Delete with Confirmation**: Trash button in the top bar of Full Review mode.
- **Zoom Image**: Press `Z` or `Space` (or click on the image) to open a full-screen lightbox zoom.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Context | Action |
| :--- | :--- | :--- |
| `↑` / `↓` or `K` / `J` | List View | **Navigate records up/down** |
| `Space` or `Z` | List View | **Enlarge / Zoom attached picture** |
| `Enter` or `⌘E` | List View | **Jump into live Title & Description editor** |
| `⌘Return` | Anywhere | **Launch Full Review Mode** |
| `→` / `Space` / `J` | Full Review | **Next record** |
| `←` / `K` | Full Review | **Previous record** |
| `Z` | Full Review | **Zoom image** |
| `Esc` | Full Review / Modals | **Exit full review / close modal / close zoom** |
| `⌘N` | Anywhere | **Quick Add Record** |
| `⇧Enter` | Quick Add Modal | **Save & Add Next** (rapid batch creation) |
| `⌘Enter` | Quick Add Modal | **Save & Close** |
| `⌘V` | Anywhere | **Paste Image** from clipboard |
| `⌘Delete` | List View | **Delete selected record** |
| `⌘F` | Anywhere | **Focus Search field** |
| `⌘⇧N` | Anywhere | **Create New Review Set** |
| `⌘⇧E` | Anywhere | **Export Active Review Set** |

---

## 📂 Project Organization

```
Quick-Review/
├── DECISIONS.md              # Requirement decisions & architecture history
├── README.md                 # Documentation & shortcuts guide
├── package.json              # App configuration & scripts
├── src/
│   ├── main.js               # Electron main process & macOS menus
│   ├── preload.js            # Secure IPC bridge
│   ├── storage.js            # Finder filesystem persistence & export service
│   └── renderer/
│       ├── index.html        # App structure & full review overlay
│       ├── styles.css        # Native macOS styling & themes
│       └── app.js            # Reactive application coordinator & event handlers
└── tests/
    └── storage.test.js       # Automated test suite
```
