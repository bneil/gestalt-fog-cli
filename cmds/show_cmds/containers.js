exports.command = 'containers'
exports.desc = 'List containers'
exports.builder = {}
exports.handler = function (argv) {
    const gestalt = require('../lib/gestalt')
    const displayResource = require('../lib/displayResourceUI');
    const selectHierarchy = require('../lib/selectHierarchy');

    selectHierarchy.resolveEnvironment(() => {
        const options = {
            message: "Containers",
            headers: ['Container', 'Description', 'Status', 'Image', 'Instances', 'Owner'],
            fields: ['name', 'description', 'properties.status', 'properties.image', 'running_instances', 'owner.name'],
            sortField: 'description',
        }

        try {
            const resources = gestalt.fetchContainers();
            resources.map(item => {
                item.running_instances = `${item.properties.tasks_running} / ${item.properties.num_instances}`
            })

            displayResource.run(options, resources);
        } catch (err) {
            console.log(err.message);
            console.log("Try running 'change-context'");
            console.log();
        }
    });
}