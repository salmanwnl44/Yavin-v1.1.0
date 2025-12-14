import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function Terminal({ name, cwd, shellType = 'powershell.exe' }) {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const terminalIdRef = useRef(null);
    const resizeObserverRef = useRef(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        let term = null;
        let fitAddon = null;
        let resizeObserver = null;
        let backendCleanup = null;
        let isInitialized = false;

        const initTerminal = async () => {
            if (isInitialized) return;
            if (!terminalRef.current) return;

            // Check dimensions
            const { clientWidth, clientHeight } = terminalRef.current;
            if (clientWidth === 0 || clientHeight === 0) return;

            isInitialized = true;

            // Initialize XTerm
            term = new XTerm({
                cursorBlink: true,
                theme: {
                    background: '#0a0e14',
                    foreground: '#d4d4d4',
                    cursor: '#ffffff',
                    selectionBackground: 'rgba(255, 255, 255, 0.3)',
                },
                fontFamily: 'Consolas, "Courier New", monospace',
                fontSize: 14,
                allowProposedApi: true
            });

            fitAddon = new FitAddon();
            term.loadAddon(fitAddon);

            term.open(terminalRef.current);
            xtermRef.current = term;
            fitAddonRef.current = fitAddon;

            // Initial fit with delay to ensure layout needs
            requestAnimationFrame(() => {
                try {
                    if (terminalRef.current && terminalRef.current.clientWidth > 0) {
                        fitAddon.fit();
                    }
                } catch (e) {
                    console.warn('Initial fit failed:', e);
                }
            });


            // Create Backend Terminal
            if (!window.electron?.terminal) {
                term.writeln('\x1b[33mTerminal backend not available.\x1b[0m');
                return;
            }

            try {
                // Map shellType to path if needed, or pass as is
                const shellMap = {
                    'powershell': 'powershell.exe',
                    'cmd': 'cmd.exe',
                    'git-bash': 'D:\\Program Files\\Git\\bin\\bash.exe', // Try user's path
                };
                // If it's a known key, use mapped value, else use it as is (if it's a path)
                const shellPath = shellMap[shellType] || shellType;

                const result = await window.electron.terminal.create({
                    shell: shellPath,
                    cwd: cwd,
                    cols: term.cols,
                    rows: term.rows
                });

                if (result.success) {
                    terminalIdRef.current = result.id;

                    // Listen for data
                    const unsubscribeData = window.electron.terminal.onData((id, data) => {
                        if (id === terminalIdRef.current) {
                            term.write(data);
                        }
                    });

                    // Listen for exit
                    const unsubscribeExit = window.electron.terminal.onExit((id, code) => {
                        if (id === terminalIdRef.current) {
                            term.writeln(`\r\n\x1b[33mTerminal exited with code ${code}\x1b[0m`);
                        }
                    });

                    // Write data to backend
                    term.onData(data => {
                        window.electron.terminal.write(terminalIdRef.current, data);
                    });

                    backendCleanup = () => {
                        unsubscribeData();
                        unsubscribeExit();
                    };
                } else {
                    term.writeln(`\x1b[31mFailed to create terminal: ${result.error}\x1b[0m`);
                }
            } catch (err) {
                term.writeln(`\x1b[31mError initializing terminal: ${err.message}\x1b[0m`);
            }
        };

        // Observe resize to trigger init when visible
        resizeObserver = new ResizeObserver((entries) => {
            if (!isInitialized) {
                for (const entry of entries) {
                    if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
                        initTerminal();
                    }
                }
            } else {
                // handle normal resize
                for (const entry of entries) {
                    if (entry.contentRect.width === 0 || entry.contentRect.height === 0) {
                        return; // Skip fit if hidden/collapsed
                    }
                }

                try {
                    if (fitAddon) {
                        fitAddon.fit();
                        if (terminalIdRef.current && term) {
                            window.electron.terminal.resize(terminalIdRef.current, term.cols, term.rows);
                        }
                    }
                } catch (e) {
                    // ignore
                }
            }
        });

        resizeObserver.observe(terminalRef.current);



        return () => {
            // Cleanup
            if (terminalIdRef.current && window.electron?.terminal) {
                window.electron.terminal.kill(terminalIdRef.current);
            }
            if (resizeObserver) {
                resizeObserver.disconnect();
            }
            if (backendCleanup) {
                backendCleanup();
            }
            if (term) {
                term.dispose();
            }
            isInitialized = false;
        };
    }, [cwd, shellType]);

    return <div ref={terminalRef} className="h-full w-full bg-[#0a0e14]" />;
}

