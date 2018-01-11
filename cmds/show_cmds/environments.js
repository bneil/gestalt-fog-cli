exports.command = 'environments'
exports.desc = 'List enviornments'
exports.builder = {}
exports.handler = function (argv) {
    const gestalt = require('../lib/gestalt')
    const displayResource = require('../lib/displayResourceUI');
    const selectHierarchy = require('../lib/selectHierarchy');

    selectHierarchy.resolveWorkspace(() => {

        const options = {
            message: "Environments",
            headers: ['Environment', 'Name', 'Type', 'Org', 'Workspace', 'Owner'],
            fields: ['description', 'name', 'properties.environment_type', 'org.properties.fqon', 'properties.workspace.name', 'owner.name'],
            sortField: 'description',
        }

        try {
            const resources = gestalt.fetchEnvironments();

            // console.log(JSON.stringify(resources, null, 2))

            displayResource.run(options, resources);

        } catch (err) {
            console.log(err.message);
            console.log("Try running 'change-context'");
            console.log();
        }
    });
}