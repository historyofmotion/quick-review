const fs = require('fs');
const path = require('path');
const os = require('os');
const { shell, dialog } = require('electron');

class StorageService {
  constructor(customRootDir = null) {
    const homeDir = os.homedir();
    const documentsDir = path.join(homeDir, 'Documents');
    this.rootDir = customRootDir || path.join(documentsDir, 'Quick Review');
    this.setsDir = path.join(this.rootDir, 'Sets');
    this.settingsFile = path.join(this.rootDir, 'settings.json');

    this.ensureDirectoryStructure();
  }

  ensureDirectoryStructure() {
    try {
      if (!fs.existsSync(this.setsDir)) {
        fs.mkdirSync(this.setsDir, { recursive: true });
      }
    } catch (err) {
      console.error('Failed to create storage directories:', err);
    }
  }

  sanitizeFolderName(name) {
    const sanitized = name.replace(/[\\/:*?"<>|]/g, '_').trim();
    return sanitized || `Set_${Date.now()}`;
  }

  getSetDirectory(folderName) {
    return path.join(this.setsDir, folderName);
  }

  getSetImagesDirectory(folderName) {
    return path.join(this.getSetDirectory(folderName), 'images');
  }

  getLocalDateKey(dateInput) {
    const d = new Date(dateInput || Date.now());
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  indexToLetterCode(idx) {
    const first = String.fromCharCode(65 + Math.floor(idx / 26) % 26);
    const second = String.fromCharCode(65 + (idx % 26));
    return `${first}${second}`;
  }

  getDayLetterCode(dateKey, settings) {
    settings.dateMap = settings.dateMap || {};
    if (settings.dateMap[dateKey]) {
      return settings.dateMap[dateKey];
    }
    const existingCount = Object.keys(settings.dateMap).length;
    const newCode = this.indexToLetterCode(existingCount);
    settings.dateMap[dateKey] = newCode;
    this.saveSettings(settings);
    return newCode;
  }

  generateDayBasedId(dateInput = new Date(), allSets = []) {
    const settings = this.loadSettings();
    const dateKey = this.getLocalDateKey(dateInput);
    const dayCode = this.getDayLetterCode(dateKey, settings);

    let maxSeq = 0;
    const regex = new RegExp(`^${dayCode}(\\d{3})$`);

    for (const set of allSets) {
      if (Array.isArray(set.records)) {
        for (const record of set.records) {
          if (record.shortId) {
            const match = record.shortId.match(regex);
            if (match) {
              const seqNum = parseInt(match[1], 10);
              if (seqNum > maxSeq) {
                maxSeq = seqNum;
              }
            }
          }
        }
      }
    }

    const nextSeq = maxSeq + 1;
    const formattedSeq = String(nextSeq).padStart(3, '0');
    return `${dayCode}${formattedSeq}`;
  }

  loadAllSets() {
    this.ensureDirectoryStructure();
    const sets = [];
    const settings = this.loadSettings();

    try {
      const entries = fs.readdirSync(this.setsDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const setJsonPath = path.join(this.setsDir, entry.name, 'set.json');
          if (fs.existsSync(setJsonPath)) {
            try {
              const content = fs.readFileSync(setJsonPath, 'utf8');
              const setData = JSON.parse(content);
              setData.folderName = entry.name;
              sets.push(setData);
            } catch (err) {
              console.error(`Error reading set at ${setJsonPath}:`, err);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error reading sets directory:', err);
    }

    if (sets.length === 0) {
      const defaultSet = this.createDefaultSet();
      this.saveSet(defaultSet);
      sets.push(defaultSet);
    }

    // Ensure all records have standard AA999 shortId
    const idPattern = /^[A-Z]{2}\d{3}$/;
    let anyUpdated = false;

    // Collect all records across all sets sorted by createdAt
    const allRecordsWithSet = [];
    sets.forEach(set => {
      if (Array.isArray(set.records)) {
        set.records.forEach(rec => {
          allRecordsWithSet.push({ record: rec, set });
        });
      }
    });

    allRecordsWithSet.sort((a, b) => new Date(a.record.createdAt) - new Date(b.record.createdAt));

    allRecordsWithSet.forEach(({ record, set }) => {
      if (!record.shortId || !idPattern.test(record.shortId)) {
        record.shortId = this.generateDayBasedId(record.createdAt, sets);
        anyUpdated = true;
      }
    });

    if (anyUpdated) {
      sets.forEach(set => this.saveSet(set));
    }

    // Sort sets by creation date
    return sets.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  saveSet(setData) {
    try {
      const setDir = this.getSetDirectory(setData.folderName);
      const imagesDir = this.getSetImagesDirectory(setData.folderName);

      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const setJsonPath = path.join(setDir, 'set.json');
      fs.writeFileSync(setJsonPath, JSON.stringify(setData, null, 2), 'utf8');
      return true;
    } catch (err) {
      console.error(`Error saving set ${setData.name}:`, err);
      throw err;
    }
  }

  deleteSet(setData) {
    try {
      const setDir = this.getSetDirectory(setData.folderName);
      if (fs.existsSync(setDir)) {
        fs.rmSync(setDir, { recursive: true, force: true });
      }
      return true;
    } catch (err) {
      console.error(`Error deleting set ${setData.name}:`, err);
      throw err;
    }
  }

  renameSet(setData, newName) {
    try {
      const oldDir = this.getSetDirectory(setData.folderName);
      const newFolderName = this.sanitizeFolderName(newName);
      const newDir = this.getSetDirectory(newFolderName);

      if (oldDir !== newDir && fs.existsSync(oldDir)) {
        fs.renameSync(oldDir, newDir);
      }

      setData.name = newName;
      setData.folderName = newFolderName;
      setData.modifiedAt = new Date().toISOString();
      this.saveSet(setData);
      return setData;
    } catch (err) {
      console.error('Error renaming set folder:', err);
      throw err;
    }
  }

  saveImage(folderName, imageBuffer, extension = 'png') {
    try {
      const imagesDir = this.getSetImagesDirectory(folderName);
      if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir, { recursive: true });
      }

      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${extension}`;
      const filePath = path.join(imagesDir, fileName);
      fs.writeFileSync(filePath, imageBuffer);
      return fileName;
    } catch (err) {
      console.error('Error saving image:', err);
      throw err;
    }
  }

  deleteImage(folderName, fileName) {
    try {
      if (!fileName) return;
      const filePath = path.join(this.getSetImagesDirectory(folderName), fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  }

  getImageDataUrl(folderName, fileName) {
    try {
      if (!fileName) return null;
      const filePath = path.join(this.getSetImagesDirectory(folderName), fileName);
      if (!fs.existsSync(filePath)) return null;

      const ext = path.extname(fileName).toLowerCase().replace('.', '') || 'png';
      const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;
      const data = fs.readFileSync(filePath);
      return `data:${mimeType};base64,${data.toString('base64')}`;
    } catch (err) {
      console.error('Error reading image for data URL:', err);
      return null;
    }
  }

  loadSettings() {
    try {
      if (fs.existsSync(this.settingsFile)) {
        return JSON.parse(fs.readFileSync(this.settingsFile, 'utf8'));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
    return {
      lastSelectedSetId: null,
      sortOption: 'entryOrder'
    };
  }

  saveSettings(settings) {
    try {
      fs.writeFileSync(this.settingsFile, JSON.stringify(settings, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  }

  revealSetInFinder(folderName) {
    const dir = this.getSetDirectory(folderName);
    if (fs.existsSync(dir)) {
      shell.openPath(dir);
    }
  }

  revealRootInFinder() {
    if (fs.existsSync(this.rootDir)) {
      shell.openPath(this.rootDir);
    }
  }

  async exportSet(setData, targetDir) {
    const exportFolder = path.join(targetDir, setData.name);
    if (!fs.existsSync(exportFolder)) {
      fs.mkdirSync(exportFolder, { recursive: true });
    }

    // 1. Write Markdown summary
    const mdContent = this.generateMarkdown(setData);
    fs.writeFileSync(path.join(exportFolder, `${setData.name}.md`), mdContent, 'utf8');

    // 2. Write JSON data
    fs.writeFileSync(path.join(exportFolder, 'set.json'), JSON.stringify(setData, null, 2), 'utf8');

    // 3. Copy Images
    const srcImages = this.getSetImagesDirectory(setData.folderName);
    const dstImages = path.join(exportFolder, 'images');

    if (fs.existsSync(srcImages)) {
      if (!fs.existsSync(dstImages)) {
        fs.mkdirSync(dstImages, { recursive: true });
      }

      for (const record of setData.records) {
        if (record.imageFileName) {
          const srcFile = path.join(srcImages, record.imageFileName);
          const dstFile = path.join(dstImages, record.imageFileName);
          if (fs.existsSync(srcFile)) {
            fs.copyFileSync(srcFile, dstFile);
          }
        }
      }
    }

    return exportFolder;
  }

  generateMarkdown(setData) {
    const lines = [];
    lines.push(`# ${setData.name}`);
    lines.push('');
    lines.push(`**Created**: ${new Date(setData.createdAt).toLocaleString()} | **Modified**: ${new Date(setData.modifiedAt).toLocaleString()}`);
    lines.push(`**Total Records**: ${setData.records.length}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    setData.records.forEach((record, idx) => {
      const idTag = record.shortId ? `[#${record.shortId}] ` : '';
      lines.push(`## ${idx + 1}. ${idTag}${record.title}`);
      if (record.tags && record.tags.length > 0) {
        lines.push(`**Tags**: ${record.tags.map(t => `\`${t}\``).join(', ')}`);
        lines.push('');
      }
      lines.push(`*Created: ${new Date(record.createdAt).toLocaleString()} | Modified: ${new Date(record.modifiedAt).toLocaleString()}*`);
      lines.push('');

      if (record.imageFileName) {
        lines.push(`![${record.title}](images/${record.imageFileName})`);
        lines.push('');
      }

      if (record.description) {
        lines.push(record.description);
        lines.push('');
      }

      lines.push('---');
      lines.push('');
    });

    return lines.join('\n');
  }

  createDefaultSet() {
    const now = new Date().toISOString();
    return {
      id: 'default-getting-started',
      name: 'Getting Started',
      folderName: 'Getting Started',
      createdAt: now,
      modifiedAt: now,
      records: [
        {
          id: 'rec-1',
          shortId: 'AA001',
          title: 'Welcome to Quick Review',
          description: 'Quick Review is your fast, distraction-free desktop app for creating, organizing, and reviewing sets of records.\n\n• Use ⌘N to quickly add new records\n• Paste images directly from your clipboard with ⌘V\n• Press ⌘Return or click "Full Review" to enter focus review mode\n• Navigate seamlessly using Left/Right arrow keys or J/K\n• Everything is automatically saved to ~/Documents/Quick Review/',
          tags: ['Tutorial', 'Getting Started'],
          imageFileName: null,
          createdAt: now,
          modifiedAt: now,
          sortOrder: 0
        },
        {
          id: 'rec-2',
          shortId: 'AA002',
          title: 'Keyboard Shortcuts Guide',
          description: 'Speed up your workflow with native macOS keyboard shortcuts:\n\n• ⌘N: Add New Record\n• ⌘⇧N: Create New Review Set\n• ⌘F: Search & Filter current set\n• ⌘Return: Enter Full Review Mode\n• Left/Right Arrows or J/K: Navigate records in full review\n• Esc: Exit full review mode\n• ⌘E: Edit selected record\n• ⌘Delete: Delete selected record\n• ⌘⇧E: Export active review set',
          tags: ['Shortcuts', 'Tips'],
          imageFileName: null,
          createdAt: now,
          modifiedAt: now,
          sortOrder: 1
        },
        {
          id: 'rec-3',
          shortId: 'AA003',
          title: 'Finder-Accessible & Auto-Saved',
          description: 'All your data is stored in human-readable JSON files and standard image files in:\n~/Documents/Quick Review/Sets/\n\nYou can inspect, copy, or back up your sets directly through Finder anytime!',
          tags: ['Storage', 'Finder'],
          imageFileName: null,
          createdAt: now,
          modifiedAt: now,
          sortOrder: 2
        }
      ]
    };
  }
}

module.exports = StorageService;
