# Terminal Bridge System

This Electron application now includes a fully functional terminal bridge system, similar to VS Code's integrated terminal.

## Features

### ✅ Multiple Terminal Support
- Create and manage multiple terminal instances
- Switch between terminals using tabs
- Close individual terminals

### ✅ Shell Selection
- **PowerShell** - Default Windows shell
- **Command Prompt (CMD)** - Classic Windows command line
- **Git Bash** - If installed on your system
- **WSL** - Windows Subsystem for Linux (if configured)

### ✅ Real Terminal Emulation
- Uses `node-pty` for true PTY (pseudo-terminal) support
- Full ANSI color support
- Cursor positioning and control sequences
- Interactive programs support (vim, nano, etc.)

### ✅ VS Code-like UI
- Terminal toolbar with shell selector
- Terminal tabs for easy switching
- Responsive terminal sizing
- Modern dark theme

## Architecture

### Backend (Electron Main Process)

1. **terminalManager.cjs** - Core terminal management
   - Manages multiple terminal instances
   - Detects available shells on the system
   - Handles terminal lifecycle (create, resize, kill)

2. **main.cjs** - IPC handlers
   - Sets up communication between renderer and main process
   - Forwards terminal data bidirectionally
   - Handles terminal events (exit, errors)

3. **preload.cjs** - Security bridge
   - Exposes safe terminal API to renderer
   - Uses contextBridge for security
   - Provides async and event-based methods

### Frontend (React)

1. **Terminal.jsx** - React component
   - Manages UI state for multiple terminals
   - Integrates xterm.js for terminal rendering
   - Handles user interactions (tabs, shell selection)
   - Manages terminal lifecycle in the UI

## API Reference

### Electron API (window.electron.terminal)

```javascript
// Get available shells
const shells = await window.electron.terminal.getShells();
// Returns: [{ name: 'PowerShell', path: 'powershell.exe', icon: 'powershell' }, ...]

// Create a new terminal
const result = await window.electron.terminal.create({
    shell: 'powershell.exe',  // Shell path
    cols: 80,                  // Terminal columns
    rows: 30,                  // Terminal rows
    cwd: 'C:\\Users\\...',     // Working directory (optional)
});
// Returns: { success: true, id: 1 }

// Write data to terminal
window.electron.terminal.write(terminalId, 'ls\r');

// Resize terminal
window.electron.terminal.resize(terminalId, cols, rows);

// Kill terminal
window.electron.terminal.kill(terminalId);

// Listen for terminal output
const unsubscribe = window.electron.terminal.onData((id, data) => {
    console.log(`Terminal ${id}:`, data);
});

// Listen for terminal exit
window.electron.terminal.onExit((id, exitCode) => {
    console.log(`Terminal ${id} exited with code ${exitCode}`);
});

// Listen for errors
window.electron.terminal.onError((error) => {
    console.error('Terminal error:', error);
});
```

## Requirements

### System Requirements
- **Windows**: Visual Studio Build Tools 2022 (installed ✅)
- **Node.js**: v20 LTS or higher
- **Python**: 3.x (for node-gyp)

### Dependencies
- `node-pty` - PTY bindings for Node.js
- `xterm` - Terminal emulator for the web
- `xterm-addon-fit` - Fit addon for xterm.js

## Usage

### Running the Application

```bash
# Development mode (with hot reload)
npm run electron:dev

# Build for production
npm run electron:build
```

### Creating a New Terminal

1. Click the **"+ New"** button in the terminal toolbar
2. Or use the shell selector dropdown to choose a different shell, then click "+ New"

### Switching Between Terminals

- Click on any terminal tab to switch to that terminal
- The active terminal is highlighted

### Closing a Terminal

- Click the **×** button on the terminal tab
- Or type `exit` in the terminal and press Enter

## Troubleshooting

### Terminal not working?
- Make sure you're running in Electron mode: `npm run electron:dev`
- Check that `node-pty` is installed: `npm list node-pty`
- Verify Visual Studio Build Tools are installed

### Shell not appearing in dropdown?
- The shell must be installed on your system
- For Git Bash: Install Git for Windows
- For WSL: Enable WSL in Windows Features

### Build errors?
- Ensure Visual Studio Build Tools 2022 are installed
- Make sure Python 3.x is in your PATH
- Try: `npm rebuild node-pty`

## Technical Details

### IPC Communication Flow

```
Renderer Process (React)
    ↓ (invoke/send)
Preload Script (contextBridge)
    ↓ (ipcRenderer)
Main Process (Electron)
    ↓ (node-pty)
Terminal Process (PowerShell/CMD/etc.)
```

### Event Flow

1. User types in terminal → xterm.js captures input
2. React sends to Electron via `window.electron.terminal.write()`
3. Electron forwards to PTY process
4. PTY executes command and sends output
5. Electron receives output and sends to React
6. React writes to xterm.js display

## Future Enhancements

- [ ] Terminal persistence across app restarts
- [ ] Custom shell configurations
- [ ] Terminal splitting (horizontal/vertical)
- [ ] Search in terminal output
- [ ] Copy/paste improvements
- [ ] Terminal themes customization
- [ ] Shell integration (current directory tracking)
