const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Storage & Sets
  loadAllSets: () => ipcRenderer.invoke('storage:loadAllSets'),
  saveSet: (setData) => ipcRenderer.invoke('storage:saveSet', setData),
  deleteSet: (setData) => ipcRenderer.invoke('storage:deleteSet', setData),
  renameSet: (setData, newName) => ipcRenderer.invoke('storage:renameSet', setData, newName),

  // Images
  saveImage: (folderName, bufferArray, extension) => ipcRenderer.invoke('storage:saveImage', folderName, bufferArray, extension),
  deleteImage: (folderName, fileName) => ipcRenderer.invoke('storage:deleteImage', folderName, fileName),
  getImageDataUrl: (folderName, fileName) => ipcRenderer.invoke('storage:getImageDataUrl', folderName, fileName),

  // Settings
  loadSettings: () => ipcRenderer.invoke('storage:loadSettings'),
  saveSettings: (settings) => ipcRenderer.invoke('storage:saveSettings', settings),

  // Finder & Dialogs
  revealSetInFinder: (folderName) => ipcRenderer.invoke('finder:revealSet', folderName),
  revealRootInFinder: () => ipcRenderer.invoke('finder:revealRoot'),
  exportSetDialog: (setData) => ipcRenderer.invoke('finder:exportSet', setData),
  openImageFileDialog: () => ipcRenderer.invoke('dialog:openImageFile'),

  // Clipboard
  readClipboardImage: () => ipcRenderer.invoke('clipboard:readImage'),

  // Menu Event Listeners
  onMenuTrigger: (callback) => {
    const handler = (event, action) => callback(action);
    ipcRenderer.on('menu:trigger', handler);
    return () => ipcRenderer.removeListener('menu:trigger', handler);
  }
});
