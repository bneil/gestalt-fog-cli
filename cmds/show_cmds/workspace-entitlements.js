const gestalt = require('../lib/gestalt')
const ui = require('../lib/gestalt-ui')
const cmd = require('../lib/cmd-base');
exports.command = 'workspace-entitlements'
exports.desc = 'Show workspace entitlements'
exports.builder = {}
exports.handler = cmd.handler(async function (argv) {
    const state = ui.resolveWorkspace();
    const resources = await gestalt.fetchWorkspaceEntitlements(state);
    ui.displayEntitlements(resources);
});