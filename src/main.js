const { app, BrowserWindow, ipcMain, Menu, dialog, clipboard } = require('electron');
const path = require('path');
const fs = require('fs');
const StorageService = require('./storage');

let mainWindow = null;
const storage = new StorageService();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  createApplicationMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createApplicationMenu() {
  const isMac = process.platform === 'darwin';

  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Record',
          accelerator: 'CmdOrCtrl+N',
          click: () => mainWindow?.webContents.send('menu:trigger', 'new-record')
        },
        {
          label: 'New Review Set...',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => mainWindow?.webContents.send('menu:trigger', 'new-set')
        },
        { type: 'separator' },
        {
          label: 'Export Active Set...',
          accelerator: 'CmdOrCtrl+Shift+E',
          click: () => mainWindow?.webContents.send('menu:trigger', 'export-set')
        },
        {
          label: 'Reveal in Finder',
          click: () => mainWindow?.webContents.send('menu:trigger', 'reveal-finder')
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'Record',
      submenu: [
        {
          label: 'Full Review Mode',
          accelerator: 'CmdOrCtrl+Return',
          click: () => mainWindow?.webContents.send('menu:trigger', 'full-review')
        },
        {
          label: 'Edit Record',
          accelerator: 'CmdOrCtrl+E',
          click: () => mainWindow?.webContents.send('menu:trigger', 'edit-record')
        },
        {
          label: 'Delete Record',
          accelerator: 'CmdOrCtrl+Backspace',
          click: () => mainWindow?.webContents.send('menu:trigger', 'delete-record')
        },
        { type: 'separator' },
        {
          label: 'Find / Filter',
          accelerator: 'CmdOrCtrl+F',
          click: () => mainWindow?.webContents.send('menu:trigger', 'find-record')
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      role: 'window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' }
        ] : [])
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Setup IPC Handlers
ipcMain.handle('storage:loadAllSets', () => {
  return storage.loadAllSets();
});

ipcMain.handle('storage:saveSet', (event, setData) => {
  return storage.saveSet(setData);
});

ipcMain.handle('storage:deleteSet', (event, setData) => {
  return storage.deleteSet(setData);
});

ipcMain.handle('storage:renameSet', (event, setData, newName) => {
  return storage.renameSet(setData, newName);
});

ipcMain.handle('storage:saveImage', (event, folderName, bufferArray, extension) => {
  const buffer = Buffer.from(bufferArray);
  return storage.saveImage(folderName, buffer, extension);
});

ipcMain.handle('storage:deleteImage', (event, folderName, fileName) => {
  storage.deleteImage(folderName, fileName);
  return true;
});

ipcMain.handle('storage:getImageDataUrl', (event, folderName, fileName) => {
  return storage.getImageDataUrl(folderName, fileName);
});

ipcMain.handle('storage:loadSettings', () => {
  return storage.loadSettings();
});

ipcMain.handle('storage:saveSettings', (event, settings) => {
  storage.saveSettings(settings);
  return true;
});

ipcMain.handle('finder:revealSet', (event, folderName) => {
  storage.revealSetInFinder(folderName);
  return true;
});

ipcMain.handle('finder:revealRoot', () => {
  storage.revealRootInFinder();
  return true;
});

ipcMain.handle('finder:exportSet', async (event, setData) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: `Select Export Destination for "${setData.name}"`,
    buttonLabel: 'Export Here',
    properties: ['openDirectory', 'createDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const targetDir = result.filePaths[0];
    const exportedPath = await storage.exportSet(setData, targetDir);
    return { success: true, path: exportedPath };
  }
  return { success: false };
});

ipcMain.handle('dialog:openImageFile', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Image File',
    filters: [
      { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'heic', 'tiff'] }
    ],
    properties: ['openFile']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    const buffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).replace('.', '').toLowerCase() || 'png';
    return {
      dataUrl: `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${buffer.toString('base64')}`,
      buffer: Array.from(buffer),
      extension: ext
    };
  }
  return null;
});

ipcMain.handle('clipboard:readImage', () => {
  const nativeImg = clipboard.readImage();
  if (!nativeImg.isEmpty()) {
    const pngBuffer = nativeImg.toPNG();
    return {
      dataUrl: nativeImg.toDataURL(),
      buffer: Array.from(pngBuffer),
      extension: 'png'
    };
  }
  return null;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
