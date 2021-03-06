const gestalt = require('../lib/gestalt')
const ui = require('../lib/gestalt-ui')
const cmd = require('../lib/cmd-base');
exports.command = 'orgs'
exports.desc = 'List orgs'
exports.builder = {}
exports.handler = cmd.handler(async function (argv) {

    const resources = await gestalt.fetchOrgs();
    resources.map(r => {
        r.fqon = r.properties.fqon; // for sorting
    })

    ui.displayResources(resources, argv);
});
