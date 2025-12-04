const simpleGit = require('simple-git');

const gitManager = {
    async getStatus(cwd) {
        try {
            const git = simpleGit(cwd);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) return { isRepo: false };

            const status = await git.status();
            // Serialize to plain object to avoid IPC cloning errors
            return JSON.parse(JSON.stringify({ isRepo: true, ...status }));
        } catch (error) {
            console.error('Git status error:', error);
            return { error: error.message };
        }
    },

    async getLog(cwd) {
        try {
            const git = simpleGit(cwd);
            const isRepo = await git.checkIsRepo();
            if (!isRepo) return [];

            const log = await git.log();
            // Serialize to plain object
            return JSON.parse(JSON.stringify(log.all));
        } catch (error) {
            console.error('Git log error:', error);
            return [];
        }
    },

    async commit(cwd, message) {
        try {
            const git = simpleGit(cwd);
            await git.add('.'); // Stage all changes for now, or we can make it selective
            const result = await git.commit(message);
            return { success: true, ...result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async stageFile(cwd, file) {
        try {
            const git = simpleGit(cwd);
            await git.add(file);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async unstageFile(cwd, file) {
        try {
            const git = simpleGit(cwd);
            await git.reset(['HEAD', file]);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getCommitDetails(cwd, hash) {
        try {
            const git = simpleGit(cwd);
            // Get commit details with stats
            const show = await git.show([hash, '--stat']);

            // Parse the output for stats
            // Example last line: " 5 files changed, 391 insertions(+), 38 deletions(-)"
            const lines = show.trim().split('\n');
            const statsLine = lines[lines.length - 1];

            return JSON.parse(JSON.stringify({
                fullOutput: show,
                stats: statsLine
            }));
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    async getRemote(cwd) {
        try {
            const git = simpleGit(cwd);
            const remotes = await git.getRemotes(true);
            const origin = remotes.find(r => r.name === 'origin');
            return origin ? origin.refs.fetch : null;
        } catch (error) {
            console.error('Git get remote error:', error);
            return null;
        }
    }
};

module.exports = gitManager;
