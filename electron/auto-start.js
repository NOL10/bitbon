import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function setupAutoStart() {
  const appPath = app.getPath('exe');
  const appName = app.getName();

  switch (process.platform) {
    case 'win32':
      setupWindowsAutoStart(appPath, appName);
      break;
    case 'darwin':
      setupMacAutoStart(appPath, appName);
      break;
    case 'linux':
      setupLinuxAutoStart(appPath, appName);
      break;
  }
}

function setupWindowsAutoStart(appPath, appName) {
  const startupKey = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
  const command = `REG ADD "${startupKey}" /v "${appName}" /t REG_SZ /d "${appPath}" /f`;
  require('child_process').execSync(command);
}

function setupMacAutoStart(appPath, appName) {
  const plistPath = path.join(
    process.env.HOME,
    'Library/LaunchAgents',
    `${appName}.plist`
  );

  const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${appName}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${appPath}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>`;

  fs.writeFileSync(plistPath, plistContent);
}

function setupLinuxAutoStart(appPath, appName) {
  const desktopEntryPath = path.join(
    process.env.HOME,
    '.config/autostart',
    `${appName}.desktop`
  );

  const desktopEntryContent = `[Desktop Entry]
Type=Application
Name=${appName}
Exec="${appPath}"
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true`;

  fs.writeFileSync(desktopEntryPath, desktopEntryContent);
} 