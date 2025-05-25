# Bitcoin Bonsai Widget

A beautiful, always-on-top, cross-platform desktop widget that visualizes Bitcoin price growth as a bonsai tree. Built with React, Electron, and TypeScript.

![screenshot](./public/screenshot.png)

## ✨ Features
- Live Bitcoin price tracking (via CoinGecko)
- Bonsai tree visualization that grows/shrinks with price changes
- Always-on-top, frameless, transparent desktop widget
- Click-through mode (soon)
- Local settings and logs (no backend required)
- Cross-platform: macOS, Windows, Linux
- Easy install: just download and run

## 🚀 Installation

### Download
- [Releases](https://github.com/NOL10/bitcoin-bonsai-widget/releases)
  - **macOS:** `.dmg`
  - **Windows:** `.exe`
  - **Linux:** `.AppImage` or `.deb`

### Build from Source
```bash
git clone https://github.com/yourusername/bitcoin-bonsai-widget.git
cd bitcoin-bonsai-widget
npm install
npm run generate-icons
cd client && npm run build && cd ..
npm run electron:build
```
Installers will be in the `release` folder.

## 🖼️ Screenshots
Add screenshots to `public/screenshot.png` and update this README.

## 🛠️ Development
```bash
npm run electron:dev
```

## 🤝 Contributing
Pull requests are welcome! For major changes, open an issue first to discuss what you'd like to change.

## 📄 License
MIT. See [LICENSE](./LICENSE).

---

**Made with ❤️ by Mr_Meadow & Noel George* 
