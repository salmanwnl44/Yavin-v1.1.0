const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const AdmZip = require('adm-zip');

class ExtensionManager {
    constructor() {
        this.extensionsDir = path.join(os.homedir(), '.codudu', 'extensions');
        this.ensureDir(this.extensionsDir);
    }

    ensureDir(dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    }

    async downloadExtension(url) {
        return new Promise((resolve, reject) => {
            const tempPath = path.join(os.tmpdir(), `ext-${Date.now()}.vsix`);

            const download = (downloadUrl) => {
                https.get(downloadUrl, (response) => {
                    // Handle Redirects
                    if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
                        if (response.headers.location) {
                            console.log(`Following redirect to: ${response.headers.location}`);
                            download(response.headers.location);
                            return;
                        }
                    }

                    if (response.statusCode !== 200) {
                        reject(new Error(`Failed to download extension: ${response.statusCode}`));
                        return;
                    }

                    const file = fs.createWriteStream(tempPath);
                    response.pipe(file);

                    file.on('finish', () => {
                        file.close();
                        resolve(tempPath);
                    });
                }).on('error', (err) => {
                    fs.unlink(tempPath, () => { });
                    reject(err);
                });
            };

            download(url);
        });
    }

    async installExtension(vsixPath) {
        try {
            const zip = new AdmZip(vsixPath);
            const zipEntries = zip.getEntries();

            // Find package.json to get extension info
            const packageEntry = zipEntries.find(entry => entry.entryName === 'extension/package.json');
            if (!packageEntry) {
                throw new Error('Invalid VSIX: package.json not found');
            }

            const packageJson = JSON.parse(packageEntry.getData().toString('utf8'));
            const extensionId = `${packageJson.publisher}.${packageJson.name}-${packageJson.version}`;
            const installDir = path.join(this.extensionsDir, extensionId);

            // Clean up if exists
            if (fs.existsSync(installDir)) {
                fs.rmSync(installDir, { recursive: true, force: true });
            }

            // Extract 'extension' folder content to installDir
            zipEntries.forEach(entry => {
                if (entry.entryName.startsWith('extension/')) {
                    const relativePath = entry.entryName.substring('extension/'.length);
                    if (!relativePath) return; // Skip the root 'extension/' folder itself

                    const fullPath = path.join(installDir, relativePath);
                    if (entry.isDirectory) {
                        this.ensureDir(fullPath);
                    } else {
                        this.ensureDir(path.dirname(fullPath));
                        fs.writeFileSync(fullPath, entry.getData());
                    }
                }
            });

            return { success: true, id: extensionId, manifest: packageJson };
        } catch (error) {
            console.error('Install error:', error);
            throw error;
        } finally {
            // Cleanup temp file
            if (fs.existsSync(vsixPath)) {
                try { fs.unlinkSync(vsixPath); } catch (e) { }
            }
        }
    }

    getInstalledExtensions() {
        try {
            const extensions = [];
            const items = fs.readdirSync(this.extensionsDir, { withFileTypes: true });

            for (const item of items) {
                if (item.isDirectory()) {
                    const packagePath = path.join(this.extensionsDir, item.name, 'package.json');
                    if (fs.existsSync(packagePath)) {
                        try {
                            const manifest = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
                            extensions.push({
                                id: item.name,
                                path: path.join(this.extensionsDir, item.name),
                                manifest: manifest
                            });
                        } catch (e) {
                            console.error(`Error parsing manifest for ${item.name}:`, e);
                        }
                    }
                }
            }
            return extensions;
        } catch (error) {
            console.error('Error listing extensions:', error);
            return [];
        }
    }

    uninstallExtension(id) {
        const extPath = path.join(this.extensionsDir, id);
        if (fs.existsSync(extPath)) {
            fs.rmSync(extPath, { recursive: true, force: true });
            return true;
        }
        return false;
    }
}

module.exports = ExtensionManager;
