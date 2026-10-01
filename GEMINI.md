# Quick Review - Workspace Guidelines

## Project Location & Permissions
- **Active Project Root**: `/Users/davidjohnson/Documents/Quick-Review`
- **File Access**: Always allow full read and write access to all files within this project directory.
- **Commands**: Run all development and build commands (`npm test`, `npm run build:app`, git commands) with working directory at `/Users/davidjohnson/Documents/Quick-Review`.

## Core Project Conventions
- **Data Persistence**: Human-readable JSON & attachments stored at `~/Documents/Quick Review/Sets/`.
- **Short ID Format**: Sequential day-based `AA999` codes (e.g. `AA001`, `AA002`, `AB001`).
- **Tag Conventions**: Tags are always stored, matched, sorted, and displayed in lowercase.
- **Testing**: Run `npm test` before committing changes.
