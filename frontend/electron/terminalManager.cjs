const os = require('os');
const path = require('path');
const fs = require('fs');

let pty;
try {
    pty = require('node-pty');
} catch (e) {
    console.warn('node-pty not found or failed to load. Terminal features will be disabled.', e);
}

class TerminalManager {
    constructor() {
        this.terminals = new Map();
        this.nextId = 1;
    }

    getAvailableShells() {
        const shells = [];
        if (os.platform() === 'win32') {
            const commonPaths = [
                { name: 'PowerShell', path: 'powershell.exe', icon: 'powershell' },
                { name: 'Command Prompt', path: 'cmd.exe', icon: 'cmd' },
                { name: 'Git Bash', path: 'C:\\Program Files\\Git\\bin\\bash.exe', icon: 'git' },
                { name: 'WSL', path: 'wsl.exe', icon: 'linux' },
            ];

            // Also check D: drive for Git Bash as seen in user's environment
            if (fs.existsSync('D:\\Program Files\\Git\\bin\\bash.exe')) {
                commonPaths.push({ name: 'Git Bash (D:)', path: 'D:\\Program Files\\Git\\bin\\bash.exe', icon: 'git' });
            }

            commonPaths.forEach(shell => {
                try {
                    if (['powershell.exe', 'cmd.exe', 'wsl.exe'].includes(shell.path)) {
                        shells.push(shell);
                    } else if (fs.existsSync(shell.path)) {
                        shells.push(shell);
                    }
                } catch (e) { }
            });
        } else {
            shells.push(
                { name: 'Bash', path: '/bin/bash', icon: 'bash' },
                { name: 'Zsh', path: '/bin/zsh', icon: 'zsh' }
            );
        }
        return shells;
    }

    createTerminal(options = {}) {
        if (!pty) {
            throw new Error('node-pty is not available');
        }

        const terminalId = this.nextId++;
        let shell = options.shell;
        if (!shell) {
            shell = os.platform() === 'win32' ? 'powershell.exe' : '/bin/bash';
        }

        let cwd = options.cwd || os.homedir();
        if (!fs.existsSync(cwd)) {
            cwd = os.homedir();
        }

        console.log(`Creating terminal ${terminalId}: shell=${shell}, cwd=${cwd}`);

        try {
            const ptyProcess = pty.spawn(shell, options.args || [], {
                name: 'xterm-256color',
                cols: options.cols || 80,
                rows: options.rows || 30,
                cwd: cwd,
                env: process.env
            });

            this.terminals.set(terminalId, {
                id: terminalId,
                process: ptyProcess,
                shell: shell,
                cwd: cwd
            });

            return {
                id: terminalId,
                process: ptyProcess
            };
        } catch (error) {
            console.error('Error spawning terminal:', error);
            throw error;
        }
    }

    write(terminalId, data) {
        const terminal = this.terminals.get(terminalId);
        if (terminal && terminal.process) {
            try {
                terminal.process.write(data);
            } catch (e) {
                console.error(`Error writing to terminal ${terminalId}:`, e);
            }
        }
    }

    resize(terminalId, cols, rows) {
        const terminal = this.terminals.get(terminalId);
        if (terminal && terminal.process) {
            try {
                if (cols > 0 && rows > 0) {
                    terminal.process.resize(cols, rows);
                }
            } catch (e) {
                console.error(`Error resizing terminal ${terminalId}:`, e);
            }
        }
    }

    kill(terminalId) {
        const terminal = this.terminals.get(terminalId);
        if (terminal) {
            if (terminal.process) {
                try {
                    // terminal.process.kill(); 
                    // node-pty's kill might not be enough on Windows sometimes, 
                    // but usually it works.
                    // Destroy handle first?
                    terminal.process.kill();
                } catch (e) {
                    console.warn(`Error killing terminal ${terminalId}:`, e);
                }
            }
            this.terminals.delete(terminalId);
        }
    }

    killAll() {
        for (const id of this.terminals.keys()) {
            this.kill(id);
        }
    }

    getAllTerminalIds() {
        return Array.from(this.terminals.keys());
    }
}

module.exports = TerminalManager;
