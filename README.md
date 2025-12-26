# Dev Productivity Suite - Chrome Extension

A hackathon Chrome Extension (Manifest V3) with developer tools, learning utilities, and productivity features.

## 🏗️ Architecture

- **Popup UI**: React + Tailwind CSS control center
- **Background**: Service Worker for background tasks
- **Content Scripts**: Feature injection into web pages
- **Storage**: chrome.storage.sync for toggles, chrome.storage.local for data

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Build extension
npm run build

# Load in Chrome
1. Open chrome://extensions/
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `dist` folder
```

## 📦 Features

### Developer Tools
- ✅ **Clear Cache** - Background-only cache clearing
- ✅ **Edit Cookie** - Floating panel to view/edit/delete cookies
- ✅ **Check SEO** - Basic SEO analysis overlay
- ✅ **Font Finder** - Hover to see font details
- ✅ **Color Finder** - Click to copy color values
- 🔌 **GitHub Agent** - Integration hook (teammate implementation)
- 🔌 **AWS Agent** - Integration hook (teammate implementation)

### Learning Tools
- ✅ **Ad Blocker** - Declarative Net Request API
- ✅ **Speed Improver** - Defer images, lightweight UI
- 🔌 **Learning Agent** - Integration hook (teammate implementation)

### Productivity Tools
- ✅ **Focus Mode** - Hide distractions, dim page
- ✅ **Passive Watching Detector** - Inactivity detection with gentle prompts
- ✅ **Energy-Aware Scheduling** - Manual energy level selection with suggestions

### Storage
- 📊 **Repo Memory** - View and manage stored repos
- 📚 **Learning History** - Track learning activities
- 💾 **Saved Sessions** - Manage saved browser sessions
- 🗑️ **Clear All Data** - One-click data clearing

## 🔌 Integration Hooks

The extension provides placeholder hooks for three agents to be implemented by teammates:

```javascript
// GitHub Agent Hook
if (toggles.githubAgent && isGithubPage) {
  // GitHub Agent will mount here
}

// AWS Agent Hook
if (toggles.awsAgent && isAWSPage) {
  // AWS Agent will mount here
}

// Learning Agent Hook
if (toggles.learningAgent) {
  // Learning Agent will mount here
}
```

## 📁 Project Structure

```
├── manifest.json              # Extension manifest (MV3)
├── popup.html                 # Popup entry point
├── src/
│   ├── popup/                 # React popup UI
│   │   ├── Popup.jsx         # Main popup component
│   │   ├── components/       # Reusable UI components
│   │   └── sections/         # Feature sections
│   ├── background/           # Service worker
│   │   ├── service-worker.js
│   │   └── handlers/         # Background handlers
│   └── content/              # Content scripts
│       ├── content-script.js # Main content script
│       └── features/         # Feature implementations
├── rules/                    # DNR rules for ad blocking
└── vite.config.js           # Build configuration
```

## 🎯 Toggle System

All features are toggle-based and persist across sessions:

1. User toggles feature in popup
2. State saved to `chrome.storage.sync`
3. Background worker notified
4. Content scripts receive update
5. Feature activated/deactivated on page

## 🛠️ Development

```bash
# Development mode (watch)
npm run dev

# Production build
npm run build
```

## ✅ MVP Checklist

- [x] Manifest V3 setup
- [x] React + Tailwind popup UI
- [x] Toggle system with persistence
- [x] Background service worker
- [x] Content script injection
- [x] Clear Cache (working)
- [x] Font Finder (working)
- [x] Focus Mode (working)
- [x] Color Finder (working)
- [x] Edit Cookie (working)
- [x] Check SEO (working)
- [x] Ad Blocker (working)
- [x] Speed Improver (working)
- [x] Passive Watching Detector (working)
- [x] Energy-Aware Scheduling (working)
- [x] Storage UI (working)
- [x] Integration hooks for GitHub/AWS/Learning agents

## 🎨 Design Principles

- Minimal, clean popup UI
- No heavy UI inside popup
- Real UI appears inside webpages
- Toggle-based feature control
- Professional, demo-friendly UX
