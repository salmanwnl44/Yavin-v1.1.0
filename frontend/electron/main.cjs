const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const os = require('os');
const TerminalManager = require('./terminalManager.cjs');
const LspManager = require('./lspManager.cjs');
const gitManager = require('./gitManager.cjs');

let mainWindow;
let terminalManager;
let lspManager;

// Handle uncaught exceptions to prevent app crash
process.on('uncaughtException', (error) => {
    if (error.code === 'EPIPE' || error.message.includes('EPIPE')) {
        // Known issue with node-pty on Windows when closing terminals
        // We can safely ignore this error
        console.warn('Ignored EPIPE error from terminal process:', error.message);
    } else {
        console.error('Uncaught Exception:', error);
        // For other errors, we might want to let it crash or handle it differently
        // But for now, logging it is better than a silent crash or a confusing dialog
    }
});

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, '../public/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        },
        frame: false, // Use custom title bar
        titleBarStyle: 'hidden',
    });

    // In production, load the local file. In dev, load the Vite server.
    const isDev = !app.isPackaged;
    const startUrl = isDev
        ? 'http://localhost:5173'
        : `file://${path.join(__dirname, '../dist/index.html')}`;

    console.log('Loading URL:', startUrl);
    mainWindow.loadURL(startUrl);

    // Open DevTools in development
    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    // Initialize LSP Manager
    lspManager = new LspManager();
    lspManager.init();

    mainWindow.on('closed', function () {
        mainWindow = null;
        if (terminalManager) {
            terminalManager.killAll();
        }
    });

    // Window Control Handlers
    ipcMain.on('window:minimize', () => {
        if (mainWindow) mainWindow.minimize();
    });

    ipcMain.on('window:maximize', () => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
        }
    });

    ipcMain.on('window:close', () => {
        if (mainWindow) mainWindow.close();
    });
}

function setupTerminalHandlers() {
    terminalManager = new TerminalManager();

    // Get available shells
    ipcMain.handle('terminal:get-shells', async () => {
        return terminalManager.getAvailableShells();
    });

    // Create a new terminal
    ipcMain.handle('terminal:create', async (event, options) => {
        try {
            const { id, process } = terminalManager.createTerminal(options);

            // Listen for data from this terminal
            process.on('data', (data) => {
                if (mainWindow) {
                    mainWindow.webContents.send('terminal:data', { id, data });
                }
            });

            // Listen for exit
            process.on('exit', (exitCode) => {
                if (mainWindow) {
                    mainWindow.webContents.send('terminal:exit', { id, exitCode });
                }
                terminalManager.kill(id);
            });

            return { success: true, id };
        } catch (error) {
            console.error('Failed to create terminal:', error);
            return { success: false, error: error.message };
        }
    });

    // Write data to terminal
    ipcMain.on('terminal:write', (event, { id, data }) => {
        terminalManager.write(id, data);
    });

    // Resize terminal
    ipcMain.on('terminal:resize', (event, { id, cols, rows }) => {
        terminalManager.resize(id, cols, rows);
    });

    // Kill terminal
    ipcMain.on('terminal:kill', (event, { id }) => {
        terminalManager.kill(id);
    });

    // Get all terminal IDs
    ipcMain.handle('terminal:get-all', async () => {
        return terminalManager.getAllTerminalIds();
    });
}


