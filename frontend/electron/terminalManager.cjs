const os = require('os');
const path = require('path');

let pty;
try {
    pty = require('node-pty');
} catch (e) {
    console.warn('node-pty not found. Terminal features will be disabled.');
}

class TerminalManager {
    constructor() {
        this.terminals = new Map();
        this.nextId = 1;
    }

    /**
     * Get available shells on the system
     */
    getAvailableShells() {
        const shells = [];

        if (os.platform() === 'win32') {
            // Windows shells
            const commonPaths = [
                { name: 'PowerShell', path: 'powershell.exe', icon: 'powershell' },
                { name: 'Command Prompt', path: 'cmd.exe', icon: 'cmd' },
                { name: 'Git Bash', path: 'C:\\Program Files\\Git\\bin\\bash.exe', icon: 'git' },
                { name: 'WSL', path: 'wsl.exe', icon: 'linux' },
            ];

            commonPaths.forEach(shell => {
                try {
                    // For system shells (powershell, cmd, wsl), they're always available
                    if (shell.path === 'powershell.exe' || shell.path === 'cmd.exe' || shell.path === 'wsl.exe') {
                        shells.push(shell);
                    } else {
                        // For others, check if they exist
                        const fs = require('fs');
                        if (fs.existsSync(shell.path)) {
                            shells.push(shell);
                        }
                    }
                } catch (e) {
                    // Skip if not available
                }
            });
        } else {
            // Unix-like systems
            shells.push(
                { name: 'Bash', path: '/bin/bash', icon: 'bash' },
                { name: 'Zsh', path: '/bin/zsh', icon: 'zsh' },
                { name: 'Fish', path: '/usr/bin/fish', icon: 'fish' }
            );
        }

        return shells;
    }

    /**
     * Create a new terminal instance
     */
    createTerminal(options = {}) {
        if (!pty) {
            throw new Error('node-pty is not available');
        }

        const terminalId = this.nextId++;

        // Determine shell
        let shell = options.shell;
        if (!shell) {
            shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        }

        // Determine working directory with validation
        let cwd = options.cwd || process.env.USERPROFILE || process.env.HOME || os.homedir();

        // Validate and sanitize the working directory
        const fs = require('fs');
        try {
            // Check if the path exists and is a directory
            if (!fs.existsSync(cwd) || !fs.statSync(cwd).isDirectory()) {
                console.warn(`Invalid working directory: ${cwd}, falling back to home directory`);
                cwd = process.env.USERPROFILE || process.env.HOME || os.homedir();
            }
        } catch (err) {
            console.warn(`Error validating working directory: ${err.message}, using home directory`);
            cwd = process.env.USERPROFILE || process.env.HOME || os.homedir();
        }

        console.log(`Creating terminal with shell: ${shell}, cwd: ${cwd}`);

        try {
            const ptyProcess = pty.spawn(shell, options.args || [], {
                name: 'xterm-256color',
                cols: options.cols || 80,
                rows: options.rows || 30,
                cwd: cwd,
                env: { ...process.env, ...options.env },
            });

            this.terminals.set(terminalId, {
                id: terminalId,
                process: ptyProcess,
                shell: shell,
                cwd: cwd,
            });

            return {
                id: terminalId,
                process: ptyProcess,
            };
        } catch (error) {
            console.error('Failed to spawn terminal:', error);
            console.error('Shell:', shell);
            console.error('CWD:', cwd);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            throw error;
        }
    }

    /**
     * Get a terminal by ID
     */
    getTerminal(terminalId) {
        return this.terminals.get(terminalId);
    }

    /**
     * Write data to a terminal
     */
    write(terminalId, data) {
        const terminal = this.terminals.get(terminalId);
        if (terminal && terminal.process) {
            terminal.process.write(data);
        }
    }

    /**
     * Resize a terminal
     */
    resize(terminalId, cols, rows) {
        const terminal = this.terminals.get(terminalId);
        if (terminal && terminal.process) {
            terminal.process.resize(cols, rows);
        }
    }

    /**
     * Kill a terminal
     */
    kill(terminalId) {
        const terminal = this.terminals.get(terminalId);
        if (terminal && terminal.process) {
            try {
                // Remove listeners to prevent data/exit events during kill
                terminal.process.removeAllListeners('data');
                terminal.process.removeAllListeners('exit');
                terminal.process.kill();
            } catch (error) {
                console.warn(`Error killing terminal ${terminalId}:`, error.message);
            }
            this.terminals.delete(terminalId);
        }
    }

    /**
     * Kill all terminals
     */
    killAll() {
        this.terminals.forEach((terminal) => {
            if (terminal.process) {
                terminal.process.kill();
            }
        });
        this.terminals.clear();
    }

    /**
     * Get all terminal IDs
     */
    getAllTerminalIds() {
        return Array.from(this.terminals.keys());
    }
}

module.exports = TerminalManager;
