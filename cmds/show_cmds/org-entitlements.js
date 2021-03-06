const gestalt = require('../lib/gestalt')
const ui = require('../lib/gestalt-ui')
const cmd = require('../lib/cmd-base');
exports.command = 'org-entitlements'
exports.desc = 'Show org entitlements'
exports.builder = {}
exports.handler = cmd.handler(async function (argv) {
    const context = await ui.resolveOrg();
    const resources = await gestalt.fetchOrgEntitlements(context);
    ui.displayEntitlements(resources);
});