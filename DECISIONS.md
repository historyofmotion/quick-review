# Quick Review - Project Requirements & Decisions

This document tracks all project requirements, architectural decisions, design choices, and user preferences for the **Quick Review** macOS desktop application.

---

## 1. Core Requirements

1. **Automatic Persistence**:
   - All changes save automatically in real-time (no manual "Save" button required).
   - Data is stored in a clean, human-readable directory in the user's Finder: `~/Documents/Quick Review/Sets/<Set Name>/`.
   - Images and records persist reliably across application launches and restarts.

2. **Sets / Collections Management**:
   - Users can create, rename, duplicate, and delete Review Sets.
   - When viewing a set, only the selected set is "active" and searchable.
   - Built-in Export feature: easily export/copy out records, images, or JSON for backup and sharing.

3. **Record / Item Details**:
   - Fields per record:
     - **Title / Name** (required)
     - **Description / Notes** (multiline text)
     - **Tags** (optional tags array for fast filtering and categorization)
     - **Image** (optional single image; supports direct clipboard paste `Cmd+V`, drag-and-drop, or file picker)
     - **Date Created** (`createdAt` timestamp)
     - **Date Last Modified** (`modifiedAt` timestamp, automatically updated on edits)

4. **Viewing & Navigation Modes**:
   - **List / Split View**:
     - Sidebar for Review Sets.
     - List of records displaying **Title** and **Description** (clean, uncluttered view).
     - Detail/Inspector pane displaying the full record with image, tags, and metadata.
   - **Full View / Focus Review Mode**:
     - Expansive, distraction-free view showing **everything** simultaneously: high-resolution image, title, full description, tags, and timestamps.
     - Smooth keyboard navigation between records:
       - `Left Arrow` / `K`: Previous record
       - `Right Arrow` / `J` / `Space`: Next record
       - `Esc`: Exit full view back to list

5. **Sorting & Search**:
   - **Sorting**:
     - By Entry / Insertion Order (original sequence)
     - By Date Created (Newest / Oldest)
     - By Date Modified (Recently edited)
     - By Name / Alphabetical
   - **Search & Filter**:
     - Scope: Active review set only.
     - Search by keyword / text in title & description.
     - Filter by selected Tag(s).

6. **Quick Add & Fluid Editing**:
   - Fast workflow for adding new items: `Cmd+N` opens quick-entry sheet/modal auto-focused on Title with immediate `Cmd+V` image paste and `Shift+Enter` (Save & Add Next) support.
   - Direct inline editing and modal editing options.

7. **Keyboard Navigation & Mac Integration**:
   - Complete keyboard shortcuts: `Cmd+N` (New Record), `Cmd+Shift+N` (New Set), `Cmd+F` (Search), `Left`/`Right` arrows (Navigate), `Cmd+E` (Edit), `Cmd+Delete` (Delete), `Cmd+Return` (Full Review Mode), `Esc` (Exit Full View).
   - Native macOS menus, Dark/Light appearance, smooth native animations.

---

## 2. Technical Stack & Architecture

- **Platform**: macOS (Apple Silicon & Intel)
- **Framework**: **Electron Desktop Application** with modern web frontend (Vanilla JS / CSS3 / HTML5 with macOS design system)
- **Local Storage Architecture**:
  ```
  ~/Documents/Quick Review/
  ├── Sets/
  │   └── <Set Name>/
  │       ├── set.json          # Set metadata & ordered record list
  │       └── images/           # Stored PNG/JPEG image files
  └── settings.json             # App preferences & last opened set
  ```
- **Finder Integration**: Direct file system reads/writes via Node `fs/promises`, `shell.showItemInFolder()`, `shell.openPath()`.
- **Image Handling**: Native clipboard paste (`Cmd+V` & `navigator.clipboard`), drag & drop, file picker, saved as PNG in the set's `images/` folder.

---

## 3. Decision History

- **2026-09-14**:
  - Confirmed storage location in `~/Documents/Quick Review/Sets/`.
  - Confirmed single image per record with clipboard paste support.
  - Confirmed list view begins with Title + Description only.
  - Confirmed full details view displays all information (Title, Description, Image, Tags, Timestamps).
  - Confirmed sorting by entry order, date created, date modified, and tags.
  - Confirmed scoped search within the active set by text and tags.
  - Confirmed record/set export functionality.
  - Confirmed Electron runtime for complete standalone macOS compatibility.
  - Built standalone native macOS `Quick Review.app` bundle in project root for direct Finder double-click launch.
  - **UX Refinements**:
    1. **Layout**: Collapsed permanent Sets sidebar into a clean Set Switcher dropdown in the top bar / menu to maximize screen real estate.
    2. **Data-Dense List**: Records list displays Title only for maximum density and fast scanning. Removed redundant "+ Add" button from the list header.
    3. **Instant Live Editing**: Detail view is directly editable inline with instant auto-save (no modal required to edit).
    4. **Field Hierarchy**: Title -> Attached Image -> Description -> Tags -> Timestamps (created/modified moved to bottom).
    5. **List Keyboard Navigation**: Full keyboard navigation in list (Up/Down arrows, `⌘E` / `Enter` to focus editor, `Space` / `Z` to zoom image, `⌘Return` for full review).
    6. **Batch Quick-Add Clarity**: Explicit keyboard badges displayed on modal (`⇧Enter` for Save & Add Next, `⌘Return` for Save & Close).
    7. **Field Order Swap**: Description is placed above the Image. (Title -> Description -> Image -> Tags -> Timestamps).
    8. **Full Review Capabilities**:
       - Live editable Title & Description right inside Full Review mode.
       - Add/Paste photos directly in Full Review (`⌘V`, Drag & Drop, Browse).
       - Top navigation arrows (`←` / `→`) and record counter in top bar.
       - Delete record with confirmation in Full Review.
       - Zoom image (`Z` / Click).
       - Small compact box when no image is present.
    9. **Day-Based Short Unique IDs (`AA999`)**:
       - IDs follow the format **`AA999`** (2 letters + 3 zero-padded digits, e.g. `AA001`, `AA002`, `AB001`).
       - The 2 letters (`AA`, `AB`, `AC`, ...) are unique to each calendar day and assigned sequentially starting from the first created date.
       - The 3 digits (`001`, `002`, ...) autoincrement with leading zeros for each record created on that day.
       - Displayed subtly in the dense list, detail header, and full review header with click-to-copy.
       - Full search filtering support by `#AA001` or `AA001`.
    10. **GitHub Repository**:
       - Repository configured and pushed to `https://github.com/historyofmotion/quick-review`.
    11. **Application Icon**:
       - Custom microscope macOS icon generated and embedded into `assets/icon.icns` and `assets/icon.png`.
       - Packaged into `Quick Review.app` bundle and macOS dock.
