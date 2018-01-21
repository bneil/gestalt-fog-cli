const gestalt = require('../lib/gestalt')
const ui = require('../lib/gestalt-ui')
const cmd = require('../lib/cmd-base');
exports.command = 'providers'
exports.desc = 'List providers'
exports.builder = {
    org: {
        description: 'Fetch providers from org'
    },
    workspace: {
        description: 'Fetch providers from workspace'
    },
    environment: {
        description: 'Fetch providers from environment'
    },
}
exports.handler = cmd.handler(async function (argv) {
    const options = {
        message: "Providers",
        headers: ['Provider', 'Description', 'Type', 'Org', 'Owner', 'UID'/*'Created'*/],
        fields: ['name', 'description', 'resource_type', 'org.properties.fqon', 'owner.name', 'id'/*'created.timestamp'*/],
        sortField: 'name',
    }

    let resources = null;

    if (argv.org) {
        const state = await ui.resolveOrg();
        resources = await gestalt.fetchOrgProviders([state.org.fqon]);
    } else if (argv.workspace) {
        const state = await ui.resolveWorkspace();
        resources = await gestalt.fetchWorkspaceProviders(state);
    } else if (argv.environment) {
        const state = await ui.resolveEnvironment();
        resources = await gestalt.fetchEnvironmentProviders(state);
    }

    for (let item of resources) {
        item.resource_type = item.resource_type.replace(/Gestalt::Configuration::Provider::/, '')
        if (item.description) {
            if (item.description.length > 20) {
                item.description = item.description.substring(0, 20) + '...';
            }
        }
    }

    ui.displayResource(options, resources);
});