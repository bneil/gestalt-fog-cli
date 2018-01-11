exports.command = 'providers'
exports.desc = 'List providers'
exports.builder = {}
exports.handler = function (argv) {
    const gestalt = require('../lib/gestalt')
    const displayResource = require('../lib/displayResourceUI');
    const selectHierarchy = require('../lib/selectHierarchy');

    selectHierarchy.resolveOrg(() => {

        const options = {
            message: "Providers",
            headers: ['Provider', 'Description', 'Type', 'Org', 'Owner', 'UID'/*'Created'*/],
            fields: ['name', 'description', 'resource_type', 'org.properties.fqon', 'owner.name', 'id'/*'created.timestamp'*/],
            sortField: 'name',
        }

        try {
            const fqon = gestalt.getState().org.fqon;

            const resources = gestalt.fetchOrgProviders([fqon]);

            resources.map(item => {
                item.resource_type = item.resource_type.replace(/Gestalt::Configuration::Provider::/, '')
                if (item.description) {
                    if (item.description.length > 20) {
                        item.description = item.description.substring(0, 20) + '...';
                    }
                }
            });

            // console.log(JSON.stringify(resources, null, 2))

            displayResource.run(options, resources);
        } catch (err) {
            console.log(err.message);
            console.log("Try running 'change-context'");
            console.log();
        }
    });
}