function setupFileSystemHandlers() {
    const fs = require('fs');
    const pathModule = require('path');

    // Read directory contents recursively
    const readDirectory = async (dirPath) => {
        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            const items = [];

            for (const entry of entries) {
                const fullPath = pathModule.join(dirPath, entry.name);

                // Skip hidden files and node_modules
                if (entry.name.startsWith('.') || entry.name === 'node_modules') {
                    continue;
                }

                if (entry.isDirectory()) {
                    items.push({
                        id: fullPath,
                        name: entry.name,
                        type: 'folder',
                        path: fullPath,
                        children: [] // Will be loaded on expand
                    });
                } else {
                    items.push({
                        id: fullPath,
                        name: entry.name,
                        type: 'file',
                        path: fullPath
                    });
                }
            }

            // Sort: folders first, then alphabetically
            return items.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'folder' ? -1 : 1;
            });
        } catch (error) {
            console.error('Error reading directory:', error);
            return [];
        }
    };

    // Open folder dialog
    ipcMain.handle('fs:open-folder', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });

        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }

        return result.filePaths[0];
    });

    // Read directory contents
    ipcMain.handle('fs:read-directory', async (event, dirPath) => {
        return await readDirectory(dirPath);
    });

    // Read file contents
    ipcMain.handle('fs:read-file', async (event, filePath) => {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            return { success: true, content };
        } catch (error) {
            console.error('Error reading file:', error);
            return { success: false, error: error.message };
        }
    });

    // Write file contents
    ipcMain.handle('fs:write-file', async (event, filePath, content) => {
        try {
            await fs.promises.writeFile(filePath, content, 'utf-8');
            return { success: true };
        } catch (error) {
            console.error('Error writing file:', error);
            return { success: false, error: error.message };
        }
    });

    // Save file dialog and write
    ipcMain.handle('fs:save-file', async (event, content, defaultPath) => {
        const options = {
            title: 'Save File',
            properties: ['showOverwriteConfirmation']
        };

        if (defaultPath) {
            options.defaultPath = defaultPath;
        }

        const result = await dialog.showSaveDialog(mainWindow, options);

        if (result.canceled || !result.filePath) {
            return { success: false, canceled: true };
        }

        try {
            await fs.promises.writeFile(result.filePath, content, 'utf-8');
            return { success: true, filePath: result.filePath };
        } catch (error) {
            console.error('Error saving file:', error);
            return { success: false, error: error.message };
        }
    });

    // Create folder
    ipcMain.handle('fs:create-folder', async (event, folderPath) => {
        try {
            await fs.promises.mkdir(folderPath, { recursive: true });
            return { success: true };
        } catch (error) {
            console.error('Error creating folder:', error);
            return { success: false, error: error.message };
        }
    });

    // Rename file or folder
    ipcMain.handle('fs:rename', async (event, oldPath, newPath) => {
        try {
            await fs.promises.rename(oldPath, newPath);
            return { success: true };
        } catch (error) {
            console.error('Error renaming:', error);
            return { success: false, error: error.message };
        }
    });

    // Delete file or folder
    ipcMain.handle('fs:delete', async (event, pathToDelete) => {
        try {
            await fs.promises.rm(pathToDelete, { recursive: true, force: true });
            return { success: true };
        } catch (error) {
            console.error('Error deleting:', error);
            return { success: false, error: error.message };
        }
    });
}



function setupGitHandlers() {
    ipcMain.handle('git:status', async (event, cwd) => {
        return await gitManager.getStatus(cwd);
    });

    ipcMain.handle('git:log', async (event, cwd) => {
        return await gitManager.getLog(cwd);
    });

    ipcMain.handle('git:commit', async (event, cwd, message) => {
        return await gitManager.commit(cwd, message);
    });

    ipcMain.handle('git:stage', async (event, cwd, file) => {
        return await gitManager.stageFile(cwd, file);
    });

    ipcMain.handle('git:unstage', async (event, cwd, file) => {
        return await gitManager.unstageFile(cwd, file);
    });

    ipcMain.handle('git:commit-details', async (event, cwd, hash) => {
        return await gitManager.getCommitDetails(cwd, hash);
    });

    ipcMain.handle('git:get-remote', async (event, cwd) => {
        return await gitManager.getRemote(cwd);
    });
}

// Extension Manager removed



// function setupExtensionHandlers() {
// Extension handlers removed
// }

function setupShellHandlers() {
    const { shell } = require('electron');


    // Show item in file explorer
    ipcMain.handle('shell:show-item', async (event, itemPath) => {
        try {
            shell.showItemInFolder(itemPath);
            return { success: true };
        } catch (error) {
            console.error('Error showing item in folder:', error);
            return { success: false, error: error.message };
        }
    });

    // Open external URL
    ipcMain.handle('shell:open-external', async (event, url) => {
        try {
            await shell.openExternal(url);
            return { success: true };
        } catch (error) {
            console.error('Error opening external URL:', error);
            return { success: false, error: error.message };
        }
    });

    // Check for compiler/interpreter availability
    ipcMain.handle('shell:check-compiler', async (event, language) => {
        const { exec } = require('child_process');
        const checkCommand = (cmd) => {
            return new Promise((resolve) => {
                exec(cmd, (error) => {
                    resolve(!error);
                });
            });
        };

        let cmd = '';
        switch (language) {
            case 'python': cmd = 'python --version'; break;
            case 'javascript': cmd = 'node --version'; break;
            case 'c': cmd = 'gcc --version'; break;
            case 'cpp': cmd = 'g++ --version'; break;
            case 'java': cmd = 'javac -version'; break;
            case 'go': cmd = 'go version'; break;
            case 'rust': cmd = 'rustc --version'; break;
            case 'php': cmd = 'php --version'; break;
            default: return false;
        }

        return await checkCommand(cmd);
    });
}

app.on('ready', () => {
    createWindow();

    try {
        setupTerminalHandlers();
        setupFileSystemHandlers();
        setupShellHandlers();
        setupGitHandlers();
        // setupExtensionHandlers();
        console.log('Terminal handlers initialized successfully');
    } catch (error) {
        console.error('Failed to initialize terminal handlers:', error);

        // Send error to frontend
        setTimeout(() => {
            if (mainWindow) {
                mainWindow.webContents.send('terminal:error', {
                    message: 'Terminal functionality is disabled. Please install node-pty.',
                    error: error.message
                });
            }
        }, 2000);
    }
});

app.on('window-all-closed', function () {
    if (terminalManager) {
        terminalManager.killAll();
    }
    if (lspManager) {
        lspManager.dispose();
    }
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
