const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  'electron',
  {
    toggleClickThrough: () => ipcRenderer.send('toggle-click-through'),
    saveWindowPosition: (x, y) => ipcRenderer.send('save-window-position', { x, y }),
    platform: process.platform,
    isClickThrough: () => ipcRenderer.invoke('get-click-through-state'),
    quit: () => ipcRenderer.send('quit-app'),
    getBtcPrice: () => ipcRenderer.invoke('get-btc-price'),
    closeApp: () => ipcRenderer.send('close-app'),
  }
); 