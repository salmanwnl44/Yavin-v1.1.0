const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    terminal: {
        // Get available shells on the system
        getShells: () => ipcRenderer.invoke('terminal:get-shells'),

        // Create a new terminal instance
        create: (options) => ipcRenderer.invoke('terminal:create', options),

        // Write data to a terminal
        write: (id, data) => ipcRenderer.send('terminal:write', { id, data }),

        // Resize a terminal
        resize: (id, cols, rows) => ipcRenderer.send('terminal:resize', { id, cols, rows }),

        // Kill a terminal
        kill: (id) => ipcRenderer.send('terminal:kill', { id }),

        // Get all terminal IDs
        getAll: () => ipcRenderer.invoke('terminal:get-all'),

        // Listen for data from terminals
        onData: (callback) => {
            const listener = (event, { id, data }) => callback(id, data);
            ipcRenderer.on('terminal:data', listener);
            return () => ipcRenderer.removeListener('terminal:data', listener);
        },

        // Listen for terminal exit
        onExit: (callback) => {
            const listener = (event, { id, exitCode }) => callback(id, exitCode);
            ipcRenderer.on('terminal:exit', listener);
            return () => ipcRenderer.removeListener('terminal:exit', listener);
        },

        // Listen for terminal errors
        onError: (callback) => {
            const listener = (event, error) => callback(error);
            ipcRenderer.on('terminal:error', listener);
            return () => ipcRenderer.removeListener('terminal:error', listener);
        },
    },

    fileSystem: {
        // Open folder picker and get the path
        openFolder: () => ipcRenderer.invoke('fs:open-folder'),

        // Read directory contents
        readDirectory: (dirPath) => ipcRenderer.invoke('fs:read-directory', dirPath),

        // Read file contents
        readFile: (filePath) => ipcRenderer.invoke('fs:read-file', filePath),

        // Write file contents
        writeFile: (filePath, content) => ipcRenderer.invoke('fs:write-file', filePath, content),

        // Save file as...
        saveFile: (content, defaultPath) => ipcRenderer.invoke('fs:save-file', content, defaultPath),

        // Create folder
        createFolder: (folderPath) => ipcRenderer.invoke('fs:create-folder', folderPath),

        // Rename file or folder
        rename: (oldPath, newPath) => ipcRenderer.invoke('fs:rename', oldPath, newPath),

        // Delete file or folder
        delete: (path) => ipcRenderer.invoke('fs:delete', path),
    },

    shell: {
        // Show item in file explorer
        showItemInFolder: (path) => ipcRenderer.invoke('shell:show-item', path),
        // Open external URL
        openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
        // Check for compiler
        checkCompiler: (language) => ipcRenderer.invoke('shell:check-compiler', language),
    },

    git: {
        status: (cwd) => ipcRenderer.invoke('git:status', cwd),
        log: (cwd) => ipcRenderer.invoke('git:log', cwd),
        commit: (cwd, message) => ipcRenderer.invoke('git:commit', cwd, message),
        stage: (cwd, file) => ipcRenderer.invoke('git:stage', cwd, file),
        unstage: (cwd, file) => ipcRenderer.invoke('git:unstage', cwd, file),
        getCommitDetails: (cwd, hash) => ipcRenderer.invoke('git:commit-details', cwd, hash),
        getRemote: (cwd) => ipcRenderer.invoke('git:get-remote', cwd),
    },

    extensions: {
        install: (url) => ipcRenderer.invoke('extension:install', url),
        list: () => ipcRenderer.invoke('extension:list'),
        uninstall: (id) => ipcRenderer.invoke('extension:uninstall', id),
    },

    // Window Controls
    ipcRenderer: {
        send: (channel, ...args) => {
            const validChannels = ['window:minimize', 'window:maximize', 'window:close'];
            if (validChannels.includes(channel)) {
                ipcRenderer.send(channel, ...args);
            }
        }
    }
});
