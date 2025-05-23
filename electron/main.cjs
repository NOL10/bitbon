const { app, BrowserWindow, screen, ipcMain, Menu, Tray } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const { setupAutoStart } = require('./auto-start.cjs');
const https = require('https');

let mainWindow = null;
let tray = null;
let isClickThrough = false;

// Create the application menu
const createMenu = () => {
  const template = [
    {
      label: 'Bitcoin Bonsai Widget',
      submenu: [
        {
          label: 'Toggle Click-Through',
          click: () => {
            isClickThrough = !isClickThrough;
            mainWindow.setIgnoreMouseEvents(isClickThrough, { forward: true });
          }
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

function createTray() {
  tray = new Tray(path.join(__dirname, '../public/icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Toggle Click-Through',
      click: () => {
        isClickThrough = !isClickThrough;
        mainWindow.setIgnoreMouseEvents(isClickThrough, { forward: true });
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ]);

  tray.setToolTip('Bitcoin Bonsai Widget');
  tray.setContextMenu(contextMenu);
}

function createWindow() {
  // Get the primary display's work area
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 330,
    height: 550,
    x: width - 350, // Position on the right side
    y: 20, // Position near the top
    frame: false, // Remove window frame
    transparent: true, // Make window transparent
    alwaysOnTop: true, // Keep window on top
    hasShadow: false, // Remove window shadow
    skipTaskbar: true, // Hide from taskbar
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5001');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../client/dist/index.html'));
  }

  // Make the window draggable
  mainWindow.setMovable(true);
  mainWindow.setResizable(false);

  // Remove menu bar
  mainWindow.setMenuBarVisibility(false);

  // Handle click-through mode
  ipcMain.on('toggle-click-through', () => {
    isClickThrough = !isClickThrough;
    mainWindow.setIgnoreMouseEvents(isClickThrough, { forward: true });
  });

  // Handle window position save
  ipcMain.on('save-window-position', (event, { x, y }) => {
    mainWindow.setPosition(x, y);
  });

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevent navigation
  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  // Prevent new window creation
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
}

// Handle app ready
app.whenReady().then(() => {
  createWindow();
  createMenu();
  createTray();
  setupAutoStart();
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Recreate window on macOS when dock icon is clicked
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

ipcMain.handle('get-btc-price', async () => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'bitcoin-bonsai-widget/1.0 (https://github.com/yourusername/bitcoin-bonsai-widget)'
      }
    };
    https.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd', options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          console.log('CoinGecko response:', data);
          resolve(JSON.parse(data));
        } catch (e) {
          console.error('Failed to parse CoinGecko response:', data, e);
          reject(e);
        }
      });
    }).on('error', (err) => {
      console.error('CoinGecko fetch error:', err);
      reject(err);
    });
  });
}); 