const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const fs = require('fs');

class LspManager {
    constructor() {
        this.server = null;
        this.wss = null;
        this.rpc = null;
        this.rpcServer = null;
        this.connections = new Set();
    }

    async init() {
        try {
            // Dynamic imports for ESM modules
            this.rpc = await import('vscode-ws-jsonrpc');
            this.rpcServer = await import('vscode-ws-jsonrpc/server');

            this.server = http.createServer();
            this.wss = new WebSocket.Server({ noServer: true });

            this.server.on('upgrade', (request, socket, head) => {
                const pathname = new URL(request.url, 'http://localhost').pathname;

                if (pathname === '/python') {
                    this.wss.handleUpgrade(request, socket, head, (webSocket) => {
                        this.launchLanguageServer(webSocket, 'python');
                    });
                } else if (pathname === '/javascript' || pathname === '/typescript') {
                    this.wss.handleUpgrade(request, socket, head, (webSocket) => {
                        this.launchLanguageServer(webSocket, 'typescript');
                    });
                } else if (pathname === '/html') {
                    this.wss.handleUpgrade(request, socket, head, (webSocket) => {
                        this.launchLanguageServer(webSocket, 'html');
                    });
                } else if (pathname === '/css') {
                    this.wss.handleUpgrade(request, socket, head, (webSocket) => {
                        this.launchLanguageServer(webSocket, 'css');
                    });
                } else if (pathname === '/json') {
                    this.wss.handleUpgrade(request, socket, head, (webSocket) => {
                        this.launchLanguageServer(webSocket, 'json');
                    });
                } else {
                    socket.destroy();
                }
            });

            const PORT = 4000;
            this.server.listen(PORT, () => {
                console.log(`LSP Server listening on port ${PORT}`);
            });
        } catch (error) {
            console.error('Failed to initialize LSP Manager:', error);
        }
    }

    launchLanguageServer(socket, language) {
        if (!this.rpc || !this.rpcServer) {
            console.error('RPC modules not loaded');
            return;
        }

        // Wrap the socket to match IWebSocket interface
        const socketWrapper = {
            send: (content) => socket.send(content, (error) => {
                if (error) console.error('WebSocket send error:', error);
            }),
            onMessage: (cb) => socket.on('message', cb),
            onError: (cb) => socket.on('error', cb),
            onClose: (cb) => socket.on('close', cb),
            dispose: () => socket.close()
        };

        const reader = new this.rpc.WebSocketMessageReader(socketWrapper);
        const writer = new this.rpc.WebSocketMessageWriter(socketWrapper);

        let socketConnection;
        try {
            socketConnection = this.rpcServer.createConnection(reader, writer, () => socket.close());
        } catch (err) {
            console.error('Error creating socket connection:', err);
            return;
        }

        let command, args;

        if (language === 'python') {
            const pythonPath = path.resolve(__dirname, '../../backend/.venv/Scripts/python.exe');
            if (!fs.existsSync(pythonPath)) {
                console.error('Python executable not found at:', pythonPath);
                return;
            }
            command = pythonPath;
            args = ['-m', 'pylsp'];
        } else if (language === 'typescript') {
            const serverScript = path.resolve(__dirname, '../node_modules/typescript-language-server/lib/cli.mjs');
            command = 'node';
            args = [serverScript, '--stdio'];
        } else if (language === 'html') {
            const serverScript = path.resolve(__dirname, '../node_modules/vscode-langservers-extracted/bin/vscode-html-language-server');
            command = 'node';
            args = [serverScript, '--stdio'];
        } else if (language === 'css') {
            const serverScript = path.resolve(__dirname, '../node_modules/vscode-langservers-extracted/bin/vscode-css-language-server');
            command = 'node';
            args = [serverScript, '--stdio'];
        } else if (language === 'json') {
            const serverScript = path.resolve(__dirname, '../node_modules/vscode-langservers-extracted/bin/vscode-json-language-server');
            command = 'node';
            args = [serverScript, '--stdio'];
        }

        console.log(`Spawning ${language} LSP...`);

        try {
            const serverConnection = this.rpcServer.createServerProcess(language, command, args);

            if (serverConnection) {
                this.rpcServer.forward(socketConnection, serverConnection, message => {
                    if (this.rpc.isRequestMessage(message)) {
                        // console.log('LSP Request:', message.method);
                    }
                    return message;
                });

                this.connections.add(serverConnection);
            }
        } catch (err) {
            console.error(`Error spawning ${language} LSP process:`, err);
            socket.close();
        }
    }

    dispose() {
        if (this.server) {
            this.server.close();
        }
        this.connections.forEach(conn => {
            try {
                conn.dispose();
            } catch (e) {
                console.error('Error disposing connection:', e);
            }
        });
        this.connections.clear();
    }
}

module.exports = LspManager;
