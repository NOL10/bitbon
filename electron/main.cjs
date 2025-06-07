const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 340,
    height: 520,
    frame: false, // Frameless for widget look
    // alwaysOnTop: true, // Removed: allow window to go behind others
    // resizable: false, // Removed: allow resizing
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Load the React app (assumes production build in client/dist)
  win.loadFile(path.join(__dirname, '../client/dist/index.html'));

  // Optional: Open DevTools in dev mode
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
}

const { ipcMain } = require('electron');

app.whenReady().then(createWindow);

ipcMain.on('close-app', () => {
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
