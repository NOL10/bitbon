# Bitcoin Bonsai Widget

[![Build Status](https://github.com/NOL10/bitbon/actions/workflows/electron-builder.yml/badge.svg)](https://github.com/NOL10/bitbon/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A cross-platform, draggable desktop widget and web app for tracking Bitcoin price and more. Built with React, Electron, and Vite.

---

## 🖼️ Screenshot
![Widget Screenshot](public/screenshot.png)

---

## ✨ Features
- **Draggable desktop widget** (Electron, frameless, resizable)
- **Web app** mode (pure React)
- **Cross-platform builds** (macOS, Windows, Linux via GitHub Actions)
- **Advanced settings** (including a "Close App" button in Electron)
- Modern UI with retro CRT effects

---

## 🚀 Getting Started

### 1. **Web App (Development)**
```sh
npm install
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173)

### 2. **Desktop Widget (Electron, Development)**
```sh
npm run build
npm run electron:dev
```

### 3. **Build Installers (macOS, Windows, Linux)**
#### Locally (for your OS):
```sh
npm run electron:dist
```
Installers will appear in the `dist/` folder.

#### Cross-Platform (All OSes):
- Push to [GitHub](https://github.com/NOL10/bitbon)
- Go to the **Actions** tab → select the latest run → download installers from "Artifacts"

---

## 📦 Downloading Installers
- **macOS:** `.dmg`, `.zip`
- **Windows:** `.exe`, `.msi`
- **Linux:** `.AppImage`, `.deb`, `.snap`
- Download from [GitHub Actions Artifacts](https://github.com/NOL10/bitbon/actions) after each push.

---

## 🤝 Contributing
See [`CONTRIBUTING.md`](CONTRIBUTING.md) for details!
- Open issues for bugs/ideas
- Fork and submit pull requests
- Follow code style and commit conventions

---

## 📄 License
MIT

---

## 👋 Contact
For questions, suggestions, or collaborations, open an issue on GitHub or contact [@NOL10](https://github.com/NOL10).
