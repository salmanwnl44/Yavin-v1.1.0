import { useEffect, useRef } from 'react';
import { Terminal as XTerm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function Terminal({ name, cwd, shellType = 'powershell.exe' }) {
    const terminalRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const terminalIdRef = useRef(null);

    useEffect(() => {
        if (!terminalRef.current || !window.electron?.terminal) return;

        let mounted = true;
        let resizeObserver = null;

        const initTerminal = async () => {
            // Wait for container to have dimensions (poll up to 1 second)
            let attempts = 0;
            while ((!terminalRef.current || terminalRef.current.clientWidth === 0 || terminalRef.current.clientHeight === 0) && attempts < 20) {
                await new Promise(resolve => setTimeout(resolve, 50));
                if (!mounted) return;
                attempts++;
            }

            if (!terminalRef.current || terminalRef.current.clientWidth === 0 || terminalRef.current.clientHeight === 0) {
                console.warn('Terminal container has no dimensions after waiting. Initialization aborted.');
                return;
            }

            // Create XTerm instance
            const term = new XTerm({
                cursorBlink: true,
                theme: {
                    background: '#0a0e14',
                    foreground: '#d4d4d4',
                    cursor: '#ffffff',
                    black: '#000000',
                    red: '#e06c75',
                    green: '#98c379',
                    yellow: '#d19a66',
                    blue: '#61afef',
                    magenta: '#c678dd',
                    cyan: '#56b6c2',
                    white: '#abb2bf',
                    brightBlack: '#5c6370',
                    brightRed: '#e06c75',
                    brightGreen: '#98c379',
                    brightYellow: '#d19a66',
                    brightBlue: '#61afef',
                    brightMagenta: '#c678dd',
                    brightCyan: '#56b6c2',
                    brightWhite: '#ffffff',
                },
                fontFamily: 'Consolas, "Courier New", monospace',
                fontSize: 14,
                lineHeight: 1.2,
                allowProposedApi: true
            });

            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);

            // Open terminal in the container
            term.open(terminalRef.current);

            // Wait for terminal to be fully initialized before fitting
            // This ensures the viewport and all internal structures are ready
            await new Promise(resolve => setTimeout(resolve, 100));

            if (!mounted) return;

            // Initial fit with proper checks
            requestAnimationFrame(() => {
                if (!mounted || !terminalRef.current) return;
                try {
                    // Verify terminal element exists and has dimensions
                    const element = term.element;
                    if (element && element.clientWidth > 0 && element.clientHeight > 0) {
                        fitAddon.fit();
                    }
                } catch (e) {
                    console.warn('Initial fit failed:', e);
                }
            });

            xtermRef.current = term;
            fitAddonRef.current = fitAddon;

            // Map shell types to actual shell paths
            const shellMap = {
                'powershell': 'powershell.exe',
                'cmd': 'cmd.exe',
                'git-bash': 'D:\\Program Files\\Git\\bin\\bash.exe',
                'node': 'powershell.exe', // JavaScript Debug Terminal uses PowerShell
            };

            const shellPath = shellMap[shellType] || shellType;

            // Create terminal process
            try {
                const result = await window.electron.terminal.create({
                    shell: shellPath,
                    cols: term.cols,
                    rows: term.rows,
                    cwd: cwd || undefined,
                });

                if (!mounted) return;

                if (result.success) {
                    terminalIdRef.current = result.id;

                    // Handle incoming data
                    const unsubscribeData = window.electron.terminal.onData((id, data) => {
                        if (id === terminalIdRef.current && xtermRef.current) {
                            xtermRef.current.write(data);
                        }
                    });

                    // Handle terminal exit
                    const unsubscribeExit = window.electron.terminal.onExit((id, exitCode) => {
                        if (id === terminalIdRef.current && xtermRef.current) {
                            xtermRef.current.write(`\r\n\x1b[33mProcess exited with code ${exitCode}\x1b[0m\r\n`);
                        }
                    });

                    // Handle user input
                    term.onData((data) => {
                        if (terminalIdRef.current) {
                            window.electron.terminal.write(terminalIdRef.current, data);
                        }
                    });

                    // Setup ResizeObserver for robust resizing
                    resizeObserver = new ResizeObserver(() => {
                        if (fitAddonRef.current && terminalIdRef.current && xtermRef.current) {
                            requestAnimationFrame(() => {
                                if (!terminalRef.current || terminalRef.current.clientWidth === 0 || terminalRef.current.clientHeight === 0) return;

                                // Ensure terminal element and viewport are ready
                                const element = xtermRef.current.element;
                                if (!element || element.clientWidth === 0 || element.clientHeight === 0) return;

                                try {
                                    fitAddonRef.current.fit();
                                    const { cols, rows } = xtermRef.current;
                                    window.electron.terminal.resize(terminalIdRef.current, cols, rows);
                                } catch (e) {
                                    // Ignore resize errors if terminal is not ready
                                    console.debug('Resize skipped:', e.message);
                                }
                            });
                        }
                    });

                    if (terminalRef.current) {
                        resizeObserver.observe(terminalRef.current);
                    }

                    // Store cleanup functions
                    return () => {
                        unsubscribeData();
                        unsubscribeExit();
                    };
                } else {
                    term.write(`\x1b[31mFailed to create terminal: ${result.error}\x1b[0m\r\n`);
                }
            } catch (error) {
                if (mounted) {
                    term.write(`\x1b[31mError: ${error.message}\x1b[0m\r\n`);
                }
            }
        };

        const cleanupPromise = initTerminal();

        return () => {
            mounted = false;

            if (resizeObserver) {
                resizeObserver.disconnect();
            }

            cleanupPromise.then(cleanupFn => cleanupFn && cleanupFn());

            if (terminalIdRef.current && window.electron?.terminal) {
                // Optional: Don't kill terminal on tab switch if we want persistence
                // But for now, we kill it as per existing logic
                // window.electron.terminal.kill(terminalIdRef.current); 
            }

            if (xtermRef.current) {
                try {
                    xtermRef.current.dispose();
                } catch (e) {
                    // Ignore dispose errors
                }
                xtermRef.current = null;
            }
        };
    }, [shellType, cwd]);

    if (!window.electron?.terminal) {
        return (
            <div className="h-full w-full bg-[#0a0e14] flex items-center justify-center text-gray-400">
                <div className="text-center px-4">
                    <p className="text-sm mb-2">⚠️ Terminal is not available</p>
                    <p className="text-xs text-gray-500">Please run with "npm run electron:dev"</p>
                </div>
            </div>
        );
    }

    return <div ref={terminalRef} className="h-full w-full bg-[#0a0e14]" />;
}
