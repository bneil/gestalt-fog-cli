exports.command = 'container'
exports.desc = 'Describe container'
exports.builder = {}
exports.handler = function (argv) {
    const gestalt = require('../lib/gestalt')
    const displayResource = require('../lib/displayResourceUI');
    const selectContainer = require('../lib/selectContainer');
    const selectHierarchy = require('../lib/selectHierarchy');

    // Main
    try {
        // 1) Select Container
        selectHierarchy.resolveEnvironment(() => {
            selectContainer.run({}, (container) => {

                // 2) Show container details

                // const container = gestalt.fetchContainer(result.container);  //fetch from current context

                if (argv.raw) {
                    console.log(JSON.stringify(container, null, 2));
                } else {
                    showContainer(container);
                    showInstances(container);
                    // showCommands(container);

                    console.log(`Use '--raw' to see raw JSON output`);
                    console.log();
                }
            });
        });
    } catch (err) {
        console.log(err.message);
        console.log("Try running 'change-context'");
        console.log();
    }

    function showContainer(c) {
        const options = {
            message: "Container",
            headers: ['Description', 'Status', 'Name', 'Path', 'Image', 'Instances', 'Owner', 'Provider'],
            fields: ['description', 'properties.status', 'name', 'path', 'properties.image', 'properties.num_instances', 'owner.name', 'properties.provider.name'],
            sortField: 'description',
        }

        // console.log()
        // console.log("Container Details:")
        displayResource.run(options, [c]);
    }

    function showInstances(c) {

        const options2 = {
            message: "Instances",
            headers: ['Container Instances', 'Host', 'Addresses', 'Ports', 'Started'],
            fields: ['id', 'host', 'ipAddresses', 'ports', 'startedAt'],
            sortField: 'description',
        }

        // console.log()
        // console.log("Container Instances:")

        displayResource.run(options2, c.properties.instances);
    }

    // function showCommands(c) {
    //     // const envId = gestalt.getCurrentEnvironment().id;

    //     console.log("Commands:")
    //     console.log()
    //     console.log("  Logs:")
    //     console.log()
    //     for (let i in c.properties.instances) {
    //         // console.log(instance)
    //         // console.log(`    ./fog '${c.properties.provider.name}' logs ${envId} ${instance.id} --tail 20 --follow`);
    //         console.log(`    ./container-logs ${c.org.properties.fqon} ${c.id}/${i} --tail 20 --follow`)
    //     }

    //     console.log()
    //     console.log("  Console Access:")
    //     console.log()
    //     for (let i in c.properties.instances) {
    //         // console.log(`    ./fog '${c.properties.provider.name}' console ${envId} ${instance.id} sh`);
    //         console.log(`    ./container-console ${c.org.properties.fqon} ${c.id}/${i}`)
    //     };
    //     console.log()
    // };

}